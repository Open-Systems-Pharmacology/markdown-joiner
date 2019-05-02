const dirTree = require('directory-tree');
const debug = require('debug')('InputHelpers');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const parseInput = inputPath => {
  debug('Parsing input directory.');
  const tree = dirTree(inputPath);
  debug('Done parsing input directory.');
  return tree.children;
};

const hasChildren = item => item.children && item.children.length;

const writeToFile = (outputFile, content) => {
  debug(`Writing content to file ${outputFile}`);
  fs.appendFileSync(outputFile, content);
  fs.appendFileSync(outputFile, '\n');
};

const isImage = item => {
  const extension = path.extname(item.name);
  return config.IMAGE_EXTENSIONS.indexOf(extension.toLowerCase()) >= 0;
};

const createDirectory = directory => {
  if (!fs.existsSync(directory)) {
    debug(`Creating output directory: ${directory}`);
    fs.mkdirSync(directory);
  }
};

const isMarkdown = item => {
  const extension = path.extname(item.name);
  return config.MARKDOWN_EXTENSIONS.indexOf(extension.toLowerCase()) >= 0;
};

const fileShouldBeIgnored = item => {
  const hiddenFileRegex = new RegExp(/^\./);
  return config.IGNORE.indexOf(item.name) >= 0 || hiddenFileRegex.test(item.name);
};

module.exports = {
  parseInput,
  hasChildren,
  writeToFile,
  isImage,
  createDirectory,
  isMarkdown,
  fileShouldBeIgnored
};
