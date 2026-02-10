# Supabase Database Setup Instructions

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/zlbybzbgxsafvrmuunbu
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"**

## Step 2: Run the Schema SQL

1. Open the file: `supabase_schema.sql` (located in your POLICY_TRACKER folder)
2. Copy ALL the SQL content
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)

**Wait for it to complete** - it will create:
- ✅ 3 tables (policies, applications, payments)
- ✅ Row Level Security policies
- ✅ Indexes for performance
- ✅ 10 real Indian government schemes

## Step 3: Verify Data

1. Click on **"Table Editor"** in the left sidebar
2. Select **"policies"** table
3. You should see 10 policies:
   - PM-KISAN
   - Ayushman Bharat
   - PMAY
   - MUDRA Loan
   - Beti Bachao Beti Padhao
   - National Pension Scheme
   - PMKVY (Skill India)
   - MGNREGA
   - Ujjwala Yojana
   - PM Jeevan Jyoti Bima Yojana

## Step 4: Enable Email Auth (Optional but Recommended)

1. Go to **"Authentication"** → **"Providers"**
2. Make sure **"Email"** is enabled
3. Toggle **"Enable email confirmations"** to OFF (for testing)
4. Click **"Save"**

## Done! ✅

Your database is now set up with real policy data!

Next, I'll update your frontend to use Supabase instead of the old backend.
