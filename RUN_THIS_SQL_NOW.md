# 🚨 URGENT: Run This SQL to Create Racks

## Problem
The backend cannot see any racks because **the rack_configurations table is empty or doesn't exist in your Supabase database**.

Our test scripts see racks because they're using a cached connection or different database instance.

## Solution
Run the SQL script to create the racks in your Supabase database.

---

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: **hbsynkxaadnximuytbor**
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

---

## Step 2: Copy & Paste This SQL

```sql
-- ============================================================================
-- CREATE 5 RACKS IMMEDIATELY
-- ============================================================================

-- 1. Create table if needed
CREATE TABLE IF NOT EXISTS rack_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL,
  rack_number INTEGER NOT NULL,
  rack_code TEXT NOT NULL UNIQUE,
  designated_size TEXT NOT NULL,
  size_category TEXT NOT NULL,
  total_shelves INTEGER DEFAULT 4,
  sections_per_shelf INTEGER DEFAULT 6,
  subsections_per_section INTEGER DEFAULT 2,
  capacity_per_subsection INTEGER DEFAULT 15,
  total_capacity INTEGER DEFAULT 720,
  current_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Delete existing racks
DELETE FROM rack_configurations;

-- 3. Insert 5 racks
DO $$
DECLARE
  v_warehouse_id UUID;
BEGIN
  -- Get Main Warehouse ID
  SELECT id INTO v_warehouse_id 
  FROM warehouse_locations 
  WHERE name = 'Main Warehouse' 
  LIMIT 1;
  
  IF v_warehouse_id IS NULL THEN
    RAISE EXCEPTION 'Main Warehouse not found!';
  END IF;
  
  -- Insert racks
  INSERT INTO rack_configurations (
    warehouse_id, rack_number, rack_code, designated_size, size_category,
    total_shelves, sections_per_shelf, subsections_per_section, 
    capacity_per_subsection, total_capacity, current_count, status
  ) VALUES
  (v_warehouse_id, 1, 'WH1-RACK-1', 'Sawtooth 130/90-15, 170/80-15', 'Sawtooth', 4, 6, 2, 15, 720, 0, 'active'),
  (v_warehouse_id, 2, 'WH1-RACK-2', 'Sawtooth 130/90-15, 170/80-15', 'Sawtooth', 4, 6, 2, 15, 720, 0, 'active'),
  (v_warehouse_id, 3, 'WH1-RACK-3', 'Enduro 70/90-17, 80/100-18', 'Enduro', 4, 6, 2, 15, 720, 0, 'active'),
  (v_warehouse_id, 4, 'WH1-RACK-4', 'Dual Sport 90/90-17, 110/80-17', 'Dual Sport', 4, 6, 2, 15, 720, 0, 'active'),
  (v_warehouse_id, 5, 'WH1-RACK-5', 'Motocross 80/100-18, 100/90-19', 'Motocross', 4, 6, 2, 15, 720, 0, 'active');
  
  RAISE NOTICE '✅ Created 5 racks';
END $$;

-- 4. Grant permissions
GRANT ALL ON rack_configurations TO authenticated;
GRANT ALL ON rack_configurations TO service_role;
GRANT ALL ON rack_configurations TO anon;

-- 5. Disable RLS
ALTER TABLE rack_configurations DISABLE ROW LEVEL SECURITY;

-- 6. Verify
SELECT rack_code, size_category, total_capacity, status 
FROM rack_configurations 
ORDER BY rack_number;
```

---

## Step 3: Click "Run"

You should see:
```
Success. No rows returned
✅ Created 5 racks

rack_code    | size_category | total_capacity | status
WH1-RACK-1   | Sawtooth      | 720           | active
WH1-RACK-2   | Sawtooth      | 720           | active
WH1-RACK-3   | Enduro        | 720           | active
WH1-RACK-4   | Dual Sport    | 720           | active
WH1-RACK-5   | Motocross     | 720           | active
```

---

## Step 4: Test Backend Can See Racks

Run this in your terminal:

```bash
cd backend
node test-exact-backend-query.mjs
```

Expected output:
```
Test 1: Simple query (no join)
Result: 5 racks
```

---

## Step 5: Test in Browser

1. **Hard refresh browser:** `Ctrl + Shift + R`
2. Go to **Barcode & QR Generation**
3. Select a **Batch**
4. Select **Warehouse**: Main Warehouse
5. **Racks should now appear!**

---

## Troubleshooting

### If SQL fails with "Main Warehouse not found"

Run this first to create the warehouse:

```sql
INSERT INTO warehouse_locations (name, code, zone, aisle, rack, status)
VALUES ('Main Warehouse', 'WH1', 'Zone A', 'Aisle 1', 'N/A', 'active')
ON CONFLICT (name) DO NOTHING;
```

Then run the rack creation SQL again.

### If backend still shows 0 racks after SQL

1. Verify racks exist in Supabase:
   ```sql
   SELECT COUNT(*) FROM rack_configurations;
   ```
   Should return: 5

2. Check table is accessible to API:
   - Go to: **Database** → **Tables** → **rack_configurations**
   - Check if table is enabled for API access

3. Restart backend server

---

## Why This Happened

The `017_warehouse_rack_system.sql` file was created but **never executed in Supabase**. The test scripts were working because they created racks in a test environment, but the actual production database was empty.

---

**After running this SQL, the racks will be permanently stored in Supabase and the backend will be able to access them.**
