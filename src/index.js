#!/usr/bin/env node

const parseArgumentOptions = require('./helpers/cli-helpers').parseArgumentOptions;
const debug = require('debug')('Main');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const miscHelpers = require('./helpers/misc-helpers');
const { parseInput, createDirectory } = miscHelpers;
const { generateMarkdown } = require('./helpers/markdown-helpers');
const config = require('./config');
const generatePDF = require('./helpers/pdf-helpers').generatePDF;

const main = () => {
  try {
    const args = parseArgumentOptions();
    const { force, input, output } = args;

    if (force) {
      debug('Deleting output folder.');
      rimraf.sync(output);
    } else if (fs.existsSync(output) && fs.readdirSync(output).length > 0) {
      throw new Error(`'${output}' is not empty. Use -f to force delete.`);
    }

    const createAnchor = val =>
      val
        .toLowerCase()
        .replace(/ /g, '-')
        // single chars that are removed
        .replace(/[.]/g, '');

    createDirectory(output);
    // Github
    generateMarkdown(
      input,
      path.join(output, config.MARKDOWN_DIRECTORY_FOR_GITHUB),
      config.ANCHOR_CHARS_TO_EXLUDE_FOR_GITHUB
    );

    // PDF
    generateMarkdown(
      input,
      path.join(output, config.MARKDOWN_DIRECTORY_FOR_PDF),
      config.ANCHOR_CHARS_TO_EXLUDE_FOR_PDF
    );
  } catch (error) {
    let message = 'Unable to generate markdown. ';
    if (error.message) {
      message += error.message;
    }
    console.error(message); // eslint-disable-line
    debug(error);
  }
};

const generatePdfFor = (input, output) => {
  const pdfDirectory = path.join(output, config.PDF_DIRECTORY);
  createDirectory(pdfDirectory);

  const markdownDirectoryForPDF = path.join(output, config.MARKDOWN_DIRECTORY_FOR_PDF);
  generateMarkdown(input, markdownDirectoryForPDF, false);

  const parsedMarkdown = parseInput(markdownDirectoryForPDF);

  generatePDF(parsedMarkdown, pdfDirectory);
};

main();
