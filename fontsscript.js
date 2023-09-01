const fs = require('fs');
const path = require('path');

const FONTS_DIR = './app/fonts'; // Path to the folder containing the font files
const CSS_FILE = './app/globals.css'; // Path to the CSS file to write the @font-face rules to

// Get the list of font files in the specified folder
const fontFiles = fs.readdirSync(FONTS_DIR);

// Generate the @font-face rule for each font file
const css = fontFiles
  .map((file) => {
    // Extract the font name and format from the file name
    const ext = path.extname(file);
    let format;
    switch (ext) {
      case '.ttf':
        format = 'truetype';
        break;
      case '.otf':
        format = 'opentype';
        break;
      case '.woff':
        format = 'woff';
        break;
      case '.woff2':
        format = 'woff2';
        break;
      default:
        return '';
    }
    const name = path.basename(file, ext);

    // Generate the @font-face rule
    return `@font-face {
  font-family: '${name}';
  src: url('./fonts/${file}') format('${format}');
}`;
  })
  .join('\n\n');

// Append the generated CSS to the specified file
fs.appendFileSync(CSS_FILE, css);