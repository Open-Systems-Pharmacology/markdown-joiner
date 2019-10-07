# Installation

## Requirements

`node.js` needs to be installed on the machine in order to use `markdown-joiner`. Please follow
`https://nodejs.org/en/download/` if you need to install node on your machine.

## Global Installation

```
npm install -g @ospsuite/markdown-joiner
```

## Using a Firewall?

If you are behing a firewall, you may have to do the following before installing the package

```
npm config set proxy <proxy-servers-address>
```

# Usage

## Displaying help

```
markdown-joiner --help
Usage: markdown-joiner [options]

Options:
  -v, --version        output the version number
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

This is the easiest way to test the `development` version. Download the source code using `git`. Form the local
`markdown-joiner` folder, execute the following

### Once

```
npm install
```

### Then

```
npm run start -- --input <path_to_input_directory> --output <path_to_output_directory>
```

Make sure to include the double dash before the command line arguments. This is how NPM allows you to pass command line
arguments to scripts.

#### Example

```
npm run start -- --input "C:\reporting engine\reporting engine output" --output "C\reporting engine\report"
```

## Debugging script

```
set DEBUG=* & npm run start -- --input <path_to_input_directory> --output <path_to_output_directory>
```

## Creating the PDF

Navigate to `<path_to_output_directory>\markdown_for_pdf` and open the file `report.md` with for instance Typora. PDF is
just one click away

## Uploading to Github

Navigate to `<path_to_output_directory>\markdown_for_github`. You can upload the file `report.md` along with the folder
`images` to github to create a live documentation

## Uninstall

```
npm uninstall -g @ospsuite/markdown-joiner
```

## NPM Publishing

```
npm publish --access public
```
