# 🎯 WAREHOUSE RACK SYSTEM - TESTING GUIDE

## ✅ SETUP COMPLETE!

Your warehouse rack management system is now fully deployed and ready for testing!

---

## 🌐 SERVERS RUNNING

- **Backend:** `http://localhost:4000`
- **Frontend:** `http://localhost:5174`

---

## 📋 TEST CHECKLIST

### **Test 1: Verify Database Setup**

Run this in Supabase SQL Editor: `VERIFY_WAREHOUSE_SETUP.sql`

**Expected Results:**
- ✅ 1 warehouse (Main Warehouse - WH1)
- ✅ 5 racks (RACK-1 through RACK-5)
- ✅ 3,600 total positions
- ✅ RACK-1 & RACK-2: Dual Sport ST 90/90-17
- ✅ RACK-3, 4, 5: To Be Assigned

---

### **Test 2: Test Backend API Endpoints**

Open browser console (F12) and run these:

```javascript
// Test 1: Get warehouses
fetch('http://localhost:4000/api/warehouses')
  .then(r => r.json())
  .then(d => console.log('Warehouses:', d));

// Expected: { success: true, warehouses: [{ code: "WH1", name: "Main Warehouse", ... }] }

// Test 2: Get racks for WH1
fetch('http://localhost:4000/api/racks?warehouseId=YOUR_WAREHOUSE_ID_HERE')
  .then(r => r.json())
  .then(d => console.log('Racks:', d));

// Expected: { success: true, racks: [5 racks] }

// Test 3: Get rack locations
fetch('http://localhost:4000/api/rack-locations?rackId=YOUR_RACK_ID_HERE')
  .then(r => r.json())
  .then(d => console.log('Locations:', d));

// Expected: { success: true, locations: [720 positions] }
```

---

### **Test 3: Generate Barcodes with Warehouse Location**

**As Operational Staff or Manager:**

1. **Login** to `http://localhost:5174`
2. **Navigate** to "Generate Barcodes" page
3. **Select** a product, batch, and shipment
4. **Scroll down** to "Warehouse Location Assignment" section
5. **Select Warehouse:** Should see "Main Warehouse (WH1)"
6. **Select Rack:** Should see RACK-1 through RACK-5
7. **Select Position:** Should see positions like "WH1-RACK-1-S1-SEC1-SUB1"
8. **Or use "Auto-assign"** checkbox
9. **Generate** barcodes
10. **Verify** success message

**Expected Result:**
- ✅ Barcodes generated successfully
- ✅ Location assigned to inventory units
- ✅ Rack capacity updated in database

---

### **Test 4: Warehouse Staff Scanning Page**

**As Warehouse Staff:**

1. **Navigate** to "Scan Products" (under Warehouse menu)
2. **Enter a barcode value** that you just generated
3. **Click "Scan"**

**Expected Result:**
- ✅ Shows product information
- ✅ Shows inventory unit details
- ✅ Shows warehouse location:
  - Warehouse: Main Warehouse (WH1)
  - Rack: RACK-X
  - Position: WH1-RACK-X-SX-SECX-SUBX
- ✅ Shows batch information
- ✅ Shows shipment information
- ✅ Shows supplier information
- ✅ **READ-ONLY** (no edit buttons)

---

### **Test 5: Relocate Inventory**

**As Operational Staff or Manager:**

1. **Navigate** to "Relocate Inventory" (under Inventory menu)
2. **Scan barcode** or enter barcode value
3. **Verify** current location is shown
4. **Select new warehouse** (if multiple exist)
5. **Select new rack**
6. **Select new position**
7. **Select reason** (e.g., "Rack Full")
8. **Add notes** (optional)
9. **Click "Relocate"**

**Expected Result:**
- ✅ Relocation successful
- ✅ Old rack capacity decremented
- ✅ New rack capacity incremented
- ✅ Relocation history recorded
- ✅ inventory_units.rack_location_id updated
- ✅ Can scan again to verify new location

---

### **Test 6: Traceability Page Shows Location**

1. **Navigate** to "Trace Products" page
2. **Scan a barcode** with warehouse location
3. **Verify** the "Inventory Unit" section shows:
   - ✅ Warehouse Location
   - ✅ Rack, Shelf, Section, Subsection
   - ✅ Assigned Date
   - ✅ Assigned By (user who generated barcode)

