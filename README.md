<p align="center">
  <img width="180" src="icon.png">
  <h1 align="center">BenchmarkIt!</h1>
  <div align="center">BenchmarkIt! is a browser extension to find CPU/GPU benchmark scores on the webpage.</div>
</p>

[![Firefox](https://extensionworkshop.com/assets/img/documentation/publish/get-the-addon-178x60px.dad84b42.png)](https://addons.mozilla.org/firefox/addon/benchmarkit/)

## Overview

BenchmarkIt! is a browser extension that allows you to easily look up CPU and GPU benchmark scores on web pages. Simply select text to instantly display PassMark benchmark data.

## Key Features

### 🔍 Auto-Detection
- Automatically detects CPU, GPU, and mobile device product names
- Supports major brands including Intel, AMD, NVIDIA, Apple, Qualcomm, MediaTek, Samsung, and more
- High-precision detection using regex pattern matching

### 📊 Benchmark Data Display
- **CPU**: Displays multi-core and single-core scores
- **GPU**: Shows benchmark scores
- Real-time data retrieval from PassMark database

### 🎨 Modern UI
- Information icon appears near selected text
- Beautiful modal window for displaying benchmark data
- Responsive design that works on mobile devices
- Loading animations and error handling

### 🌐 Cross-Browser Support
- Chrome/Chromium-based browsers
- Firefox
- Optimized manifest files for each browser

## How to Use

1. **Select Text**: Select CPU or GPU product names on web pages
2. **Click Icon**: Click the information icon (ℹ️) that appears
3. **View Data**: Check benchmark scores in the modal window
4. **View Details**: Access more detailed information via PassMark detail page links

## Supported Products

### CPU
- Intel Core i3/i5/i7/i9 series
- Intel Core Ultra series
- AMD Ryzen series
- Apple M1/M2/M3 series
- Qualcomm Snapdragon
- MediaTek Dimensity/Helio

### GPU
- NVIDIA GeForce RTX/GTX series
- AMD Radeon RX/HD series
- Intel Arc series
- Intel Iris/UHD Graphics

### Mobile Devices
- iPhone series
- Samsung Galaxy series
- Google Pixel series
- OnePlus, Xiaomi, Huawei and other Android devices

## Installation

### Firefox
1. Install from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/benchmarkit/)
2. Restart your browser to enable the extension

### Chrome/Chromium
1. Clone this repository
2. Run `build.py` to create Chrome package
3. Enable "Developer mode" in Chrome's extension management page
4. Load the unpacked folder from `dist/chrome.zip`

## Development

### Project Structure
```
BenchmarkIt/
├── background/          # Background scripts
│   ├── background.js   # Main background processing
│   └── offscreen.html  # Chrome offscreen document
├── content/            # Content scripts
│   ├── init.js         # Initialization
│   ├── detectProduct.js # Product name detection logic
│   ├── appendButton.js # Information icon display
│   └── showInfo.js     # Modal display and UI
├── dist/               # Build artifacts
├── manifest_*.json     # Browser-specific manifest files
└── build.py           # Build script
```

### Build Instructions
```bash
python build.py
```

### Technical Specifications
- **Manifest V3** support
- **ES6+** JavaScript
- **CSS3** animations
- Data fetching via **Fetch API**
- HTML parsing with **DOMParser**

## Privacy

- Only selected text is sent to PassMark API
- No personal information or browsing history is collected
- Data is transmitted over encrypted HTTPS connections

## License

This project is released under the AGPL License. See the [LICENSE](LICENSE) file for details.

## Contributing

Please report bugs and feature requests via [Issues](https://github.com/your-username/BenchmarkIt/issues).
Pull requests are welcome.

## Changelog

### v1.0
- Initial release
- CPU/GPU benchmark search functionality
- Chrome/Firefox support
- Modern UI implementation
