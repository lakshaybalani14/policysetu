-- 21_fix_users_permission.sql
-- Fix 'permission denied for table users'
-- This script safely grants permissions to the 'users' table or view if it exists.

do $$
begin
    -- 1. Try to Grant Permissions on 'users' table/view in public schema
    if exists (select from pg_class where relname = 'users' and relkind in ('r', 'v', 'm')) then
        execute 'GRANT ALL ON public.users TO authenticated';
        execute 'GRANT ALL ON public.users TO service_role';
        execute 'GRANT SELECT ON public.users TO anon';
        
        -- If it's a table, enable RLS and add a policy (if not already there)
        if exists (select from pg_tables where tablename = 'users' and schemaname = 'public') then
            execute 'alter table public.users enable row level security';
            execute 'create policy "Allow Select for Authenticated" on public.users for select using (true)';
            execute 'create policy "Allow Insert for Authenticated" on public.users for insert with check (true)';
            execute 'create policy "Allow Update for Authenticated" on public.users for update using (true)';
        end if;
    end if;
exception when others then
    raise notice 'Error granting permissions on users table: %', SQLERRM;
end $$;

-- 2. Explicitly Grant permissions on 'profiles' (just in case they meant profiles)
grant all on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- 3. Ensure 'documents' permissions are correct again
grant all on public.documents to authenticated;
grant all on public.documents to service_role;
