# 🔐 Admin Account Setup - Step by Step Guide

## What We're Creating

A proper admin management system with:
- ✅ Dedicated `admins` table in Supabase
- ✅ SQL scripts for admin creation
- ✅ Helper functions to check admin status
- ✅ Updated login to verify against database
- ✅ Ability to add/remove admins later

---

## Step 1: Provide Your Admin Credentials

**Please provide:**

1. **Admin Email:** _________________ (e.g., admin@policytracker.com)
2. **Admin Password:** _________________ (choose a secure password)
3. **Admin Full Name:** _________________ (e.g., "System Administrator")

---

## Step 2: Run SQL Script in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your Policy Tracker project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste SQL**
   - Open file: `admin_system.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor

4. **Run the Script**
   - Click "Run" button
   - Should see: "Success. No rows returned"

---

## Step 3: Create Admin User in Supabase Auth

1. **Go to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Users" tab

2. **Add New User**
   - Click "Add User" button
   - **Email:** (the email you provided above)
   - **Password:** (the password you provided above)
   - **Auto Confirm User:** ✅ Check this box
   - Click "Create User"

3. **Copy User ID**
   - Find the newly created user in the list
   - Click on the user
   - **Copy the UUID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

## Step 4: Insert Admin Record

1. **Go back to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Run This SQL** (replace the placeholders):
```sql
INSERT INTO admins (user_id, email, full_name, role, is_active)
VALUES (
    'PASTE_USER_ID_HERE',           -- The UUID you copied
    'YOUR_ADMIN_EMAIL_HERE',        -- Your admin email
    'YOUR_FULL_NAME_HERE',          -- Your full name
    'admin',
    true
);
```

3. **Click "Run"**
   - Should see: "Success. 1 row affected"

---

## Step 5: Verify Admin Creation

Run this query to verify:
```sql
SELECT * FROM admins;
```

You should see your admin record! ✅

---

## Step 6: Update Frontend (I'll do this)

Once you provide credentials, I'll:
1. Update `Login.jsx` to check admins table
2. Add `adminHelpers` to `supabase.js`
3. Test the admin login

---

## Step 7: Test Admin Login

1. Go to: http://localhost:5173/login
2. Click "Admin Login" tab
3. Enter your admin credentials
4. Should successfully log in! 🎉

---

## Future: Add More Admins

To add more admins later:
1. Create user in Supabase Auth
2. Run INSERT query with their details
3. Done!

To remove admin access:
```sql
UPDATE admins SET is_active = false WHERE email = 'admin@example.com';
```

---

**Ready to proceed! Please provide your admin credentials above.** 👆
