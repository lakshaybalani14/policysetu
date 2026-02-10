-- Debug and Fix Missing Profiles (Final Version)

-- 1. Insert missing profiles for users who exist in auth.users
insert into public.profiles (id, full_name)
select 
  id, 
  coalesce(
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'name', 
    'User ' || substr(id::text, 1, 4)
  ) as full_name
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- 2. Update existing profiles that have empty names
update public.profiles p
set full_name = coalesce(
  (select raw_user_meta_data->>'full_name' from auth.users where id = p.id),
  (select raw_user_meta_data->>'name' from auth.users where id = p.id),
  'User ' || substr(p.id::text, 1, 4)
)
where p.full_name is null or p.full_name = '' or p.full_name like 'User %';
