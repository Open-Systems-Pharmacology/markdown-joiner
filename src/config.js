const CONTENT_FILE = '_content.md';
const TITLE_FILE = '_title.md';
const SUMMARY_FILE = 'summary.md';
const IMAGE_EXTENSIONS = ['.png'];
const MD_EXTENSION = '.md';
const MARKDOWN_EXTENSIONS = [MD_EXTENSION];
const MARKDOWN_DIRECTORY_FOR_PDF = 'markdown_for_pdf';
const MARKDOWN_DIRECTORY_FOR_GITHUB = 'markdown_for_github';
const PDF_DIRECTORY = 'pdf';
const DIRECTORY = 'directory';
const PDF_FILE = 'output.pdf';
const STYLES_DIRECTORY = 'styles';
const PDF_STYLES_FILE = 'pdf-styles.css';
// Markdown supports a maximum of 6 nesting levels
const MAX_SUPPORTED_SECTION_LEVELS = 6;
const SECTION_LEVELS = 6;
const INTRO_FILE = '_intro.md';
const PAGE_BREAK = '<div class="page-break"></div>';
const SUMMARY_FILE_TITLE = '# Table of Contents';
const IGNORE = [
  TITLE_FILE,
  CONTENT_FILE,
  INTRO_FILE,
  SUMMARY_FILE,
  MARKDOWN_DIRECTORY_FOR_PDF,
  MARKDOWN_DIRECTORY_FOR_GITHUB
];
const SINGLE_MARKDOWN_FILE = 'report.md';
const IMAGES_DIRECTORY = 'images';
const ANCHOR_CHARS_TO_EXLUDE_FOR_GITHUB = '[`~!@#$%^&*()+=<>?,./:;"\'|{}\\–—]';
const ANCHOR_CHARS_TO_EXLUDE_FOR_PDF = '[`~!@#$%^&*()+=<>?,/:;"\'|{}\\–—]';

module.exports = {
  CONTENT_FILE,
  IGNORE,
  MARKDOWN_DIRECTORY_FOR_GITHUB,
  MARKDOWN_DIRECTORY_FOR_PDF,
  IMAGE_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  TITLE_FILE,
  SUMMARY_FILE,
  DIRECTORY,
  MAX_SUPPORTED_SECTION_LEVELS,
  SECTION_LEVELS,
  MD_EXTENSION,
  PDF_DIRECTORY,
  PDF_FILE,
  STYLES_DIRECTORY,
  PDF_STYLES_FILE,
  INTRO_FILE,
  PAGE_BREAK,
  SUMMARY_FILE_TITLE,
  SINGLE_MARKDOWN_FILE,
  IMAGES_DIRECTORY,
  ANCHOR_CHARS_TO_EXLUDE_FOR_GITHUB,
  ANCHOR_CHARS_TO_EXLUDE_FOR_PDF
};
