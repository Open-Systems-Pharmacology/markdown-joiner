#!/usr/bin/env node

const parseArgumentOptions = require('./helpers/cli-helpers').parseArgumentOptions;
const debug = require('debug')('Main');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const miscHelpers = require('./helpers/misc-helpers');
const { createDirectory } = miscHelpers;
const { generateMarkdown } = require('./helpers/markdown-helpers');
const config = require('./config');

const main = () => {
  try {
    const args = parseArgumentOptions();
    const { force, input, output } = args;

    if (!fs.existsSync(input)) {
      throw new Error(`Input folder '${input}' does not exist.`);
    }

    if (force) {
      debug('Deleting output folder.');
      rimraf.sync(output);
    } else if (fs.existsSync(output) && fs.readdirSync(output).length > 0) {
      throw new Error(`Output folder '${output}' is not empty. Use -f to force delete.`);
    }

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

main();
