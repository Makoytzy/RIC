# 🎯 Why inventory_units Table Is CRITICAL

## ❌ The Wrong Approach

**NEVER do this:**

```sql
-- ❌ WRONG: Barcode represents a quantity
CREATE TABLE barcodes (
    barcode_value TEXT,
    product_id UUID,
    batch_id UUID,
    quantity INTEGER  -- ❌ This is the problem!
);

-- This creates a barcode like:
-- Barcode: 200000000042
-- Product: Red Indian Customs Classic Sawtooth 130/90-15
-- Batch: BATCH-2608-000001
-- Quantity: 100  ← ❌ One barcode = 100 tires? Which tire is which?
```

### Problems with this approach:

1. **❌ Cannot scan individual tires during receiving**
   - You scan one barcode, but 100 tires arrive. Which 100?

2. **❌ Cannot implement FIFO picking**
   - Customer orders 1 tire. Which of the 100 tires do you pick?

3. **❌ Cannot link barcode to specific order**
   - Tire goes to Customer A. Which tire? All 100 show same barcode.

4. **❌ Cannot trace returns**
   - Customer returns defective tire. Which tire was it? No way to know.

5. **❌ Cannot track location**
   - Where are these 100 tires? Different racks? Can't tell.

---

## ✅ The Correct Approach

**Each physical tire = ONE inventory_unit = ONE barcode**

```sql
-- ✅ CORRECT: Each inventory_unit represents ONE physical tire
CREATE TABLE inventory_units (
    id UUID PRIMARY KEY,
    unit_number TEXT UNIQUE,        -- INV-000001, INV-000002, etc.
    product_id UUID NOT NULL,       -- What tire type
    batch_id UUID NOT NULL,         -- Which batch it came from
    barcode_id UUID UNIQUE,         -- ONE barcode per tire
    location_code TEXT,             -- WHERE is this specific tire
    status TEXT,                    -- AVAILABLE, PICKED, SOLD, RETURNED
    condition TEXT,                 -- NEW, DAMAGED, DEFECTIVE
    last_scanned_at TIMESTAMPTZ,    -- When was THIS tire scanned
    last_scanned_by UUID            -- Who scanned THIS tire
);
```

---

## 📦 Real-World Example

### Scenario: Shipment Arrives

**Shipment Details:**
- Container: MSKU1234567
- Expected: 100 tires
- Product: Red Indian Customs Classic Sawtooth 130/90-15
- Batch: BATCH-2608-000001

### ✅ CORRECT Process:

**Step 1: Create Batch**
```sql
INSERT INTO batches (batch_number, shipment_id, product_id)
VALUES ('BATCH-2608-000001', shipment_uuid, product_uuid);
```

**Step 2: Create 100 Individual Inventory Units**
```sql
-- For each physical tire (1 to 100):
INSERT INTO inventory_units (unit_number, product_id, batch_id, status)
VALUES ('INV-000001', product_uuid, batch_uuid, 'AVAILABLE');

INSERT INTO inventory_units (unit_number, product_id, batch_id, status)
VALUES ('INV-000002', product_uuid, batch_uuid, 'AVAILABLE');

-- ... repeat for all 100 tires ...

INSERT INTO inventory_units (unit_number, product_id, batch_id, status)
VALUES ('INV-000100', product_uuid, batch_uuid, 'AVAILABLE');
```

**Step 3: Generate Barcode for Each Tire**
```sql
-- Tire #1
INSERT INTO barcodes (barcode_value, inventory_unit_id)
VALUES ('200000000001', inv_unit_001_uuid);

-- Tire #2
INSERT INTO barcodes (barcode_value, inventory_unit_id)
VALUES ('200000000002', inv_unit_002_uuid);

-- ... repeat for all 100 tires ...

-- Tire #100
INSERT INTO barcodes (barcode_value, inventory_unit_id)
VALUES ('200000000100', inv_unit_100_uuid);
```

**Result:**
- ✅ 100 physical tires = 100 inventory_units = 100 unique barcodes
- ✅ Each tire can be scanned, tracked, and traced individually

---

## 🔍 Workflow Examples

### Example 1: Receiving Workflow

**Operational Staff scans each tire as it's unloaded:**

