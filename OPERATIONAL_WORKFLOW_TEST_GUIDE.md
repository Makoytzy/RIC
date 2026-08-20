# Operational Staff Workflow - Complete Test Guide

## 🎯 Overview
This guide walks you through testing the complete operational workflow for Red Indian Customs tire inventory system, from shipment registration to barcode generation.

## 📋 Prerequisites

### 1. Services Running
✅ **Backend**: http://localhost:4000 (currently running)
✅ **Frontend**: http://localhost:5174 (should be running)
✅ **Supabase**: https://hbsynkxaadnximuytbor.supabase.co

### 2. Test User Setup

**IMPORTANT**: Before testing, set up passwords for the test users.

Run this SQL in your Supabase SQL Editor:
```sql
-- Set password to "Password123!" for testing
UPDATE auth.users 
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'sarah.williams@redindiancustoms.com';

UPDATE auth.users 
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'emily.davis@redindiancustoms.com';
```

Or run the prepared script:
- File: `backend/database/SET_TEST_PASSWORDS.sql`
- Execute in Supabase SQL Editor

### 3. Test Credentials
```
Email: sarah.williams@redindiancustoms.com
Password: Password123!
Role: Operational Staff
```

---

## 🔐 Step 1: Login

1. Open browser: http://localhost:5174
2. You should see the Login page
3. Enter credentials:
   - Email: `sarah.williams@redindiancustoms.com`
   - Password: `Password123!`
4. Click **"Login"**
5. You should be redirected to `/dashboard`

**Expected Result**: Successfully logged in, redirected to dashboard

**Troubleshooting**:
- If you see "Invalid credentials": Make sure you ran the password setup SQL
- If login button doesn't work: Check browser console for errors
- If page doesn't redirect: Check network tab for 401 errors

---

## 📦 Step 2: Create a Shipment

### Why: Shipments are the starting point of inventory workflow

1. Navigate to: **Operational Dashboard** → **Shipment Registration**
2. Click **"+ New Shipment"**
3. Fill in the form:
   ```
   Supplier: [Select from dropdown - e.g., "Tirex Manufacturing Co."]
   Shipment Number: SHIP-2026-001
   Container Number: CONT-ABC123
   BL Number: BL-2026-001
   Expected Quantity: 1000
   Expected Arrival Date: [Select a future date]
   Notes: Test shipment for workflow validation
   ```
4. Click **"Create Shipment"**

**Expected Result**: 
- Success message shown
- New shipment appears in the list with status "PENDING"
- Shipment card shows all entered details

**Troubleshooting**:
- If "Failed to load data": You're not logged in - go back to Step 1
- If "No suppliers found": You need to create suppliers first (Admin feature)
- If 403 error: User role not assigned correctly

---

## 📥 Step 3: Receive the Shipment

### Why: Only RECEIVED shipments can create batches

1. In **Shipment Registration** page, find your shipment (SHIP-2026-001)
2. Click **"Receive"** or **"Edit"** button
3. Update status or use "Receive Shipment" action
4. Enter actual received quantity: 1000
5. Click **"Confirm Receipt"**

**Expected Result**:
- Shipment status changes to "RECEIVED"
- Shipment card color changes (usually to green/success color)
- Shipment now available for batch creation

---

## 🏷️ Step 4: Register Products (If Not Done)

### Why: Batches must be linked to products

1. Navigate to: **Operational Dashboard** → **Product Registration**
2. Check if products exist (e.g., tire SKUs)
3. If no products, click **"+ New Product"**
4. Fill in product details:
   ```
   SKU: TEST-TIRE-001
   Brand: Michelin
   Model: Pilot Sport 4
   Dimensions: 225/45R17
   Category: Performance Tire
   Status: In Stock
   ```
5. Click **"Create Product"**

**Expected Result**:
- Product appears in the list
- Product available for batch selection

---

## 📊 Step 5: Create a Batch

### Why: Batches group products by shipment and date

