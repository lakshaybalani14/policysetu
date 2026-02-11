-- 14_rescue_permissions.sql
-- EMERGENCY RESCUE SCRIPT
-- This script explicitly restores access to all core tables and simplifies storage permissions

-- 1. Restore Access to POLICIES table (Public Read)
alter table policies enable row level security;
drop policy if exists "Public read access to policies" on policies;
drop policy if exists "Everyone can view policies" on policies;

create policy "Public read access to policies"
on policies for select
using (true);

-- 2. Restore Access to APPLICATIONS table
alter table applications enable row level security;
drop policy if exists "Users can view own applications" on applications;
drop policy if exists "Users can insert own applications" on applications;

create policy "Users can view own applications"
on applications for select
using (auth.uid() = user_id);

create policy "Users can insert own applications"
on applications for insert
with check (auth.uid() = user_id);

-- 3. Restore Access to DOCUMENTS table
alter table documents enable row level security;
drop policy if exists "Users can view own documents" on documents;
drop policy if exists "Users can insert own documents" on documents;

create policy "Users can view own documents"
on documents for select
using (auth.uid() = user_id);

create policy "Users can insert own documents"
on documents for insert
with check (auth.uid() = user_id);

-- 4. SIMPLIFY Storage Permissions to Unblock Uploads
-- We will rely on 'owner' column which Supabase automatically sets
drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Users can manage their own documents" on storage.objects;
drop policy if exists "Users can view own documents" on storage.objects;
drop policy if exists "Users can manage own storage" on storage.objects;

-- Allow ANY authenticated user to upload to the bucket (Simplest working policy)
create policy "Authenticated users can upload to application-documents"
on storage.objects for insert
with check (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);

-- Allow owners to do everything else
create policy "Users can manage own storage objects"
on storage.objects for all
using (
  bucket_id = 'application-documents' 
  and auth.uid() = owner
);

-- 5. Restore Admin Access (Admins verify everything)
-- We use a simpler check to avoid recursion issues
create policy "Admins can view all data applications"
on applications for select
using (
  (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
);

create policy "Admins can view all data documents"
on documents for select
using (
  (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
);

create policy "Admins can view all storage"
on storage.objects for select
using (
  bucket_id = 'application-documents'
  and (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
);
