# 🔍 Admin Setup Verification & Quick Fix

## Current Issue
You're getting "Access Denied: Not an admin account" because the admin record doesn't exist in the database yet.

---

## Quick Verification Steps

### Step 1: Check if admins table exists

Run this in Supabase SQL Editor:
```sql
SELECT * FROM admins;
```

**Expected Results:**
- ✅ If table exists but empty: Go to Step 2
- ❌ If error "relation admins does not exist": Run the full SQL from `admin_system.sql` first

---

### Step 2: Check if your user exists in Auth

1. Go to Supabase Dashboard → Authentication → Users
2. Look for: **kapoorsoumil@gmail.com**

**If user exists:**
- ✅ Copy the user's UUID
- Go to Step 3

**If user DOESN'T exist:**
- Click "Add User"
- Email: `kapoorsoumil@gmail.com`
- Password: `dimagmatkha`
- ✅ Check "Auto Confirm User"
- Click "Create User"
- Copy the UUID
- Go to Step 3

---

### Step 3: Insert admin record

Run this SQL (replace `YOUR_USER_ID` with the UUID you copied):

```sql
INSERT INTO admins (user_id, email, full_name, role, is_active)
VALUES (
    'YOUR_USER_ID',              -- Paste UUID here
    'kapoorsoumil@gmail.com',
    'Soumil Kapoor',
    'admin',
    true
);
```

---

### Step 4: Verify admin record

Run this:
```sql
SELECT * FROM admins WHERE email = 'kapoorsoumil@gmail.com';
```

Should show:
- ✅ email: kapoorsoumil@gmail.com
- ✅ full_name: Soumil Kapoor
- ✅ is_active: true

---

### Step 5: Test Login

1. Go to: http://localhost:5173/login
2. Click "Admin Login" tab
3. Enter:
   - Email: `kapoorsoumil@gmail.com`
   - Password: `dimagmatkha`
4. Click "Login"
5. Should work! 🎉

---

## Quick Troubleshooting

### Error: "relation admins does not exist"
**Fix:** Run the complete SQL from `admin_system.sql` in Supabase SQL Editor

### Error: "Access Denied: Not an admin account"
**Fix:** Make sure you completed Step 3 (insert admin record)

### Error: "Invalid login credentials"
**Fix:** Password might be wrong. Reset it in Supabase Dashboard → Authentication → Users → Click user → Reset Password

### Still not working?
Run this to check if admin check is working:
```sql
SELECT is_admin((SELECT id FROM auth.users WHERE email = 'kapoorsoumil@gmail.com'));
```
Should return: `true`

---

## All-in-One Setup Script

If you want to do everything at once, here's the complete script:

```sql
-- 1. Create admins table (if not exists)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (if not exist)
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
CREATE POLICY "Admins can view all admins"
    ON admins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- 4. Helper function
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE user_id = check_user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Insert your admin (REPLACE 'YOUR_USER_ID' with actual UUID!)
-- First create user in Auth UI, then run this:
/*
INSERT INTO admins (user_id, email, full_name, role, is_active)
VALUES (
    'YOUR_USER_ID',
    'kapoorsoumil@gmail.com',
    'Soumil Kapoor',
    'admin',
    true
)
ON CONFLICT (user_id) DO NOTHING;
*/
```

---

**Start with Step 1 to verify where you are in the setup process!**
