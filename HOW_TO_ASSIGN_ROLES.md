# How to Assign Roles to Your User Account

This guide will help you assign roles to your user account to fix the 403 Forbidden errors.

## Why You're Getting 403 Errors

Your user account exists in the database but has **no roles assigned**. The backend API checks for specific roles before allowing access to endpoints. Without roles, you get "403 Forbidden" errors.

## Quick Fix (3 Steps)

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the SQL Script

Copy and paste the contents of `backend/database/ASSIGN_USER_ROLES.sql` into the SQL Editor, OR use this quick script:

```sql
-- 1. First, check what users exist
SELECT 
  u.id,
  u.email,
  COALESCE(ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), ARRAY[]::text[]) as roles
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email
ORDER BY u.created_at DESC;

-- 2. Assign admin role to your user
-- ⚠️ IMPORTANT: Replace 'your-email@example.com' with YOUR actual email
DO $$
DECLARE
  v_user_id UUID;
  v_admin_role_id UUID;
  v_email TEXT := 'your-email@example.com'; -- CHANGE THIS!
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'admin';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ User not found: %', v_email;
    RETURN;
  END IF;
  
  IF v_admin_role_id IS NULL THEN
    RAISE NOTICE '❌ Admin role not found';
    RETURN;
  END IF;
  
  INSERT INTO user_roles (user_id, role_id)
  VALUES (v_user_id, v_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RAISE NOTICE '✅ Admin role assigned to %', v_email;
END $$;

-- 3. Verify the assignment
SELECT 
  u.email,
  ARRAY_AGG(r.name) as assigned_roles
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.email;
```

**IMPORTANT:** Change `'your-email@example.com'` to your actual email address!

### Step 3: Refresh Your Session

1. **Sign out** from your application
2. **Sign back in**
3. Your new roles will be loaded
4. ✅ The 403 errors should be gone!

## Available Roles

Choose the role(s) that match your needs:

| Role | Access Level | Best For |
|------|-------------|----------|
| `admin` | Full system access | System administrators |
| `manager` | Management & reports | Warehouse managers |
| `operational_staff` | Orders, inventory, suppliers | Operations team |
| `warehouse_staff` | Receiving, picking, packing | Warehouse workers |
| `sales_staff` | Sales operations | Sales team |

## Assigning Multiple Roles

If you want to assign multiple roles to a user:

```sql
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'your-email@example.com'; -- CHANGE THIS
  v_role_name TEXT;
  v_role_id UUID;
  v_roles TEXT[] := ARRAY['admin', 'manager', 'operational_staff']; -- Add roles here
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ User not found';
    RETURN;
  END IF;
  
  FOREACH v_role_name IN ARRAY v_roles
  LOOP
    SELECT id INTO v_role_id FROM roles WHERE name = v_role_name;
    
    IF v_role_id IS NOT NULL THEN
      INSERT INTO user_roles (user_id, role_id)
      VALUES (v_user_id, v_role_id)
      ON CONFLICT (user_id, role_id) DO NOTHING;
      
      RAISE NOTICE '✅ Assigned: %', v_role_name;
    END IF;
  END LOOP;
END $$;
```

## Troubleshooting

### "User not found"
- Double-check your email address spelling
- Make sure you've registered an account
- Check if your email is confirmed

### "Admin role not found"
The roles table might be empty. Run this to create default roles:

```sql
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('manager', 'Management and reporting'),
  ('operational_staff', 'Operational tasks'),
  ('warehouse_staff', 'Warehouse operations'),
  ('sales_staff', 'Sales operations')
ON CONFLICT (name) DO NOTHING;
```

### Still getting 403 errors after assigning roles?
1. Make sure you signed out and back in
2. Clear browser cache/cookies
3. Check browser console for auth token
4. Verify roles were assigned (run Step 1 query again)

## Quick Test

After assigning roles, you can test in the browser console:

```javascript
// Check your current roles
const user = JSON.parse(localStorage.getItem('user'));
console.log('My roles:', user?.roles);
```

You should see your assigned roles in the array.

## Need Help?

- Check `backend/database/ASSIGN_USER_ROLES.sql` for more detailed examples
- Check `backend/database/CHECK_ROLES.sql` to verify role assignments
- Look at `FIXING_403_PERMISSION_ERRORS.md` for more context

---

**Remember:** Always sign out and sign back in after changing roles!
