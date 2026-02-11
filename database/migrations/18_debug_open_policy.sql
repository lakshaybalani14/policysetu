-- 18_debug_open_policy.sql
-- DEBUGGING: OPEN ACCESS POLICY
-- This script applies a broad "ALLOW ALL" policy for authenticated users to the application-documents bucket.
-- Use this to confirm if the issue is strictly policy-related.

-- 1. Ensure Bucket Exists
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

-- 2. Clean Slate: Drop ALL existing policies on storage.objects
-- We list every policy name we've used so far to be sure
drop policy if exists "Allow Authenticated Inserts" on storage.objects;
drop policy if exists "Allow Authenticated Updates" on storage.objects;
drop policy if exists "Allow Authenticated Deletes" on storage.objects;
drop policy if exists "Allow Owners to Select" on storage.objects;
drop policy if exists "Allow Admins to Select" on storage.objects;
drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Users can manage their own documents" on storage.objects;
drop policy if exists "Users can view own documents" on storage.objects;
drop policy if exists "Users can manage own storage" on storage.objects;
drop policy if exists "Authenticated users can upload to application-documents" on storage.objects;
drop policy if exists "Users can manage own storage objects" on storage.objects;
drop policy if exists "Admins can view all storage" on storage.objects;
drop policy if exists "Give users access to own folder 1jf68p_0" on storage.objects;

-- 3. APPLY "OPEN" DEBUG POLICY
-- This allows ANY authenticated user to perform ANY action (Insert, Select, Update, Delete)
-- on ANY file within the 'application-documents' bucket.
create policy "DEBUG_OPEN_ACCESS_YourName"
on storage.objects for all
using (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);

-- 4. Verify Policy Creation
select * from pg_policies where tablename = 'objects';