```javascript
// Scan barcode 200000000042
onBarcodeScan('200000000042') {
  // Find the specific inventory unit
  const unit = await db.inventory_units
    .where('barcode_id', barcode_id)
    .first();
  
  // Update THIS specific tire
  await db.inventory_units
    .where('id', unit.id)
    .update({
      status: 'RECEIVED',
      last_scanned_at: NOW(),
      last_scanned_by: current_user_id,
      location_code: 'RECEIVING-BAY-A'
    });
  
  console.log(`✅ Received tire ${unit.unit_number} (Barcode: 200000000042)`);
  console.log(`   Product: ${unit.product.sku}`);
  console.log(`   Batch: ${unit.batch.batch_number}`);
  console.log(`   Location: RECEIVING-BAY-A`);
}
```

**Without inventory_units:** ❌ Can't track individual tires  
**With inventory_units:** ✅ Know exactly which tire was scanned, when, where, by whom

---

### Example 2: Picking Workflow (FIFO)

**Customer orders 1 tire:**

```javascript
// Find oldest available tire (FIFO)
const tireToPickQuery = `
  SELECT 
    iu.id,
    iu.unit_number,
    iu.location_code,
    b.barcode_value,
    bat.batch_number,
    bat.manufactured_date
  FROM inventory_units iu
  JOIN barcodes b ON iu.barcode_id = b.id
  JOIN batches bat ON iu.batch_id = bat.id
  WHERE iu.product_id = $1
    AND iu.status = 'AVAILABLE'
  ORDER BY bat.manufactured_date ASC, iu.received_date ASC
  LIMIT 1
`;

const tire = await db.query(tireToPickQuery, [product_id]);

console.log(`📦 Pick tire: ${tire.unit_number}`);
console.log(`   Barcode: ${tire.barcode_value}`);
console.log(`   Location: ${tire.location_code}`);
console.log(`   Batch: ${tire.batch_number} (${tire.manufactured_date})`);

// Warehouse staff scans this specific tire
await db.inventory_units.update(tire.id, {
  status: 'PICKED',
  last_scanned_at: NOW()
});

// Link to order
await db.order_items.insert({
  order_id: order_id,
  inventory_unit_id: tire.id,  // ← Know EXACTLY which tire
  barcode_id: tire.barcode_id
});
```

**Without inventory_units:** ❌ "Pick any tire from batch X" - can't track which one  
**With inventory_units:** ✅ Pick specific tire, scan it, link to order

---

### Example 3: Customer Returns Defective Tire

**Customer returns tire after 2 weeks:**

```javascript
// Customer provides barcode from receipt or scans QR code
const returnedBarcode = '200000000042';

// Find the EXACT tire
const returnQuery = `
  SELECT 
    iu.id,
    iu.unit_number,
    iu.location_code,
    b.barcode_value,
    bat.batch_number,
    s.shipment_number,
    s.container_number,
    sup.name as supplier_name,
    oi.order_id,
    o.customer_name,
    o.created_at as order_date
  FROM inventory_units iu
  JOIN barcodes b ON iu.barcode_id = b.id
  JOIN batches bat ON iu.batch_id = bat.id
  JOIN shipments s ON bat.shipment_id = s.id
  JOIN suppliers sup ON s.supplier_id = sup.id
  LEFT JOIN order_items oi ON oi.inventory_unit_id = iu.id
  LEFT JOIN orders o ON oi.order_id = o.id
  WHERE b.barcode_value = $1
`;

const tireHistory = await db.query(returnQuery, [returnedBarcode]);

console.log(`🔍 Return Traceability:`);
console.log(`   Unit: ${tireHistory.unit_number}`);
console.log(`   Barcode: ${tireHistory.barcode_value}`);
console.log(`   Batch: ${tireHistory.batch_number}`);
console.log(`   Shipment: ${tireHistory.shipment_number}`);
console.log(`   Container: ${tireHistory.container_number}`);
console.log(`   Supplier: ${tireHistory.supplier_name}`);
console.log(`   Sold to: ${tireHistory.customer_name} on ${tireHistory.order_date}`);
console.log(`   ✅ Complete chain preserved!`);

// Update status
await db.inventory_units.update(tireHistory.id, {
  status: 'RETURNED',
  condition: 'DEFECTIVE'
});

// If batch recall needed, find all tires from same batch
const batchTires = await db.inventory_units
  .where('batch_id', tireHistory.batch_id)
  .select('unit_number', 'barcode_value', 'status');

console.log(`⚠️ Other tires from same batch: ${batchTires.length}`);
```

