create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.can_view_baby(target_baby_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.babies
    where babies.id = target_baby_id
      and babies.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.baby_members
    where baby_members.baby_id = target_baby_id
      and baby_members.user_id = auth.uid()
      and baby_members.status = 'active'
  );
$$;

create or replace function public.can_edit_baby_content(target_baby_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.babies
    where babies.id = target_baby_id
      and babies.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.baby_members
    where baby_members.baby_id = target_baby_id
      and baby_members.user_id = auth.uid()
      and baby_members.status = 'active'
      and baby_members.role in ('owner', 'editor')
  );
$$;

create or replace function public.has_pending_baby_invite(target_baby_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') <> ''
  and exists (
    select 1
    from public.baby_members
    where baby_members.baby_id = target_baby_id
      and baby_members.status = 'invited'
      and lower(baby_members.invite_email) = lower(auth.jwt() ->> 'email')
  );
$$;

create table if not exists public.babies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  nickname text,
  gender text not null default 'unspecified' check (gender in ('female', 'male', 'other', 'unspecified')),
  birth_date date not null,
  avatar_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  title text not null,
  recorded_at timestamptz not null,
  content text,
  mood text check (mood in ('happy', 'calm', 'fussy', 'excited', 'sleepy', 'sick')),
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  title text not null,
  happened_at timestamptz not null,
  description text,
  is_important boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.growth_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  type text not null check (type in ('height', 'weight', 'head_circumference')),
  value numeric(8, 2) not null check (value > 0),
  recorded_on date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  memory_id uuid references public.memories(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  file_url text,
  poster_url text,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  storage_path text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint media_assets_parent_check check (
    (memory_id is not null and milestone_id is null)
    or
    (memory_id is null and milestone_id is not null)
  )
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  color text not null default '#F29D74',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tags_user_name_unique unique (user_id, normalized_name)
);

create table if not exists public.memory_tags (
  memory_id uuid not null references public.memories(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (memory_id, tag_id)
);

create table if not exists public.baby_members (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invite_email text not null,
  display_name text,
  role text not null default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists babies_user_id_idx on public.babies(user_id);
create index if not exists babies_birth_date_idx on public.babies(birth_date desc);
create index if not exists memories_user_baby_recorded_idx on public.memories(user_id, baby_id, recorded_at desc);
create index if not exists memories_search_idx on public.memories using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '')));
create index if not exists milestones_user_baby_happened_idx on public.milestones(user_id, baby_id, happened_at desc);
create index if not exists growth_metrics_baby_type_date_idx on public.growth_metrics(baby_id, type, recorded_on);
create index if not exists media_assets_baby_created_idx on public.media_assets(baby_id, created_at desc);
create index if not exists memory_tags_tag_id_idx on public.memory_tags(tag_id);
create index if not exists baby_members_baby_idx on public.baby_members(baby_id);
create index if not exists baby_members_user_idx on public.baby_members(user_id);
create unique index if not exists baby_members_baby_email_unique on public.baby_members(baby_id, invite_email);
create unique index if not exists baby_members_baby_user_unique on public.baby_members(baby_id, user_id) where user_id is not null;

drop trigger if exists babies_set_updated_at on public.babies;
create trigger babies_set_updated_at
before update on public.babies
for each row
execute function public.set_updated_at();

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
before update on public.memories
for each row
execute function public.set_updated_at();

drop trigger if exists milestones_set_updated_at on public.milestones;
create trigger milestones_set_updated_at
before update on public.milestones
for each row
execute function public.set_updated_at();

drop trigger if exists growth_metrics_set_updated_at on public.growth_metrics;
create trigger growth_metrics_set_updated_at
before update on public.growth_metrics
for each row
execute function public.set_updated_at();

drop trigger if exists tags_set_updated_at on public.tags;
create trigger tags_set_updated_at
before update on public.tags
for each row
execute function public.set_updated_at();

drop trigger if exists baby_members_set_updated_at on public.baby_members;
create trigger baby_members_set_updated_at
before update on public.baby_members
for each row
execute function public.set_updated_at();

alter table public.babies enable row level security;
alter table public.memories enable row level security;
alter table public.milestones enable row level security;
alter table public.growth_metrics enable row level security;
alter table public.media_assets enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;
alter table public.baby_members enable row level security;

create policy "babies owner select"
on public.babies
for select
using (
  public.can_view_baby(id)
  or public.has_pending_baby_invite(id)
);

create policy "babies owner insert"
on public.babies
for insert
with check (auth.uid() = user_id);

create policy "babies owner update"
on public.babies
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "babies owner delete"
on public.babies
for delete
using (auth.uid() = user_id);

create policy "memories owner select"
on public.memories
for select
using (public.can_view_baby(baby_id));

create policy "memories owner insert"
on public.memories
for insert
with check (
  auth.uid() = user_id
  and public.can_edit_baby_content(baby_id)
);

create policy "memories owner update"
on public.memories
for update
using (public.can_edit_baby_content(baby_id))
with check (public.can_edit_baby_content(baby_id));

create policy "memories owner delete"
on public.memories
for delete
using (public.can_edit_baby_content(baby_id));

