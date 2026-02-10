-- =====================================================
-- FIX ADMIN LOGIN - UPDATE RLS POLICY
-- =====================================================

-- The problem: RLS policy blocks checking admin status during login
-- because auth.uid() is null when user is not logged in yet

-- Solution: Allow SELECT on admins table for everyone
-- (This is safe because we're only exposing admin status, not sensitive data)

-- Step 1: Drop the restrictive policy
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;

-- Step 2: Create a new policy that allows checking admin status
CREATE POLICY "Anyone can check admin status"
    ON admins FOR SELECT
    USING (true);

-- Step 3: Keep the INSERT policy restrictive (only admins can create admins)
DROP POLICY IF EXISTS "Admins can create new admins" ON admins;
CREATE POLICY "Admins can create new admins"
    ON admins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Step 4: Keep the UPDATE policy restrictive (only admins can update)
DROP POLICY IF EXISTS "Admins can update admins" ON admins;
CREATE POLICY "Admins can update admins"
    ON admins FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'admins';

-- Test the admin check (replace with your user_id)
-- SELECT is_admin((SELECT id FROM auth.users WHERE email = 'kapoorsoumil@gmail.com'));

-- =====================================================
-- DONE!
-- =====================================================
-- Now try logging in as admin again
-- It should work! 🎉
