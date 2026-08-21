# 🏭 WAREHOUSE RACK MANAGEMENT SYSTEM

## 📋 OVERVIEW

Complete traceability system with role-based warehouse management for Red Indian Customs tire inventory.

---

## 👥 ROLE PERMISSIONS

### **Operational Staff & Manager**
✅ Input inventory unit details when generating barcodes  
✅ Assign warehouse location, rack, shelf, section, subsection  
✅ Edit/relocate inventory when racks are full  
✅ View real-time capacity of all racks  
✅ Create relocation history

### **Warehouse Staff**
✅ Scan products (barcode scanner or manual)  
✅ View current location of scanned product  
✅ **READ-ONLY** - Cannot edit locations  
✅ Verify physical placement matches system

---

## 🏗️ WAREHOUSE 1 STRUCTURE

### **Total Racks:** 5

### **Rack Configuration:**
```
Each Rack =
├── 4 Shelves (S1, S2, S3, S4)
│   └── Each Shelf has 6 Sections (SEC1-SEC6)
│       └── Each Section has 2 Subsections (SUB1, SUB2)
│           └── Each Subsection capacity: 14-15 tires
│
Total per Rack: 4 × 6 × 2 × 15 = 720 positions
Total Warehouse 1: 5 × 720 = 3,600 tire positions
```

### **Size Allocation:**

| Rack Number | Designated Size | Category | Capacity |
|-------------|----------------|----------|----------|
| **RACK-1** | Dual Sport ST 90/90-17 | Dual Sport | 720 |
| **RACK-2** | Dual Sport ST 90/90-17 | Dual Sport | 720 |
| **RACK-3** | To Be Assigned | General | 720 |
| **RACK-4** | To Be Assigned | General | 720 |
| **RACK-5** | To Be Assigned | General | 720 |

**Note:** Each tire size category gets 2 dedicated racks

---

## 📍 POSITION CODE FORMAT

```
WH1-RACK-2-S3-SEC4-SUB1
 │    │    │  │    │
 │    │    │  │    └─ Subsection 1 or 2
 │    │    │  └────── Section 1-6
 │    │    └───────── Shelf 1-4
 │    └────────────── Rack number
 └─────────────────── Warehouse code
```

**Example:** `WH1-RACK-2-S3-SEC4-SUB1`
- **Warehouse:** Main Warehouse (WH1)
- **Rack:** Rack 2 (Dual Sport ST 90/90-17)
- **Shelf:** 3rd shelf from bottom
- **Section:** 4th section
- **Subsection:** First subsection
- **Capacity:** 15 tires

---

## 🔄 COMPLETE WORKFLOW

### **STEP 1: Generate Barcodes (Operational Staff/Manager)**

**Page:** Generate Barcodes  
**When:** After batch creation, ready to label tires

**Process:**
1. Select Product (e.g., "Dual Sport ST 90/90-17")
2. Select Batch (e.g., "BATCH-2608-655")
3. Select Shipment (optional)
4. **NEW:** Select Warehouse Location
5. **NEW:** Select Rack (shows only racks for this tire size)
6. **NEW:** Select available position (auto-suggests next available)
7. Enter Quantity (e.g., 100 barcodes)
8. Click "Generate Barcodes"

**What Happens:**
```
System generates 100 barcodes + QR codes
Each barcode is linked to:
├── Product: Dual Sport ST 90/90-17
├── Batch: BATCH-2608-655
├── Shipment: SHIP-2024-001
├── Supplier: ABC Tire Factory
└── Inventory Unit:
    ├── Warehouse: Main Warehouse (WH1)
    ├── Rack: RACK-2
    ├── Position: WH1-RACK-2-S1-SEC1-SUB1 to WH1-RACK-2-S1-SEC3-SUB2
    ├── Status: AVAILABLE
    └── Assigned by: John Doe (Operational Staff)
```

