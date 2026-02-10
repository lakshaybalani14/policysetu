# 🔐 Admin Login Fix - Create Admin Account

## The Problem
Admin login shows "invalid" or "Access Denied: Not an admin account" because:
1. You don't have an admin user created in Supabase yet
2. OR the user doesn't have `role: 'admin'` in their metadata

## Solution: Create Admin User in Supabase

### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Users" tab

3. **Create New User**
   - Click "Add User" or "Invite User"
   - Email: `admin@policytracker.com` (or your choice)
   - Password: Create a strong password
   - Click "Create User"

4. **Add Admin Role Metadata**
   - Find the newly created user in the list
   - Click on the user
   - Scroll to "User Metadata" section
   - Click "Edit" or add metadata
   - Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
   - Save changes

### Method 2: Via SQL (Alternative)

Run this SQL in Supabase SQL Editor:

```sql
-- First, create the user via Supabase Auth UI, then update metadata:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'admin@policytracker.com';
```

## Test Admin Login

1. **Go to login page:** http://localhost:5173/login
2. **Switch to "Admin Login"** tab
3. **Enter credentials:**
   - Email: `admin@policytracker.com`
   - Password: (the password you set)
4. **Click Login**
5. **Should redirect to Dashboard** ✅

## Create Regular User (For Testing)

1. Go to Register page: http://localhost:5173/register
2. Fill out the form
3. This creates a regular user (role: 'user')
4. Can apply for policies but can't access admin features

## Admin vs Regular User

| Feature | Admin | Regular User |
|---------|-------|--------------|
| View Policies | ✅ | ✅ |
| Apply for Policies | ✅ | ✅ |
| View Own Applications | ✅ | ✅ |
| Dashboard Stats | ✅ (All stats) | ✅ (Own stats) |
| Manage Applications | ✅ | ❌ |

---

**Quick Test Credentials (After Setup):**
- **Admin:** admin@policytracker.com / YourPassword123
- **User:** Create via Register page
