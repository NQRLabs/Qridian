/**
 * QR ARG Tool - Main Application Logic
 * MIT License - Copyright (c) 2025 NQR
 */

// Import QrScanner - note: this will be available after module loads
let QrScanner;
let qrCode = null;
let qrScannerInstance = null;
let currentLogoUrl = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  // Import QrScanner module
  try {
    // https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js
    const module = await import('./vendor/qr-scanner.min.js');
    //const module = await import('https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js');
    QrScanner = module.default;
    console.log('QrScanner loaded successfully');
  } catch (err) {
    console.error('Failed to load QrScanner:', err);
  }
  
  initializeTabs();
  initializeQRGenerator();
  initializeQRScanner();
  initializeLicenseModal();
});

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');

      // Update active states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');

      // Stop camera if switching away from scan tab
      if (tabName !== 'scan' && qrScannerInstance) {
        stopCamera();
      }
    });
  });
}

// ============================================================================
// QR CODE GENERATION
// ============================================================================

function initializeQRGenerator() {
  // Get all controls
  const qrText = document.getElementById('qr-text');
  const qrEcc = document.getElementById('qr-ecc');
  const qrSize = document.getElementById('qr-size');
  const qrMargin = document.getElementById('qr-margin');
  const qrDotStyle = document.getElementById('qr-dot-style');
  const qrCornerStyle = document.getElementById('qr-corner-style');
  const qrColor = document.getElementById('qr-color');
  const qrBgColor = document.getElementById('qr-bg-color');
  const qrGradient = document.getElementById('qr-gradient');
  const qrGradientStart = document.getElementById('qr-gradient-start');
  const qrGradientEnd = document.getElementById('qr-gradient-end');
  const qrGradientType = document.getElementById('qr-gradient-type');
  const qrLogo = document.getElementById('qr-logo');
  const qrLogoUrl = document.getElementById('qr-logo-url');
  const qrLogoSize = document.getElementById('qr-logo-size');
  const logoSizeValue = document.getElementById('logo-size-value');
  const gradientControls = document.getElementById('gradient-controls');

  // Download buttons
  const downloadSvg = document.getElementById('download-svg');
  const downloadPng = document.getElementById('download-png');
  const copyImage = document.getElementById('copy-image');

  // Logo size display
  qrLogoSize.addEventListener('input', () => {
    logoSizeValue.textContent = qrLogoSize.value;
    generateQR();
  });

  // Gradient toggle
  qrGradient.addEventListener('change', () => {
    gradientControls.style.display = qrGradient.checked ? 'flex' : 'none';
    generateQR();
  });

  // Logo file upload
  qrLogo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentLogoUrl = event.target.result;
        qrLogoUrl.value = ''; // Clear URL input
        generateQR();
      };
      reader.readAsDataURL(file);
    }
  });

  // Logo URL input
  qrLogoUrl.addEventListener('input', () => {
    if (qrLogoUrl.value.trim()) {
      currentLogoUrl = qrLogoUrl.value.trim();
      qrLogo.value = ''; // Clear file input
      generateQR();
    } else if (!qrLogo.files[0]) {
      currentLogoUrl = null;
      generateQR();
    }
  });

  // Add event listeners to all controls
  [qrText, qrEcc, qrSize, qrMargin, qrDotStyle, qrCornerStyle, 
   qrColor, qrBgColor, qrGradientStart, qrGradientEnd, qrGradientType].forEach(element => {
    element.addEventListener('input', generateQR);
    element.addEventListener('change', generateQR);
  });

  // Download handlers
  downloadSvg.addEventListener('click', () => downloadQRCode('svg'));
  downloadPng.addEventListener('click', () => downloadQRCode('png'));
  copyImage.addEventListener('click', copyQRToClipboard);

  // Generate initial QR code
  generateQR();
}

