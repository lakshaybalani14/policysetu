-- 15_focused_document_fix.sql
-- FOCUSED FIX FOR DOCUMENTS ONLY
-- This script ONLY changes permissions for 'documents' table and 'storage.objects'
-- It DOES NOT touch 'policies' or 'applications' tables.

-- 1. Reset DOCUMENTS Table Permissions
alter table documents enable row level security;

-- Drop existing policies for documents to start fresh
drop policy if exists "Users can insert their own documents." on documents;
drop policy if exists "Users can view their own documents." on documents;
drop policy if exists "Admins can view all documents" on documents;
drop policy if exists "Users can insert own documents" on documents;
drop policy if exists "Users can view own documents" on documents;

-- Re-create simplified policies for documents
create policy "Users can insert own documents"
on documents for insert
with check (auth.uid() = user_id);

create policy "Users can view own documents"
on documents for select
using (auth.uid() = user_id);

create policy "Admins can view all documents"
on documents for select
using (
  exists (select 1 from public.admins where user_id = auth.uid())
  or
  (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
);

-- 2. Reset STORAGE Permissions (Targeted to application-documents bucket)
-- Drop existing policies for storage
drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Users can manage their own documents" on storage.objects;
drop policy if exists "Users can view own documents" on storage.objects;
drop policy if exists "Users can manage own storage" on storage.objects;
drop policy if exists "Authenticated users can upload to application-documents" on storage.objects;
drop policy if exists "Users can manage own storage objects" on storage.objects;
drop policy if exists "Admins can view all storage" on storage.objects;

-- Allow ANY authenticated user to upload to the bucket
create policy "Authenticated users can upload to application-documents"
on storage.objects for insert
with check (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);

-- Allow owners to manage their own files (View/Update/Delete)
create policy "Users can manage own storage objects"
on storage.objects for all
using (
  bucket_id = 'application-documents' 
  and auth.uid() = owner
);

-- Allow admins to view all files
create policy "Admins can view all storage"
on storage.objects for select
using (
  bucket_id = 'application-documents'
  and (
    exists (select 1 from public.admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  )
);
