# 🧪 User System Verification & Testing Guide

## Good News! ✅
Your system is already set up! Here's what exists:

- ✅ Database tables (policies, applications, payments)
- ✅ Admin system working
- ✅ User registration (`Register.jsx`)
- ✅ User login (`Login.jsx`)
- ✅ Application form (`ApplicationForm.jsx`)
- ✅ Dashboards (user & admin)

---

## Step 1: Verify Database Tables

Run this in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- `admins`
- `applications`
- `payments`
- `policies`

---

## Step 2: Verify RLS Policies

```sql
-- Check RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('applications', 'policies', 'payments', 'admins')
ORDER BY tablename, policyname;
```

**Expected policies:**
- policies: "Anyone can view policies"
- applications: "Users can view own applications", "Users can insert own applications"
- admins: "Anyone can check admin status"

---

## Step 3: Test User Registration

### Manual Test:
1. Go to: http://localhost:5173/register
2. Fill in the form:
   - Full Name: `Test User`
   - Email: `testuser@example.com`
   - Phone: `9876543210`
   - Password: `test123`
   - Confirm Password: `test123`
3. Click "Register"
4. Should redirect to dashboard

### Verify in Supabase:
```sql
-- Check if user was created
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users 
WHERE email = 'testuser@example.com';
```

**Expected:** User exists with metadata containing name, phone, role='user'

---

## Step 4: Test User Login

### Manual Test:
1. Go to: http://localhost:5173/login
2. Click "Citizen Login" tab (NOT Admin)
3. Enter:
   - Email: `testuser@example.com`
   - Password: `test123`
4. Click "Login"
5. Should redirect to `/dashboard`

### Verify:
- Check browser localStorage has user object
- User role should be 'user' (not 'admin')

---

## Step 5: Test Policy Application

### Manual Test:
1. Login as test user
2. Go to: http://localhost:5173/policies
3. Click "View Details" on any policy
4. Click "Apply Now"
5. Fill in the application form
6. Click "Submit Application"

### Verify in Supabase:
```sql
-- Check if application was created
SELECT id, user_id, policy_name, full_name, status, submitted_at
FROM applications
WHERE email = 'testuser@example.com'
ORDER BY submitted_at DESC
LIMIT 5;
```

**Expected:** Application exists with status='submitted'

---

## Step 6: Test User Dashboard

### Manual Test:
1. Login as test user
2. Go to: http://localhost:5173/dashboard
3. Should see:
   - Total applications count
   - Pending applications
   - Status breakdown
   - Recent applications list

### Verify Data:
```sql
-- Get user's application stats
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
FROM applications
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testuser@example.com');
```

---

## Step 7: Test My Applications Page

### Manual Test:
1. Login as test user
2. Go to: http://localhost:5173/my-applications
3. Should see list of all applications
4. Each showing: policy name, status, date

---

## Step 8: Test Admin Dashboard

### Manual Test:
1. Login as admin (kapoorsoumil@gmail.com)
2. Go to admin dashboard
3. Should see:
   - ALL applications (from all users)
   - Total stats across all users
   - Ability to filter/search
   - Ability to update status

### Verify Data:
```sql
-- Get all applications (admin view)
SELECT 
    a.id,
    a.full_name,
    a.email,
    a.policy_name,
    a.status,
    a.submitted_at,
    u.email as user_email
FROM applications a
JOIN auth.users u ON a.user_id = u.id
ORDER BY a.submitted_at DESC
LIMIT 10;
```

---

## Step 9: Test Status Update (Admin)

### Manual Test:
1. Login as admin
2. Find an application
3. Update status to "under_review" or "approved"
4. Save changes

### Verify:
```sql
-- Check status was updated
SELECT id, policy_name, status, last_updated
FROM applications
WHERE email = 'testuser@example.com';
```

### Test User Sees Update:
1. Logout admin
2. Login as test user
3. Go to My Applications
4. Should see updated status

---

## Step 10: End-to-End Test

### Complete User Journey:
1. ✅ Register new user
2. ✅ Login as user
3. ✅ Browse policies
4. ✅ Apply for policy
5. ✅ View in My Applications (status: submitted)
6. ✅ Logout

### Complete Admin Journey:
1. ✅ Login as admin
2. ✅ See new application in dashboard
3. ✅ Update status to "approved"
4. ✅ Logout

### Verify User Sees Update:
1. ✅ Login as user again
2. ✅ Check My Applications
3. ✅ Status should be "approved"

---

## Common Issues & Fixes

### Issue: User can't see own applications
**Fix:** Check RLS policy
```sql
CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);
```

### Issue: User can't submit application
**Fix:** Check RLS policy
```sql
CREATE POLICY "Users can insert own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

### Issue: Admin can't see all applications
**Fix:** Add admin policy
```sql
CREATE POLICY "Admins can view all applications"
    ON applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
```

---

## Quick Test Commands

### Create Test User via SQL:
```sql
-- This creates a user in auth (you'll need to use Supabase Dashboard for this)
-- Go to Authentication → Users → Add User
-- Email: testuser@example.com
-- Password: test123
-- Auto Confirm: ✅
```

### Create Test Application:
```sql
INSERT INTO applications (
    user_id, policy_id, policy_name, full_name, email, phone,
    date_of_birth, gender, address, city, state, pincode,
    occupation, annual_income, category, bank_name, account_number, ifsc_code,
    status
)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'testuser@example.com'),
    (SELECT id FROM policies LIMIT 1),
    'Test Policy',
    'Test User',
    'testuser@example.com',
    '9876543210',
    '1990-01-01',
    'Male',
    '123 Test Street',
    'Mumbai',
    'Maharashtra',
    '400001',
    'Software Engineer',
    500000,
    'General',
    'Test Bank',
    '1234567890',
    'TEST0001234',
    'submitted'
);
```

---

**Start with Step 3 (Test User Registration) and work through each step!**
