# Fixing 403 Permission Errors

## Problem
Users are getting `403 Forbidden` errors when trying to access warehouse locations and other protected endpoints.

**Error Message:**
```
Error: You do not have permission to perform this action
```

## Root Cause
The user account doesn't have the required roles assigned in the database. The backend API endpoints check for specific roles before allowing access.

## Required Roles by Endpoint

### Warehouse Locations (`/api/warehouse/locations`)
- **Required roles:** `admin`, `manager`, `operational_staff`, or `warehouse_staff`

### Other Endpoints
- **Receiving:** `warehouse_staff`, `manager`, `admin`
- **Orders:** `admin`, `manager`, `operational_staff`, `sales_staff`
- **Suppliers:** `admin`, `manager`, `operational_staff`
- **Dashboard:** All roles

## Solution

### Option 1: Using SQL Script (Recommended for Testing)

Run the SQL script to assign roles:

```bash
# Connect to your Supabase database or use the Supabase SQL Editor
# Then run:
```

```sql
-- Check current users and their roles
SELECT 
  u.id,
  u.email,
  ARRAY_AGG(r.name) as roles
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email;

-- Assign admin role to a specific user (replace email)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM auth.users u, roles r
WHERE u.email = 'your-email@example.com'
  AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

Or use the provided script:
```bash
psql -h your-db-host -U postgres -d postgres -f backend/database/ASSIGN_DEFAULT_ROLES.sql
```

### Option 2: Using Supabase Dashboard

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the script from `backend/database/ASSIGN_DEFAULT_ROLES.sql`
3. Verify roles were assigned by checking the `user_roles` table

### Option 3: Using the API (If User Management is implemented)

Once logged in as admin:
1. Navigate to User Management page
2. Select a user
3. Assign appropriate roles

## Available Roles

The system has these roles defined:
- `admin` - Full access to all features
- `manager` - Management and reporting access
- `operational_staff` - Operational tasks (orders, inventory, suppliers)
- `warehouse_staff` - Warehouse operations (receiving, picking, packing)
- `sales_staff` - Sales operations

## Verification

After assigning roles:

1. **Sign out and sign back in** - The frontend caches user data
2. Check browser console for role information
3. Try accessing the protected page again

## Development Workaround

The frontend pages have **mock data fallback** for development. Even if you get a 403 error, the page will display sample data so you can continue UI development.

To see mock data:
- The error handler in each page automatically loads sample data
- This allows frontend development without needing database setup
- Look for `// Mock data for development` comments in the code

## Debugging

To check what roles the current user has:

```javascript
// In browser console while logged in:
const user = JSON.parse(localStorage.getItem('user'));
console.log('User roles:', user?.roles);
```

Or check the backend logs when making requests - the auth middleware logs role information.

## Related Files

- `backend/src/middleware/authMiddleware.js` - Authentication & role loading
- `backend/src/middleware/roleMiddleware.js` - Authorization checks
- `backend/database/ASSIGN_DEFAULT_ROLES.sql` - Role assignment script
- `frontend/src/utils/permissions.js` - Frontend role definitions
