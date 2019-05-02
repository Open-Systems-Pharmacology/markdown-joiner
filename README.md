# Installation

```
- Download the code from github and unzip it.
- cd markdown-joiner
- npm install -g .
```

# Usage

## Displaying help

```
markdown-joiner --help
Usage: markdown-joiner [options]

Options:
  -V, --version        output the version number
  -i, --input [path]   Path to the input directory 
  -o, --output [path]  Path to the output directory 
  -f, --force          Force clean the output directory before generating files
  -h, --help           output usage information
```

## Generating reports

```
markdown-joiner --input <path_to_input_directory> --output <path_to_output_directory>
```

## Running as an NPM script

```
npm run start -- --input <path_to_input_directory> --output <path_to_output_directory>
```

Make sure to include the double dash before the command line arguments. This is how NPM allows you to pass command line arguments to scripts.

## Debugging script

```
set DEBUG = * & npm run start -- --input <path_to_input_directory> --output <path_to_output_directory>
```

## Styling HTML and PDF

HTML and PDF documents can be styled independently by modifying `src/styles/html-styles.css` and `src/styles/pdf-styles.css` respectively.