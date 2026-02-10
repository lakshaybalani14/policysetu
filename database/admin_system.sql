-- =====================================================
-- ADMIN MANAGEMENT SYSTEM - SUPABASE SQL
-- =====================================================

-- =====================================================
-- 1. CREATE ADMINS TABLE
-- =====================================================
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

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Policy: Admins can view all admins
CREATE POLICY "Admins can view all admins"
    ON admins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policy: Admins can insert new admins
CREATE POLICY "Admins can create new admins"
    ON admins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policy: Admins can update admin records
CREATE POLICY "Admins can update admins"
    ON admins FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to check if a user is an active admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE user_id = check_user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check admin by email
CREATE OR REPLACE FUNCTION is_admin_by_email(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE email = check_email AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE FIRST ADMIN (MANUAL STEP)
-- =====================================================
-- IMPORTANT: Run this AFTER creating the user in Supabase Auth UI
-- 
-- Steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter email and password
-- 4. Copy the user's UUID from the users list
-- 5. Replace <USER_ID>, <EMAIL>, and <FULL_NAME> below
-- 6. Run the INSERT statement

/*
INSERT INTO admins (user_id, email, full_name, role, is_active)
VALUES (
    '<USER_ID>',        -- Replace with actual user UUID from auth.users
    '<EMAIL>',          -- Replace with admin email
    '<FULL_NAME>',      -- Replace with admin full name
    'admin',
    true
);
*/

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check if admins table exists and has data
-- SELECT * FROM admins;

-- Check if a specific user is admin
-- SELECT is_admin('<USER_ID>');

-- Check if email is admin
-- SELECT is_admin_by_email('admin@example.com');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Admin management system created successfully!
-- Next steps:
-- 1. Create admin user in Supabase Auth
-- 2. Run the INSERT statement with actual values
-- 3. Update frontend to use admins table for authentication
