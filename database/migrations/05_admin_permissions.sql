-- 1. Setup Admins Table (if not already present)
create table if not exists admins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  created_at timestamp with time zone default now()
);

alter table admins enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Admins can view admins table" on admins;
drop policy if exists "Admins can view all applications" on applications;
drop policy if exists "Admins can update all applications" on applications;
drop policy if exists "Admins can view all profiles" on profiles;

-- Re-create Policies

create policy "Admins can view admins table"
  on admins for select
  using ( auth.uid() = user_id );

-- 2. Update Applications RLS for Admins
-- Allow admins to see ALL applications
create policy "Admins can view all applications"
  on applications for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

-- Allow admins to update ALL applications (for Approve/Decline)
create policy "Admins can update all applications"
  on applications for update
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

-- 3. Update Profiles RLS for Admins (to see applicant names)
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

-- 4. Temporary: Insert current user as admin (for development)
-- You (User) should run this manually with your specific User ID if needed, 
-- or rely on the `raw_user_meta_data->>'role'` check if your auth setup handles it.
-- insert into admins (user_id) values ('YOUR_USER_ID_HERE') on conflict do nothing;
