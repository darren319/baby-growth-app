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

drop policy if exists "babies owner select" on public.babies;
create policy "babies owner select"
on public.babies
for select
using (
  public.can_view_baby(id)
  or public.has_pending_baby_invite(id)
);

drop policy if exists "memories owner select" on public.memories;
create policy "memories owner select"
on public.memories
for select
using (public.can_view_baby(baby_id));

drop policy if exists "memories owner insert" on public.memories;
create policy "memories owner insert"
on public.memories
for insert
with check (
  auth.uid() = user_id
  and public.can_edit_baby_content(baby_id)
);

drop policy if exists "memories owner update" on public.memories;
create policy "memories owner update"
on public.memories
for update
using (public.can_edit_baby_content(baby_id))
with check (public.can_edit_baby_content(baby_id));

drop policy if exists "memories owner delete" on public.memories;
create policy "memories owner delete"
on public.memories
for delete
using (public.can_edit_baby_content(baby_id));

drop policy if exists "milestones owner select" on public.milestones;
create policy "milestones owner select"
on public.milestones
for select
using (public.can_view_baby(baby_id));

drop policy if exists "milestones owner insert" on public.milestones;
create policy "milestones owner insert"
on public.milestones
for insert
with check (
  auth.uid() = user_id
  and public.can_edit_baby_content(baby_id)
);

drop policy if exists "milestones owner update" on public.milestones;
create policy "milestones owner update"
on public.milestones
for update
using (public.can_edit_baby_content(baby_id))
with check (public.can_edit_baby_content(baby_id));

drop policy if exists "milestones owner delete" on public.milestones;
create policy "milestones owner delete"
on public.milestones
for delete
using (public.can_edit_baby_content(baby_id));

drop policy if exists "growth metrics owner select" on public.growth_metrics;
create policy "growth metrics owner select"
on public.growth_metrics
for select
using (public.can_view_baby(baby_id));

drop policy if exists "growth metrics owner insert" on public.growth_metrics;
create policy "growth metrics owner insert"
on public.growth_metrics
for insert
with check (
  auth.uid() = user_id
  and public.can_edit_baby_content(baby_id)
);

drop policy if exists "growth metrics owner update" on public.growth_metrics;
create policy "growth metrics owner update"
on public.growth_metrics
for update
using (public.can_edit_baby_content(baby_id))
with check (public.can_edit_baby_content(baby_id));

drop policy if exists "growth metrics owner delete" on public.growth_metrics;
create policy "growth metrics owner delete"
on public.growth_metrics
for delete
using (public.can_edit_baby_content(baby_id));

drop policy if exists "media assets owner select" on public.media_assets;
create policy "media assets owner select"
on public.media_assets
for select
using (public.can_view_baby(baby_id));

drop policy if exists "media assets owner insert" on public.media_assets;
create policy "media assets owner insert"
on public.media_assets
for insert
with check (
  auth.uid() = user_id
  and public.can_edit_baby_content(baby_id)
);

drop policy if exists "media assets owner update" on public.media_assets;
create policy "media assets owner update"
on public.media_assets
for update
using (public.can_edit_baby_content(baby_id))
with check (public.can_edit_baby_content(baby_id));

drop policy if exists "media assets owner delete" on public.media_assets;
create policy "media assets owner delete"
on public.media_assets
for delete
using (public.can_edit_baby_content(baby_id));

drop policy if exists "tags owner select" on public.tags;
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

drop policy if exists "memory tags owner select" on public.memory_tags;
create policy "memory tags owner select"
on public.memory_tags
for select
using (
  exists (
    select 1
    from public.memories
    where memories.id = memory_tags.memory_id
      and public.can_view_baby(memories.baby_id)
  )
);

drop policy if exists "memory tags owner insert" on public.memory_tags;
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

drop policy if exists "memory tags owner delete" on public.memory_tags;
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

drop policy if exists "baby members owner select" on public.baby_members;
create policy "baby members owner select"
on public.baby_members
for select
using (
  public.can_view_baby(baby_id)
  or lower(invite_email) = lower(auth.jwt() ->> 'email')
);

drop policy if exists "baby members invitee claim update" on public.baby_members;
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

drop policy if exists "baby members owner insert" on public.baby_members;
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

drop policy if exists "baby members owner update" on public.baby_members;
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

drop policy if exists "baby members invitee delete" on public.baby_members;
create policy "baby members invitee delete"
on public.baby_members
for delete
using (
  lower(invite_email) = lower(auth.jwt() ->> 'email')
  and status = 'invited'
);

drop policy if exists "baby members owner delete" on public.baby_members;
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

drop policy if exists "storage baby media owner write" on storage.objects;
create policy "storage baby media owner write"
on storage.objects
for insert
with check (
  bucket_id = 'baby-media'
  and public.can_edit_baby_content(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "storage baby media owner update" on storage.objects;
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

drop policy if exists "storage baby media owner delete" on storage.objects;
create policy "storage baby media owner delete"
on storage.objects
for delete
using (
  bucket_id = 'baby-media'
  and public.can_edit_baby_content(((storage.foldername(name))[1])::uuid)
);
