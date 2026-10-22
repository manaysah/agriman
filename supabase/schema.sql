-- AgriMan cloud ledger (run once in Supabase → SQL Editor)
create extension if not exists pgcrypto;

create table if not exists public.farms (
  farm_id text primary key,
  password_hash text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.farm_sessions (
  token uuid primary key default gen_random_uuid(),
  farm_id text not null references public.farms(farm_id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '180 days'),
  created_at timestamptz not null default now()
);

create index if not exists farm_sessions_farm_id_idx on public.farm_sessions(farm_id);

alter table public.farms enable row level security;
alter table public.farm_sessions enable row level security;

-- No direct table access for anon; only SECURITY DEFINER RPCs below.

create or replace function public.create_farm(
  p_farm_id text,
  p_password text,
  p_data jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text := upper(trim(p_farm_id));
  v_token uuid;
begin
  if v_id is null or length(v_id) < 4 or length(v_id) > 24 then
    raise exception 'INVALID_FARM_ID';
  end if;
  if p_password is null or length(p_password) < 6 then
    raise exception 'WEAK_PASSWORD';
  end if;
  if exists (select 1 from public.farms where farm_id = v_id) then
    raise exception 'FARM_EXISTS';
  end if;

  insert into public.farms (farm_id, password_hash, data, updated_at)
  values (
    v_id,
    crypt(p_password, gen_salt('bf')),
    coalesce(p_data, '{}'::jsonb),
    now()
  );

  insert into public.farm_sessions (farm_id)
  values (v_id)
  returning token into v_token;

  return jsonb_build_object(
    'farm_id', v_id,
    'token', v_token,
    'data', coalesce(p_data, '{}'::jsonb),
    'updated_at', now()
  );
end;
$$;

create or replace function public.login_farm(
  p_farm_id text,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text := upper(trim(p_farm_id));
  v_row public.farms%rowtype;
  v_token uuid;
begin
  select * into v_row from public.farms where farm_id = v_id;
  if not found then
    raise exception 'BAD_LOGIN';
  end if;
  if v_row.password_hash <> crypt(p_password, v_row.password_hash) then
    raise exception 'BAD_LOGIN';
  end if;

  delete from public.farm_sessions
  where farm_id = v_id and expires_at < now();

  insert into public.farm_sessions (farm_id)
  values (v_id)
  returning token into v_token;

  return jsonb_build_object(
    'farm_id', v_row.farm_id,
    'token', v_token,
    'data', v_row.data,
    'updated_at', v_row.updated_at
  );
end;
$$;

create or replace function public.load_farm(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sess public.farm_sessions%rowtype;
  v_row public.farms%rowtype;
begin
  select * into v_sess
  from public.farm_sessions
  where token = p_token and expires_at > now();

  if not found then
    raise exception 'BAD_SESSION';
  end if;

  select * into v_row from public.farms where farm_id = v_sess.farm_id;

  return jsonb_build_object(
    'farm_id', v_row.farm_id,
    'token', v_sess.token,
    'data', v_row.data,
    'updated_at', v_row.updated_at
  );
end;
$$;

create or replace function public.save_farm(
  p_token uuid,
  p_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sess public.farm_sessions%rowtype;
  v_updated timestamptz;
begin
  select * into v_sess
  from public.farm_sessions
  where token = p_token and expires_at > now();

  if not found then
    raise exception 'BAD_SESSION';
  end if;

  update public.farms
  set data = coalesce(p_data, '{}'::jsonb),
      updated_at = now()
  where farm_id = v_sess.farm_id
  returning updated_at into v_updated;

  -- slide session forward
  update public.farm_sessions
  set expires_at = now() + interval '180 days'
  where token = p_token;

  return jsonb_build_object(
    'farm_id', v_sess.farm_id,
    'updated_at', v_updated
  );
end;
$$;

grant execute on function public.create_farm(text, text, jsonb) to anon, authenticated;
grant execute on function public.login_farm(text, text) to anon, authenticated;
grant execute on function public.load_farm(uuid) to anon, authenticated;
grant execute on function public.save_farm(uuid, jsonb) to anon, authenticated;
