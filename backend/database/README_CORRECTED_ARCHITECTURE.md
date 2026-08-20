# ✅ Corrected Database Architecture - Traceability Chain

## 📋 Overview

This document describes the corrected Supabase data architecture for **Red Indian Customs (RIC)** Inventory Management System, establishing proper relationships for complete product traceability from supplier to end customer.

---

## 🔗 Complete Relationship Chain

```text
                    suppliers
                        │
                        │ 1:N
                        ▼
                  shipments
              ┌─────────┴─────────┐
              │                   │
       container_number       bl_number
              │
              │ 1:N
              ▼
             batches
              │
              │ 1:N
              ▼
           products ─────────┐
              │              │
              │ 1:N      1:N │
              ▼              ▼
       inventory_units
              │
              │ 1:1
              ▼
           barcodes
              │
              │ (embedded)
              ▼
       QR Code (traceability URL)
```

### 🎯 Complete Flow

```text
Supplier
   ↓
Shipment (with Container Number + BL Number)
   ↓
Batch (references shipment's container)
   ↓
Product (tire catalog: SKU, brand, model, dimensions)
   ↓
Inventory Unit (physical item)
   ↓
Barcode (unique identifier)
   ↓
QR Code (embedded in barcode record)
```

---

## 📊 Table Relationships Explained

### 1. **suppliers** → **shipments** (1:N)

**Suppliers** send **shipments** to the warehouse.

**Key Fields in `shipments`:**
- `supplier_id` → links to supplier
- `container_number` → physical container identifier
- `bl_number` → Bill of Lading number
- `shipment_number` → unique tracking number

```sql
SELECT 
    sup.name as supplier,
    s.shipment_number,
    s.container_number,
    s.bl_number
FROM shipments s
JOIN suppliers sup ON s.supplier_id = sup.id;
```

---

### 2. **shipments** → **batches** (1:N)

Each **shipment** contains one or more **batches** of products.

**Key Fields in `batches`:**
- `shipment_id` → links to shipment
- `product_id` → which tire product
- `container_number` → cached from shipment for quick reference
- `batch_number` → unique batch identifier

```sql
SELECT 
    s.shipment_number,
    s.container_number,
    b.batch_number,
    p.sku
FROM batches b
JOIN shipments s ON b.shipment_id = s.id
JOIN products p ON b.product_id = p.id;
```

---

### 3. **products** → **inventory_units** (1:N)

**Products** define the tire catalog (SKU, brand, model, dimensions).  
**Inventory Units** are the individual physical tires.

**Key Fields in `inventory_units`:**
- `product_id` → which tire type (e.g., "SAW-15-130/90")
- `batch_id` → which batch it came from
- `barcode_id` → unique barcode assigned (1-to-1)
- `warehouse_id` → current location
- `location_code` → specific slot/rack
- `status` → available, sold, damaged, etc.

```sql
SELECT 
    p.sku,
    p.brand,
    p.model,
    iu.unit_number,
    iu.status,
    iu.location_code
FROM inventory_units iu
JOIN products p ON iu.product_id = p.id;
```

---

### 4. **inventory_units** → **barcodes** (1:1)

Each **inventory unit** (physical tire) gets a **unique barcode**.

**Key Fields in `barcodes`:**
- `inventory_unit_id` → links to physical item (PRIMARY relationship)
- `barcode_value` → unique barcode string (e.g., "200000000042")
- `qr_code_data` → Base64 QR code image or URL
- `barcode_type` → CODE128, QR, etc.
- `product_id` → denormalized for quick queries (optional)
- `batch_id` → denormalized for quick queries (optional)

```sql
SELECT 
    b.barcode_value,
    b.qr_code_data,
    iu.unit_number,
    p.sku
FROM barcodes b
JOIN inventory_units iu ON b.inventory_unit_id = iu.id
JOIN products p ON iu.product_id = p.id;
```

---

## 🔍 Traceability View

A pre-built view `barcode_traceability` shows the complete chain:

```sql
SELECT * FROM barcode_traceability
WHERE barcode_value = '200000000042';
```

**Returns:**
- Barcode details
- Inventory unit info
- Product details (SKU, brand, model)
- Batch info
- Shipment info (container number, BL number)
- Supplier info
- Warehouse location

---

## 🛠️ How to Apply the Correction

### Step 1: Backup Your Database

```bash
# From Supabase dashboard, create a backup before running migrations
```

### Step 2: Run the Migration

**Option A: Via Supabase SQL Editor**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `013_correct_data_architecture.sql`
3. Click "Run"

**Option B: Via Command Line (if you have direct access)**

```bash
psql "postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres" \
  -f backend/database/013_correct_data_architecture.sql
```