---

### **Test 7: Rack Capacity Tracking**

**Generate many barcodes to test capacity:**

1. Generate 15 barcodes for same position (subsection)
2. **Expected:** Position status changes to "full"
3. Generate 720 barcodes for same rack
4. **Expected:** Rack status changes to "full"
5. Try to relocate to full rack
6. **Expected:** Should show "No available space" or suggest alternative

---

### **Test 8: Role-Based Access Control**

**Test as Warehouse Staff (read-only):**
- ✅ Can scan products
- ✅ Can view location information
- ❌ Cannot generate barcodes with location
- ❌ Cannot relocate inventory

**Test as Operational Staff:**
- ✅ Can generate barcodes with location
- ✅ Can relocate inventory
- ✅ Can scan products

**Test as Manager:**
- ✅ Can generate barcodes with location
- ✅ Can relocate inventory
- ✅ Can scan products
- ✅ Full access to all features

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue: Warehouse dropdown is empty**
**Cause:** SQL script not run or failed  
**Fix:** Verify in Supabase that warehouse_locations has data:
```sql
SELECT * FROM warehouse_locations;
```

### **Issue: Rack dropdown is empty**
**Cause:** Racks not created or warehouse ID mismatch  
**Fix:** Verify racks exist:
```sql
SELECT * FROM rack_configurations;
```

### **Issue: 403 Forbidden on relocation**
**Cause:** User role is warehouse_staff (read-only)  
**Fix:** Login as operational_staff or manager

### **Issue: "Position already full"**
**Cause:** Position capacity reached (15 tires)  
**Fix:** Select different position or use auto-assign

### **Issue: Backend API returns error**
**Cause:** Check backend console for errors  
**Fix:** View terminal output or check logs

---

## 📊 DATABASE VERIFICATION QUERIES

Run these in Supabase to verify data integrity:

```sql
-- Check warehouse data
SELECT * FROM warehouse_locations;

-- Check racks
SELECT rack_code, designated_size, total_capacity, current_count, status 
FROM rack_configurations;

-- Check inventory units with location
SELECT 
  iu.unit_code,
  iu.position_code,
  iu.rack_code,
  rl.position_code as actual_position,
  rc.rack_code as actual_rack
FROM inventory_units iu
LEFT JOIN rack_locations rl ON rl.id = iu.rack_location_id
LEFT JOIN rack_configurations rc ON rc.id = rl.rack_id
WHERE iu.rack_location_id IS NOT NULL
LIMIT 10;

-- Check relocation history
SELECT 
  from_position_code,
  to_position_code,
  reason,
  relocated_at
FROM inventory_relocation_history
ORDER BY relocated_at DESC
LIMIT 10;
```

---

## ✨ SUCCESS CRITERIA

**System is fully functional when:**
- ✅ Backend running without errors
- ✅ Frontend running without errors
- ✅ Warehouse dropdown populates
- ✅ Rack dropdown populates when warehouse selected
- ✅ Position dropdown shows available positions
- ✅ Barcodes generated with location assignment
- ✅ Warehouse staff can scan (read-only)
- ✅ Operational staff can relocate inventory
- ✅ Rack capacity updates automatically
- ✅ Relocation history is tracked
- ✅ Traceability page shows location data

---

## 🎉 YOU'RE READY TO TEST!

1. Open `http://localhost:5174` in your browser
2. Login as **Operational Staff** or **Manager**
3. Go to "Generate Barcodes"
4. Look for the new "Warehouse Location Assignment" section
5. Start testing! 🚀

---

## 📞 NEED HELP?

If you encounter any issues:
1. Check browser console (F12) for frontend errors
2. Check backend terminal for API errors
3. Run verification queries in Supabase
4. Check that all tables exist and have data

**Files to reference:**
- `FIXES_APPLIED.md` - List of all fixes
- `VERIFY_WAREHOUSE_SETUP.sql` - Database verification
- `000_DIAGNOSE_WAREHOUSE_TABLE.sql` - Table structure diagnosis

---

**Status:** ✅ READY FOR TESTING  
**Last Updated:** August 21, 2024  
**Next Step:** Start testing the features above!
