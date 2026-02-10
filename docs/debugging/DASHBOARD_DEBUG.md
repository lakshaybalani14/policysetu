# 🔍 Dashboard Not Showing Applications - Debug Guide

## The Issue
Applications are saving to database but not showing in user/admin dashboards.

---

## Step 1: Verify Data in Database

Run this in Supabase SQL Editor:

```sql
-- Check if applications exist
SELECT id, user_id, policy_name, status, submitted_at
FROM applications
ORDER BY submitted_at DESC
LIMIT 10;
```

**Expected:** Should show your submitted applications

---

## Step 2: Check Application Status Values

```sql
-- Check what status values are in the database
SELECT DISTINCT status FROM applications;
```

**Expected:** Should show 'submitted', 'approved', 'rejected', etc.

---

## Step 3: Check RLS Policies

The dashboard might not be able to read applications due to RLS.

```sql
-- Check RLS policies on applications table
SELECT * FROM pg_policies WHERE tablename = 'applications';
```

**Required policies:**
1. "Users can view own applications" - FOR SELECT
2. "Users can insert own applications" - FOR INSERT
3. "Admins can view all applications" - FOR SELECT (admin only)

---

## Step 4: Test Query Manually

```sql
-- Test if you can query your own applications
SELECT * FROM applications
WHERE user_id = auth.uid();
```

If this returns empty but Step 1 shows data, **RLS is blocking the query**.

---

## Fix: Add Missing RLS Policies

If RLS is blocking, run this:

```sql
-- Allow users to view their own applications
CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own applications  
CREATE POLICY "Users can insert own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow admins to view ALL applications
CREATE POLICY "Admins can view all applications"
    ON applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Allow admins to update applications
CREATE POLICY "Admins can update applications"
    ON applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
```

---

## Step 5: Check Browser Console

1. Open browser (http://localhost:5173/dashboard)
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Look for errors (red text)

**Common errors:**
- "Failed to fetch dashboard data" - RLS issue
- "Cannot read property 'length' of undefined" - Data not loading
- Network errors - Supabase connection issue

---

## Step 6: Hard Refresh

Sometimes the browser caches old code:

1. Press `Ctrl + Shift + R` (hard refresh)
2. Or clear browser cache
3. Reload the page

---

## Quick Fix SQL (Run All)

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
DROP POLICY IF EXISTS "Admins can update applications" ON applications;

-- Recreate policies
CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
    ON applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can update applications"
    ON applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
```

---

## After Running SQL:

1. Hard refresh browser (`Ctrl + Shift + R`)
2. Logout and login again
3. Check dashboard

**Should now show:**
- Total applications count
- Pending applications
- Recent applications list

---

**Start with Step 1 to verify data exists, then Step 3 to check RLS!**