**Option C: Via Node.js Script**

```bash
cd backend
node -e "
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = fs.readFileSync('./database/013_correct_data_architecture.sql', 'utf8');
pool.query(sql)
  .then(() => console.log('✅ Migration complete'))
  .catch(err => console.error('❌ Error:', err))
  .finally(() => pool.end());
"
```

---

## ✅ Verification

After running the migration, verify the structure:

### Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'suppliers', 'shipments', 'batches', 
    'products', 'inventory_units', 'barcodes'
)
ORDER BY table_name;
```

### Check Foreign Keys

```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('shipments', 'batches', 'inventory_units', 'barcodes')
ORDER BY tc.table_name, kcu.column_name;
```

### Test Traceability

```sql
-- Validate a barcode's complete chain
SELECT * FROM validate_traceability_chain('200000000042');

-- View sample traceability chains
SELECT 
    barcode_value,
    product_sku,
    batch_number,
    shipment_number,
    supplier_name
FROM barcode_traceability
LIMIT 10;
```

---

## 🔄 Data Migration Notes

### Existing Barcodes

The migration script automatically handles existing barcodes:

1. **If a barcode has `product_id` but no `inventory_unit_id`:**
   - Creates a new `inventory_unit` record
   - Links the barcode to this unit
   - Preserves all existing data

2. **Naming convention for migrated units:**
   - `unit_number` = `MIGRATED-{first 20 chars of barcode_value}`

### Manual Data Entry Going Forward

When creating new barcodes:

```javascript
// 1. Create/find the inventory unit
const { data: inventoryUnit } = await supabase
  .from('inventory_units')
  .insert({
    unit_number: 'IU-2026-001234',
    product_id: productId,
    batch_id: batchId,
    status: 'available',
    condition: 'new',
    quantity: 1
  })
  .select()
  .single();

// 2. Generate barcode and link to inventory unit
const { data: barcode } = await supabase
  .from('barcodes')
  .insert({
    barcode_value: generatedBarcodeValue,
    inventory_unit_id: inventoryUnit.id,
    barcode_type: 'CODE128',
    qr_code_data: qrCodeBase64,
    status: 'active'
  })
  .select()
  .single();

// 3. Update inventory unit with barcode reference (optional, for bidirectional link)
await supabase
  .from('inventory_units')
  .update({ barcode_id: barcode.id })
  .eq('id', inventoryUnit.id);
```

---

## 📈 Benefits of Corrected Architecture

### ✅ Complete Traceability
- Track any tire from **supplier** → **shipment** → **container** → **batch** → **barcode**
- QR code scanning reveals full history

### ✅ Data Integrity
- Proper foreign keys prevent orphaned records
- Cascade deletes maintain referential integrity
- Unique constraints prevent duplicate barcodes

### ✅ Efficient Queries
- Indexed relationships for fast lookups
- Denormalized fields (`product_id`, `batch_id` in barcodes) for reporting
- Pre-built view (`barcode_traceability`) for common queries

### ✅ Scalability
- Separation of concerns (catalog vs. physical inventory)
- One product → many inventory units
- Supports future features (batch recalls, warranty tracking)

---

## 🚨 Important Notes

1. **One-to-One Relationship: Inventory Unit ↔ Barcode**
   - Each inventory unit can have at most ONE barcode
   - Each barcode can be assigned to at most ONE inventory unit
   - Enforced by unique constraints

2. **Product vs. Inventory Unit**
   - **Product** = Tire type in catalog (e.g., "Red Indian Customs Classic Sawtooth 130/90-15")
   - **Inventory Unit** = Physical tire in warehouse (e.g., "Unit #12345 from Batch B-2026-001")
   - One product SKU → many physical tires in stock

3. **Shipment → Batch → Inventory Unit**
   - Shipment records the **container number** and **BL number**
   - Batches inherit container info from shipment
   - Inventory units link to batch (and thus to shipment and supplier)

4. **QR Code Storage**
   - QR codes are stored IN the `barcodes` table as Base64 or URL
   - Field: `qr_code_data`
   - Not a separate table

---

## 📞 Support

If you encounter issues during migration:

1. Check Supabase logs in Dashboard → Database → Logs
2. Verify all prerequisite tables exist (`suppliers`, `products`, `warehouses`)
3. Review foreign key constraint errors
4. Contact your database administrator

---

## 📄 Related Files

- `013_correct_data_architecture.sql` - Main migration script
- `010_barcode_qr_traceability_schema.sql` - Original schema (to be corrected)
- `009_admin_full_features.sql` - Products, warehouses, suppliers schema

---

**Last Updated:** 2026-08-19  
**Migration Version:** 013  
**Status:** ✅ Ready for Production
