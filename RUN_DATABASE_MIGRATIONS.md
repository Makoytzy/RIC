# 🚀 Run Database Migrations - Step by Step Guide

## ✅ Prerequisites Completed:
- [x] Frontend dependencies installed (`jsbarcode`, `qrcode.react`)
- [x] Backend dependencies installed (`qrcode`, `canvas`)
- [x] Code fixes applied (DOM warnings, API endpoints)

---

## 📋 Required Migrations:

1. **014_final_barcode_architecture.sql** - Core database schema
2. **015_transaction_safe_barcode_rpc.sql** - Transaction-safe RPC functions

---

## 🎯 Option 1: Run via Supabase Dashboard (RECOMMENDED)

### Step 1: Open Supabase Dashboard

1. Go to your Supabase project: https://app.supabase.com
2. Select your project: **Red Indian Customs**
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Migration 014

1. Click **New Query** button (top right)
2. Copy the entire content of:
   ```
   backend/database/014_final_barcode_architecture.sql
   ```
3. Paste into the SQL editor
4. Click **RUN** button (or press `Ctrl+Enter`)
5. **Wait for completion** - should show:
   ```
   ✅ 014_final_barcode_architecture.sql executed successfully!
   ```

### Step 3: Run Migration 015

1. Click **New Query** button again
2. Copy the entire content of:
   ```
   backend/database/015_transaction_safe_barcode_rpc.sql
   ```
3. Paste into the SQL editor
4. Click **RUN** button (or press `Ctrl+Enter`)
5. **Wait for completion** - should show:
   ```
   ✅ 015_transaction_safe_barcode_rpc.sql executed successfully!
   ```

### Step 4: Verify Tables Created

Run this query in SQL Editor to verify:

```sql
SELECT 
    'shipments' as table_name, COUNT(*) as row_count FROM shipments
UNION ALL
SELECT 'batches', COUNT(*) FROM batches
UNION ALL
SELECT 'inventory_units', COUNT(*) FROM inventory_units
UNION ALL
SELECT 'barcodes', COUNT(*) FROM barcodes;
```

Should return:
```
table_name       | row_count
-----------------|-----------
shipments        | 0
batches          | 0
inventory_units  | 0
barcodes         | 0
```

### Step 5: Verify Functions Created

```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'create_inventory_barcodes',
    'get_barcodes_with_traceability',
    'validate_barcode_chain',
    'get_next_barcode_sequence'
)
ORDER BY routine_name;
```

Should return 4 functions.

---

## 🔧 Option 2: Run via psql CLI (Alternative)

If you prefer command line:

```bash
# Get your database connection string from Supabase Dashboard
# Go to: Project Settings > Database > Connection String > URI

# Replace with your actual connection string:
$SUPABASE_URL = "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres"

# Run migration 014
psql $SUPABASE_URL -f "backend/database/014_final_barcode_architecture.sql"

# Run migration 015
psql $SUPABASE_URL -f "backend/database/015_transaction_safe_barcode_rpc.sql"
```

---

## 🧪 Test After Migration

### Test 1: Backend API Endpoints

1. **Start backend server** (if not running):
   ```bash
   cd backend
   npm start
   ```

2. **Test config endpoint**:
   ```bash
   curl http://localhost:4000/api/barcodes/config
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "config": {
       "format": "CODE128",
       "prefix": "RIC",
       ...
     }
   }
   ```

3. **Test get barcodes**:
   ```bash
   curl http://localhost:4000/api/barcodes?limit=10
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "barcodes": [],
     "total": 0
   }
   ```
   
   (Empty array is OK - no barcodes generated yet)

### Test 2: Frontend Barcode Generation Page

