-- EMERGENCY FIX for Admin Access

-- 1. Unblock the 'admins' table
-- We allow ANY authenticated user to read the admins table. 
-- This ensures that the "exists (select 1 from admins...)" check NEVER fails due to permission issues on the admins table itself.
drop policy if exists "Admins can view admins table" on admins;
create policy "Authenticated can view admins" 
  on admins for select 
  to authenticated 
  using (true);

-- 2. Simplify Applications Policy
-- We'll try the most basic check: If you are in the admins table, you see everything.
drop policy if exists "Admins can view all applications" on applications;
create policy "Admins can view all applications"
  on applications for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
  );

-- 3. Simplify Update Policy
drop policy if exists "Admins can update all applications" on applications;
create policy "Admins can update all applications"
  on applications for update
  using (
    exists (select 1 from admins where user_id = auth.uid())
  );

-- 4. ENSURE YOU ARE AN ADMIN
-- This will insert your current user as an admin if not already there.
insert into admins (user_id, email, full_name, is_active)
select auth.uid(), auth.email(), 'System Admin', true
from auth.users
where id = auth.uid()
on conflict (user_id) do nothing;