function generateQR() {
  const qrText = document.getElementById('qr-text').value || 'https://example.com';
  const qrEcc = document.getElementById('qr-ecc').value;
  const qrSize = parseInt(document.getElementById('qr-size').value);
  const qrMargin = parseInt(document.getElementById('qr-margin').value);
  const qrDotStyle = document.getElementById('qr-dot-style').value;
  const qrCornerStyle = document.getElementById('qr-corner-style').value;
  const qrColor = document.getElementById('qr-color').value;
  const qrBgColor = document.getElementById('qr-bg-color').value;
  const qrGradient = document.getElementById('qr-gradient').checked;
  const qrGradientStart = document.getElementById('qr-gradient-start').value;
  const qrGradientEnd = document.getElementById('qr-gradient-end').value;
  const qrGradientType = document.getElementById('qr-gradient-type').value;
  const qrLogoSize = parseFloat(document.getElementById('qr-logo-size').value);

  // Auto-increase error correction if logo is present
  let correctionLevel = qrEcc;
  if (currentLogoUrl && (qrEcc === 'L' || qrEcc === 'M')) {
    correctionLevel = 'H';
    document.getElementById('qr-ecc').value = 'H';
  }

  // Check contrast
  checkContrast(qrColor, qrBgColor);

  // Configure QR code options
  const options = {
    width: qrSize,
    height: qrSize,
    type: 'canvas',
    data: qrText,
    margin: qrMargin,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: correctionLevel
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: qrLogoSize,
      margin: 5,
      crossOrigin: 'anonymous'
    },
    dotsOptions: {
      color: qrGradient ? undefined : qrColor,
      gradient: qrGradient ? {
        type: qrGradientType,
        rotation: 0,
        colorStops: [
          { offset: 0, color: qrGradientStart },
          { offset: 1, color: qrGradientEnd }
        ]
      } : undefined,
      type: qrDotStyle
    },
    backgroundOptions: {
      color: qrBgColor
    },
    cornersSquareOptions: {
      color: qrGradient ? qrGradientStart : qrColor,
      type: qrCornerStyle
    },
    cornersDotOptions: {
      color: qrGradient ? qrGradientEnd : qrColor,
      type: qrCornerStyle === 'dot' ? 'dot' : 'square'
    }
  };

  // Add logo if present
  if (currentLogoUrl) {
    options.image = currentLogoUrl;
  }

  // Clear previous QR code
  const container = document.getElementById('qr-preview');
  container.innerHTML = '';

  // Generate new QR code
  qrCode = new QRCodeStyling(options);
  qrCode.append(container);
}

function checkContrast(color1, color2) {
  const warningBox = document.getElementById('contrast-warning');
  
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  // Calculate relative luminance
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  
  // Calculate contrast ratio
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  // Show warning if contrast is too low (< 3:1 for QR codes)
  if (ratio < 3) {
    warningBox.style.display = 'block';
  } else {
    warningBox.style.display = 'none';
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getRelativeLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function downloadQRCode(extension) {
  if (!qrCode) return;
  
  const fileName = `qr-code-${Date.now()}.${extension}`;
  qrCode.download({ name: fileName, extension: extension });
}

async function copyQRToClipboard() {
  if (!qrCode) return;

  try {
    const canvas = document.querySelector('#qr-preview canvas');
    if (!canvas) {
      alert('QR code not ready. Please wait a moment and try again.');
      return;
    }

    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        
        // Visual feedback
        const btn = document.getElementById('copy-image');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Clipboard error:', err);
        alert('Failed to copy to clipboard. Your browser may not support this feature.');
      }
    });
  } catch (err) {
    console.error('Copy error:', err);
    alert('Failed to copy QR code.');
  }
}

// ============================================================================
// QR CODE SCANNING
// ============================================================================

function initializeQRScanner() {
  const startCamera = document.getElementById('start-camera');
  const stopCameraBtn = document.getElementById('stop-camera');
  const scanFile = document.getElementById('scan-file');
  const copyResult = document.getElementById('copy-result');
  const openLink = document.getElementById('open-link');

  startCamera.addEventListener('click', startCameraScanning);
  stopCameraBtn.addEventListener('click', stopCamera);
  scanFile.addEventListener('change', handleFileUpload);
  copyResult.addEventListener('click', copyResultToClipboard);
  openLink.addEventListener('click', openScannedLink);
  
  // Add paste event listener for screenshot pasting
  initializePasteScanning();
}

