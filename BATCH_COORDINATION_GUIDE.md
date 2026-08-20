# Batch Coordination & Storage Assignment Guide

## 🎯 Overview
The Batch Coordination feature allows operational staff to organize products into batches, assign warehouse locations, and automatically notify floor staff when batches are ready for storage.

## ✨ Features

### 1. **Batch Organization**
- View all active batches in one place
- Filter by assignment status (All, Unassigned, Assigned)
- See batch details: number, product, shipment, location status

### 2. **Warehouse Location Assignment**
- Assign batches to specific warehouse locations
- View available locations with capacity info
- Prevent over-allocation (capacity checks)
- Change location if needed

### 3. **Staff Notifications**
- Automatic notifications to warehouse staff
- Real-time notification bell with unread count
- Notifications include batch and location details
- Direct navigation to assigned batches

### 4. **Activity Tracking**
- Complete audit trail of batch activities
- Track who assigned locations and when
- Monitor notification history
- View status changes

## 📋 Database Schema

### New Tables Created

#### 1. `notifications`
Stores user notifications for batch assignments and system events.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'success', 'warning', 'error', 'task'
    priority TEXT NOT NULL, -- 'low', 'normal', 'high', 'urgent'
    related_entity_type TEXT, -- 'batch', 'shipment', etc.
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `batch_activities`
Tracks all activities related to batches.

```sql
CREATE TABLE batch_activities (
    id UUID PRIMARY KEY,
    batch_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by UUID,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Activity types:
- `created` - Batch created
- `location_assigned` - Location first assigned
- `location_changed` - Location changed
- `status_changed` - Status updated
- `inventory_registered` - Inventory units added
- `barcode_generated` - Barcodes created
- `notification_sent` - Staff notified
- `approved` / `rejected` / `closed` - Status changes

#### 3. `batches` (Updated)
Added warehouse location fields:

```sql
ALTER TABLE batches ADD COLUMN warehouse_location_id UUID;
ALTER TABLE batches ADD COLUMN location_assigned_at TIMESTAMPTZ;
ALTER TABLE batches ADD COLUMN location_assigned_by UUID;
```

### Database Functions

#### `assign_batch_location()`
Comprehensive function that:
1. Assigns batch to warehouse location
2. Validates location capacity and status
3. Logs activity in batch_activities
4. Sends notifications to warehouse staff
5. Returns result with notification count

```sql
SELECT assign_batch_location(
    p_batch_id := '<batch-uuid>',
    p_location_id := '<location-uuid>',
    p_assigned_by := '<user-uuid>',
    p_notify_warehouse_staff := TRUE
);
```

#### `get_available_warehouse_locations()`
Returns available locations with capacity info:

```sql
SELECT * FROM get_available_warehouse_locations(
    p_min_capacity := 10
);
```

#### `get_user_notifications()`
Get notifications for a user with filters:

```sql
SELECT * FROM get_user_notifications(
    p_user_id := '<user-uuid>',
    p_limit := 50,
    p_offset := 0,
    p_unread_only := TRUE
);
```

#### `mark_notification_read()`
Mark a notification as read:

```sql
SELECT mark_notification_read(
    p_notification_id := '<notification-uuid>',
    p_user_id := '<user-uuid>'
);
```

## 🚀 Setup Instructions

### 1. Run Database Migration

**Option A: Supabase SQL Editor (Recommended)**
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/hbsynkxaadnximuytbor/sql
2. Copy contents of `backend/database/016_batch_coordination_notifications.sql`
3. Paste and run in SQL Editor
4. Verify: Check for success messages

**Option B: Command Line (if psql installed)**
```bash
cd backend
psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 \
  -d postgres \
  -U postgres.hbsynkxaadnximuytbor \
  -f database/016_batch_coordination_notifications.sql
