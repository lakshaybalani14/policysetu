-- Fix Admin RLS to be more robust using auth.jwt()

-- Drop potentially conflicting policies
drop policy if exists "Admins can view all applications" on applications;
drop policy if exists "Admins can update all applications" on applications;
drop policy if exists "Admins can view all profiles" on profiles;

-- Applications policies
create policy "Admins can view all applications"
  on applications for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can update all applications"
  on applications for update
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Profiles policies
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