1. Navigate to: **Operational Dashboard** → **Batch Management**
2. Click **"+ New Batch"**
3. Fill in the form:
   ```
   Shipment: [Select SHIP-2026-001 from dropdown]
   Product: [Select TEST-TIRE-001 from dropdown]
   Batch Month: [Current month]
   Batch Year: [Current year]
   Quantity: 100
   Manufactured Date: [Select a date]
   Expiry Date: [Select future date, or leave empty]
   Notes: Test batch for barcode generation
   ```
4. Click **"Generate Batch Number"** (auto-generates format: BATCH-YYMM-XXX)
5. Click **"Create Batch"**

**Expected Result**:
- Success message shown
- New batch appears with status "ACTIVE"
- Batch card shows:
  - Batch number (e.g., BATCH-2608-123)
  - Product details
  - Shipment reference
  - Quantity

**Important**: Copy or note down the **Batch ID** (visible in the batch card or URL)

---

## 📦 Step 6: Register Inventory Units

### Why: Inventory units create individual items ready for barcode generation

1. Navigate to: **Operational Dashboard** → **Inventory Registration**
2. Click **"+ New Inventory Unit"** or **"Bulk Register"**
3. Fill in the form:
   ```
   Batch: [Select the batch you just created]
   Quantity: 10 (will create 10 inventory units)
   Location: WAREHOUSE-A-01
   Notes: Test inventory for barcode workflow
   ```
4. Click **"Register Inventory"**

**Expected Result**:
- Success message: "10 inventory units registered successfully"
- Units appear in the inventory list
- Each unit has:
  - Unit number (sequential)
  - Status: AVAILABLE
  - Location: WAREHOUSE-A-01
  - Linked batch and product

---

## 🔢 Step 7: Generate Barcodes

### Why: Barcodes enable traceability from shipment → batch → unit

1. Navigate to: **Operational Dashboard** → **Barcode Generation**
2. Select options:
   ```
   Batch: [Select your batch]
   Format: QR Code (or Code128, or Both)
   Quantity: 10 (match inventory units)
   ```
3. Click **"Generate Barcodes"**

**Expected Result**:
- Success message: "10 barcodes generated successfully"
- Barcodes appear in the list:
  - Format: `RIC000000000007`, `RIC000000000008`, etc.
  - Status: ACTIVE
  - Each barcode linked to an inventory unit
- Preview images shown (QR codes or barcodes)
- **"Download PDF"** and **"Print"** buttons available

---

## ✅ Step 8: Verify Complete Traceability

### Test the full chain: Barcode → Unit → Batch → Shipment → Supplier

1. Pick any generated barcode (e.g., `RIC000000000007`)
2. Scan or enter the barcode in the system
3. Verify you can see:
   ```
   Barcode: RIC000000000007
     └─ Inventory Unit: #001
          └─ Batch: BATCH-2608-123
               └─ Product: TEST-TIRE-001 (Michelin Pilot Sport 4)
                    └─ Shipment: SHIP-2026-001
                         └─ Supplier: Tirex Manufacturing Co.
   ```

**Expected Result**: Complete traceability from barcode back to supplier

---

## 🎉 Success Criteria

✅ All 7 pages work without errors:
1. Shipment Registration
2. Batch Management  
3. Product Registration
4. Products List
5. Inventory Registration
6. Barcode Generation
7. Shipment Schedule

✅ Complete workflow functional:
- Create Shipment → Receive → Create Batch → Register Inventory → Generate Barcodes

✅ Proper error messages:
- 401: "Authentication required. Please log in again."
- 403: "Access denied..."
- Generic: Helpful error message (not just "Failed to load data")

✅ Data persistence:
- All created records saved to database
- Data survives page refresh
- Relationships intact (batch → shipment → supplier)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to load data. Please try again."
**Cause**: Generic error - could be auth, network, or server issue
**Solution**: 
1. Check browser console for specific error
2. Check Network tab → Look for status code (401, 403, 500)
3. With improved error messages, you'll now see specific auth/permission errors

### Issue 2: "Authentication required. Please log in again."
**Cause**: Session expired or not logged in
**Solution**: Log out completely, then log in again with test credentials

