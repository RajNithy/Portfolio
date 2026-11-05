-- Raak Editz: run this once in Supabase > SQL Editor.
-- The Free plan supports files up to 50 MB each and 1 GB total storage.
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Video Editing', 'Graphic Design', 'Branding')),
  project_type text not null default 'CREATIVE PROJECT',
  description text default '',
  image_url text,
  video_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "Public can view published projects" on public.projects;
create policy "Public can view published projects"
on public.projects for select
using (published = true);

drop policy if exists "Authenticated users can manage projects" on public.projects;
create policy "Authenticated users can manage projects"
on public.projects for all
to authenticated
using (true)
with check (true);

-- Public bucket for poster thumbnails and uploaded MP4/WebM videos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  52428800,
  array[
    'image/jpeg','image/png','image/webp','image/gif',
    'video/mp4','video/webm','video/quicktime'
  ]
)
on conflict (id) do update
set public = true,
    file_size_limit = 52428800,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio files" on storage.objects;
create policy "Public can view portfolio files"
on storage.objects for select
using (bucket_id = 'portfolio');

drop policy if exists "Authenticated users can upload portfolio files" on storage.objects;
create policy "Authenticated users can upload portfolio files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio');

drop policy if exists "Authenticated users can update portfolio files" on storage.objects;
create policy "Authenticated users can update portfolio files"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio')
with check (bucket_id = 'portfolio');

drop policy if exists "Authenticated users can delete portfolio files" on storage.objects;
create policy "Authenticated users can delete portfolio files"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio');
