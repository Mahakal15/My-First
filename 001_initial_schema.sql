-- CODE ZERO STORE initial schema.
-- Apply in a Supabase SQL migration. Review policies before production launch.
create extension if not exists pgcrypto;

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 5 and 2000),
  category text not null check (category in ('Projects','AI Tools','Blogs','PDF Documents','Programming Code')),
  creator_id uuid references auth.users(id) on delete set null,
  creator_name text not null default 'Community',
  external_url text,
  file_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','removed')),
  views_count bigint not null default 0 check (views_count >= 0),
  downloads_count bigint not null default 0 check (downloads_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_public_category_created_idx
  on public.resources(category, created_at desc) where status = 'approved';
create index if not exists resources_search_idx
  on public.resources using gin (to_tsvector('english', title || ' ' || description));

alter table public.resources enable row level security;

-- Visitors can read only approved resources.
create policy "Anyone can read approved resources"
  on public.resources for select
  using (status = 'approved');

-- Do not add anonymous INSERT/UPDATE/DELETE policies.
-- Route public submissions through a validated Edge Function with CAPTCHA,
-- rate limiting, file validation and moderation. Authenticated creator policies
-- should be added only after implementing ownership and role checks.

create table if not exists public.resource_reports (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 1000),
  created_at timestamptz not null default now()
);
alter table public.resource_reports enable row level security;
-- Report insertion should be mediated by an Edge Function to prevent abuse.

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','moderator')),
  created_at timestamptz not null default now()
);
alter table public.admin_roles enable row level security;
-- No public policies. Admin role checks must be performed server-side.