async function startCameraScanning() {
  if (!QrScanner) {
    alert('QR Scanner library not loaded yet. Please wait a moment and try again.');
    return;
  }

  const cameraPanel = document.getElementById('camera-panel');
  const videoElement = document.createElement('video');
  const readerElement = document.getElementById('camera-reader');

  try {
    // Show camera panel
    cameraPanel.style.display = 'block';
    
    // Clear and setup video element
    readerElement.innerHTML = '';
    readerElement.appendChild(videoElement);

    // Create scanner instance
    qrScannerInstance = new QrScanner(
      videoElement,
      result => {
        console.log('Decoded:', result.data);
        displayScanResult(result.data);
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    await qrScannerInstance.start();
  } catch (err) {
    console.error('Camera error:', err);
    alert(`Camera error: ${err.message || err}. Make sure you're using HTTPS or localhost, and have granted camera permissions.`);
    cameraPanel.style.display = 'none';
  }
}

function stopCamera() {
  if (qrScannerInstance) {
    qrScannerInstance.stop();
    qrScannerInstance.destroy();
    qrScannerInstance = null;
    document.getElementById('camera-panel').style.display = 'none';
  }
}

async function handleFileUpload(event) {
  if (!QrScanner) {
    alert('QR Scanner library not loaded yet. Please wait a moment and try again.');
    event.target.value = '';
    return;
  }

  const file = event.target.files[0];
  if (!file) return;

  try {
    console.log('Scanning file:', file.name, file.type, file.size);
    const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
    console.log('Scan result:', result.data);
    displayScanResult(result.data);
  } catch (err) {
    console.error('File scan error:', err);
    
    // Provide helpful error message
    let errorMsg = 'Error: Could not decode QR code from this image. ';
    if (err.message && err.message.includes('QR code')) {
      errorMsg += err.message;
    } else {
      errorMsg += 'Make sure the image contains a valid, clearly visible QR code.';
    }
    
    displayScanResult(errorMsg, true);
  }

  // Clear file input
  event.target.value = '';
}

function initializePasteScanning() {
  // Add paste event listener to the whole document
  document.addEventListener('paste', async (event) => {
    // Only handle paste when on the scan tab
    const scanTab = document.getElementById('scan-tab');
    if (!scanTab.classList.contains('active')) {
      return;
    }

    if (!QrScanner) {
      console.warn('QrScanner not loaded yet');
      return;
    }

    const items = event.clipboardData?.items;
    if (!items) return;

    // Look for an image in the clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault(); // Prevent default paste behavior
        
        const blob = item.getAsFile();
        if (blob) {
          try {
            console.log('Scanning pasted image:', blob.type, blob.size);
            
            // Visual feedback
            const scanOutput = document.getElementById('scan-output');
            scanOutput.textContent = '🔍 Scanning pasted image...';
            scanOutput.classList.add('has-content');
            
            const result = await QrScanner.scanImage(blob, { returnDetailedScanResult: true });
            console.log('Paste scan result:', result.data);
            displayScanResult(result.data);
            
            // Flash the paste notice to confirm
            const pasteNotice = document.getElementById('paste-notice');
            if (pasteNotice) {
              pasteNotice.style.background = 'rgba(31, 201, 170, 0.2)';
              setTimeout(() => {
                pasteNotice.style.background = '';
              }, 500);
            }
          } catch (err) {
            console.error('Paste scan error:', err);
            
            let errorMsg = 'Error: Could not decode QR code from pasted image. ';
            if (err.message && err.message.includes('QR code')) {
              errorMsg += err.message;
            } else {
              errorMsg += 'Make sure the pasted image contains a valid, clearly visible QR code.';
            }
            
            displayScanResult(errorMsg, true);
          }
        }
        break; // Only process the first image found
      }
    }
  });
  
  console.log('Paste scanning initialized - press Ctrl+V (or Cmd+V) to scan screenshots!');
}

function displayScanResult(text, isError = false) {
  const output = document.getElementById('scan-output');
  const resultActions = document.getElementById('result-actions');
  const openLink = document.getElementById('open-link');

  output.textContent = text;
  output.classList.add('has-content');

  if (!isError) {
    resultActions.style.display = 'flex';

    // Check if result is a URL
    const isUrl = /^https?:\/\//i.test(text);
    openLink.style.display = isUrl ? 'inline-block' : 'none';
    openLink.setAttribute('data-url', text);
  } else {
    resultActions.style.display = 'none';
  }
}

function copyResultToClipboard() {
  const output = document.getElementById('scan-output');
  const text = output.textContent;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-result');
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Copy error:', err);
    alert('Failed to copy to clipboard.');
  });
}

function openScannedLink() {
  const openLink = document.getElementById('open-link');
  const url = openLink.getAttribute('data-url');
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ============================================================================
// LICENSE MODAL
// ============================================================================

function initializeLicenseModal() {
  const licenseLink = document.getElementById('licenseLink');
  const licenseOverlay = document.getElementById('licenseOverlay');
  const licenseModal = document.getElementById('licenseModal');
  const licenseClose = document.getElementById('licenseClose');

  function openLicense() {
    licenseOverlay.classList.add('show');
    licenseModal.classList.add('show');
  }

  function closeLicense() {
    licenseOverlay.classList.remove('show');
    licenseModal.classList.remove('show');
  }

  licenseLink.addEventListener('click', openLicense);
  licenseOverlay.addEventListener('click', closeLicense);
  licenseClose.addEventListener('click', closeLicense);
}