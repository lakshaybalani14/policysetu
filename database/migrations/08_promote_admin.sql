-- Helper to promote a user to admin
-- 1. Updates auth.users metadata to role='admin'
-- 2. Inserts into public.admins table

create or replace function promote_email_to_admin(target_email text)
returns text
security definer -- Runs with privileges of the creator (postgres)
as $$
declare
  target_id uuid;
begin
  -- Find user by email
  select id into target_id from auth.users where email = target_email;
  
  if target_id is null then
    return 'User not found: ' || target_email;
  end if;

  -- 1. Update metadata
  update auth.users
  set raw_user_meta_data = 
      case 
        when raw_user_meta_data is null then '{"role": "admin"}'::jsonb
        else raw_user_meta_data || '{"role": "admin"}'::jsonb
      end
  where id = target_id;

  -- 2. Insert into admins table
  insert into public.admins (user_id, email, full_name, is_active)
  values (
    target_id, 
    target_email, 
    'Admin ' || target_email, 
    true
  )
  on conflict (user_id) do update
  set is_active = true;

  return 'Success: User ' || target_email || ' is now an Admin.';
end;
$$ language plpgsql;
