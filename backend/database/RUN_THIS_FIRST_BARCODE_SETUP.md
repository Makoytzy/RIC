# 🚀 Barcode & QR System - Database Setup Guide

## ⚡ Quick Start (3 Steps)

### Step 1: Run Schema SQL
Copy and paste **ALL content** from this file into Supabase SQL Editor:
```
backend/database/010_barcode_qr_traceability_schema.sql
```
Click "RUN" ✅

### Step 2: Run Sequence Function SQL
Copy and paste **ALL content** from this file into Supabase SQL Editor:
```
backend/database/011_barcode_sequence_function.sql
```
Click "RUN" ✅

### Step 3: Run RPC Functions SQL (CRITICAL - Bypasses Cache Issues)
Copy and paste **ALL content** from this file into Supabase SQL Editor:
```
backend/database/012_barcode_rpc_functions.sql
```
Click "RUN" ✅

**WHY THIS STEP IS CRITICAL:**  
PostgREST schema cache sometimes doesn't refresh immediately after creating tables. The RPC functions in step 3 bypass the cache completely and allow barcode generation to work immediately without waiting for cache refresh.

---

## ✅ Verification

After running all 3 SQL files, verify in Supabase:

### Check Tables Created (12 tables)
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'barcodes', 'batches', 'shipments', 'inventory_units',
  'orders', 'order_items', 'returns', 'stock_movements',
  'picking_tasks', 'packing_tasks', 'barcode_scans', 'barcode_sequences'
);
```

### Check RPC Functions Created (7 functions)
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'increment_barcode_sequence',
  'insert_barcode',
  'get_barcodes',
  'get_barcode_by_value',
  'delete_barcode',
  'update_barcode_status',
  'barcode_exists'
);
```

### Initialize Barcode Sequence
```sql
INSERT INTO barcode_sequences (sequence_name, current_value)
VALUES ('default', 200000000000)
ON CONFLICT (sequence_name) DO NOTHING;
```

### Test Barcode Generation (Optional)
```sql
-- Test RPC function
SELECT insert_barcode(
  'TEST001',
  'CODE128',
  NULL,
  NULL,
  NULL,
  NULL
);

-- Verify it was created
SELECT * FROM barcodes WHERE barcode_value = 'TEST001';

-- Clean up test
DELETE FROM barcodes WHERE barcode_value = 'TEST001';
```

---

## 🔄 Backend Setup

### 1. Install QR Code Package
```bash
cd backend
npm install qrcode
```

### 2. Restart Backend Server
```bash
npm run dev
```

---

## 📋 What Gets Created

### Tables (12)
1. **shipments** - Container/BL tracking
2. **batches** - Product batches linked to shipments
3. **barcodes** - Physical barcode/QR storage (UNIQUE constraint)
4. **inventory_units** - Individual inventory items
5. **orders** - Customer orders
6. **order_items** - Order line items
7. **returns** - Return tracking
8. **stock_movements** - Inventory movement history
9. **picking_tasks** - Warehouse picking operations
10. **packing_tasks** - Packing operations
11. **barcode_scans** - Scan history/audit trail
12. **barcode_sequences** - Atomic sequence generator

### RPC Functions (7)
1. **increment_barcode_sequence** - Atomic sequence increment
2. **insert_barcode** - Create barcode (bypasses schema cache)
3. **get_barcodes** - List barcodes with pagination
4. **get_barcode_by_value** - Lookup single barcode
5. **delete_barcode** - Delete barcode by ID
6. **update_barcode_status** - Update barcode status
7. **barcode_exists** - Check if barcode exists

### Features
- ✅ Unit-level traceability (Product → Batch → Unit → Barcode → QR)
- ✅ Server-side unique barcode generation
- ✅ QR codes with traceability URLs
- ✅ Full CRUD operations
- ✅ RLS policies for security
- ✅ Audit logging (activity_log integration)
- ✅ Schema cache bypass (RPC functions)

---

## 🐛 Troubleshooting

### Issue: "Could not find table 'barcodes' in schema cache"

**Solution:** Run Step 3 (012_barcode_rpc_functions.sql)  
The RPC functions bypass PostgREST's schema cache completely.

### Issue: Barcode generation fails after 5 attempts

**Cause:** Schema cache not refreshed OR sequence not initialized  

**Solutions:**
1. Verify RPC functions exist (see verification query above)
2. Initialize sequence (see verification section)
3. Try restarting Supabase project: Project Settings → Pause → Resume

### Issue: Frontend shows "Could not load existing barcodes"

**Solution:** Wait 30 seconds for schema cache to refresh OR restart backend  
The RPC functions in listBarcodes() will automatically handle this.

---

## 🎯 Next Steps

1. ✅ Run all 3 SQL files in order
2. ✅ Verify tables and functions created
3. ✅ Initialize sequence
4. ✅ Install qrcode package (if not done)
5. ✅ Restart backend
6. 🚀 Generate your first barcode from the UI!

---

## 📚 Technical Details

### Barcode Format
- **Type:** CODE128
- **Format:** 12-digit numeric (200000000001, 200000000002, ...)
- **Checksum:** Modulo-10 (optional, configurable)
- **Sequence:** Database-managed atomic increment (concurrent-safe)

### QR Code Format
- **Content:** `http://your-domain.com/trace/{barcode_value}`
- **Error Correction:** Level M (15% recovery)
- **Size:** 300x300px
- **Format:** Data URL (base64-encoded PNG)

### Traceability Chain
```
Product → Batch → Shipment → Inventory Unit → Barcode
         ↓
    QR Code URL → Public Trace Page
         ↓
  Orders → Picking → Packing → Returns
```

---

## 🔒 Security

- **RLS Policies:** Enabled on all tables
- **Service Role:** Backend uses service_role key (bypasses RLS)
- **Public Access:** Only traceability view (/trace/:barcode) is public
- **Audit Trail:** All operations logged to activity_log

---

Need help? Check:
- `BARCODE_QR_SYSTEM_INSPECTION_REPORT.md` - Full system analysis
- `backend/src/services/barcodeService.js` - Service implementation
- `frontend/src/pages/dashboard/operational/BarcodeGeneration.jsx` - UI component