**Smart Features:**
- System auto-suggests next available positions
- Shows real-time capacity: "15/15 full" or "3/15 available"
- Warns when rack is almost full (>90%)
- Auto-marks position as "FULL" when capacity reached

---

### **STEP 2: Print Labels**

**Process:**
1. Select generated barcodes
2. Click "Print All" or "Print Single"
3. Print barcode labels with QR codes
4. Physical label shows:
   - Barcode value: `RIC000000000336`
   - QR code (scannable)
   - Product name
   - SKU
   - Batch number
   - **Location:** WH1-RACK-2-S1-SEC1-SUB1

---

### **STEP 3: Physical Storage (Warehouse Staff)**

**Page:** Scan Products (Warehouse Receiving)  
**When:** Taking tires from receiving area to storage

**Process:**
1. Scan barcode using handheld scanner or camera
2. System displays:
   ```
   ✅ Product: Dual Sport ST 90/90-17
   📍 Assigned Location: WH1-RACK-2-S1-SEC1-SUB1
   📦 Batch: BATCH-2608-655
   🏢 Warehouse: Main Warehouse
   🗄️ Rack: RACK-2 (Dual Sport ST 90/90-17)
   📏 Shelf: 1, Section: 1, Subsection: 1
   ```
3. Warehouse staff walks to exact location
4. Places tire in designated spot
5. Confirms placement (click "Confirm Stored")

**Note:** Warehouse staff **CANNOT EDIT** location. They only verify and confirm.

---

### **STEP 4: Relocation (When Rack is Full)**

**Page:** Relocate Inventory (Operational Staff/Manager only)  
**When:** Rack reaches capacity, reorganization needed

**Scenario:**
```
RACK-2 is FULL (720/720 positions occupied)
New shipment of 50 more Dual Sport ST 90/90-17 tires arrives
Need to move some tires to make room
```

**Process:**
1. Operational staff scans barcode to relocate
2. System shows current location:
   ```
   Current: WH1-RACK-2-S4-SEC6-SUB2
   Status: FULL (720/720)
   ```
3. Select new location:
   - Option A: Move to RACK-1 (same size category)
   - Option B: Move to overflow rack (RACK-3)
4. System shows available positions in selected rack
5. Select new position: `WH1-RACK-1-S2-SEC3-SUB1`
6. Select reason: "Rack Full", "Reorganization", "Maintenance", etc.
7. Add notes (optional): "Moved to make room for new shipment"
8. Click "Update Location"

**What Happens:**
```
Old Location (RACK-2-S4-SEC6-SUB2):
├── Current count: 15 → 14
├── Status: full → available
└── Updated: 2024-08-21 14:30

New Location (RACK-1-S2-SEC3-SUB1):
├── Current count: 12 → 13
├── Status: available (still has space)
└── Updated: 2024-08-21 14:30

Relocation History Created:
├── From: WH1-RACK-2-S4-SEC6-SUB2
├── To: WH1-RACK-1-S2-SEC3-SUB1
├── Reason: Rack Full
├── Notes: "Moved to make room for new shipment"
├── Relocated by: John Doe
└── Date: 2024-08-21 14:30:25

QR Code Data AUTOMATICALLY UPDATED ✅
```

---

### **STEP 5: Customer Scans QR Code (Public)**

**URL:** `/trace/RIC000000000336`  
**Who:** Anyone (customers, staff, public)  
**Access:** No login required