**Without inventory_units:** ❌ "A tire from batch X was returned" - which one? Who bought it? Can't tell.  
**With inventory_units:** ✅ Complete history: Which tire, from which batch, which shipment, which supplier, who bought it, when.

---

## 📊 Database Comparison

### ❌ WITHOUT inventory_units (Wrong)

```
products
   │
   ├─────────────────┐
   ↓                 ↓
batches          barcodes
   │                 │
   │                 │
   quantity: 100     quantity: 100  ← Can't identify individual tires
```

**Problems:**
- Which of the 100 tires is which?
- Can't scan individual tires
- Can't implement FIFO
- Can't track returns to specific tire
- Can't link order to specific tire

---

### ✅ WITH inventory_units (Correct)

```
products (Catalog)
   │
   ↓
batches (Group of tires)
   │
   ├─────────────────┬─────────────────┬─────
   ↓                 ↓                 ↓
inventory_units  inventory_units  inventory_units
(Tire #1)        (Tire #2)        (Tire #3) ... (Tire #100)
   │                 │                 │
   ↓                 ↓                 ↓
barcodes         barcodes         barcodes
200000000001     200000000002     200000000003  ... 200000000100
```

**Benefits:**
- ✅ Each physical tire = one record
- ✅ Each tire has unique barcode
- ✅ Can scan during receiving, picking, shipping
- ✅ FIFO works (pick oldest tire first)
- ✅ Returns traced to exact tire
- ✅ Link orders to specific tires
- ✅ Track location per tire
- ✅ Warranty per tire (not per batch)

---

## 🎯 Key Takeaways

### 1. **Product ≠ Inventory Unit**

- **Product** = Catalog entry (e.g., "Red Indian Customs Classic Sawtooth 130/90-15")
- **Inventory Unit** = Physical tire in warehouse (e.g., "INV-000042 on rack A-02-15")

### 2. **One Physical Tire = One Record**

```
Batch has 100 tires
  ↓
Create 100 inventory_units
  ↓
Generate 100 unique barcodes
  ↓
Each tire individually tracked
```

### 3. **No Quantity Field in inventory_units**

```sql
-- ❌ WRONG
CREATE TABLE inventory_units (
    quantity INTEGER  -- NO! Each unit = 1 tire
);

-- ✅ CORRECT
CREATE TABLE inventory_units (
    unit_number TEXT UNIQUE  -- Each record IS one tire
    -- No quantity field needed
);
```

### 4. **Container Number Lives in shipments ONLY**

```sql
-- ❌ WRONG: Duplicating container_number
CREATE TABLE batches (
    container_number TEXT  -- ❌ Don't duplicate!
);

-- ✅ CORRECT: Get it from shipment
SELECT 
    b.batch_number,
    s.container_number  -- ✅ Single source of truth
FROM batches b
JOIN shipments s ON b.shipment_id = s.id;
```

---

## 🚀 Implementation Checklist

When creating your system:

- [ ] **One inventory_unit per physical tire** (not per quantity)
- [ ] **No quantity field** in inventory_units (each record = 1 tire)
- [ ] **One barcode per inventory_unit** (1-to-1 relationship)
- [ ] **Container number ONLY in shipments** (not duplicated in batches)
- [ ] **Scan workflow enabled** (receiving, picking, shipping, returns)
- [ ] **FIFO picking supported** (oldest batch/tire first)
- [ ] **Order linking** (know which tire went to which customer)
- [ ] **Return tracing** (track returned tire back to supplier)
- [ ] **Location tracking** (where is this specific tire right now)
- [ ] **Status tracking** (lifecycle: AVAILABLE → PICKED → SHIPPED → SOLD)

---

## 📖 Related Documentation

- **`013_correct_data_architecture.sql`** - Migration that implements this correctly
- **`README_CORRECTED_ARCHITECTURE.md`** - Technical guide
- **`ARCHITECTURE_CORRECTION_SUMMARY.md`** - Quick overview

---

**Bottom Line:**

> **Don't make barcodes represent quantities. Make each physical tire its own inventory_unit with its own barcode. This enables proper scanning workflows, FIFO picking, return tracing, and complete traceability.**

---

**Status:** ✅ Critical Design Decision  
**Last Updated:** 2026-08-19
