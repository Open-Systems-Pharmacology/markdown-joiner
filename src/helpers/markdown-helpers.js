const debug = require('debug')('MarkdownHelpers');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const config = require('../config');
const miscHelpers = require('./misc-helpers');
const { hasChildren, writeToFile, isMarkdown, fileShouldBeIgnored, isImage, parseInput, createDirectory } = miscHelpers;

const generateMarkdown = (input, markdownDirectory, charsToExclude) => {
  const parsedInput = parseInput(input);
  createDirectory(markdownDirectory);
  const imageDirectory = path.join(markdownDirectory, config.IMAGES_DIRECTORY);
  const contentFile = path.join(markdownDirectory, config.SINGLE_MARKDOWN_FILE);
  const createAnchor = createMarkdownAnchorFunc(charsToExclude);
  createDirectory(imageDirectory);
  generateIntro(input, contentFile);
  generateSummaryFileTitle(contentFile);
  generateSummaryFile(parsedInput, contentFile, createAnchor);
  generateMarkdownContent(parsedInput, contentFile, imageDirectory);
};

const generateMarkdownContent = (content, contentFile, imageDirectory, parentDirectory = '', currentLevel = 0) => {
  const level = getNextLevel(currentLevel);

  content.forEach(item => {
    if (item.type === config.DIRECTORY && hasChildren(item)) {
      const inputFolderName = path.join(parentDirectory, item.name);
      const outputImageFolderName = path.join(imageDirectory, parentDirectory, item.name);
      if (!fs.existsSync(outputImageFolderName)) {
        fs.mkdirSync(outputImageFolderName);
      }
      concatenateMarkdownForChapter(item, contentFile, outputImageFolderName, level);
      generateMarkdownContent(item.children, contentFile, imageDirectory, inputFolderName, level);
    }
  });
};

const concatenateMarkdownForChapter = (chapter, contentFile, outputImageFolderName, level) => {
  if (!chapter.children) {
    return;
  }

  insertCharpterTitle(chapter, contentFile, level);
  insertChapterContent(chapter, contentFile);

  chapter.children.forEach(item => {
    if (item.type !== config.DIRECTORY) {
      if (isImage(item)) {
        insertImage(item, contentFile, outputImageFolderName);
      } else {
        insertMarkdown(item, contentFile);
      }
    }
  });
};

const insertCharpterTitle = (chapter, outputFile, level) => {
  debug(`Inserting title into ${chapter.path}`);
  const title = getChapterTitle(chapter);
  writeToFile(outputFile, `${'#'.repeat(level)} ${title}`);
};

const insertChapterContent = (chapter, outputFile) => {
  debug(`Inserting content into ${chapter.path}`);
  const contentFile = path.join(chapter.path, config.CONTENT_FILE);
  if (!fs.existsSync(contentFile)) {
    return;
  }
  const content = fs.readFileSync(contentFile, 'utf8');
  writeToFile(outputFile, content);
};

const insertImage = (item, outputFile, outputDirectory) => {
  const imageTargetPath = path.join(outputDirectory, item.name);
  const relativeImagePath = createRelativePath(outputFile, imageTargetPath);
  debug(`Inserting image ${item.name} from ${imageTargetPath}`);
  const imageMarkdown = `![${item.name}](${relativeImagePath})\n`;
  writeToFile(outputFile, imageMarkdown);
  fs.copyFileSync(item.path, imageTargetPath);
};

const insertMarkdown = (item, outputFile) => {
  if (fileShouldBeIgnored(item)) {
    debug(`Ignoring file ${item.name}`);
    return;
  }

  if (isMarkdown(item)) {
    debug(`Inserting markdown into ${item.path}`);
    const content = fs.readFileSync(item.path, 'utf8');
    writeToFile(outputFile, content);
  }
};

const getChapterTitle = chapter => {
  debug(`Getting title for ${chapter.name}`);
  const titleFile = path.join(chapter.path, config.TITLE_FILE);
  debug(`Title file: ${titleFile}`);
  if (!fs.existsSync(titleFile)) {
    return chapter.name;
  }
  return fs.readFileSync(titleFile, 'utf8').replace(/^\s+|\s+$/g, '');
};

const createRelativePath = (fromFile, toFile) => {
  const relativePath = path.relative(fromFile, toFile);
  //needs to remove the first relative sign as we are dealing with files and not folder
  if (relativePath.startsWith('..')) {
    return relativePath.substr('../'.length);
  }
  return relativePath;
};
const generateSummaryFileTitle = summaryFileName => {
  writeToFile(summaryFileName, config.SUMMARY_FILE_TITLE);
};

const generateSummaryFile = (content, summaryFileName, createAnchor, parentDirectory = '', currentLevel = 0) => {
  debug(`Generating summary file: ${summaryFileName}`);
  const tab = '  ';
  const level = getNextLevel(currentLevel);

  content.forEach(item => {
    if (fileShouldBeIgnored(item)) {
      return;
    }
    if (item.type !== 'directory') {
      return;
    }

    const title = getChapterTitle(item);

    writeToFile(summaryFileName, `${tab.repeat(level)}* [${title}](#${createAnchor(title)})`);

    if (hasChildren(item)) {
      generateSummaryFile(item.children, summaryFileName, createAnchor, path.join(parentDirectory, item.name), level);
    }
  });
};

const generateIntro = (inputPath, introFileName) => {
  const globOptions = {
    nodir: true,
    dot: false
  };
  const introFiles = glob.sync(`${inputPath}/*`, globOptions);
  introFiles.forEach(file => {
    const intro = fs.readFileSync(file, 'utf8');
    writeToFile(introFileName, intro);
  });
};

// Returns a valid markdown anchor from a header that can be used to navigate within a single document
// code taken from https://gist.github.com/asabaylus/3071099#gistcomment-2563127 for completion
const createMarkdownAnchorFunc = charsToExclude => {
  const removeRegEx = new RegExp(charsToExclude, 'g');
  return val =>
    val
      .toLowerCase()
      .replace(/ /g, '-')
      // single chars that are removed
      .replace(removeRegEx, '')
      // CJK punctuations that are removed
      .replace(/[　。？！，、；：“”【】（）〔〕［］﹃﹄“”‘’﹁﹂—…－～《》〈〉「」]/g, '');
};

const getNextLevel = currentLevel => {
  const levelCount = Math.min(config.SECTION_LEVELS, config.MAX_SUPPORTED_SECTION_LEVELS);
  return currentLevel === levelCount ? currentLevel : currentLevel + 1;
};

module.exports = {
  generateMarkdown
};
