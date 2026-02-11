-- 13_refine_upload_policies.sql
-- Refine Storage Policies using folder paths matching User ID
-- This is more robust for uploads/upserts than relying on the 'owner' column assignment

-- 1. Clean up previous policies for application-documents
drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Users can view own documents" on storage.objects;
drop policy if exists "Users can update own documents" on storage.objects;
drop policy if exists "Users can delete own documents" on storage.objects;
drop policy if exists "Users can perform all actions on own folder" on storage.objects;
drop policy if exists "Users can manage their own documents" on storage.objects;

-- 2. Create a comprehensive policy for users to manage their own folder
-- This allows SELECT, INSERT, UPDATE, DELETE if the file path starts with their User ID
create policy "Users can manage their own documents"
on storage.objects
for all
using (
  bucket_id = 'application-documents' 
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'application-documents' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Ensure Admins can still view everything
drop policy if exists "Admins can view all documents" on storage.objects;

create policy "Admins can view all documents"
on storage.objects for select
using (
  bucket_id = 'application-documents' 
  and (
    exists (select 1 from public.admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  )
);
