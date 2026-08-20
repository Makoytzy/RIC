# 🚀 Quick Start Guide - Operational Workflow

## Prerequisites
- ✅ Backend running on `http://localhost:4000`
- ✅ Frontend running on `http://localhost:5174`
- ✅ Logged in as Operational Staff user
- ✅ Database migrations 014 & 015 executed

---

## 📝 Step-by-Step Test Workflow

### **Step 1: Create a Shipment** 
**Page:** Shipment Registration (`/dashboard/operational/shipment-registration`)

1. Click **"New Shipment"** button
2. Fill in the form:
   - **Supplier:** Select from dropdown
   - **Shipment Number:** `SHIP-2026-TEST-002`
   - **Container Number:** `MSKU9876543`
   - **BL Number:** `BL-2026-TEST-002`
   - **Expected Quantity:** `50`
   - **Expected Arrival Date:** Select today or tomorrow
3. Click **"Create Shipment"**
4. ✅ Shipment appears in the list with status **PENDING**

---

### **Step 2: Receive the Shipment**
**Page:** Inventory Registration (`/dashboard/operational/inventory-registration`)

1. You should see your shipment in the **"Pending Shipments"** list
2. Click **"Receive"** button on your shipment
3. Fill in the form:
   - **Actual Quantity Received:** `50` (or adjust if different)
   - **Receiving Notes:** "All tires in good condition"
4. Click **"Confirm Receipt"**
5. ✅ Shipment is now marked as **RECEIVED**
6. ✅ Shipment disappears from pending list

---

### **Step 3: Create a Batch**
**Page:** Batch Management (`/dashboard/operational/batch-management`)

1. Click **"New Batch"** button
2. Fill in the form:
   - **Shipment:** Select your received shipment (`SHIP-2026-TEST-002`)
   - **Product:** Select any tire product (e.g., `SAW-15-130/90`)
   - **Batch Number:** Leave blank (auto-generates)
   - **Batch Month:** Current month
   - **Batch Year:** 2026
3. Click **"Create Batch"**
4. ✅ Batch appears in the list with auto-generated number (e.g., `BATCH-2608-123`)
5. ✅ Status: **ACTIVE**

---

### **Step 4: Generate Barcodes**
**Page:** Barcode Generation (`/dashboard/operational/barcode-generation`)

1. Click **"Batch: ON"** to enable batch mode
2. **Select Batch** from dropdown:
   - Choose your newly created batch
   - Product auto-fills from the batch
3. **Set Quantity:** Enter `5` (generate 5 barcodes)
4. Click **"Generate 5 Barcodes"**
5. ✅ 5 barcodes appear in the right panel
6. ✅ Each barcode shows:
   - Unique barcode value (e.g., `RIC000000000007`)
   - Product details
   - Batch number
   - QR code (if generated)

---

### **Step 5: Print/Export Barcodes**
**Still on:** Barcode Generation page

1. **Print Single Barcode:**
   - Click the **printer icon** on any barcode
   - Print dialog opens with formatted label
2. **Print All Barcodes:**
   - Click **"Print All"** button at top
   - All barcodes print in batch
3. **Export to CSV:**
   - Click **"Export"** button
   - Downloads `barcodes-YYYY-MM-DD.csv`

---

### **Step 6: View Schedule**
**Page:** Shipment Schedule (`/dashboard/operational/shipment-schedule`)

1. View dashboard cards:
   - **Pending:** Shows pending shipments
   - **In Transit:** Shows in-transit shipments
   - **Received:** Shows your received shipment
2. View timeline:
   - Toggle **"Calendar View"**
   - See shipments on timeline
3. Check arrival status:
   - Days until arrival
   - Overdue warnings

---

### **Step 7: Manage Products**
**Page:** Products List (`/dashboard/operational/products-list`)

1. **View Products:**
   - See all tire products in catalog
   - Stats dashboard at top
2. **Search/Filter:**
   - Search by SKU or name
   - Filter by brand, category, status
3. **Edit Product:**
   - Click **"Edit"** on any product
   - Update details in modal
   - Click **"Save Changes"**

---

### **Step 8: Add New Product**
**Page:** Product Registration (`/dashboard/operational/product-registration`)

1. Fill in product details:
   - **SKU:** `TEST-17-100/90`
   - **Brand:** `Red Indian Customs`
   - **Model:** `Test Trail`
   - **Dimensions:** `100/90-17`
   - **Category:** `Trail`
   - **Retail Price:** `95.00`
2. Click **"Register Product"**
3. ✅ Product registered successfully
4. ✅ Appears in Products List

---

## 🎯 Verification Checklist

After completing the workflow, verify:

- ✅ Shipment created and shows in Shipment Registration
- ✅ Shipment received and marked as RECEIVED
- ✅ Batch created and linked to shipment
- ✅ Barcodes generated with correct batch/product info
- ✅ Barcodes can be printed and exported
- ✅ Products can be added and edited
- ✅ Schedule shows correct shipment status

---

## 📊 Expected Results

### **Database Records Created:**

```sql
-- Check shipments
SELECT * FROM shipments WHERE shipment_number = 'SHIP-2026-TEST-002';

-- Check batches
SELECT * FROM batches WHERE shipment_id = '<your_shipment_id>';

-- Check barcodes
SELECT * FROM barcodes WHERE batch_id = '<your_batch_id>';

-- Check full traceability
SELECT 
    b.barcode_value,
    bat.batch_number,
    p.sku,
    s.shipment_number,
    s.container_number,
    sup.name as supplier
FROM barcodes b
JOIN batches bat ON b.batch_id = bat.id
JOIN products p ON b.product_id = p.id
JOIN shipments s ON bat.shipment_id = s.id
LEFT JOIN suppliers sup ON s.supplier_id = sup.id
WHERE b.barcode_value LIKE 'RIC%'
ORDER BY b.created_at DESC
LIMIT 5;
```

---

## 🐛 Troubleshooting

### **Problem: Backend not responding**
```bash
cd backend
.\KILL_PORT_4000.ps1
npm start
```

### **Problem: Frontend not loading**
```bash
cd frontend
npm run dev
```

### **Problem: No suppliers in dropdown**
- Create suppliers first in Admin panel
- Or run the test data SQL script

### **Problem: No products available**
- Register products first in Product Registration
- Or import sample products

### **Problem: Batch dropdown is empty**
- Ensure you have RECEIVED shipments
- Create a batch in Batch Management first

---

## 🎉 Success!

If you can complete all steps above, your operational workflow is **FULLY FUNCTIONAL** and ready for production use!

**Next:** Train your operational staff on the workflow and start processing real shipments! 🚛📦
