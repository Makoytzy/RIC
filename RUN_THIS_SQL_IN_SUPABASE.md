# 🚀 QUICK START - RUN THIS SQL IN SUPABASE

## ⚠️ CRITICAL STEP - DO THIS NOW!

The warehouse rack system is ready, but you need to create the database tables first.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **Step 1: Open Supabase Dashboard**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **Red Indian Customs Inventory**
3. Click on **SQL Editor** in the left sidebar

---

### **Step 2: Open the SQL File**
1. In VS Code, open: `backend/database/017_warehouse_rack_system.sql`
2. Press `Ctrl+A` to select all
3. Press `Ctrl+C` to copy

---

### **Step 3: Paste and Run in Supabase**
1. In Supabase SQL Editor, click **New Query**
2. Paste the copied SQL (Ctrl+V)
3. Click **Run** button (or press F5)
4. Wait for completion (may take 30-60 seconds)

---

### **Step 4: Verify Success**

You should see this message at the bottom:
```
✅ Warehouse rack system created successfully!
📦 Warehouse 1: 5 racks initialized
📊 Each rack: 4 shelves × 6 sections × 2 subsections × 15 capacity = 720 total positions per rack
🏷️ Total capacity: 3,600 tire positions in Warehouse 1
```

---

### **Step 5: Verify Tables Created**

Run this verification query in Supabase:
```sql
-- Check warehouse
SELECT * FROM warehouse_locations;

-- Check racks
SELECT rack_code, designated_size, total_capacity, current_count, status 
FROM rack_configurations 
ORDER BY rack_number;

-- Check total positions
SELECT COUNT(*) as total_positions FROM rack_locations;
```

**Expected Results:**
- 1 warehouse: "Main Warehouse (WH1)"
- 5 racks: RACK-1, RACK-2, RACK-3, RACK-4, RACK-5
- 3,600 positions total

---

## ✅ WHAT THIS SCRIPT DOES

### **Creates 4 New Tables:**
1. **warehouse_locations** - Stores warehouse info
2. **rack_configurations** - Stores rack details (5 racks)
3. **rack_locations** - Stores 3,600 individual positions
4. **inventory_relocation_history** - Tracks all moves

### **Updates 1 Existing Table:**
1. **inventory_units** - Adds location fields

### **Creates Triggers:**
1. Auto-updates rack capacity when inventory assigned
2. Auto-updates position status (available/full)

### **Initializes Data:**
1. Creates "Main Warehouse (WH1)"
2. Creates 5 racks with 720 positions each
3. Sets up Dual Sport ST 90/90-17 on RACK-1 and RACK-2

---

## 🧪 TEST AFTER RUNNING SQL

### **Test 1: Check API**
```bash
# Open browser console and run:
fetch('http://localhost:4000/api/warehouses')
  .then(r => r.json())
  .then(d => console.log(d));

# Should show:
# { success: true, warehouses: [{ name: "Main Warehouse", code: "WH1", ... }] }
```

### **Test 2: Check Barcode Generation Page**
1. Login to your app
2. Go to "Generate Barcodes"
3. Select a batch
4. **Look for "Warehouse Location" section**
5. Dropdown should now show "Main Warehouse (WH1)"

---

## ❌ TROUBLESHOOTING

### **Error: "relation does not exist"**
**Cause:** Tables already exist  
**Fix:** Safe to ignore, or drop tables first:
```sql
DROP TABLE IF EXISTS inventory_relocation_history CASCADE;
DROP TABLE IF EXISTS rack_locations CASCADE;
DROP TABLE IF EXISTS rack_configurations CASCADE;
DROP TABLE IF EXISTS warehouse_locations CASCADE;
-- Then run the script again
```

### **Error: "column already exists"**
**Cause:** inventory_units already has location fields  
**Fix:** The script uses `ADD COLUMN IF NOT EXISTS`, safe to ignore

### **No warehouses in dropdown**
**Cause:** SQL script not run yet  
**Fix:** Run the SQL script as described above

### **API returns empty array**
**Cause:** Tables empty or SQL script incomplete  
**Fix:** Check that all NOTICE messages appeared, verify with SELECT queries

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for errors (F12)
2. Check backend logs in terminal
3. Verify SQL script ran completely
4. Check tables exist: `\dt` in Supabase SQL Editor

---

## 🎉 SUCCESS CHECKLIST

After running SQL script, you should have:
- ✅ Tables created in Supabase
- ✅ 1 warehouse visible in API response
- ✅ 5 racks visible in API response
- ✅ 3,600 positions in database
- ✅ Warehouse dropdown populates in UI
- ✅ Rack dropdown populates when warehouse selected
- ✅ Position dropdown shows available positions

---

**File Location:** `backend/database/017_warehouse_rack_system.sql`  
**Estimated Time:** 2 minutes  
**Required:** YES - System won't work without this!

🚀 **GO RUN IT NOW!** 🚀
