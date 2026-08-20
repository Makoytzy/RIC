# Operational Staff Login Instructions

## Problem
The Batch Management and Shipment Registration pages show "Failed to load data" because you need to be logged in as an Operational Staff user.

## Solution: Log In First

### Test Credentials

**Operational Staff Account 1:**
- Email: `sarah.williams@redindiancustoms.com`
- Password: *(You need to set this in Supabase or use the password reset flow)*

**Operational Staff Account 2:**
- Email: `emily.davis@redindiancustoms.com`
- Password: *(You need to set this in Supabase or use the password reset flow)*

### Login Steps

1. **Open the application**: http://localhost:5174
2. **Navigate to Login page** (should be the default page or `/login`)
3. **Enter credentials**:
   - Email: `sarah.williams@redindiancustoms.com`
   - Password: *(your test password)*
4. **Click Sign In**
5. **Navigate to Operational Dashboard** → Batch Management

### Setting Up Test Passwords

If you don't have passwords set up, you have two options:

#### Option 1: Password Reset (Recommended)
1. Go to Supabase Dashboard: https://hbsynkxaadnximuytbor.supabase.co
2. Navigate to **Authentication** → **Users**
3. Find the user (`sarah.williams@redindiancustoms.com`)
4. Click the **"..."** menu → **Send Password Reset Email**
5. Check your email and set a new password

#### Option 2: Set Password Directly (Testing Only)
Run this SQL in your Supabase SQL Editor:

```sql
-- Set password to "Password123!" for testing
-- WARNING: Use a secure password in production!
UPDATE auth.users 
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'sarah.williams@redindiancustoms.com';

UPDATE auth.users 
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'emily.davis@redindiancustoms.com';
```

Then log in with:
- Email: `sarah.williams@redindiancustoms.com`
- Password: `Password123!`

## Current Error Explanation

The error you're seeing:
```
Error: Failed to fetch batches
GET /api/batches 401
```

This `401 Unauthorized` error means:
- ✅ Backend is running correctly on port 4000
- ✅ Frontend is making requests correctly
- ❌ **User is not authenticated** (no valid session token)

Once you log in, the `Authorization: Bearer <token>` header will be automatically added to all API requests.

## Verification Steps

After logging in successfully:

1. **Check AuthContext**: Open browser DevTools → Console
   - You should see: `Auth event: SIGNED_IN` or `Auth event: TOKEN_REFRESHED`
   
2. **Check Network Tab**: Open browser DevTools → Network
   - Filter for `/api/batches`
   - Click on the request
   - Check **Request Headers** → you should see:
     ```
     Authorization: Bearer eyJhbGci...
     ```

3. **Check Response**: 
   - Status should be `200 OK` (not 401)
   - Response should contain batch data

## Next Steps After Login

Once logged in as Operational Staff, you'll be able to:

1. ✅ **View Shipments** (ShipmentRegistration page)
2. ✅ **Create New Shipments** (if suppliers exist)
3. ✅ **View Batches** (BatchManagement page)
4. ✅ **Create New Batches** (linked to received shipments)
5. ✅ **Generate Barcodes** (after batches are created)

## Troubleshooting

### Issue: "Authentication required. Please log in again."
- **Solution**: Your session expired. Log out and log in again.

### Issue: "Access denied. You do not have permission to view batches."
- **Solution**: Your user role is not correctly assigned. Run:
  ```sql
  -- Check user roles
  SELECT u.email, r.name as role
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  LEFT JOIN public.roles r ON r.id = ur.role_id
  WHERE u.email = 'sarah.williams@redindiancustoms.com';
  ```
  
### Issue: Still getting 401 after login
- **Solution**: Check browser console for auth errors
- Clear browser cache and localStorage
- Log out completely and log in again

## Backend Status

✅ Backend is running on: http://localhost:4000
✅ Frontend is running on: http://localhost:5174
✅ Supabase project: https://hbsynkxaadnximuytbor.supabase.co
✅ Test users created: 2 operational staff accounts
✅ API endpoints working (tested with curl)

The only missing piece is **user authentication** (logging in).
