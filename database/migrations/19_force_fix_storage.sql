-- 19_force_fix_storage.sql
-- FORCE UPLOADS TO WORK: Nuclear Option
-- This script completely resets and opens up the 'application-documents' bucket.

-- 1. Ensure Bucket is Private and Exists (or Create it)
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do update set public = false;

-- 2. DROP ALL EXISTING POLICIES for this bucket (to purge any conflicts)
drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Users can manage their own documents" on storage.objects;
drop policy if exists "Users can view own documents" on storage.objects;
drop policy if exists "Users can manage own storage" on storage.objects;
drop policy if exists "Authenticated users can upload to application-documents" on storage.objects;
drop policy if exists "Users can manage own storage objects" on storage.objects;
drop policy if exists "Admins can view all storage" on storage.objects;
drop policy if exists "Allow Authenticated Inserts" on storage.objects;
drop policy if exists "Allow Authenticated Updates" on storage.objects;
drop policy if exists "Allow Authenticated Deletes" on storage.objects;
drop policy if exists "Allow Owners to Select" on storage.objects;
drop policy if exists "Allow Admins to Select" on storage.objects;
drop policy if exists "DEBUG_OPEN_ACCESS_YourName" on storage.objects;
drop policy if exists "Allow Authenticated Inserts" on storage.objects;

-- 3. APPLY SINGLE, BROAD "AUTHENTICATED CAN DO ANYTHING" POLICY
-- This allows any logged-in user to Insert, Select, Update, Delete ANY file in this bucket.
-- It's the most permissive setting possible for authenticated users.
create policy "FORCE_OPEN_ACCESS_ALL"
on storage.objects for all
using (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);

-- 4. Enable RLS on objects (it should already be on, but just in case)
alter table storage.objects enable row level security;