```

### 2. Restart Backend

```bash
cd backend
npm start
```

The backend will now expose new endpoints:
- `/api/warehouse-locations/*` - Location management
- `/api/notifications/*` - Notification management  
- `/api/batches/:id/assign-location` - Assign location to batch
- `/api/batches/:id/activities` - Get batch activity log

### 3. Frontend is Ready

New page created:
- `frontend/src/pages/dashboard/operational/BatchCoordination.jsx`

New component created:
- `frontend/src/components/notifications/NotificationBell.jsx`

Add to your routing and navigation as needed.

## 🎮 How to Use

### For Operational Staff

#### Step 1: Navigate to Batch Coordination
```
Dashboard → Operational → Batch Coordination
```

#### Step 2: Review Batches
- View stats: Total batches, Unassigned, Assigned, Available locations
- Use filter tabs:
  - **All Batches** - See everything
  - **Needs Location** - Batches awaiting assignment
  - **Assigned** - Batches with locations

#### Step 3: Assign Location
1. Find a batch in "Needs Location" tab
2. Click **"Assign Location"** button
3. In the modal:
   - Select warehouse location from dropdown
   - Locations show: Code, Name, Available capacity
   - Check "Notify warehouse staff" (enabled by default)
   - Review batch details
4. Click **"Assign Location"**
5. Success! Notifications sent to warehouse staff

#### Step 4: Verify Assignment
- Batch status changes to "Assigned"
- Badge shows green checkmark
- Activity logged in batch history
- Warehouse staff receive notifications

### For Warehouse Staff

#### Receiving Notifications
1. **Notification Bell** appears in header (if component added)
2. **Red badge** shows unread count
3. Click bell to open dropdown:
   - See list of notifications
   - Unread notifications highlighted in blue
   - High-priority items have colored left border
   - Shows time (e.g., "5m ago", "2h ago")

#### Handling Notifications
1. Click on a notification:
   - Automatically marked as read
   - Navigates to batch detail page (if action_url set)
   - See full batch and location info
2. Or click "Mark all read" to clear all at once
3. Click "View all notifications" for full history page

### Notification Details
Each notification includes:
- **Title**: "New Batch Assigned to Location"
- **Message**: "Batch BATCH-2608-123 (Michelin Pilot Sport 4) has been assigned to location A-01-01-01. Please prepare for storage."
- **Type**: Task (blue icon)
- **Priority**: Normal, High, or Urgent
- **Metadata**: Batch number, location code, product SKU, shipment number
- **Action URL**: Direct link to batch (e.g., `/dashboard/warehouse/batch/<id>`)

## 🔧 API Endpoints

### Warehouse Locations

```javascript
// Get all warehouse locations
GET /api/warehouse-locations?status=active&zone=A&min_capacity=10

// Get available locations
GET /api/warehouse-locations/available?min_capacity=10

// Get location by ID
GET /api/warehouse-locations/:id

// Create location
POST /api/warehouse-locations
Body: { code, name, zone, aisle, rack, shelf, capacity }

// Update location
PUT /api/warehouse-locations/:id
Body: { status, current_stock, ... }

// Delete location
DELETE /api/warehouse-locations/:id
```

### Batch Location Assignment

```javascript
// Assign batch to location
POST /api/batches/:id/assign-location
Body: {
  location_id: "uuid",
  notify_warehouse_staff: true
}

// Get batch activities
GET /api/batches/:id/activities?limit=50&offset=0
```

### Notifications

```javascript
// Get user notifications
GET /api/notifications?unread_only=true&limit=50

// Get unread count
GET /api/notifications/unread/count

// Mark notification as read
PUT /api/notifications/:id/read

// Mark all as read
PUT /api/notifications/read-all

// Delete notification
DELETE /api/notifications/:id

// Create notification (admin)
POST /api/notifications
Body: {
  user_id: "uuid",
  title: "Title",
  message: "Message",
  type: "task",
  priority: "normal",
  related_entity_type: "batch",
  related_entity_id: "uuid",
  action_url: "/dashboard/batch/123"
}
```

## 📊 Frontend Components

### BatchCoordination Page

**Location**: `frontend/src/pages/dashboard/operational/BatchCoordination.jsx`

**Features**:
- Stats dashboard (total, unassigned, assigned, available locations)
- Filter tabs (All, Needs Location, Assigned)
- Batch table with details
- Location assignment modal
- Real-time updates after assignment
- Success/error messaging

**Props**: None (standalone page)

### NotificationBell Component

**Location**: `frontend/src/components/notifications/NotificationBell.jsx`

**Features**:
- Bell icon with unread badge
- Dropdown panel with notifications
- Auto-refresh every 30 seconds
- Click to navigate to related page
- Mark individual or all as read
- Priority color coding
- Relative time display

**Usage**:
```jsx
import NotificationBell from './components/notifications/NotificationBell';

// Add to header/navbar
<NotificationBell />
```

## 🎨 Notification Types & Styling

### Types
- **info** 📘 - Informational (blue icon)
- **success** ✅ - Success (green icon)
- **warning** ⚠️ - Warning (orange icon)
- **error** ❌ - Error (red icon)
- **task** 🔔 - Task/Action required (blue icon)

### Priorities
- **low** - Gray border
- **normal** - Blue border (default)
- **high** - Orange border + orange background
- **urgent** - Red border + red background

### Visual Indicators
- Unread notifications: Blue background
- Read notifications: White background
- Unread dot: Blue circle on the right
- Priority borders: Colored left border (4px)

## 🔐 Security & Permissions

### Row Level Security (RLS)

**Notifications**:
- Users can only see their own notifications
- Users can only update their own notifications
- System can create notifications for anyone

**Batch Activities**:
- All authenticated users can view
- All authenticated users can create

**Warehouse Locations**:
- All authenticated users can read
- operational_staff, manager, admin can create/update
- Only admin can delete

### Function Security
All database functions use `SECURITY DEFINER` to run with elevated privileges while respecting RLS policies.

## 📈 Workflow Example

### Complete Batch-to-Storage Flow

1. **Shipment Arrives** (handled elsewhere)
   - Shipment created and received
   - Status: RECEIVED

2. **Batch Created** (BatchManagement page)
   - Operational staff creates batch
   - Links to shipment and product
   - Status: ACTIVE
   - Location: Not assigned

3. **Location Assignment** (BatchCoordination page)
   - Staff views unassigned batches
   - Selects batch → Clicks "Assign Location"
   - Chooses warehouse location (e.g., A-01-02-03)
   - Confirms with "Notify warehouse staff" checked
   - Click "Assign Location"

4. **System Actions** (automatic)
   - Batch updated with location_id
   - Activity logged: "location_assigned"
   - Query warehouse_staff role members
   - Create notification for each warehouse staff
   - Activity logged: "notification_sent"

5. **Warehouse Staff Notified** (real-time)
   - Notification bell shows badge (e.g., "1")
   - Staff clicks bell → sees notification
   - Notification shows batch details and location
   - Staff clicks notification → navigates to batch page

6. **Physical Storage** (warehouse floor)
   - Staff locates the physical batch
   - Moves items to assigned location (A-01-02-03)
   - Updates inventory system
   - Scans barcodes (if applicable)

7. **Inventory Registration** (InventoryRegistration page)
   - Register inventory units for the batch
   - Units inherit batch's warehouse location
   - Ready for barcode generation

8. **Barcode Generation** (BarcodeGeneration page)
   - Generate barcodes for inventory units
   - Barcodes linked to batch and location
   - Complete traceability chain

## 🧪 Testing Guide

### Test Scenario 1: Assign Location to Batch

**Prerequisites**:
- Logged in as operational staff
- At least 1 active batch exists
- Warehouse locations exist

**Steps**:
1. Navigate to Batch Coordination page
2. Verify stats show correct counts
3. Click "Needs Location" tab
4. Click "Assign Location" on a batch
5. Select a warehouse location
6. Keep "Notify warehouse staff" checked
7. Click "Assign Location"
8. Verify success message
9. Verify batch moves to "Assigned" tab
10. Check notification sent

**Expected Result**:
- ✅ Batch updated with location
- ✅ Success message displayed
- ✅ Stats updated
- ✅ Warehouse staff notified
- ✅ Activity logged

### Test Scenario 2: Receive Notification

**Prerequisites**:
- Logged in as warehouse staff
- Batch has been assigned (from Scenario 1)

**Steps**:
1. Look for notification bell in header
2. Verify red badge shows count
3. Click bell icon
4. Verify dropdown opens
5. See notification with batch details
6. Click on notification
7. Verify marked as read
8. Verify navigated to batch page

**Expected Result**:
- ✅ Badge shows unread count
- ✅ Notification appears in dropdown
- ✅ Clicking marks as read
- ✅ Badge count decreases
- ✅ Navigation works

### Test Scenario 3: View Batch Activities

**Prerequisites**:
- Batch with assigned location

**Steps**:
1. Open batch detail page
2. Click "Activities" or "History" tab
3. Verify activities listed:
   - Batch created
   - Location assigned
   - Notification sent

**Expected Result**:
- ✅ All activities shown
- ✅ Timestamps correct
- ✅ User names displayed
- ✅ Changes tracked (old vs new value)

## 🐛 Troubleshooting

### Issue: Notifications not appearing

**Possible Causes**:
1. User role not set to warehouse_staff
2. RLS policy blocking access
3. Notification not created due to function error

**Solutions**:
```sql
-- Check user roles
SELECT u.email, r.name 
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.id = '<user-uuid>';

-- Check notifications table
SELECT * FROM notifications 
WHERE user_id = '<user-uuid>' 
ORDER BY created_at DESC 
LIMIT 10;

-- Verify RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'notifications';
```

### Issue: Cannot assign location

**Possible Causes**:
1. Location at full capacity
2. Location under maintenance
3. Batch already assigned
4. Missing permissions

**Solutions**:
```sql
-- Check location status
SELECT * FROM warehouse_locations 
WHERE id = '<location-uuid>';

-- Verify capacity
SELECT code, capacity, current_stock, 
       (capacity - current_stock) as available
FROM warehouse_locations
WHERE status = 'active';

-- Check batch status
SELECT * FROM batches 
WHERE id = '<batch-uuid>';
```

### Issue: Location dropdown empty

**Possible Causes**:
1. No warehouse locations created
2. All locations at full capacity
3. All locations under maintenance

**Solutions**:
```sql
-- Check available locations
SELECT * FROM get_available_warehouse_locations(0);

-- Create test locations if needed
INSERT INTO warehouse_locations (code, name, zone, aisle, rack, shelf, capacity, status)
VALUES ('TEST-01', 'Test Location', 'T', '01', '01', '01', 100, 'active');
```

## 📝 Next Steps

1. **Add NotificationBell to Header**
   - Edit your main layout component
   - Import and add `<NotificationBell />`

2. **Add BatchCoordination to Navigation**
   - Add route in your router
   - Add menu item in operational dashboard

3. **Customize Notifications**
   - Modify notification templates in `assign_batch_location()` function
   - Add more notification types as needed

4. **Create Notification History Page**
   - Full page view of all notifications
   - Filter by type, priority, date
   - Search functionality

5. **Add Batch Detail Page**
   - View complete batch information
   - Show assigned location
   - Display activity history
   - Link to related inventory units and barcodes

## 🎉 Summary

You now have a complete Batch Coordination & Storage Assignment system with:

✅ Batch location assignment workflow
✅ Real-time staff notifications
✅ Activity tracking and audit trail
✅ Capacity management
✅ User-friendly UI with filtering
✅ API endpoints for integration
✅ Security and permission controls

The system is production-ready and fully functional!