**Displays:**
```
┌─────────────────────────────────────┐
│  ✅ VERIFIED AUTHENTIC PRODUCT      │
│  Red Indian Customs                 │
└─────────────────────────────────────┘

📦 PRODUCT INFORMATION
├── Product: Dual Sport ST 90/90-17
├── Brand: Red Indian Customs
├── SKU: SAW-18-90/90
└── Category: Dual Sport

📍 CURRENT LOCATION
├── Warehouse: Main Warehouse (WH1)
├── Rack: RACK-1 (Dual Sport ST 90/90-17)
├── Position: WH1-RACK-1-S2-SEC3-SUB1
├── Shelf: 2, Section: 3, Subsection: 1
└── Status: AVAILABLE

🏷️ BATCH INFORMATION
├── Batch: BATCH-2608-655
├── Manufactured: 2024-01-15
└── Quantity in Batch: 500 units

🚢 SHIPMENT INFORMATION
├── Shipment: SHIP-2024-001
├── Container: ABCD1234567
├── BL Number: BL123456
└── Received: 2024-02-20

🏭 SUPPLIER INFORMATION
├── Supplier: ABC Tire Factory
├── Code: SUP-001
├── Contact: John Smith
└── Email: contact@abctire.com

📜 RELOCATION HISTORY
└── Relocated 1 time
    ├── From: WH1-RACK-2-S4-SEC6-SUB2
    ├── To: WH1-RACK-1-S2-SEC3-SUB1
    ├── Reason: Rack Full
    ├── Date: 2024-08-21
    └── By: John Doe
```

---

## 🎯 KEY FEATURES

### **1. Capacity Management**
- ✅ Real-time tracking of every position
- ✅ Auto-calculate available space
- ✅ Visual indicators (green/yellow/red)
- ✅ Alerts when rack >90% full

### **2. Smart Assignment**
- ✅ Auto-suggest next available position
- ✅ Only show racks for matching tire size
- ✅ Prevent over-allocation
- ✅ Optimize storage efficiency

### **3. Audit Trail**
- ✅ Complete relocation history
- ✅ Track who moved what, when, why
- ✅ Number of times each tire relocated
- ✅ Original assignment timestamp

### **4. Role-Based Access**
- ✅ Operational Staff/Manager: Full control
- ✅ Warehouse Staff: Read-only scanning
- ✅ Public: Traceability viewing only

### **5. Scalability**
- ✅ Easy to add Warehouse 2, 3, 4...
- ✅ Flexible rack configurations
- ✅ Support different capacities per subsection
- ✅ Add new tire size categories

---

## 📊 DATABASE TABLES

### **warehouse_locations**
Main warehouse records (WH1, WH2, etc.)

### **rack_configurations**
Rack details, size assignments, total capacity

### **rack_locations**
Individual storage positions (720 per rack)

### **inventory_units**
Actual tires with current locations

### **inventory_relocation_history**
Complete audit trail of all moves

---

## 🚀 NEXT STEPS

### **1. Run SQL Script**
```sql
-- Paste this file in Supabase SQL Editor:
backend/database/017_warehouse_rack_system.sql
```

### **2. Create UI Pages**
- **Assign Inventory** (Operational Staff/Manager)
- **Relocate Inventory** (Operational Staff/Manager)
- **Scan Products** (Warehouse Staff - Read Only)
- **Rack Capacity Dashboard** (All roles)

### **3. Integrate with Barcode Generation**
- Add location fields to barcode generation form
- Auto-create inventory_units records
- Link to rack_locations

### **4. Update Traceability Page**
- Show current warehouse location
- Display relocation history
- Show position code clearly

---

## ✅ BENEFITS

1. **Complete Traceability** - From supplier to exact shelf position
2. **Prevent Lost Inventory** - Every tire has exact GPS coordinates
3. **Optimize Storage** - Fill racks efficiently, minimize walking
4. **Quick Retrieval** - Staff knows exactly where to find any tire
5. **Capacity Planning** - Know when racks are full before ordering
6. **Audit Compliance** - Complete history of all movements
7. **Customer Confidence** - Scan QR code, see authentic product with location

---

## 📝 NOTES

- **Warehouse 2+**: Will be configured when needed
- **Capacity Adjustment**: Can change 15 to 14 if needed per subsection
- **Rack Reassignment**: Can change designated size categories anytime
- **Backup Locations**: RACK-3, 4, 5 available as overflow/general storage

---

**Created:** August 21, 2024  
**System:** Red Indian Customs Inventory Management  
**Version:** 1.0
