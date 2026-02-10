-- Create Tickets Table
create table tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  subject text not null,
  category text check (category in ('technical', 'policy', 'payment', 'other')) default 'other',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('open', 'in-progress', 'resolved', 'closed')) default 'open',
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create Ticket Replies Table
create table ticket_replies (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  message text not null,
  is_admin_reply boolean default false,
  created_at timestamp with time zone default now()
);

-- RLS for Tickets
alter table tickets enable row level security;

create policy "Users can view their own tickets"
  on tickets for select
  using ( auth.uid() = user_id );

create policy "Users can create tickets"
  on tickets for insert
  with check ( auth.uid() = user_id );

create policy "Admins can view all tickets"
  on tickets for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

create policy "Admins can update tickets"
  on tickets for update
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

-- RLS for Replies
alter table ticket_replies enable row level security;

create policy "Users can view replies for their tickets"
  on ticket_replies for select
  using (
    exists (select 1 from tickets where id = ticket_id and user_id = auth.uid())
  );

create policy "Users can reply to their tickets"
  on ticket_replies for insert
  with check (
    exists (select 1 from tickets where id = ticket_id and user_id = auth.uid())
  );

create policy "Admins can view all replies"
  on ticket_replies for select
  using (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );

create policy "Admins can reply to any ticket"
  on ticket_replies for insert
  with check (
    exists (select 1 from admins where user_id = auth.uid())
    or
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );
