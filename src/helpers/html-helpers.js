const showdown = require('showdown');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const miscHelpers = require('./misc-helpers');
const { hasChildren, isImage, writeToFile } = miscHelpers;

showdown.setOption('tables', true);
const converter = new showdown.Converter();

const generateHTML = (content, outputDirectory, parentDirectory = '') => {
  content.forEach(item => {
    const folderName = path.join(outputDirectory, parentDirectory, item.name);
    if (item.type === config.DIRECTORY && hasChildren(item)) {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
      generateHTML(item.children, outputDirectory, path.join(parentDirectory, item.name));
    } else {
      generateHTMLForItem(item, folderName, parentDirectory, outputDirectory);
    }
  });
};

const generateHTMLForItem = (item, folderName, parentDirectory, outputDirectory) => {
  if (item.type === config.DIRECTORY && hasChildren(item)) {
    generateHTMLForItem(item.children);
    return;
  }

  if (isImage(item)) {
    fs.copyFileSync(item.path, folderName);
    return;
  }

  const markdownContent = fs.readFileSync(item.path, 'utf8');
  let htmlContent = converter.makeHtml(markdownContent);

  if (item.name === config.SUMMARY_FILE) {
    htmlContent = fixLinksSource(htmlContent);
  }

  const depth = calculateTreeDepth(parentDirectory);
  htmlContent = wrapInHTMLHeader(htmlContent, depth);
  const fileName = item.name.replace(config.MD_EXTENSION, config.HTML_EXTENSION);
  const htmlFile = path.join(outputDirectory, parentDirectory, fileName);
  writeToFile(htmlFile, htmlContent);
};

const calculateTreeDepth = url => {
  const elements = url.split('/');
  if (elements.length === 1) {
    return elements[0] === '' ? 0 : 1;
  }
  return elements.length;
};

const wrapInHTMLHeader = (content, depth) => {
  const parentDirectory = depth ? '../'.repeat(depth) : '';
  const stylesUrl = path.join(parentDirectory, config.HTML_STYLES_FILE);
  const header = config.HTML_HEADER.replace(config.STYLES_HREF_MARKER, stylesUrl);
  const footer = config.HTML_FOOTER;
  return `${header}${content}${footer}`;
};

// Replaces all link's URLs so they target HTML files
// instead of Markdown files.
const fixLinksSource = content => content.replace(new RegExp(/\.md/, 'gm'), config.HTML_EXTENSION);

module.exports = {
  generateHTML
};
