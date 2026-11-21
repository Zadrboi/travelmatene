-- ==============================================================================
-- TravelMateNE — Supabase Database Schema & Row-Level Security (RLS)
-- Location: supabase/schema.sql
-- Production-ready, idempotent PostgreSQL migration script
-- ==============================================================================

-- 1. Profiles Table & Auth Trigger
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  nationality text not null default 'Indian',
  home_state text,
  travel_style text,
  updated_at timestamptz default now()
);

-- Trigger function to automatically provision profile when an auth.user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, nationality, home_state, travel_style, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'nationality', 'Indian'),
    new.raw_user_meta_data->>'home_state',
    coalesce(new.raw_user_meta_data->>'travel_style', 'Explorer'),
    now()
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    nationality = coalesce(excluded.nationality, public.profiles.nationality),
    home_state = coalesce(excluded.home_state, public.profiles.home_state),
    travel_style = coalesce(excluded.travel_style, public.profiles.travel_style),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Saved Itineraries Table
create table if not exists public.saved_itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  states text[] not null,
  days int not null,
  total_budget_inr int not null,
  permits_summary text,
  plan_json jsonb not null,
  created_at timestamptz default now()
);

-- 3. Document Checklists Table
create table if not exists public.document_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  trip_label text not null,
  permit_type text not null,
  items jsonb not null,
  updated_at timestamptz default now()
);

-- 4. Bookmarked Places Table
create table if not exists public.bookmarked_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  place_slug text not null,
  created_at timestamptz default now(),
  unique(user_id, place_slug)
);

-- Indexes for performance
create index if not exists idx_profiles_updated_at on public.profiles(updated_at);
create index if not exists idx_saved_itineraries_user on public.saved_itineraries(user_id, created_at desc);
create index if not exists idx_document_checklists_user on public.document_checklists(user_id, updated_at desc);
create index if not exists idx_bookmarked_places_user on public.bookmarked_places(user_id);

-- ==============================================================================
-- Row-Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS on all 4 tables
alter table public.profiles enable row level security;
alter table public.saved_itineraries enable row level security;
alter table public.document_checklists enable row level security;
alter table public.bookmarked_places enable row level security;

-- Profiles Policies (auth.uid() = id)
drop policy if exists "Profiles SELECT policy" on public.profiles;
create policy "Profiles SELECT policy"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles INSERT policy" on public.profiles;
create policy "Profiles INSERT policy"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles UPDATE policy" on public.profiles;
create policy "Profiles UPDATE policy"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Profiles DELETE policy" on public.profiles;
create policy "Profiles DELETE policy"
  on public.profiles for delete
  using (auth.uid() = id);

-- Saved Itineraries Policies (auth.uid() = user_id)
drop policy if exists "Saved Itineraries SELECT policy" on public.saved_itineraries;
create policy "Saved Itineraries SELECT policy"
  on public.saved_itineraries for select
  using (auth.uid() = user_id);

drop policy if exists "Saved Itineraries INSERT policy" on public.saved_itineraries;
create policy "Saved Itineraries INSERT policy"
  on public.saved_itineraries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Saved Itineraries UPDATE policy" on public.saved_itineraries;
create policy "Saved Itineraries UPDATE policy"
  on public.saved_itineraries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Saved Itineraries DELETE policy" on public.saved_itineraries;
create policy "Saved Itineraries DELETE policy"
  on public.saved_itineraries for delete
  using (auth.uid() = user_id);

-- Document Checklists Policies (auth.uid() = user_id)
drop policy if exists "Document Checklists SELECT policy" on public.document_checklists;
create policy "Document Checklists SELECT policy"
  on public.document_checklists for select
  using (auth.uid() = user_id);

drop policy if exists "Document Checklists INSERT policy" on public.document_checklists;
create policy "Document Checklists INSERT policy"
  on public.document_checklists for insert
  with check (auth.uid() = user_id);

drop policy if exists "Document Checklists UPDATE policy" on public.document_checklists;
create policy "Document Checklists UPDATE policy"
  on public.document_checklists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Document Checklists DELETE policy" on public.document_checklists;
create policy "Document Checklists DELETE policy"
  on public.document_checklists for delete
  using (auth.uid() = user_id);

-- Bookmarked Places Policies (auth.uid() = user_id)
drop policy if exists "Bookmarked Places SELECT policy" on public.bookmarked_places;
create policy "Bookmarked Places SELECT policy"
  on public.bookmarked_places for select
  using (auth.uid() = user_id);

drop policy if exists "Bookmarked Places INSERT policy" on public.bookmarked_places;
create policy "Bookmarked Places INSERT policy"
  on public.bookmarked_places for insert
  with check (auth.uid() = user_id);

drop policy if exists "Bookmarked Places UPDATE policy" on public.bookmarked_places;
create policy "Bookmarked Places UPDATE policy"
  on public.bookmarked_places for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Bookmarked Places DELETE policy" on public.bookmarked_places;
create policy "Bookmarked Places DELETE policy"
  on public.bookmarked_places for delete
  using (auth.uid() = user_id);
