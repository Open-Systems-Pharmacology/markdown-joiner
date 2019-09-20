const debug = require('debug')('MarkdownHelpers');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const config = require('../config');
const miscHelpers = require('./misc-helpers');
const { hasChildren, writeToFile, isMarkdown, fileShouldBeIgnored, isImage, parseInput, createDirectory } = miscHelpers;

const generateMarkdown = (input, markdownDirectory, createImageAsRelative = true) => {
  const parsedInput = parseInput(input);
  createDirectory(markdownDirectory);

  const introFileName = path.join(markdownDirectory, config.INTRO_FILE);
  generateIntro(input, introFileName);

  const summaryFileName = path.join(markdownDirectory, config.SUMMARY_FILE);
  generateSummaryFileTitle(summaryFileName);
  generateSummaryFile(parsedInput, summaryFileName);
  generateMarkdownForContent(parsedInput, markdownDirectory, createImageAsRelative);
};

const generateSingleMarkdown = (input, markdownDirectory) => {
  const parsedInput = parseInput(input);
  createDirectory(markdownDirectory);
  const imageDirectory = path.join(markdownDirectory, config.IMAGES_DIRECTORY);
  const contentFile = path.join(markdownDirectory, config.SINGLE_MARKDOWN_FILE);
  createDirectory(imageDirectory);
  generateIntro(input, contentFile);
  generateSummaryFileTitle(contentFile);
  generateSummaryFile(parsedInput, contentFile, false);
  generateSingleMarkdownContent(parsedInput, contentFile, imageDirectory);
};

const generateMarkdownForContent = (
  content,
  outputDirectory,
  createImageAsRelative,
  parentDirectory = '',
  currentLevel = 0
) => {
  const level = getNextLevel(currentLevel);

  content.forEach(item => {
    if (item.type === config.DIRECTORY && hasChildren(item)) {
      const inputFolderName = path.join(parentDirectory, item.name);
      const folderName = path.join(outputDirectory, parentDirectory, item.name);
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
      generateMarkdownForChapter(item, folderName, inputFolderName, outputDirectory, level, createImageAsRelative);
      generateMarkdownForContent(item.children, outputDirectory, createImageAsRelative, inputFolderName, level);
    }
  });
};

const generateMarkdownForChapter = (
  chapter,
  folderName,
  parentDirectory,
  outputDirectory,
  level,
  createImageAsRelative
) => {
  if (!chapter.children) {
    return;
  }
  const outputFile = `${path.join(folderName, chapter.name)}.md`;
  const outputChapterDirectory = path.join(outputDirectory, parentDirectory);
  debug(`Generating markdown for ${outputFile}`);

  insertCharpterTitle(chapter, outputFile, level);
  insertChapterContent(chapter, outputFile);

  chapter.children.forEach(item => {
    if (item.type !== config.DIRECTORY) {
      if (isImage(item)) {
        insertImage(item, outputFile, outputChapterDirectory, createImageAsRelative);
      } else {
        insertMarkdown(item, outputFile);
      }
    }
  });
};

const generateSingleMarkdownContent = (
  content,
  contentFile,
  imageDirectory,
  parentDirectory = '',
  currentLevel = 0
) => {
  const level = getNextLevel(currentLevel);

  content.forEach(item => {
    if (item.type === config.DIRECTORY && hasChildren(item)) {
      const inputFolderName = path.join(parentDirectory, item.name);
      const outputImageFolderName = path.join(imageDirectory, parentDirectory, item.name);
      if (!fs.existsSync(outputImageFolderName)) {
        fs.mkdirSync(outputImageFolderName);
      }
      concatenateMarkdownForChapter(item, contentFile, outputImageFolderName, level);
      generateSingleMarkdownContent(item.children, contentFile, imageDirectory, inputFolderName, level);
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
        insertImage(item, contentFile, outputImageFolderName, true);
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

const insertImage = (item, outputFile, outputDirectory, createImageAsRelative) => {
  const imageTargetPath = path.join(outputDirectory, item.name);
  const relativePath = createRelativePath(outputFile, imageTargetPath);
  const imagePath = createImageAsRelative ? relativePath : imageTargetPath;
  debug(`Inserting image ${item.name} from ${imageTargetPath}`);
  const imageMarkdown = `![${item.name}](${imagePath})\n`;
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

const generateSummaryFile = (
  content,
  summaryFileName,
  createFileLink = true,
  parentDirectory = '',
  currentLevel = 0
) => {
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
    const link = createFileLink ? path.join(parentDirectory, item.name, `${item.name}.md`) : `#${createAnchor(title)}`;

    writeToFile(summaryFileName, `${tab.repeat(level)}* [${title}](${link})`);

    if (hasChildren(item)) {
      generateSummaryFile(item.children, summaryFileName, createFileLink, path.join(parentDirectory, item.name), level);
    }
  });
};

// Returns a valid markdown anchor from a header that can be used to navigate within a single document
// code taken from https://gist.github.com/asabaylus/3071099#gistcomment-2563127 for completion
const createAnchor = val =>
  val
    .toLowerCase()
    .replace(/ /g, '-')
    // single chars that are removed
    .replace(/[`~!@#$%^&*()+=<>?,./:;"'|{}\[\]\\–—]/g, '')
    // CJK punctuations that are removed
    .replace(/[　。？！，、；：“”【】（）〔〕［］﹃﹄“”‘’﹁﹂—…－～《》〈〉「」]/g, '');

const getNextLevel = currentLevel => {
  const levelCount = Math.min(config.SECTION_LEVELS, config.MAX_SUPPORTED_SECTION_LEVELS);
  return currentLevel === levelCount ? currentLevel : currentLevel + 1;
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

module.exports = {
  generateMarkdown,
  generateSingleMarkdown
};
