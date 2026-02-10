-- Enable storage extension if not already enabled (usually enabled by default)
-- create extension if not exists "storage";

-- 1. Create Storage Buckets
-- Note: It is often easier to create buckets in the Supabase Dashboard, but this SQL attempts to do it.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

-- 2. Storage Policies (Row Level Security)

-- Avatars: Publicly viewable, uploadable by owner
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- Application Documents: Private, viewable by owner and admins
create policy "Users can view their own application documents."
  on storage.objects for select
  using ( bucket_id = 'application-documents' and auth.uid() = owner );

create policy "Users can upload application documents."
  on storage.objects for insert
  with check ( bucket_id = 'application-documents' and auth.role() = 'authenticated' );

-- 3. Documents Table (Metadata)
create table documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  application_id uuid references applications(id), -- Optional, can be linked later
  document_type text check (document_type in ('aadhar', 'income_proof', 'residence_proof', 'photo', 'other')),
  file_path text not null,
  storage_bucket text not null,
  file_name text,
  file_size bigint,
  content_type text,
  status text check (status in ('pending', 'verified', 'rejected')) default 'pending',
  uploaded_at timestamp with time zone default now()
);

-- RLS for Documents Table
alter table documents enable row level security;

create policy "Users can view their own documents."
  on documents for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own documents."
  on documents for insert
  with check ( auth.uid() = user_id );

-- Index for faster lookups
create index idx_documents_user_id on documents(user_id);
create index idx_documents_application_id on documents(application_id);
