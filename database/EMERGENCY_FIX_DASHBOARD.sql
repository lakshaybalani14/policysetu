-- =====================================================
-- EMERGENCY FIX: Dashboard Not Working After RLS Update
-- =====================================================

-- This will temporarily disable RLS to get dashboard working again
-- Then we'll add back the correct policies

-- Step 1: Disable RLS temporarily
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
DROP POLICY IF EXISTS "Admins can update applications" ON applications;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON applications;

-- Step 3: Re-enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, working policies
-- Policy 1: Users can view their own applications
CREATE POLICY "users_select_own"
    ON applications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own applications
CREATE POLICY "users_insert_own"
    ON applications
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Admins can view ALL applications
CREATE POLICY "admins_select_all"
    ON applications
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Policy 4: Admins can update any application
CREATE POLICY "admins_update_all"
    ON applications
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'applications';

-- Test query (should return your applications)
SELECT id, policy_name, status, submitted_at
FROM applications
ORDER BY submitted_at DESC
LIMIT 5;

-- =====================================================
-- DONE!
-- =====================================================
-- Now:
-- 1. Hard refresh browser (Ctrl + Shift + R)
-- 2. Logout and login again
-- 3. Dashboard should work!
