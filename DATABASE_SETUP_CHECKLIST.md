# 🚀 Database Setup Checklist

## ❌ Current Problem
```
Error: Could not find the table 'public.employees' in the schema cache
```

This means the database tables haven't been created yet!

---

## ✅ Solution: Run the Production Schema

### Step 1: Open Supabase
1. Go to: https://supabase.com/dashboard
2. Select your project: **Red Indian Customs**
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run Production Schema
1. Open file: `backend/database/PRODUCTION_READY_SCHEMA.sql`
2. **Select ALL** text (Ctrl + A)
3. **Copy** (Ctrl + C)
4. Paste into Supabase SQL Editor
5. Click **"Run"** button (or Ctrl + Enter)

### Step 3: Wait for Success
You should see:
```
Success. No rows returned
```

This means all tables, functions, triggers, and data were created!

### Step 4: Verify Tables
Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see at least:
- ✅ audit_logs
- ✅ employees
- ✅ roles
- ✅ user_roles
- ✅ users

### Step 5: Verify Employees
Run this query:
```sql
SELECT COUNT(*) as total_employees FROM public.employees;
```

Should return: **15 employees**

### Step 6: Check Your Admin Account
```sql
SELECT employee_code, full_name, email, employee_position 
FROM public.employees 
WHERE employee_code = 'EMP-10001';
```

Should show:
- Code: EMP-10001
- Name: Daisy Rey Daguplo
- Email: daisyreydaguplo18@gmail.com
- Position: admin

---

## 🔄 After Running Schema

1. **Restart Backend** (if running):
   ```bash
   cd backend
   npm run dev
   ```

2. **Refresh Frontend** (Ctrl + R in browser)

3. **Test Employee Registration Page**:
   - Should now load without errors
   - Should show 15 employees
   - Should be able to create new employees

---

## 🎉 Expected Result

After running the schema:
- ✅ No more "table not found" errors
- ✅ Employee Registration page loads
- ✅ Shows 15 pre-registered employees
- ✅ Admin dashboard shows real data
- ✅ User management works
- ✅ Role management works
- ✅ All features functional

---

## 📋 What Gets Created

The PRODUCTION_READY_SCHEMA.sql creates:

### Tables (5)
1. **roles** - 5 system roles (admin, manager, operational_staff, warehouse_staff, sales_staff)
2. **users** - User profiles
3. **user_roles** - Role assignments
4. **employees** - Pre-registered employees (15 records)
5. **audit_logs** - Activity tracking

### Functions (7)
- `has_role()` - Check user roles
- `verify_employee_code()` - Validate codes
- `mark_employee_code_used()` - Mark codes as used
- `handle_new_user()` - Auto-create profiles
- `set_updated_at()` - Auto-update timestamps
- `sync_email_verification()` - Sync email status
- `update_last_login()` - Track logins

### Triggers (3)
- `on_auth_user_created` - Auto user setup
- `trg_users_updated_at` - Auto timestamp
- `trg_employees_updated_at` - Auto timestamp

### Security
- ✅ Row Level Security (RLS) enabled
- ✅ Role-based policies
- ✅ Admin-only access controls

### Sample Data
- ✅ 5 roles
- ✅ 15 employees (including your admin: EMP-10001)

---

## ⚠️ Important Notes

1. **Run ONLY ONCE** - The schema is idempotent (safe to run multiple times)
2. **Backup First** - If you have existing data, backup first
3. **Check Permissions** - Make sure you're using the service role in Supabase
4. **Reload Schema** - The script includes `notify pgrst, 'reload schema';`

---

## 🆘 Troubleshooting

### "Permission denied"
- Make sure you're in the SQL Editor (not the Table Editor)
- Use the service role connection

### "Already exists" errors
- Safe to ignore - means tables already exist
- Script uses `IF NOT EXISTS` everywhere

### Still getting errors after running?
1. Check Supabase logs in dashboard
2. Verify all tables exist
3. Check RLS policies are enabled
4. Restart backend server

---

## 📞 Next Steps

After database is set up:

1. ✅ Sign up with code: **EMP-10001**
2. ✅ Login as admin
3. ✅ Test all admin features
4. ✅ Create more employees
5. ✅ Assign roles to users

---

**You're ready to go!** 🚀
