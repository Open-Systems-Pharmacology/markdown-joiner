#!/usr/bin/env node

const parseArgumentOptions = require('./helpers/cli-helpers').parseArgumentOptions;
const debug = require('debug')('Main');
const miscHelpers = require('./helpers/misc-helpers');
const parseInput = miscHelpers.parseInput;
const createDirectory = miscHelpers.createDirectory;
const markdownHelpers = require('./helpers/markdown-helpers');
const generateMarkdown = markdownHelpers.generateMarkdown;
const generateSummaryFile = markdownHelpers.generateSummaryFile;
const generateSummaryFileTitle = markdownHelpers.generateSummaryFileTitle;
const generateIntro = markdownHelpers.generateIntro;
const htmlHelpers = require('./helpers/html-helpers');
const generateHTML = htmlHelpers.generateHTML;
const path = require('path');
const config = require('./config');
const generatePDF = require('./helpers/pdf-helpers').generatePDF;
const fs = require('fs');
const rimraf = require('rimraf');

const main = () => {
  try {
    const args = parseArgumentOptions();
    const parsedInput = parseInput(args.input);

    if (args.force) {
      debug('Deleting output folder.');
      rimraf.sync(args.output);
    } else if (fs.existsSync(args.output)) {
      throw new Error('Output folder is not empty. Use -f to force delete.');
    }

    createDirectory(args.output);

    // MARKDOWN
    const markdownDirectory = path.join(args.output, config.MARKDOWN_DIRECTORY);
    createDirectory(markdownDirectory);

    const introFileName = path.join(markdownDirectory, config.INTRO_FILE);
    generateIntro(args.input, introFileName);

    const summaryFileName = path.join(markdownDirectory, config.SUMMARY_FILE);
    generateSummaryFileTitle(summaryFileName);
    generateSummaryFile(parsedInput, summaryFileName);
    generateMarkdown(parsedInput, markdownDirectory);

    // HTML
    const htmlDirectory = path.join(args.output, config.HTML_DIRECTORY);
    createDirectory(htmlDirectory);
    const stylesFile = path.join(__dirname, config.STYLES_DIRECTORY, config.HTML_STYLES_FILE);
    fs.writeFileSync(path.join(htmlDirectory, config.HTML_STYLES_FILE), fs.readFileSync(stylesFile));
    const parsedMarkdown = parseInput(markdownDirectory);
    generateHTML(parsedMarkdown, htmlDirectory);

    // PDF
    const pdfDirectory = path.join(args.output, config.PDF_DIRECTORY);
    createDirectory(pdfDirectory);
    generatePDF(parsedMarkdown, pdfDirectory);
  } catch (error) {
    let message = 'Unable to generate markdown. ';
    if (error.message) {
      message += error.message;
    }
    console.error(message); // eslint-disable-line
    debug(error);
  }
};

main();
