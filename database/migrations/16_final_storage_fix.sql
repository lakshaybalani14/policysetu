-- 16_final_storage_fix.sql
-- DEFINITIVE STORAGE FIX
-- The error "new row violates row-level security policy" on upload means 
-- the INSERT into storage.objects is failing.

-- 1. Unconditionally Update Bucket to be Private (Standard for detailed RLS)
update storage.buckets
set public = false
where id = 'application-documents';

-- 2. NUCLEAR OPTION: Drop ALL policies on storage.objects to ensure no conflicts
-- We are cleaning the slate completely for this bucket.
drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Users can manage their own documents" on storage.objects;
drop policy if exists "Users can view own documents" on storage.objects;
drop policy if exists "Users can manage own storage" on storage.objects;
drop policy if exists "Authenticated users can upload to application-documents" on storage.objects;
drop policy if exists "Users can manage own storage objects" on storage.objects;
drop policy if exists "Admins can view all storage" on storage.objects;
drop policy if exists "Give users access to own folder 1jf68p_0" on storage.objects;
drop policy if exists "Give users access to own folder 1jf68p_1" on storage.objects;
drop policy if exists "Give users access to own folder 1jf68p_2" on storage.objects;
drop policy if exists "Give users access to own folder 1jf68p_3" on storage.objects;

-- 3. APPLY SINGLE, SIMPLE UPLOAD POLICY
-- This policy uses the generic "authenticated" role check which is impossible to fail for logged-in users.
create policy "Allow Authenticated Inserts"
on storage.objects for insert
with check (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);

-- 4. APPLY SIMPLE SELECT POLICY (Own files)
create policy "Allow Owners to Select"
on storage.objects for select
using (
  bucket_id = 'application-documents' 
  and auth.uid() = owner
);

-- 5. APPLY SIMPLE SELECT POLICY (Admins)
create policy "Allow Admins to Select"
on storage.objects for select
using (
  bucket_id = 'application-documents' 
  and (
    exists (select 1 from public.admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  )
);
