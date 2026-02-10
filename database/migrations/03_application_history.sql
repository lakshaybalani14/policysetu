-- Create Application Logs Table
create table application_logs (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) not null,
  changed_by uuid references auth.users, -- Can be null if system automated
  previous_status text,
  new_status text,
  remarks text,
  created_at timestamp with time zone default now()
);

-- RLS for Application Logs
alter table application_logs enable row level security;

-- Admins can view all logs
create policy "Admins can view all logs."
  on application_logs for select
  using ( 
    exists (
      select 1 from admins 
      where user_id = auth.uid() 
      and is_active = true
    ) 
  );

-- Users can view logs for their own applications
create policy "Users can view logs for their own applications."
  on application_logs for select
  using (
    exists (
      select 1 from applications
      where id = application_logs.application_id
      and user_id = auth.uid()
    )
  );

-- Function to handle auto-logging of status changes
create or replace function log_application_status_change()
returns trigger as $$
begin
  if (old.status is distinct from new.status) then
    insert into application_logs (
      application_id,
      changed_by,
      previous_status,
      new_status,
      remarks,
      created_at
    ) values (
      new.id,
      auth.uid(), -- This might be null if updated via service role, but usually works for storage-api calls
      old.status,
      new.status,
      new.remarks, -- Assuming remarks field exists in applications update payload or is passed
      now()
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for Status Changes
create trigger on_application_status_change
  after update on applications
  for each row execute procedure log_application_status_change();