create policy "milestones owner select"
on public.milestones
for select
using (public.can_view_baby(baby_id));

create policy "milestones owner insert"
on public.milestones
for insert
with check (
  auth.uid() = user_id
  and public.can_edit_baby_content(baby_id)
);

create policy "milestones owner update"
on public.milestones
for update
using (public.can_edit_baby_content(baby_id))
with check (public.can_edit_baby_content(baby_id));

create policy "milestones owner delete"
on public.milestones
for delete
using (public.can_edit_baby_content(baby_id));

create policy "growth metrics owner select"
on public.growth_metrics
for select
using (public.can_view_baby(baby_id));

create policy "growth metrics owner insert"
on public.growth_metrics
for insert
with check (
  auth.uid() = user_id
  and public.can_edit_baby_content(baby_id)
);

create policy "growth metrics owner update"
on public.growth_metrics
for update
using (public.can_edit_baby_content(baby_id))
with check (public.can_edit_baby_content(baby_id));

create policy "growth metrics owner delete"
on public.growth_metrics
for delete
using (public.can_edit_baby_content(baby_id));

create policy "media assets owner select"
on public.media_assets
for select
using (public.can_view_baby(baby_id));

create policy "media assets owner insert"
on public.media_assets
for insert
with check (
  auth.uid() = user_id
  and public.can_edit_baby_content(baby_id)
);

create policy "media assets owner update"
on public.media_assets
for update
using (public.can_edit_baby_content(baby_id))
with check (public.can_edit_baby_content(baby_id));

create policy "media assets owner delete"
on public.media_assets
for delete
using (public.can_edit_baby_content(baby_id));

create policy "tags owner select"
on public.tags
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.memory_tags
    join public.memories on memories.id = memory_tags.memory_id
    where memory_tags.tag_id = tags.id
      and public.can_view_baby(memories.baby_id)
  )
);

create policy "tags owner insert"
on public.tags
for insert
with check (auth.uid() = user_id);

create policy "tags owner update"
on public.tags
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tags owner delete"
on public.tags
for delete
using (auth.uid() = user_id);

create policy "memory tags owner select"
on public.memory_tags
for select
using (
  exists (
    select 1
    from public.memories
    where memories.id = memory_tags.memory_id
      and (
        memories.user_id = auth.uid()
        or exists (
          select 1
          from public.baby_members
          where baby_members.baby_id = memories.baby_id
            and baby_members.user_id = auth.uid()
            and baby_members.status = 'active'
        )
      )
  )
);

create policy "memory tags owner insert"
on public.memory_tags
for insert
with check (
  exists (
    select 1
    from public.memories
    where memories.id = memory_tags.memory_id
      and public.can_edit_baby_content(memories.baby_id)
  )
);

create policy "memory tags owner delete"
on public.memory_tags
for delete
using (
  exists (
    select 1
    from public.memories
    where memories.id = memory_tags.memory_id
      and public.can_edit_baby_content(memories.baby_id)
  )
);

create policy "baby members owner select"
on public.baby_members
for select
using (
  public.can_view_baby(baby_id)
  or lower(invite_email) = lower(auth.jwt() ->> 'email')
);

create policy "baby members invitee claim update"
on public.baby_members
for update
using (
  user_id is null
  and lower(invite_email) = lower(auth.jwt() ->> 'email')
)
with check (
  lower(invite_email) = lower(auth.jwt() ->> 'email')
  and user_id = auth.uid()
  and status = 'active'
);

create policy "baby members owner insert"
on public.baby_members
for insert
with check (
  exists (
    select 1
    from public.babies
    where babies.id = baby_members.baby_id
      and babies.user_id = auth.uid()
  )
);

create policy "baby members owner update"
on public.baby_members
for update
using (
  exists (
    select 1
    from public.babies
    where babies.id = baby_members.baby_id
      and babies.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.babies
    where babies.id = baby_members.baby_id
      and babies.user_id = auth.uid()
  )
);

create policy "baby members invitee delete"
on public.baby_members
for delete
using (
  lower(invite_email) = lower(auth.jwt() ->> 'email')
  and status = 'invited'
);

create policy "baby members owner delete"
on public.baby_members
for delete
using (
  exists (
    select 1
    from public.babies
    where babies.id = baby_members.baby_id
      and babies.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('baby-media', 'baby-media', true)
on conflict (id) do nothing;

create policy "storage baby media public read"
on storage.objects
for select
using (bucket_id = 'baby-media');

create policy "storage baby media owner write"
on storage.objects
for insert
with check (
  bucket_id = 'baby-media'
  and public.can_edit_baby_content(((storage.foldername(name))[1])::uuid)
);

create policy "storage baby media owner update"
on storage.objects
for update
using (
  bucket_id = 'baby-media'
  and public.can_edit_baby_content(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'baby-media'
  and public.can_edit_baby_content(((storage.foldername(name))[1])::uuid)
);

create policy "storage baby media owner delete"
on storage.objects
for delete
using (
  bucket_id = 'baby-media'
  and public.can_edit_baby_content(((storage.foldername(name))[1])::uuid)
);
