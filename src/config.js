const CONTENT_FILE = '_content.md';
const TITLE_FILE = '_title.md';
const SUMMARY_FILE = 'summary.md';
const IMAGE_EXTENSIONS = ['.png'];
const MD_EXTENSION = '.md';
const HTML_EXTENSION = '.html';
const MARKDOWN_EXTENSIONS = [MD_EXTENSION];
const HTML_DIRECTORY = 'html';
const MARKDOWN_DIRECTORY = 'markdown';
const PDF_DIRECTORY = 'pdf';
const DIRECTORY = 'directory';
const PDF_FILE = 'output.pdf';
const STYLES_DIRECTORY = 'styles';
const PDF_STYLES_FILE = 'pdf-styles.css';
const HTML_STYLES_FILE = 'html-styles.css';
// Markdown supports a maximum of 6 nesting levels
const MAX_SUPPORTED_SECTION_LEVELS = 6;
const SECTION_LEVELS = 6;
const INTRO_FILE = '_intro.md';
const PAGE_BREAK = '<div class="page-break"></div>';
const SUMMARY_FILE_TITLE = '# Table of Contents';
const IGNORE = [TITLE_FILE, MARKDOWN_DIRECTORY, HTML_DIRECTORY, CONTENT_FILE, INTRO_FILE];
const STYLES_HREF_MARKER = '___STYLES_HREF___';
const HTML_HEADER = `
<html>
  <head>
    <link href="https://fonts.googleapis.com/css?family=Lato:400,900,700,700italic,400italic,300italic,300,100italic,100,900italic" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Dosis:400,500,700,800,600,300,200" rel="stylesheet" type="text/css">
    <link rel="stylesheet" type="text/css" href="${STYLES_HREF_MARKER}">
  </head>
  <body>`;
const HTML_FOOTER = `
  </body>
</html>`;

module.exports = {
  CONTENT_FILE,
  IGNORE,
  MARKDOWN_DIRECTORY,
  HTML_DIRECTORY,
  IMAGE_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  TITLE_FILE,
  SUMMARY_FILE,
  DIRECTORY,
  MAX_SUPPORTED_SECTION_LEVELS,
  SECTION_LEVELS,
  MD_EXTENSION,
  HTML_EXTENSION,
  PDF_DIRECTORY,
  PDF_FILE,
  STYLES_DIRECTORY,
  HTML_STYLES_FILE,
  PDF_STYLES_FILE,
  HTML_HEADER,
  HTML_FOOTER,
  STYLES_HREF_MARKER,
  INTRO_FILE,
  PAGE_BREAK,
  SUMMARY_FILE_TITLE
};
