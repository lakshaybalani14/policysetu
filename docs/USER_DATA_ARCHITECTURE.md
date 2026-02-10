# 📊 User Data Management - Database Architecture

## Overview

Your application uses **Supabase** which provides both authentication and database storage. User data is split across multiple tables for security and organization.

---

## Database Structure

### 1. `auth.users` (Supabase Auth - Built-in)

**Purpose:** Handles authentication (login/password)

**What's Stored:**
- `id` (UUID) - Unique user identifier
- `email` - User's email address
- `encrypted_password` - Hashed password (secure)
- `created_at` - Registration timestamp
- `raw_user_meta_data` - Additional user info (JSON)
  - `name` - Full name
  - `phone` - Phone number
  - `role` - 'user' or 'admin'

**Example:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "testuser@example.com",
  "raw_user_meta_data": {
    "name": "Test User",
    "phone": "9876543210",
    "role": "user"
  }
}
```

**Security:**
- ✅ Passwords are hashed (not stored in plain text)
- ✅ Managed by Supabase Auth
- ✅ Cannot be directly queried from frontend

---

### 2. `admins` (Custom Table)

**Purpose:** Track which users are admins

**Schema:**
```sql
CREATE TABLE admins (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),  -- Links to auth.users
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    last_login TIMESTAMP
);
```

**Example Data:**
```
user_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
email: kapoorsoumil@gmail.com
full_name: Soumil Kapoor
is_active: true
```

**How It Works:**
- When user logs in, system checks if their `user_id` exists in `admins` table
- If yes → Admin access
- If no → Regular user access

---

### 3. `applications` (Custom Table)

**Purpose:** Store policy applications submitted by users

**Schema:**
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),  -- Links to auth.users
    policy_id UUID REFERENCES policies(id),
    
    -- Personal Info
    full_name TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    
    -- Address
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    
    -- Financial
    occupation TEXT,
    annual_income NUMERIC,
    category TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    
    -- Status
    status TEXT DEFAULT 'submitted',
    submitted_at TIMESTAMP,
    last_updated TIMESTAMP
);
```

**Example Data:**
```
user_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
policy_name: PM Kisan Samman Nidhi
full_name: Test User
email: testuser@example.com
status: submitted
```

**How It Works:**
- When user applies for policy, all form data is saved here
- `user_id` links application to the user who submitted it
- Users can only see their own applications (RLS policy)
- Admins can see ALL applications

---

### 4. `policies` (Custom Table)

**Purpose:** Store available government policies

**Schema:**
```sql
CREATE TABLE policies (
    id UUID PRIMARY KEY,
    name TEXT,
    description TEXT,
    detailed_description TEXT,
    sector TEXT,
    department TEXT,
    benefit_amount NUMERIC,
    benefit_type TEXT,
    status TEXT DEFAULT 'active',
    eligibility JSONB,
    documents JSONB,
    created_at TIMESTAMP
);
```

**Access:**
- ✅ Everyone can view (public read)
- ❌ Only admins can create/edit

---

### 5. `payments` (Custom Table)

**Purpose:** Track benefit disbursements

**Schema:**
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    application_id UUID REFERENCES applications(id),
    user_id UUID REFERENCES auth.users(id),
    amount NUMERIC,
    status TEXT DEFAULT 'pending',
    payment_date DATE,
    transaction_id TEXT,
    created_at TIMESTAMP
);
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │   auth.users     │  ← Supabase Auth
                    │  - id            │
                    │  - email         │
                    │  - password      │
                    │  - metadata      │
                    └──────────────────┘
                              ↓
                    Is user an admin?
                              ↓
                    ┌──────────────────┐
                    │   admins table   │  ← Check here
                    │  - user_id       │
                    │  - is_active     │
                    └──────────────────┘
                              ↓
                    User logs in successfully
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   USER APPLIES FOR POLICY                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  applications    │  ← Application data
                    │  - user_id       │     stored here
                    │  - policy_id     │
                    │  - form data     │
                    │  - status        │
                    └──────────────────┘
                              ↓
                    Admin reviews application
                              ↓
                    Status updated (approved/rejected)
                              ↓
                    ┌──────────────────┐
                    │   payments       │  ← If approved
                    │  - application_id│
                    │  - amount        │
                    │  - status        │
                    └──────────────────┘
```

---

## Row Level Security (RLS)

**What is RLS?**
Database-level security that controls who can see/edit what data.

### Applications Table RLS:

**Policy 1: Users can view own applications**
```sql
CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);
```
- Users can only see applications where `user_id` matches their ID

**Policy 2: Users can insert own applications**
```sql
CREATE POLICY "Users can insert own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```
- Users can only create applications with their own `user_id`

**Policy 3: Admins can view all applications**
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
- Admins can see ALL applications from ALL users

---

## Data Privacy & Security

### ✅ What's Secure:

1. **Passwords:** Never stored in plain text, always hashed
2. **User Isolation:** Users can only see their own data (RLS)
3. **Admin Verification:** Admin status checked from database, not client
4. **API Keys:** Supabase keys are environment-specific

### ⚠️ What's Stored:

**In `auth.users` metadata:**
- Name, phone, role (basic info)

**In `applications` table:**
- Full application details (name, address, bank details, etc.)
- This is necessary for policy processing

**Not Stored:**
- Credit card numbers
- Sensitive documents (only file names/URLs)

---

## Example Queries

### Get User's Applications:
```sql
SELECT * FROM applications 
WHERE user_id = auth.uid()
ORDER BY submitted_at DESC;
```

### Get All Applications (Admin Only):
```sql
SELECT a.*, u.email as user_email
FROM applications a
JOIN auth.users u ON a.user_id = u.id
ORDER BY a.submitted_at DESC;
```

### Check if User is Admin:
```sql
SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid() AND is_active = true
);
```

---

## Summary

**User Data is Managed Across:**
1. `auth.users` → Authentication (email, password, basic info)
2. `admins` → Admin role tracking
3. `applications` → Policy applications
4. `payments` → Benefit disbursements

**Security Features:**
- ✅ RLS ensures users only see their own data
- ✅ Admins have elevated access to all data
- ✅ Passwords are hashed and secure
- ✅ Database-level access control

**Data Flow:**
Register → Login → Apply → Admin Reviews → Status Update → Payment
