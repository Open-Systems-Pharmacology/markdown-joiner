const debug = require('debug')('MarkdownHelpers');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const miscHelpers = require('./misc-helpers');
const hasChildren = miscHelpers.hasChildren;
const writeToFile = miscHelpers.writeToFile;
const isMarkdown = miscHelpers.isMarkdown;
const fileShouldBeIgnored = miscHelpers.fileShouldBeIgnored;
const isImage = miscHelpers.isImage;
const glob = require('glob');

const generateMarkdown = (content, outputDirectory, parentDirectory = '') => {
  content.forEach(item => {
    if (item.type === config.DIRECTORY && hasChildren(item)) {
      const folderName = path.join(outputDirectory, parentDirectory, item.name);
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
      generateMarkdownForChapter(
        item,
        folderName,
        path.join(parentDirectory, item.name),
        outputDirectory
      );
      generateMarkdown(item.children, outputDirectory, path.join(parentDirectory, item.name));
    }
  });
};

const generateMarkdownForChapter = (chapter, folderName, parentDirectory, outputDirectory) => {
  if (!chapter.children) {
    return;
  }
  const outputFile = `${path.join(folderName, chapter.name)}.md`;
  debug(`Generating markdown for ${outputFile}`);

  insertChapterContent(chapter, outputFile);

  chapter.children.forEach(item => {
    if (item.type !== config.DIRECTORY) {
      if (isImage(item)) {
        insertImage(item, outputFile, parentDirectory, outputDirectory);
      } else {
        insertMarkdown(item, outputFile, path.join(folderName, item.name));
      }
    }
  });
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

const insertImage = (item, outputFile, parentDirectory, outputDirectory) => {
  debug(`Inserting image ${item.name}`);
  const imageMarkdown = `![${item.name}](${item.name})`;
  writeToFile(outputFile, imageMarkdown);
  fs.copyFileSync(item.path, path.join(outputDirectory, parentDirectory, item.name));
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

const generateSummaryFileTitle = summaryFileName => {
  writeToFile(summaryFileName, config.SUMMARY_FILE_TITLE);
};

const generateSummaryFile = (content, summaryFileName, parentDirectory = '', level = 0) => {
  const levelCount = Math.min(config.SECTION_LEVELS, config.MAX_SUPPORTED_SECTION_LEVELS);
  level = level === levelCount ? level : level + 1;

  debug(`Generating summary file: ${summaryFileName}`);

  content.forEach(item => {
    if (fileShouldBeIgnored(item)) {
      return;
    }
    if (item.type === 'directory') {
      const link = path.join(parentDirectory, item.name, `${item.name}.md`);
      const tab = '  ';
      writeToFile(
        summaryFileName,
        `${tab.repeat(level)}* [${getChapterTitle(item)}](${encodeURI(link)})`
      );
      if (hasChildren(item)) {
        generateSummaryFile(
          item.children,
          summaryFileName,
          path.join(parentDirectory, item.name),
          level
        );
      }
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

module.exports = {
  generateMarkdown,
  generateSummaryFile,
  generateSummaryFileTitle,
  generateIntro
};
