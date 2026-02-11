-- Add admin access policies for documents and storage

-- 1. Documents Table - Admin Access
drop policy if exists "Admins can view all documents" on documents;
drop policy if exists "Admins can view all documents in storage" on storage.objects;

-- Allow admins to view all documents metadata
create policy "Admins can view all documents"
  on documents for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

-- 2. Storage Objects - Admin Access for application-documents bucket
-- Allow admins to view all application documents
create policy "Admins can view all documents in storage"
  on storage.objects for select
  using (
    bucket_id = 'application-documents' and (
      exists (select 1 from admins where user_id = auth.uid())
      or
      (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
    )
  );
