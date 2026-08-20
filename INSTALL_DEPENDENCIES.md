# 📦 Install Dependencies - Complete Guide

## Overview

This guide covers all dependencies needed for the complete barcode traceability system.

---

## 🔧 Backend Dependencies

### Navigate to backend:
```bash
cd backend
```

### Install Required Packages:

```bash
# QR Code Generation
npm install qrcode

# Optional: Real CODE128 barcode images (backend-side)
npm install jsbarcode canvas

# OR (lighter, SVG only):
npm install jsbarcode xmldom
```

### Verify Installation:

```bash
npm list qrcode jsbarcode
```

Expected output:
```
├── qrcode@1.x.x
└── jsbarcode@3.x.x
```

---

## 🎨 Frontend Dependencies

### Navigate to frontend:
```bash
cd frontend
```

### Install Required Packages:

```bash
# CODE128 Barcode Generation
npm install jsbarcode

# QR Code Component
npm install qrcode.react
```

### Verify Installation:

```bash
npm list jsbarcode qrcode.react
```

Expected output:
```
├── jsbarcode@3.x.x
└── qrcode.react@3.x.x
```

---

## 📋 Complete Dependency List

### Backend (`backend/package.json`):

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@supabase/supabase-js": "^2.x.x",
    "qrcode": "^1.5.3",
    "jsbarcode": "^3.11.5",
    "canvas": "^2.11.2"
  }
}
```

**Or without canvas:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@supabase/supabase-js": "^2.x.x",
    "qrcode": "^1.5.3",
    "jsbarcode": "^3.11.5",
    "xmldom": "^0.6.0"
  }
}
```

### Frontend (`frontend/package.json`):

```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "react-router-dom": "^6.x.x",
    "@supabase/supabase-js": "^2.x.x",
    "framer-motion": "^10.x.x",
    "lucide-react": "^0.x.x",
    "jsbarcode": "^3.11.5",
    "qrcode.react": "^3.1.0"
  }
}
```

---

## 🚀 Quick Install (All at Once)

### Backend:
```bash
cd backend
npm install qrcode jsbarcode canvas
```

### Frontend:
```bash
cd frontend
npm install jsbarcode qrcode.react
```

---

## ⚠️ Troubleshooting

### Issue: `canvas` installation fails on Windows

**Solution 1: Use xmldom instead**
```bash
npm uninstall canvas
npm install xmldom
```

**Solution 2: Install build tools**
```bash
npm install --global windows-build-tools
npm install canvas
```

**Solution 3: Use pre-built binaries**
```bash
npm install canvas --canvas_binary_host_mirror=https://registry.npmmirror.com/-/binary/canvas/
```

### Issue: Module not found errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Version conflicts

**Solution:**
```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update jsbarcode

# Or update all
npm update
```

---

## ✅ Verification

### Backend Verification:

Create test file: `backend/test-barcode.js`

```javascript
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';

// Test QR Code
QRCode.toDataURL('https://test.com', (err, url) => {
  if (err) console.error('❌ QR generation failed:', err);
  else console.log('✅ QR generation works');
});

// Test CODE128
try {
  const canvas = createCanvas(200, 100);
  JsBarcode(canvas, 'TEST123', { format: 'CODE128' });
  console.log('✅ CODE128 generation works');
} catch (error) {
  console.error('❌ CODE128 generation failed:', error);
}
```

Run:
```bash
node test-barcode.js
```

### Frontend Verification:

Create test component: `frontend/src/components/TestBarcode.jsx`

```jsx
import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';

export default function TestBarcode() {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, 'TEST123', {
        format: 'CODE128'
      });
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Barcode Test</h2>
      <svg ref={barcodeRef} />
      
      <h2>QR Code Test</h2>
      <QRCodeSVG value="https://test.com" size={128} />
    </div>
  );
}
```

Add to your app temporarily and verify both display correctly.

---

## 📊 What Each Package Does

### Backend:

| Package | Purpose | Required |
|---------|---------|----------|
| `qrcode` | Generate QR code images | ✅ Yes |
| `jsbarcode` | Generate CODE128 barcodes | ✅ Yes |
| `canvas` | PNG barcode rendering | Optional |
| `xmldom` | SVG barcode rendering | Alternative to canvas |

### Frontend:

| Package | Purpose | Required |
|---------|---------|----------|
| `jsbarcode` | Display CODE128 barcodes | ✅ Yes |
| `qrcode.react` | Display QR codes | ✅ Yes |

---

## 🔄 Alternative: Frontend-Only Generation

If you prefer to generate everything on the frontend:

**Backend:** Only install `qrcode` (for database storage)

**Frontend:** Install both `jsbarcode` and `qrcode.react` (for display)

**Pros:**
- Lighter backend
- Faster response times
- Less server load

**Cons:**
- QR codes not pre-generated
- Must generate on every page load
- Can't print server-side labels

**Recommended:** Hybrid approach (backend generates, frontend displays)

---

## 📖 Documentation Links

- **jsbarcode:** https://github.com/lindell/JsBarcode
- **qrcode:** https://github.com/soldair/node-qrcode
- **qrcode.react:** https://github.com/zpao/qrcode.react
- **canvas:** https://github.com/Automattic/node-canvas

---

## ✅ Installation Complete Checklist

- [ ] Backend `qrcode` installed
- [ ] Backend `jsbarcode` installed
- [ ] Backend `canvas` OR `xmldom` installed
- [ ] Frontend `jsbarcode` installed
- [ ] Frontend `qrcode.react` installed
- [ ] No installation errors
- [ ] Test script runs successfully
- [ ] Components display correctly

---

**Status:** ✅ Ready to implement barcode system  
**Last Updated:** 2026-08-19
