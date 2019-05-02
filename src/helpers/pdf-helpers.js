const markdownPDF = require('markdown-pdf');
const path = require('path');
const config = require('../config');
const miscHelpers = require('./misc-helpers');
const hasChildren = miscHelpers.hasChildren;
const isMarkdown = miscHelpers.isMarkdown;
const fileShouldBeIgnored = miscHelpers.fileShouldBeIgnored;
const isImage = miscHelpers.isImage;
const fs = require('fs');
const through = require('through2');
const cheerio = require('cheerio');
const debug = require('debug')('PDFHelpers');
const dirTree = require('directory-tree');
const fileUrl = require('file-url');

const mdDocs = [];

// eslint-disable-next-line func-names
const preProcessHtml = outputDirectory => () => through(function (chunk, enc, callback) {
  // eslint-disable-next-line id-length
  const $ = cheerio.load(chunk);

  $('img[src]').each((idx, elem) => {
    let imageSrc = $(elem).attr('src');
    imageSrc = fileUrl(path.join(outputDirectory, imageSrc));
    $(elem).attr('src', imageSrc);
  });

  $('a').each((idx, elem) => {
    const originalTag = $(elem);
    const textTag = originalTag.text();

    originalTag.after(`<strong>${textTag}</strong>`);
    originalTag.remove();
  });

  this.push($.html());
  callback();
});

const clean = directory => {
  const tree = dirTree(directory);
  tree.children.forEach(item => {
    if (isImage(item)) {
      fs.unlinkSync(item.path);
    }
  });
};

const generatePDF = (content, outputDirectory, parentDirectory = '') => {

  const summaryFile = path.join(outputDirectory, '..', config.MARKDOWN_DIRECTORY, config.SUMMARY_FILE);
  const introFile = path.join(outputDirectory, '..', config.MARKDOWN_DIRECTORY, config.INTRO_FILE);
  if (fs.existsSync(introFile)) {
    mdDocs.push(introFile);
  }
  mdDocs.push(summaryFile);

  generatePDFFromMarkdown(content, outputDirectory, parentDirectory);
  const bookPath = path.join(outputDirectory, config.PDF_FILE);
  const cssPath = path.join(__dirname, '..', config.STYLES_DIRECTORY, config.PDF_STYLES_FILE);
  const runningsPath = path.resolve(__dirname, 'running-t.js');

  const pdfOptions = {
    preProcessHtml: preProcessHtml(outputDirectory),
    cssPath,
    runningsPath,
    paperFormat: 'Letter'
  };

  markdownPDF(pdfOptions)
    .concat.from(mdDocs)
    .to(bookPath, () => {
      debug('Finished generating PDF.');
      // Delete all images since they're not needed anymore.
      clean(outputDirectory);
    });
};

const generatePDFFromMarkdown = (content, outputDirectory, parentDirectory = '') => {
  content.forEach(item => {
    if (fileShouldBeIgnored(item)) {
      return;
    }
    if (item.type === config.DIRECTORY && hasChildren(item)) {
      generatePDFFromMarkdown(
        item.children,
        outputDirectory,
        path.join(parentDirectory, item.name)
      );
    } else if (isMarkdown(item) && item.name !== config.SUMMARY_FILE) {
      mdDocs.push(item.path);
    } else if (isImage(item)) {
      fs.copyFileSync(item.path, path.join(outputDirectory, item.name));
    }
  });
};

module.exports = {
  generatePDF
};
