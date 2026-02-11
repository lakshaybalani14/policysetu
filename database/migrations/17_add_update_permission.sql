-- 17_add_update_permission.sql
-- FIXED MISSING PERMISSION FOR UPSERT
-- The application uses 'upsert: true' which requires UPDATE permission, not just INSERT.

-- 1. Grant UPDATE permission to Authenticated Users for this bucket
-- This allows overwriting files (upsert)
create policy "Allow Authenticated Updates"
on storage.objects for update
using (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);

-- 2. Grant DELETE permission (just in case)
create policy "Allow Authenticated Deletes"
on storage.objects for delete
using (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);

-- 3. Ensure INSERT is still allowed (Double check)
drop policy if exists "Allow Authenticated Inserts" on storage.objects;
create policy "Allow Authenticated Inserts"
on storage.objects for insert
with check (
  bucket_id = 'application-documents' 
  and auth.role() = 'authenticated'
);
