-- LOCAL TESTING ONLY. Never run this in Supabase.
-- Recreates the minimum of Supabase's environment (roles, auth.users, auth.uid())
-- so the migration and the RLS test can run against a plain Postgres.
create role anon nologin;
create role authenticated nologin;
create schema auth;
grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
create table auth.users (
  id uuid primary key,
  email text,
  aud text,
  role text,
  raw_user_meta_data jsonb default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    ),
    ''
  )::uuid
$$;
grant execute on function auth.uid() to anon, authenticated;
