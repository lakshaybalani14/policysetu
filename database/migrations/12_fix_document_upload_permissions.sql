-- Fix permissions for document uploads

-- 1. Ensure bucket exists and is private
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do update set public = false;

-- 2. Reset Storage Policies for application-documents
-- Drop existing potential conflicting policies
drop policy if exists "Users can upload application documents." on storage.objects;
drop policy if exists "Users can view their own application documents." on storage.objects;
drop policy if exists "Admins can view all documents in storage" on storage.objects;
drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Users can view own documents" on storage.objects;
drop policy if exists "Admins can view all documents" on storage.objects;

-- Allow authenticated users to upload files to application-documents bucket
create policy "Authenticated users can upload documents"
on storage.objects for insert
with check (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);

-- Allow users to view/download their own files
create policy "Users can view own documents"
on storage.objects for select
using (
  bucket_id = 'application-documents' 
  and auth.uid() = owner
);

-- Allow users to update their own files
create policy "Users can update own documents"
on storage.objects for update
using (
  bucket_id = 'application-documents' 
  and auth.uid() = owner
);

-- Allow users to delete their own files
create policy "Users can delete own documents"
on storage.objects for delete
using (
  bucket_id = 'application-documents' 
  and auth.uid() = owner
);

-- Allow admins to view all files
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

-- 3. Reset Documents Table Policies
alter table documents enable row level security;

-- Drop existing policies
drop policy if exists "Users can insert their own documents." on documents;
drop policy if exists "Users can view their own documents." on documents;
drop policy if exists "Admins can view all documents" on documents;
drop policy if exists "Users can insert own documents" on documents;
drop policy if exists "Users can view own documents" on documents;

-- Recreate policies
create policy "Users can insert own documents"
on documents for insert
with check (
  auth.uid() = user_id
);

create policy "Users can view own documents"
on documents for select
using (
  auth.uid() = user_id
);

create policy "Admins can view all documents"
on documents for select
using (
  exists (select 1 from public.admins where user_id = auth.uid())
  or
  (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
);
