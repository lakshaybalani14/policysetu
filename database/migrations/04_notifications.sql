-- Create Notifications Table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text check (type in ('info', 'success', 'warning', 'error')) default 'info',
  is_read boolean default false,
  link_url text, -- Optional link to redirect user (e.g., to application details)
  created_at timestamp with time zone default now()
);

-- RLS for Notifications
alter table notifications enable row level security;

create policy "Users can view their own notifications."
  on notifications for select
  using ( auth.uid() = user_id );

create policy "Users can update their own notifications (mark as read)."
  on notifications for update
  using ( auth.uid() = user_id );

-- Function to Auto-Create Notification on Application Status Change
create or replace function notify_on_application_status_change()
returns trigger as $$
declare
  app_policy_name text;
begin
  if (old.status is distinct from new.status) then
    -- Get policy name for better message
    -- Assuming policy_name is stored in applications table (as per my previous knowledge), 
    -- if it's a relation, we might need a select. 
    -- Based on previous files, 'policy_name' is a column in 'applications'.
    
    insert into notifications (
      user_id,
      title,
      message,
      type,
      link_url
    ) values (
      new.user_id,
      'Application Update',
      'Your application for ' || coalesce(new.policy_name, 'policy') || ' has been ' || new.status,
      case 
        when new.status = 'approved' then 'success'
        when new.status = 'rejected' then 'error'
        else 'info'
      end,
      '/dashboard' -- Could be more specific if we had a detailed view URL
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for Notifications
create trigger on_application_status_change_notify
  after update on applications
  for each row execute procedure notify_on_application_status_change();
