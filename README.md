# CSV to YAML Converter

A fast, simple tool to convert CSV files to YAML format. Available as both a web app and CLI tool.

## Features

✅ **Web UI** - Beautiful, modern interface with file picker  
✅ **CLI** - Node.js command-line tool  
✅ **No dependencies for web** - Works offline  
✅ **Fast & lightweight** - Pure JavaScript  
✅ **Converts URL data** - Perfect for API testing  

## Quick Start

### Web App (Recommended)
1. Open `converter.html` in any modern web browser
2. Click "Browse" to select your CSV file
3. Click "Convert to YAML"
4. Click "Download YAML" to save

**No installation needed!** Works completely offline.

### CLI Tool

#### Installation
```bash
npm install
```

#### Usage
```bash
npm start
```

Then follow the prompts:
- Enter input CSV filename (default: `customdata.csv`)
- Enter output YAML filename (default: `inputs.yaml`)

## File Structure

```
├── converter.html       # Web app (open in browser)
├── convert.js          # CLI tool
├── package.json        # Dependencies
├── package-lock.json   # Lock file
└── README.md          # This file
```

## CSV Format

Your CSV should have a `url` column:

```csv
url
https://example.com/page1
https://example.com/page2
https://example.com/page3
```

## Output Format

Converts to YAML like:

```yaml
input0:
  url: https://example.com/page1
input1:
  url: https://example.com/page2
input2:
  url: https://example.com/page3
```

## Browser Compatibility

- Chrome/Edge 99+
- Firefox 111+
- Safari 15.1+

Requires `window.showOpenFilePicker()` support (modern browsers only).

## License

MIT
