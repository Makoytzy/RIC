# Barcode Generation Guide

## Overview
The Barcode Generation page allows Operational Staff to generate unique barcodes with QR codes for tire inventory units. Each barcode is linked to a specific batch and product for full traceability.

## ✅ Current Status
- ✅ Page fully functional with batch mode
- ✅ Auto-loads all available batches
- ✅ Generates barcodes via backend API
- ✅ Prints individual or batch labels
- ✅ Exports barcode data to CSV

## 📋 Prerequisites

Before generating barcodes, ensure:
1. **Shipments exist** - Create shipments in Shipment Management
2. **Batches exist** - Create batches in Batch Management (link shipments to products)
3. **Backend running** - Node.js backend must be running on port 4000

## 🎯 Workflow Steps

### Step 1: Access the Page
1. Log in as Operational Staff (or Manager/Admin)
2. Navigate to sidebar → **MANAGEMENT** → **Barcode Generation**
3. Page automatically enables **Batch Mode**

### Step 2: Select a Batch
1. In the yellow **Batch Controls** section, click the "Select Batch" dropdown
2. Choose a batch from the list (format: `BATCH-NUMBER - BRAND MODEL (MONTH/YEAR)`)
3. Product details will auto-fill from the selected batch

### Step 3: Set Quantity
1. Use the **+/-** buttons or type a number in the quantity field
2. Default is 1 barcode per batch
3. You can generate multiple barcodes for the same batch

### Step 4: Generate Barcodes
1. Click the **"Generate X Barcode(s)"** button
2. Wait for success message
3. Generated barcodes appear in the right panel

### Step 5: Print or Export
- **Print Single**: Click printer icon on any barcode card
- **Print All**: Click "Print All" button at the top
- **Export CSV**: Click "Export CSV" button to download data

## 🔍 Troubleshooting

### "No active batches" Message
**Problem**: Dropdown shows "No active batches. Create a batch in Batch Management first."

**Solution**:
1. Go to **Batch Management** page
2. Create a new batch:
   - Select a shipment
   - Select a product
   - Set quantity
   - Add batch month/year
   - Click "Create Batch"
3. Return to Barcode Generation and refresh

### "Failed to generate barcodes" Error
**Problem**: API call fails when clicking Generate

**Possible causes**:
1. **Backend not running** - Start backend: `cd backend && npm start`
2. **Database connection issue** - Check `.env` file has correct Supabase credentials
3. **Authentication token expired** - Log out and log back in

### Batches Not Loading
**Problem**: Batch dropdown is empty even though batches exist

**Solution**:
1. Open browser Developer Tools (F12)
2. Check Console tab for errors:
   - Look for `📦 Loaded batches:` log message
   - Check if `✅ Successfully loaded X batches` appears
   - Look for `❌ Error loading batches:` messages
3. Verify backend is running: `http://localhost:4000/api/batches`
4. Click the refresh button (circular arrow) in the top-right corner

## 🎨 UI Features

### Batch Mode (Auto-Enabled)
- **Orange section**: Shows batch selection controls
- **Batch dropdown**: Lists all available batches with product info
- **Product display**: Read-only, auto-filled from selected batch
- **Quantity controls**: +/- buttons and manual input
- **Generate button**: Creates barcodes and adds to the list

### Generated Barcodes Panel
- **Barcode cards**: Show barcode number, product, batch, status
- **Print icon**: Print individual label
- **Eye icon**: View traceability chain
- **Delete icon**: Deactivate barcode (soft delete)

### Top Actions
- **Batch toggle**: Switch batch mode on/off (recommend keeping ON)
- **Refresh icon**: Reload generated barcodes from database
- **Print All**: Print all barcodes in one sheet
- **Export CSV**: Download barcode data

## 📊 Barcode Format

Generated barcodes follow this structure:
- **Format**: CODE128 or QR Code
- **Prefix**: `RIC` (Red Indian Customs)
- **Serial**: 12-digit unique identifier
- **Example**: `RIC000000000001`

Each barcode includes:
- Product information (brand, model, SKU, dimensions)
- Batch number and date
- Shipment traceability
- QR code for mobile scanning

## 🔗 Related Pages

- **Batch Management** (`/batches`) - Create and manage batches
- **Shipment Management** (`/shipments`) - Receive and track shipments
- **Product Catalog** (`/products`) - View all products
- **Batch Coordination** - Assign warehouse locations (future feature)

## 🚀 Quick Start Example

1. **Create a shipment**:
   - Go to Shipments → Create New
   - Select supplier
   - Add shipment details
   - Mark as "RECEIVED"

2. **Create a batch**:
   - Go to Batch Management → Create Batch
   - Select the received shipment
   - Select a product
   - Set quantity (e.g., 50 tires)
   - Add batch month/year
   - Click "Create Batch"

3. **Generate barcodes**:
   - Go to Barcode Generation
   - Select the created batch from dropdown
   - Set quantity (e.g., 50 barcodes)
   - Click "Generate 50 Barcodes"
   - Wait for success message

4. **Print labels**:
   - Click "Print All" button
   - Print dialog opens
   - Select printer and print

## 📝 Notes

- Barcodes are **unique** and cannot be duplicated
- Deactivated barcodes are **soft-deleted** (preserved for audit trail)
- QR codes enable mobile scanning for traceability
- Batch mode is the **recommended workflow** for operational staff
- All barcode operations are logged in the audit trail

## 🆘 Support

If issues persist:
1. Check backend logs: `cd backend && npm start` (watch console output)
2. Check browser console: F12 → Console tab
3. Verify database connection: Check Supabase dashboard
4. Verify user permissions: Operational Staff role required

---

**Last Updated**: Enhanced with batch loading improvements and auto-enabled batch mode
**Status**: Fully Functional ✅
