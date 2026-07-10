create extension if not exists pgcrypto;

create table public.article_likes (
  article_slug text not null check (article_slug ~ '^[a-z0-9-]{1,120}$'),
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (article_slug, visitor_id)
);

create table public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null check (article_slug ~ '^[a-z0-9-]{1,120}$'),
  visitor_id uuid not null,
  display_name text not null check (char_length(display_name) between 2 and 40),
  body text not null check (char_length(body) between 2 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index article_comments_public_idx on public.article_comments (article_slug, created_at desc) where status = 'approved';
create index article_comments_rate_limit_idx on public.article_comments (article_slug, visitor_id, created_at desc);

alter table public.article_likes enable row level security;
alter table public.article_comments enable row level security;

create or replace function public.get_article_interaction_summary(target_slug text)
returns table (like_count bigint, comment_count bigint)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.article_likes where article_slug = target_slug),
    (select count(*) from public.article_comments where article_slug = target_slug and status = 'approved');
$$;

create or replace function public.get_article_comments(target_slug text)
returns table (id uuid, display_name text, body text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select id, display_name, body, created_at
  from public.article_comments
  where article_slug = target_slug and status = 'approved'
  order by created_at asc;
$$;

create or replace function public.toggle_article_like(target_slug text, target_visitor_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_slug !~ '^[a-z0-9-]{1,120}$' then
    raise exception 'Invalid article slug';
  end if;

  if exists (select 1 from public.article_likes where article_slug = target_slug and visitor_id = target_visitor_id) then
    delete from public.article_likes where article_slug = target_slug and visitor_id = target_visitor_id;
  else
    insert into public.article_likes (article_slug, visitor_id) values (target_slug, target_visitor_id);
  end if;

  return (select count(*) from public.article_likes where article_slug = target_slug);
end;
$$;

create or replace function public.submit_article_comment(
  target_slug text,
  target_visitor_id uuid,
  target_display_name text,
  target_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  comment_id uuid;
begin
  if target_slug !~ '^[a-z0-9-]{1,120}$' then
    raise exception 'Invalid article slug';
  end if;

  if char_length(trim(target_display_name)) not between 2 and 40 or char_length(trim(target_body)) not between 2 and 500 then
    raise exception 'De reactie voldoet niet aan de redactionele lengte-eisen.';
  end if;

  if exists (
    select 1 from public.article_comments
    where article_slug = target_slug
      and visitor_id = target_visitor_id
      and created_at > now() - interval '60 seconds'
  ) then
    raise exception 'De redactie vraagt u heel even te wachten voor een tweede reactie.';
  end if;

  insert into public.article_comments (article_slug, visitor_id, display_name, body)
  values (target_slug, target_visitor_id, trim(target_display_name), trim(target_body))
  returning id into comment_id;

  return comment_id;
end;
$$;

revoke all on table public.article_likes, public.article_comments from anon, authenticated;
grant execute on function public.get_article_interaction_summary(text) to anon, authenticated;
grant execute on function public.get_article_comments(text) to anon, authenticated;
grant execute on function public.toggle_article_like(text, uuid) to anon, authenticated;
grant execute on function public.submit_article_comment(text, uuid, text, text) to anon, authenticated;