1. **Start frontend dev server** (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Login** as Operational Staff

3. **Navigate to**: `/barcode/generate`

4. **Verify**:
   - ✅ Page loads without errors
   - ✅ No console warnings about DOM nesting
   - ✅ Products list shows demo products or real products
   - ✅ Can click "Generate" button (may need real data first)

---

## 📊 Create Test Data (Optional)

If you want to test barcode generation, you need:

### 1. Create Supplier:

```sql
INSERT INTO suppliers (name, supplier_code, contact_person, email, phone)
VALUES (
    'Test Supplier Inc',
    'SUP001',
    'John Doe',
    'john@testsupplier.com',
    '+1234567890'
)
RETURNING *;
-- Copy the UUID returned
```

### 2. Create Shipment:

```sql
INSERT INTO shipments (
    supplier_id,
    shipment_number,
    container_number,
    bl_number,
    expected_quantity,
    expected_arrival_date,
    status
)
VALUES (
    'paste-supplier-uuid-here',
    'SHIP-2026-001',
    'MSKU1234567',
    'BL-2026-001',
    100,
    '2026-08-25',
    'PENDING'
)
RETURNING *;
-- Copy the UUID returned
```

### 3. Create Batch:

```sql
INSERT INTO batches (
    shipment_id,
    batch_number,
    batch_month,
    batch_year,
    status
)
VALUES (
    'paste-shipment-uuid-here',
    'BATCH-2608-000001',
    8,  -- August
    2026,
    'ACTIVE'
)
RETURNING *;
-- Copy the UUID returned
```

### 4. Create Product (if not exists):

```sql
INSERT INTO products (
    sku,
    brand,
    model,
    product_name,
    dimensions,
    category,
    status
)
VALUES (
    'SAW-15-130/90',
    'Red Indian Customs',
    'Classic Sawtooth',
    'Classic Sawtooth Tire',
    '130/90-15',
    'Sawtooth',
    'active'
)
RETURNING *;
-- Copy the UUID returned
```

### 5. Generate Barcode via RPC:

```sql
SELECT * FROM create_inventory_barcodes(
    'paste-product-uuid-here'::UUID,
    'paste-batch-uuid-here'::UUID,
    'paste-shipment-uuid-here'::UUID,
    5  -- Generate 5 barcodes
);
```

If successful, you should see:
```json
{
  "success": true,
  "quantity": 5,
  "barcodes": [
    {
      "barcode_value": "RIC000000000001",
      "barcode_type": "CODE128",
      ...
    },
    ...
  ]
}
```

---

## ✅ Success Checklist

After completing migrations, verify:

- [ ] Migration 014 ran without errors
- [ ] Migration 015 ran without errors
- [ ] Tables created: `shipments`, `batches`, `inventory_units`, `barcodes`
- [ ] Functions created: `create_inventory_barcodes`, etc.
- [ ] Backend API `/api/barcodes/config` returns 200 OK
- [ ] Backend API `/api/barcodes` returns 200 OK (empty array is fine)
- [ ] Frontend barcode page loads without errors
- [ ] No console warnings about DOM or JSX

---

## 🆘 Troubleshooting

### Error: "relation already exists"
**Solution**: Tables already exist. Migration 014 is idempotent (safe to run multiple times).

### Error: "function already exists"
**Solution**: Functions already exist. Migration 015 uses `CREATE OR REPLACE` (safe to run again).

### Error: "permission denied"
**Solution**: Make sure you're logged in as the project owner in Supabase Dashboard.

### Backend still returns 500 error
**Solution**: 
1. Check backend console logs for actual error
2. Verify tables exist in Supabase Dashboard > Table Editor
3. Restart backend server after migration
4. Check `backend/.env` has correct `DATABASE_URL`

### Frontend shows blank page
**Solution**:
1. Check browser console for errors
2. Restart frontend dev server
3. Clear browser cache (`Ctrl+Shift+R`)

---

## 📞 Need Help?

If you encounter any issues:
1. Copy the exact error message
2. Check which step failed (migration 014, 015, or testing)
3. Share the error for assistance

---

## 🎉 What's Next After Migration?

Once migrations are successful:

1. **Generate your first barcode** via frontend UI
2. **Print barcode label** with real CODE128
3. **Scan with warehouse scanner** (BarcodeScanner page)
4. **View traceability** via QR code
5. **Test complete workflow**: Generate → Print → Scan → Trace

---

**Ready to start? Open Supabase Dashboard and begin with Migration 014!** 🚀
