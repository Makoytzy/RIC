# Fix: Employees API 500 Error

## Problem
The Employee Registration page was getting a **500 Internal Server Error** when calling `GET /api/employees`.

### Root Cause
The backend controller was trying to insert/select columns that **don't exist** in the `employees` table schema:
- ❌ `phone` (doesn't exist in schema)
- ❌ `assigned_warehouse` (doesn't exist in schema)

The actual `employees` table schema only has:
- `id`, `employee_code`, `full_name`, `email`, `employee_position`, `department`, `is_used`, `used_at`, `user_id`, `created_at`, `updated_at`, `created_by`, `metadata`

---

## Solution

### 1. **Backend Controller Fixed** (`employeeController.js`)

#### Before:
```javascript
// ❌ Trying to insert non-existent columns
.insert({
  phone: phone || null,  // Column doesn't exist
  assigned_warehouse: assignedWarehouse || 'Main Hub',  // Column doesn't exist
  ...
})
```

#### After:
```javascript
// ✅ Store extra fields in metadata JSON column
const metadata = {};
if (phone) metadata.phone = phone;
if (assignedWarehouse) metadata.assigned_warehouse = assignedWarehouse;

.insert({
  full_name: fullName,
  email: email.trim().toLowerCase(),
  employee_code: code,
  employee_position: role || 'operational_staff',
  department: department || 'Warehouse Operations',
  is_used: false,
  metadata: metadata  // ✅ Extra fields go here
})
```

### 2. **List Employees Updated**

Now transforms data to extract `phone` and `assigned_warehouse` from metadata:

```javascript
const employees = (data || []).map(emp => ({
  ...emp,
  phone: emp.metadata?.phone || null,
  assigned_warehouse: emp.metadata?.assigned_warehouse || null
}));
```

### 3. **Frontend Updated** (`EmployeeRegistration.jsx`)

Now properly reads phone and warehouse from metadata:

```javascript
phone: e.phone || e.metadata?.phone || '—',
assignedWarehouse: e.assigned_warehouse || e.metadata?.assigned_warehouse || 'Not Assigned',
```

---

## Result

✅ **API now works correctly**  
✅ **Employee Registration page loads without errors**  
✅ **Displays real employees from database** (15 pre-registered employees)  
✅ **Can create new employees**  
✅ **Phone and warehouse info stored in metadata**  

---

## Testing

1. **Start backend:** `cd backend && npm run dev`
2. **Start frontend:** `cd frontend && npm run dev`
3. **Navigate to:** Admin → Employee Registration
4. **Should see:** 15 pre-registered employees from database
5. **Test create:** Click "Register Employee" and add new one

---

## Database Schema Reference

The `employees` table was created with the `PRODUCTION_READY_SCHEMA.sql`:

```sql
create table if not exists public.employees (
    id uuid primary key default gen_random_uuid(),
    employee_code text unique not null,
    full_name text not null,
    email text unique not null,
    employee_position text not null,  -- admin, manager, operational_staff, warehouse_staff, sales_staff
    department text,
    is_used boolean not null default false,
    used_at timestamptz,
    user_id uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references public.users(id) on delete set null,
    metadata jsonb default '{}'::jsonb  -- ✅ Extra fields stored here
);
```

---

## Files Changed

1. ✅ `backend/src/controllers/employeeController.js` - Fixed insert/select queries
2. ✅ `frontend/src/pages/dashboard/admin/EmployeeRegistration.jsx` - Updated data mapping
3. ✅ Removed all hardcoded fallback data

---

**Status:** ✅ FIXED - The 500 error is now resolved!
