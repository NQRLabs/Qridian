<img alt="Qridian-logo" src="./assets/images/logo.png" style="margin-left:auto; margin-right:auto; display:block; width:220px;"/>

# Qridian

**Qridian** is a lightweight, fully client‑side QR code **generator & scanner** for ARG creators and everyday tinkerers. It runs entirely in the browser—no servers, accounts, or build tools—so you can design, test, and scan codes with confidence, even offline.

## Overview

Qridian lets you **design branded QR codes** (colors, gradients, logos, corner shapes) and **scan** codes from the camera or from image files. Everything happens locally. It’s fast and privacy‑preserving.

## Features

### QR Code Generation

* **Live preview** with instant updates
* **Custom styling**: dot & corner styles, solid colors or **linear/radial gradients**
* **Logo embedding** with **auto‑elevated error‑correction** for reliability
* **Export** as **SVG** or **PNG**, plus **copy to clipboard**
* **Contrast checker** warns when colors may reduce scannability

### QR Code Scanning

* **Real‑time camera scanning** with optional region/outline highlighting
* **Scan from files** (PNG/JPG/WebP, etc.)
* **Smart output actions**: copy result; open links directly

### Security & Privacy

* **100% client‑side**—no data leaves your browser
* **Offline‑capable** after initial load

## Quick Start

1. Open `index.html` in a modern browser.
2. Create codes in **Create QR**; scan in **Scan QR** (camera requires HTTPS or `localhost`).
3. Download as SVG/PNG or copy to the clipboard.

> Tip: For camera access on mobile Safari and most desktop browsers, serve over HTTPS (or use `http://localhost` during local development). A quick option:
>
> ```bash
> python3 -m http.server 8080
> # then open http://localhost:8080
> ```

## Technical Notes

* **Generation** uses **`qr-code-styling`** (canvas/SVG output, gradients, logos).
* **Scanning** uses **`qr-scanner`** (Web Worker + optional `BarcodeDetector`).
* To ensure **full offline use**, place vendor files under `assets/js/vendor/` and reference them locally (see below). When vendoring `qr-scanner`, include **both** `qr-scanner.min.js` **and** `qr-scanner-worker.min.js` in the same folder.

## Accessibility

* High‑contrast UI and keyboard‑focusable controls
* Contrast warning for generated QR images to prevent unreadable codes

## License

MIT License — free for modification and use. Attribution appreciated if used publicly.

## Third-Party Components (vendored)

This distribution of **Qridian** bundles copies of the following open-source libraries.  
Each component remains under its own license; Qridian’s MIT license applies to Qridian’s original code only.

- **qr-code-styling@1.6.0-rc.1** — MIT License — © Denis Kozak  
  Files: `assets/js/vendor/qr-code-styling.js`  
  License: `vendor-licenses/qr-code-styling.LICENSE`  
  Project: https://github.com/kozakdenys/qr-code-styling

- **qr-scanner@1.4.2** — MIT License — © Nimiq  
  Files: 
  `assets/js/vendor/qr-scanner.min.js`, 
  `assets/js/vendor/qr-scanner-worker.min.js`  
  License: `vendor-licenses/qr-scanner.LICENSE`  
  Project: https://github.com/nimiq/qr-scanner

**Note:** We keep upstream copyright and license notices intact in the vendored files.

## Credit

Created by **NQR** for ARG designers, puzzle creators, and curious builders who like their tools simple, beautiful, and local‑first. If you use *Qridian* in an event or project, I’d love to hear about it.
