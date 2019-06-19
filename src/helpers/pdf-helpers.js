const markdownPDF = require('markdown-pdf');
const path = require('path');
const config = require('../config');
const fs = require('fs');
const through = require('through2');
const cheerio = require('cheerio');
const debug = require('debug')('PDFHelpers');
const fileUrl = require('file-url');
const miscHelpers = require('./misc-helpers');
const { hasChildren, isMarkdown, fileShouldBeIgnored } = miscHelpers;

const mdDocs = [];

const preProcessHtml = () =>
  // eslint-disable-next-line func-names
  through(function(chunk, enc, callback) {
    // eslint-disable-next-line id-length
    const $ = cheerio.load(chunk);

    $('img[src]').each((idx, elem) => {
      const imageSrc = $(elem).attr('src');
      $(elem).attr('src', fileUrl(imageSrc));
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

const generatePDF = (content, outputDirectory) => {
  const summaryFile = path.join(outputDirectory, '..', config.MARKDOWN_DIRECTORY, config.SUMMARY_FILE);
  const introFile = path.join(outputDirectory, '..', config.MARKDOWN_DIRECTORY, config.INTRO_FILE);

  if (fs.existsSync(introFile)) {
    mdDocs.push(introFile);
  }
  mdDocs.push(summaryFile);

  generatePDFFromMarkdown(content, outputDirectory);

  const bookPath = path.join(outputDirectory, config.PDF_FILE);
  const cssPath = path.join(__dirname, '..', config.STYLES_DIRECTORY, config.PDF_STYLES_FILE);
  const runningsPath = path.resolve(__dirname, 'running-t.js');

  const pdfOptions = {
    preProcessHtml,
    cssPath,
    runningsPath,
    paperFormat: 'Letter'
  };

  markdownPDF(pdfOptions)
    .concat.from(mdDocs)
    .to(bookPath, () => {
      debug('Finished generating PDF.');
    });
};

const generatePDFFromMarkdown = (content, outputDirectory, parentDirectory = '') => {
  content.forEach(item => {
    if (fileShouldBeIgnored(item)) {
      return;
    }
    if (item.type === config.DIRECTORY && hasChildren(item)) {
      generatePDFFromMarkdown(item.children, outputDirectory, path.join(parentDirectory, item.name));
    } else if (isMarkdown(item) && item.name !== config.SUMMARY_FILE) {
      mdDocs.push(item.path);
    }
  });
};

module.exports = {
  generatePDF
};
