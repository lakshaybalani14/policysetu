# 🎯 ADMIN SETUP - PERSONALIZED INSTRUCTIONS FOR SOUMIL KAPOOR

## Your Admin Credentials
- **Email:** kapoorsoumil@gmail.com
- **Password:** dimagmatkha
- **Full Name:** Soumil Kapoor

---

## STEP 1: Create Admins Table in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your Policy Tracker project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Run This SQL:**

```sql
-- =====================================================
-- STEP 1: CREATE ADMINS TABLE AND SETUP
-- =====================================================

-- Create admins table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all admins"
    ON admins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can create new admins"
    ON admins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can update admins"
    ON admins FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE user_id = check_user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_by_email(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE email = check_email AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

4. **Click "Run"** - Should see "Success"

---

## STEP 2: Create Your Admin User in Supabase Auth

1. **Go to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Users" tab

2. **Add New User**
   - Click "Add User" button
   - **Email:** `kapoorsoumil@gmail.com`
   - **Password:** `dimagmatkha`
   - **Auto Confirm User:** ✅ **CHECK THIS BOX!**
   - Click "Create User"

3. **Copy Your User ID**
   - Find "kapoorsoumil@gmail.com" in the users list
   - Click on the user
   - **Copy the UUID** (it's a long string like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
   - **KEEP THIS COPIED!** You'll need it in the next step

---

## STEP 3: Insert Your Admin Record

1. **Go back to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Run This SQL** (replace `YOUR_USER_ID_HERE` with the UUID you copied):

```sql
-- =====================================================
-- STEP 2: INSERT SOUMIL KAPOOR AS ADMIN
-- =====================================================

INSERT INTO admins (user_id, email, full_name, role, is_active)
VALUES (
    'YOUR_USER_ID_HERE',           -- PASTE YOUR UUID HERE!
    'kapoorsoumil@gmail.com',
    'Soumil Kapoor',
    'admin',
    true
);
```

3. **Click "Run"** - Should see "Success. 1 row affected"

---

## STEP 4: Verify Admin Creation

Run this to verify:
```sql
SELECT * FROM admins;
```

You should see:
- ✅ Your email: kapoorsoumil@gmail.com
- ✅ Your name: Soumil Kapoor
- ✅ is_active: true

---

## STEP 5: Wait for Frontend Updates

I'll now update the frontend code to:
1. Add admin helper functions
2. Update login to check admins table
3. Test the admin login

**You don't need to do anything for this step - I'll handle it!**

---

## STEP 6: Test Your Admin Login

Once I'm done with frontend updates:

1. Go to: http://localhost:5173/login
2. Click "Admin Login" tab
3. Enter:
   - **Email:** kapoorsoumil@gmail.com
   - **Password:** dimagmatkha
4. Click "Login"
5. Should redirect to Dashboard! 🎉

---

## ⚠️ IMPORTANT NOTES

1. **Password Security:** Your password is stored securely by Supabase Auth (hashed)
2. **Change Password:** You can change it later in Supabase Dashboard
3. **Add More Admins:** Use the same process (Steps 2-3) for new admins

---

**Ready? Start with STEP 1 above!** 👆
