-- 20_fix_documents_rls.sql
-- Fix permissions for the 'documents' table to allow inserts.

-- 1. Reset RLS on documents table
alter table documents enable row level security;

drop policy if exists "Users can view their own documents." on documents;
drop policy if exists "Users can insert their own documents." on documents;
drop policy if exists "Users can view own documents" on documents;
drop policy if exists "Users can insert own documents" on documents;
drop policy if exists "Enable Insert for Authenticated Users" on documents;
drop policy if exists "Enable Select for Authenticated Users" on documents;

-- 2. Create Broad Policies for Documents
-- Allow any authenticated user to INSERT (we validate specific fields in app if needed, but DB should be open)
create policy "Enable Insert for Authenticated Users"
on documents for insert
with check ( auth.role() = 'authenticated' );

-- Allow users to view their OWN documents
create policy "Enable Select for Own Documents"
on documents for select
using ( auth.uid() = user_id );

-- Allow Admins to View ALL documents (referencing admins table which usually exists)
create policy "Enable Select for Admins"
on documents for select
using ( 
  exists (select 1 from admins where user_id = auth.uid()) 
);

-- 3. Grant Permissions
grant all on documents to authenticated;
-- Grant usage on sequence if valid
grant usage, select on all sequences in schema public to authenticated;

-- 4. ATTEMPT to fix the "permission denied for table users" error
-- If a table specifically named "users" exists in public, grant access to it.
do $$ 
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'users') then
    execute 'grant select, insert, update on table public.users to authenticated';
  end if;
end $$;
