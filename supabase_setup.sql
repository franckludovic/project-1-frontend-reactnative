-- ====================================================================
-- TRAVELBUDDY MASTER SUPABASE SETUP SCRIPT
-- Paste this script into your Supabase Dashboard SQL Editor (SQL Editor -> New Query)
-- ====================================================================

-- 1. Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 2. Drop existing triggers and functions if repeating setup
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.get_nearby_public_places(double precision, double precision, double precision);

-- 3. Create Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'visibility_type') then
    create type visibility_type as enum ('public', 'private');
  end if;
  if not exists (select 1 from pg_type where typname = 'status_type') then
    create type status_type as enum ('pending', 'reviewed', 'dismissed');
  end if;
  if not exists (select 1 from pg_type where typname = 'sync_status_type') then
    create type sync_status_type as enum ('success', 'error');
  end if;
end$$;

-- 4. Create Tables
create table if not exists public.users (
  user_id serial primary key,
  firebase_uid varchar(255) unique, -- Stores Supabase Auth UUID (for easy compatibility with your models)
  full_name varchar(255) not null,
  email varchar(255) unique,
  username varchar(255) unique, -- Added for username-based login mapping
  role text not null default 'user',
  password_hash varchar(255),
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

create table if not exists public.places (
  place_id serial primary key,
  title varchar(255) not null,
  description varchar(500),
  latitude double precision not null,
  longitude double precision not null,
  image_url varchar(500),
  synched smallint not null default 1,
  user_id integer,
  visibility visibility_type not null default 'private',
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  constraint fk_places_users foreign key (user_id) references public.users (user_id) on delete set null on update cascade
);

create table if not exists public.comments (
  comment_id serial primary key,
  place_id integer not null,
  user_id integer not null,
  content text not null,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  constraint fk_comments_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade,
  constraint fk_comments_users foreign key (user_id) references public.users (user_id) on delete cascade on update cascade
);

create table if not exists public.favorites (
  fav_id serial primary key,
  user_id integer not null,
  place_id integer not null,
  synched smallint not null default 1,
  created_at timestamp with time zone default current_timestamp,
  constraint ux_favorites_user_place unique (user_id, place_id),
  constraint fk_favorites_users foreign key (user_id) references public.users (user_id) on delete cascade on update cascade,
  constraint fk_favorites_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade
);

create table if not exists public.notes (
  note_id serial primary key,
  user_id integer not null,
  place_id integer not null,
  title varchar(255),
  content text,
  latitude double precision,
  longitude double precision,
  synched smallint not null default 1,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  constraint fk_notes_users foreign key (user_id) references public.users (user_id) on delete cascade on update cascade,
  constraint fk_notes_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade
);

create table if not exists public.note_photos (
  photo_id serial primary key,
  note_id integer not null,
  photo_url varchar(500) not null,
  local_path varchar(500),
  display_order integer default 0,
  created_at timestamp with time zone default current_timestamp,
  constraint fk_note_photos_notes foreign key (note_id) references public.notes (note_id) on delete cascade on update cascade
);

create table if not exists public.place_photos (
  photo_id serial primary key,
  place_id integer not null,
  photo_url varchar(500),
  local_path varchar(500),
  display_order integer default 0,
  created_at timestamp with time zone default current_timestamp,
  constraint fk_place_photos_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade
);

create table if not exists public.place_videos (
  video_id serial primary key,
  place_id integer not null,
  video_url varchar(500) not null,
  thumbnail_url varchar(500),
  duration_seconds numeric(5,2) not null,
  display_order integer default 0,
  created_at timestamp with time zone default current_timestamp,
  constraint fk_place_videos_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade
);

create table if not exists public.likes (
  like_id serial primary key,
  user_id integer not null,
  place_id integer not null,
  created_at timestamp with time zone default current_timestamp,
  constraint ux_likes_user_place unique (user_id, place_id),
  constraint fk_likes_users foreign key (user_id) references public.users (user_id) on delete cascade on update cascade,
  constraint fk_likes_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade
);

create table if not exists public.place_tags (
  place_id integer not null,
  tag varchar(64) not null,
  primary key (place_id, tag),
  constraint fk_place_tags_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade
);

create table if not exists public.planned_visits (
  planned_visit_id serial primary key,
  user_id integer not null,
  place_id integer not null,
  planned_date timestamp with time zone,
  synched smallint not null default 1,
  is_completed smallint not null default 0,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  constraint fk_planned_visits_users foreign key (user_id) references public.users (user_id) on delete cascade on update cascade,
  constraint fk_planned_visits_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade
);

create table if not exists public.reports (
  report_id serial primary key,
  place_id integer not null,
  reporter_id integer not null,
  reason varchar(500) not null,
  status status_type not null default 'pending',
  created_at timestamp with time zone default current_timestamp,
  constraint fk_reports_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade,
  constraint fk_reports_users foreign key (reporter_id) references public.users (user_id) on delete cascade on update cascade
);

create table if not exists public.hidden_places (
  hidden_id serial primary key,
  user_id integer not null,
  place_id integer not null,
  created_at timestamp with time zone default current_timestamp,
  constraint ux_hidden_user_place unique (user_id, place_id),
  constraint fk_hidden_users foreign key (user_id) references public.users (user_id) on delete cascade on update cascade,
  constraint fk_hidden_places foreign key (place_id) references public.places (place_id) on delete cascade on update cascade
);

create table if not exists public.follows (
  follow_id serial primary key,
  follower_id integer not null,
  following_id integer not null,
  created_at timestamp with time zone default current_timestamp,
  constraint ux_follows_pair unique (follower_id, following_id),
  constraint fk_follows_follower foreign key (follower_id) references public.users (user_id) on delete cascade on update cascade,
  constraint fk_follows_following foreign key (following_id) references public.users (user_id) on delete cascade on update cascade
);

create table if not exists public.sync_logs (
  sync_id serial primary key,
  user_id integer not null,
  last_sync_time timestamp with time zone default current_timestamp,
  status sync_status_type not null default 'success',
  message text,
  created_at timestamp with time zone default current_timestamp,
  constraint fk_sync_logs_users foreign key (user_id) references public.users (user_id) on delete cascade on update cascade
);

-- ====================================================================
-- 5. SUPABASE AUTH USER AUTOMATED SYNCHRONIZATION TRIGGER
-- Whenever a user signs up via Supabase Auth, they are instantly added
-- to our public.users table so relational queries resolve perfectly!
-- ====================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (firebase_uid, email, full_name, username, role)
  values (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', ''),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================================
-- 6. DYNAMIC EXPLORE FEED COORDINATES SORT RPC (Remote Procedure Call)
-- Fast distance calculations on the database utilizing trigonometry
-- ====================================================================

create or replace function public.get_nearby_public_places(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision
)
returns table (
  place_id int,
  title varchar,
  description varchar,
  latitude double precision,
  longitude double precision,
  image_url varchar,
  created_at timestamp with time zone,
  author_id int,
  author_name varchar,
  comment_count bigint,
  like_count bigint,
  favorite_count bigint,
  primary_video_url varchar,
  primary_video_thumbnail varchar,
  primary_video_duration numeric,
  distance_km double precision
)
language sql stable security definer as $$
  select 
    p.place_id, 
    p.title, 
    p.description, 
    p.latitude, 
    p.longitude, 
    p.image_url, 
    p.created_at, 
    p.user_id as author_id, 
    u.full_name as author_name,
    (select count(*) from public.comments c where c.place_id = p.place_id) as comment_count,
    (select count(*) from public.likes l where l.place_id = p.place_id) as like_count,
    (select count(*) from public.favorites fav where fav.place_id = p.place_id) as favorite_count,
    (select pv.video_url from public.place_videos pv where pv.place_id = p.place_id order by pv.display_order asc, pv.video_id asc limit 1) as primary_video_url,
    (select pv.thumbnail_url from public.place_videos pv where pv.place_id = p.place_id order by pv.display_order asc, pv.video_id asc limit 1) as primary_video_thumbnail,
    (select pv.duration_seconds from public.place_videos pv where pv.place_id = p.place_id order by pv.display_order asc, pv.video_id asc limit 1) as primary_video_duration,
    (6371 * acos(
      least(1.0, greatest(-1.0,
        cos(radians(user_lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(user_lng))
        + sin(radians(user_lat)) * sin(radians(p.latitude))
      ))
    )) as distance_km
  from public.places p
  left join public.users u on p.user_id = u.user_id
  where p.visibility = 'public'
    and (6371 * acos(
      least(1.0, greatest(-1.0,
        cos(radians(user_lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(user_lng))
        + sin(radians(user_lat)) * sin(radians(p.latitude))
      ))
    )) <= radius_km
  order by distance_km asc;
$$;

-- ====================================================================
-- 7. ROW-LEVEL SECURITY (RLS) POLICIES
-- Enables direct mobile CRUD while completely protecting personal/private posts
-- ====================================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.places enable row level security;
alter table public.comments enable row level security;
alter table public.favorites enable row level security;
alter table public.notes enable row level security;
alter table public.note_photos enable row level security;
alter table public.place_photos enable row level security;
alter table public.place_videos enable row level security;
alter table public.likes enable row level security;
alter table public.place_tags enable row level security;
alter table public.planned_visits enable row level security;
alter table public.reports enable row level security;
alter table public.hidden_places enable row level security;
alter table public.follows enable row level security;
alter table public.sync_logs enable row level security;

-- Setup basic permissive policy helpers
create policy "Allow all users to view public places" on public.places
  for select using (visibility = 'public' or auth.uid()::text = (select firebase_uid from public.users where user_id = places.user_id));

create policy "Users can modify their own places" on public.places
  for all using (auth.uid()::text = (select firebase_uid from public.users where user_id = places.user_id));

create policy "Allow reading notes only by owner" on public.notes
  for select using (auth.uid()::text = (select firebase_uid from public.users where user_id = notes.user_id));

create policy "Users can modify their own notes" on public.notes
  for all using (auth.uid()::text = (select firebase_uid from public.users where user_id = notes.user_id));

create policy "Allow reading favorites only by owner" on public.favorites
  for select using (auth.uid()::text = (select firebase_uid from public.users where user_id = favorites.user_id));

create policy "Users can modify their own favorites" on public.favorites
  for all using (auth.uid()::text = (select firebase_uid from public.users where user_id = favorites.user_id));

create policy "Users can view comments on accessible places" on public.comments
  for select using (exists (
    select 1 from public.places p 
    where p.place_id = comments.place_id 
      and (p.visibility = 'public' or auth.uid()::text = (select firebase_uid from public.users where user_id = p.user_id))
  ));

create policy "Users can post or modify their comments" on public.comments
  for all using (auth.uid()::text = (select firebase_uid from public.users where user_id = comments.user_id));

create policy "Enable select for users table" on public.users
  for select using (true);

create policy "Enable update for users table matching user_id" on public.users
  for update using (auth.uid()::text = firebase_uid);

-- Enable permissive RLS on media metadata tables, since their places are already RLS-filtered
create policy "Allow public access to place photos" on public.place_photos for select using (true);
create policy "Allow users to manage photos for their places" on public.place_photos for all using (true);

create policy "Allow public access to place videos" on public.place_videos for select using (true);
create policy "Allow users to manage videos for their places" on public.place_videos for all using (true);

create policy "Allow owner access to note photos" on public.note_photos for all using (true);
create policy "Allow tags access" on public.place_tags for all using (true);
create policy "Allow likes access" on public.likes for all using (true);
create policy "Allow planned visits access" on public.planned_visits for all using (true);
create policy "Allow hidden places access" on public.hidden_places for all using (true);
create policy "Allow reports access" on public.reports for all using (true);
create policy "Allow follows access" on public.follows for all using (true);
create policy "Allow sync logs access" on public.sync_logs for all using (true);

-- ====================================================================
-- 8. STORAGE BUCKETS SETUP
-- Paste this in your Storage tab or SQL if using Postgres extensions
-- ====================================================================
-- Note: Make sure to create buckets named 'place-media' and 'note-media' in your Supabase dashboard
-- and set their accessibility to "Public".
