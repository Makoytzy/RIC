# Database Setup Guide

## 🎯 Quick Start

### Option 1: Fresh Installation (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run Production Schema**
   ```sql
   -- Copy and paste the entire content of:
   PRODUCTION_READY_SCHEMA.sql
   ```

3. **Verify Installation**
   - Check that all verification queries at the end return data
   - Confirm 5 roles exist
   - Confirm 15 employees exist

4. **Test Your Admin Account**
   - Code: `EMP-10001`
   - Email: `daisyreydaguplo18@gmail.com`

---

## 📋 What Gets Created

### Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `roles` | System roles | 5 (admin, manager, operational_staff, warehouse_staff, sales_staff) |
| `users` | User profiles | Created on signup |
| `user_roles` | User-Role mapping | Created on signup |
| `employees` | Pre-registered employees | 15 sample employees |
| `audit_logs` | Activity tracking | Created by system |

### Functions

| Function | Purpose |
|----------|---------|
| `has_role(text[])` | Check if user has specific roles |
| `verify_employee_code(text)` | Validate employee code before signup |
| `mark_employee_code_used(text, uuid)` | Mark code as used after signup |
| `handle_new_user()` | Auto-create user profile on signup |
| `sync_email_verification(uuid)` | Sync email verification status |
| `update_last_login()` | Track last login time |
| `set_updated_at()` | Auto-update timestamps |

### Security Features

✅ **Row Level Security (RLS)** enabled on all tables  
✅ **Role-based access control** for all operations  
✅ **Admin-only** employee management  
✅ **Secure** employee code verification  
✅ **Audit trail** for compliance  

---

## 👥 Pre-registered Employees

### Your Admin Account
- **Code:** EMP-10001
- **Name:** Daisy Rey Daguplo
- **Email:** daisyreydaguplo18@gmail.com
- **Role:** admin
- **Department:** Management

### Managers (2)
- **EMP-20001** - Maria Santos (Operations)
- **EMP-20002** - John Chen (Logistics)

### Operational Staff (3)
- **EMP-30001** - Sarah Williams (Operations)
- **EMP-30002** - Robert Johnson (Operations)
- **EMP-30003** - Emily Davis (Inventory)

### Warehouse Staff (5)
- **EMP-40001** - Michael Brown (Warehouse)
- **EMP-40002** - Jennifer Garcia (Warehouse)
- **EMP-40003** - David Martinez (Warehouse)
- **EMP-40004** - Lisa Anderson (Receiving)
- **EMP-40005** - James Wilson (Picking)

### Sales Staff (4)
- **EMP-50001** - Patricia Taylor (Sales)
- **EMP-50002** - Christopher Lee (Sales)
- **EMP-50003** - Linda White (Customer Service)
- **EMP-50004** - Daniel Harris (Sales)

---

## 🔍 Useful Queries

### Check All Employees
```sql
select employee_code, full_name, email, employee_position, is_used
from public.employees
order by employee_code;
```

### Check Unused Codes
```sql
select employee_code, full_name, email, employee_position
from public.employees
where is_used = false
order by employee_code;
```

### Check Users and Their Roles
```sql
select
    u.full_name,
    u.email,
    u.position,
    u.is_active,
    array_agg(r.name) as roles
from public.users u
left join public.user_roles ur on ur.user_id = u.id
left join public.roles r on r.id = ur.role_id
group by u.id, u.full_name, u.email, u.position, u.is_active
order by u.created_at desc;
```

### Check Employee Registration Status
```sql
select * from public.employee_registration_status;
```

### Verify Employee Code
```sql
select * from public.verify_employee_code('EMP-10001');
```

---

## ➕ Adding New Employees

```sql
insert into public.employees (
    employee_code,
    full_name,
    email,
    employee_position,
    department,
    metadata
)
values (
    'EMP-60001',
    'John Doe',
    'john.doe@redindiancustoms.com',
    'warehouse_staff',
    'Warehouse',
    '{"hire_date": "2026-08-13", "employee_type": "full_time"}'::jsonb
);
```

---

## 🔧 Troubleshooting

### Issue: "Table already exists"
**Solution:** The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: "Employee code not found"
**Solution:** Check if the code exists:
```sql
select * from public.employees where employee_code = 'YOUR-CODE';
```

### Issue: "Role not assigned"
**Solution:** Check user roles:
```sql
select u.email, r.name
from public.users u
join public.user_roles ur on ur.user_id = u.id
join public.roles r on r.id = ur.role_id
where u.email = 'YOUR-EMAIL';
```

### Issue: "Permission denied"
**Solution:** Make sure you're using the Supabase SQL Editor with service role permissions.

---

## 📊 Schema Diagram

```
auth.users (Supabase Auth)
    ↓
    ↓ (on_auth_user_created trigger)
    ↓
public.users ←──────────┐
    ↓                   │
    ↓                   │
public.user_roles       │
    ↓                   │
    ↓                   │
public.roles            │
                        │
public.employees ───────┘
    (employee_code verification)
```

---

## ✅ Verification Checklist

After running the production schema, verify:

- [ ] 5 roles exist in `public.roles`
- [ ] 15 employees exist in `public.employees`
- [ ] All employees have `is_used = false`
- [ ] Your admin code (EMP-10001) is available
- [ ] Functions are created (check with `\df public.*` in psql or SQL Editor)
- [ ] RLS is enabled on all tables
- [ ] Policies exist for each table

---

## 🚀 Production Deployment Checklist

Before going to production:

- [ ] Run `PRODUCTION_READY_SCHEMA.sql` in Supabase
- [ ] Test admin signup with EMP-10001
- [ ] Test regular employee signup with another code
- [ ] Verify roles are assigned correctly
- [ ] Test admin dashboard features
- [ ] Test role-based access control
- [ ] Configure backups in Supabase
- [ ] Set up monitoring and alerts
- [ ] Document your custom employees
- [ ] Train staff on employee code usage

---

## 📝 Notes

- **Passwords are NEVER stored in `public.users`** - Supabase Auth handles all password management
- **Employee codes are one-time use** - Once used, they cannot be reused
- **RLS policies** ensure users can only see their own data (except admins/managers)
- **Audit logs** track all important actions for compliance
- **The schema is idempotent** - Safe to run multiple times

---

## 🆘 Support

If you encounter issues:

1. Check the verification queries at the end of PRODUCTION_READY_SCHEMA.sql
2. Review the Supabase logs in the dashboard
3. Check browser console for frontend errors
4. Verify environment variables in `.env` files
5. Ensure backend server is running on correct port

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

---

**Ready to use!** 🎉

Your database is now fully configured and production-ready.
