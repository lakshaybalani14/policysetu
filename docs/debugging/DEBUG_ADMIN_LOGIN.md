# 🔍 Admin Login Debug - SQL Verification Queries

Run these queries in Supabase SQL Editor to debug the issue:

## Query 1: Check if admin record exists
```sql
SELECT * FROM admins WHERE email = 'kapoorsoumil@gmail.com';
```

**Expected:** Should show Soumil Kapoor's admin record with `is_active = true`

---

## Query 2: Get the user_id from auth.users
```sql
SELECT id, email FROM auth.users WHERE email = 'kapoorsoumil@gmail.com';
```

**Copy the `id` (UUID) from the result!**

---

## Query 3: Check if user_id matches in admins table
```sql
-- Replace YOUR_USER_ID with the UUID from Query 2
SELECT * FROM admins WHERE user_id = 'YOUR_USER_ID';
```

**Expected:** Should show the admin record

---

## Query 4: Test the is_admin function
```sql
-- Replace YOUR_USER_ID with the UUID from Query 2
SELECT is_admin('YOUR_USER_ID');
```

**Expected:** Should return `true`

---

## Query 5: Check for duplicate users
```sql
SELECT id, email, created_at FROM auth.users WHERE email = 'kapoorsoumil@gmail.com';
```

**Expected:** Should show only ONE user

---

## Common Issues & Fixes

### Issue 1: user_id mismatch
**Problem:** The user_id in admins table doesn't match the actual user in auth.users

**Fix:**
```sql
-- First, get the correct user_id
SELECT id FROM auth.users WHERE email = 'kapoorsoumil@gmail.com';

-- Then update the admins table (replace CORRECT_USER_ID)
UPDATE admins 
SET user_id = 'CORRECT_USER_ID'
WHERE email = 'kapoorsoumil@gmail.com';
```

---

### Issue 2: Multiple admin records
**Problem:** Duplicate admin records causing conflicts

**Fix:**
```sql
-- Check for duplicates
SELECT * FROM admins WHERE email = 'kapoorsoumil@gmail.com';

-- If duplicates exist, keep only the active one
DELETE FROM admins 
WHERE email = 'kapoorsoumil@gmail.com' 
AND id NOT IN (
    SELECT id FROM admins 
    WHERE email = 'kapoorsoumil@gmail.com' 
    ORDER BY created_at DESC 
    LIMIT 1
);
```

---

### Issue 3: RLS Policy blocking the query
**Problem:** Row Level Security preventing the query

**Fix:**
```sql
-- Temporarily disable RLS to test
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Try login again
-- If it works, the issue is RLS

-- Re-enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Fix the policy
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
CREATE POLICY "Anyone can check admin status"
    ON admins FOR SELECT
    USING (true);
```

---

## After running these queries, tell me:
1. What does Query 1 return?
2. What does Query 2 return (the user_id)?
3. What does Query 4 return (true or false)?
