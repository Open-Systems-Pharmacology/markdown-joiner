const commander = require('commander');
const version = require('../../package.json').version;
const path = require('path');
const debug = require('debug')('CLIHelpers');
const lodash = require('lodash');
const flattenDeep = lodash.flattenDeep;
const remove = lodash.remove;

const sanitizeArguments = () => {
  // Command line args are not parsed properly due to a
  // Powershell bug.
  // See https://github.com/nodejs/node/issues/21854
  // and https://github.com/PowerShell/PowerShell/issues/7400
  const sanitizedArgs = process.argv.map(entry => {

    // Here we're trying to capture the flag after the
    // escaped quotes.
    const regex = new RegExp(/"\s*-(.)\s*/gm);
    const match = entry.match(regex);
    if (!match) {
      return entry;
    }

    const splitItems = entry.split(match[0]);

    // Remove any characters around the flag (-o or -i)
    const flag = match[0].replace('" ', '').replace(' ', '');

    // Reconstruct the argument array.
    const newArgs = [splitItems[0], flag, splitItems[1]];
    return newArgs;
  });

  // Remove any empty elements and escaped quotes.
  const flattenedArgs = remove(flattenDeep(sanitizedArgs), item => item !== '').map(item => item.replace('"', ''));
  return consolidateArgs(flattenedArgs);
};

const consolidateArgs = (flattenedArgs) => {

  let isPreviousArgFlag = false;
  const finalArgs = [];

  // Sometimes if the argument paths have spaces
  // the words between spaces appear as separate arguments.
  // We must consolidate them.
  flattenedArgs.forEach((arg, idx) => {
    if (idx < 2) {
      finalArgs.push(arg);
      return;
    }

    if (arg.indexOf('-') === 0) {
      isPreviousArgFlag = true;
      finalArgs.push(arg);
      return;
    }

    if (isPreviousArgFlag) {
      finalArgs.push(arg);
      isPreviousArgFlag = false;
    } else {
      finalArgs[idx - 1] += ` ${arg}`;
    }
  });
  return finalArgs;
};

const parseArgumentOptions = () => {
  const sanitizedArgs = sanitizeArguments();
  commander
    .version(version)
    .option('-i, --input [path]', 'Path to the input directory')
    .option('-o, --output [path]', 'Path to the output directory')
    .option('-f, --force', 'Force clean the output directory before generating files')
    .parse(sanitizedArgs);

  if (!commander.input || !commander.output) {
    throw new Error('Please provide input and output paths.');
  }

  commander.input = resolvePath(commander.input);
  commander.output = resolvePath(commander.output);

  debug(`Input path: ${commander.input}`);
  debug(`Output path: ${commander.output}`);

  return commander;
};

const resolvePath = dirPath => (dirPath ? path.resolve(dirPath) : dirPath);

module.exports = {
  parseArgumentOptions
};
