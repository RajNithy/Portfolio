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

-- Website branding settings managed from /admin.
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  brand_name text not null default 'Raak Editz',
  logo_url text,
  hero_kicker text not null default 'INDEPENDENT CREATIVE STUDIO',
  hero_title_line1 text not null default 'Visuals that',
  hero_title_line2 text not null default 'make an impact.',
  hero_description text not null default '',
  about_kicker text not null default 'A LITTLE ABOUT ME',
  about_title_line1 text not null default 'Good design gets noticed.',
  about_title_line2 text not null default 'Great stories stay.',
  about_paragraph1 text not null default '',
  about_paragraph2 text not null default '',
  contact_kicker text not null default 'AVAILABLE FOR SELECT PROJECTS',
  contact_title_line1 text not null default 'Have an idea?',
  contact_title_line2 text not null default 'Let’s make it real.',
  contact_description text not null default '',
  instagram_url text not null default 'https://www.instagram.com/raak_editz/',
  whatsapp_number text not null default '',
  contact_email text not null default '',
  service_intro text not null default '',
  service1_title text not null default 'Video editing',
  service1_description text not null default '',
  service2_title text not null default 'Graphic design',
  service2_description text not null default '',
  service3_title text not null default 'Branding & creative',
  service3_description text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
drop policy if exists "Public can view website settings" on public.site_settings;
create policy "Public can view website settings" on public.site_settings for select using (true);
drop policy if exists "Authenticated users can manage website settings" on public.site_settings;
create policy "Authenticated users can manage website settings" on public.site_settings for all to authenticated using (true) with check (true);

insert into public.site_settings (
  id, brand_name, hero_description, about_paragraph1, about_paragraph2, contact_description,
  service_intro, service1_description, service2_description, service3_description
) values (
  1, 'Raak Editz',
  'I turn ideas into scroll-stopping videos and memorable designs. Thoughtful visuals, sharp edits, and creative work built to connect.',
  'Raak Editz is a creative space for video editing and graphic design. I enjoy shaping raw ideas into polished visual stories — whether that’s a fast-paced reel, a campaign poster or a complete brand look.',
  'This portfolio is a growing collection of selected work. Each project is an opportunity to experiment, solve a visual problem and make something people remember.',
  'Tell me what you’re working on. Let’s create something worth looking at.',
  'From the first rough idea to the final export, I focus on making every frame and every detail count.',
  'Reels, promotional videos, cinematic edits, short-form content and motion-led storytelling.',
  'Social media creatives, posters, thumbnails, campaign artwork and advertising layouts.',
  'Logo concepts, visual direction and consistent design assets for growing brands.'
) on conflict (id) do nothing;

-- Fill default copy for an existing empty settings row, without overwriting any saved edits.
update public.site_settings set
  hero_description = coalesce(nullif(hero_description, ''), 'I turn ideas into scroll-stopping videos and memorable designs. Thoughtful visuals, sharp edits, and creative work built to connect.'),
  about_paragraph1 = coalesce(nullif(about_paragraph1, ''), 'Raak Editz is a creative space for video editing and graphic design. I enjoy shaping raw ideas into polished visual stories — whether that’s a fast-paced reel, a campaign poster or a complete brand look.'),
  about_paragraph2 = coalesce(nullif(about_paragraph2, ''), 'This portfolio is a growing collection of selected work. Each project is an opportunity to experiment, solve a visual problem and make something people remember.'),
  contact_description = coalesce(nullif(contact_description, ''), 'Tell me what you’re working on. Let’s create something worth looking at.'),
  service_intro = coalesce(nullif(service_intro, ''), 'From the first rough idea to the final export, I focus on making every frame and every detail count.'),
  service1_description = coalesce(nullif(service1_description, ''), 'Reels, promotional videos, cinematic edits, short-form content and motion-led storytelling.'),
  service2_description = coalesce(nullif(service2_description, ''), 'Social media creatives, posters, thumbnails, campaign artwork and advertising layouts.'),
  service3_description = coalesce(nullif(service3_description, ''), 'Logo concepts, visual direction and consistent design assets for growing brands.')
where id = 1;