### Issue 3: "Access denied. You do not have permission..."
**Cause**: User role not assigned
**Solution**: Run this SQL to assign role:
```sql
-- Check current roles
SELECT u.email, r.name 
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'sarah.williams@redindiancustoms.com';

-- If no role, assign operational_staff role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM auth.users u, roles r
WHERE u.email = 'sarah.williams@redindiancustoms.com'
AND r.name = 'operational_staff'
ON CONFLICT DO NOTHING;
```

### Issue 4: "Could not embed because more than one relationship was found"
**Cause**: Duplicate foreign key constraints (already fixed in code)
**Solution**: Backend already updated with explicit FK names in queries

### Issue 5: Blank dropdowns (no suppliers, no products)
**Cause**: No data in database
**Solution**: 
- For suppliers: Admin must create suppliers first
- For products: Use Product Registration page to create products
- Or run test data SQL script if available

---

## 📊 Testing Checklist

Use this checklist to verify all features:

- [ ] Login works with test credentials
- [ ] Shipment Registration page loads
- [ ] Can create new shipment
- [ ] Can view shipment list
- [ ] Can receive shipment (change status to RECEIVED)
- [ ] Batch Management page loads
- [ ] Can create new batch (linked to received shipment)
- [ ] Batch list shows correct data
- [ ] Product Registration page loads
- [ ] Can create new product
- [ ] Products List page loads
- [ ] Inventory Registration page loads
- [ ] Can register inventory units
- [ ] Barcode Generation page loads
- [ ] Can generate barcodes
- [ ] Barcodes display correctly (QR codes visible)
- [ ] Can download barcode PDF
- [ ] Shipment Schedule page loads
- [ ] All pages show proper error messages (not generic "Failed to load data")

---

## 🔍 Verification Commands

### Check Backend Logs
```powershell
# See what requests are hitting the backend
# Backend should show: GET /api/batches 200 (not 401)
```

### Check Browser Console
```javascript
// Should see successful API calls
// No 401 or 403 errors
// AuthContext should show user logged in
```

### Check Database
```sql
-- Verify data was created
SELECT COUNT(*) FROM shipments; -- Should have your test shipment
SELECT COUNT(*) FROM batches;   -- Should have your test batch
SELECT COUNT(*) FROM inventory_units; -- Should have 10 units
SELECT COUNT(*) FROM barcodes;  -- Should have 10 barcodes

-- Verify relationships
SELECT 
  b.barcode_number,
  iu.unit_number,
  ba.batch_number,
  p.sku,
  s.shipment_number,
  su.name as supplier_name
FROM barcodes b
JOIN inventory_units iu ON iu.id = b.inventory_unit_id
JOIN batches ba ON ba.id = iu.batch_id
JOIN products p ON p.id = ba.product_id
JOIN shipments s ON s.id = ba.shipment_id
JOIN suppliers su ON su.id = s.supplier_id
ORDER BY b.barcode_number DESC
LIMIT 5;
```

---

## 📝 Notes

1. **Error Messages Improved**: Both BatchManagement and ShipmentRegistration now show specific error messages:
   - 401: Authentication required
   - 403: Access denied
   - Other: Specific error message from backend

2. **Backend Ready**: All controller files updated with correct FK relationship names to avoid PostgREST PGRST201 errors

3. **Test Data**: You can create test data manually through the UI following this guide, or run SQL scripts if available

4. **Next Steps**: After verifying this workflow, Admin features can be tested (user management, system settings, etc.)

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Set passwords (in Supabase SQL Editor)
# Run: backend/database/SET_TEST_PASSWORDS.sql

# 2. Login
# Go to: http://localhost:5174
# Email: sarah.williams@redindiancustoms.com
# Password: Password123!

# 3. Create workflow:
# Shipment Registration → Create shipment → Receive it
# Batch Management → Create batch (linked to shipment)
# Inventory Registration → Register units
# Barcode Generation → Generate barcodes

# 4. Verify
# Check that all pages load without "Failed to load data" error
# Check that barcodes are generated and traceable
```

Good luck with testing! 🎉
