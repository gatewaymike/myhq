-- MyHQ: two-account RLS test plus the formula test vectors against the database.
-- Safe to run in the Supabase SQL editor: everything happens inside one transaction
-- that is ROLLED BACK at the end, so no test user, device or entry is kept.
-- Success = the last result reads "ALL RLS AND FORMULA TESTS PASSED".
-- Any failure stops the script with an error naming the check that failed.

begin;

-- Two throwaway users. The sign-up trigger must create their profiles.
insert into auth.users (id, email, aud, role) values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'rls-test-a@example.invalid', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-4000-8000-00000000000b', 'rls-test-b@example.invalid', 'authenticated', 'authenticated');

do $$ begin
  assert (select count(*) from public.profiles
          where id in ('aaaaaaaa-0000-4000-8000-00000000000a', 'bbbbbbbb-0000-4000-8000-00000000000b')) = 2,
         'FAIL: sign-up trigger did not create both profiles';
end $$;

-- ============================================================ as user A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-00000000000a","role":"authenticated"}', true);

insert into public.devices (id, name, route, h2_flow_ml_min)
values ('dddddddd-0000-4000-8000-00000000000a', 'Test inhaler', 'inhalation', 600);

-- Handoff test vectors (src/lib/hq.vectors.json).
insert into public.entries (route, session_start, local_date, tz, volume_ml, concentration_mg_l, minutes, h2_flow_ml_min, notes, client_request_id) values
  ('water',      now(), '2026-10-04', 'Asia/Taipei', 500,  1.6,  null, null, 'v1 1.00',  gen_random_uuid()),
  ('water',      now(), '2026-10-04', 'Asia/Taipei', 500,  1.2,  null, null, 'v2 0.75',  gen_random_uuid()),
  ('water',      now(), '2026-10-04', 'Asia/Taipei', 1000, 0.8,  null, null, 'v3 1.00',  gen_random_uuid()),
  ('inhalation', now(), '2026-10-04', 'Asia/Taipei', null, null, 30,   150,  'v4 1.00',  gen_random_uuid()),
  ('inhalation', now(), '2026-10-04', 'Asia/Taipei', null, null, 30,   300,  'v5 2.00',  gen_random_uuid()),
  ('inhalation', now(), '2026-10-04', 'Asia/Taipei', null, null, 30,   600,  'v6 4.00',  gen_random_uuid()),
  ('inhalation', now(), '2026-10-04', 'Asia/Taipei', null, null, 30,   2000, 'v7 13.33', gen_random_uuid()),
  ('inhalation', now(), '2026-10-04', 'Asia/Taipei', null, null, 130,  150,  'v8 4.33',  gen_random_uuid()),
  ('inhalation', now(), '2026-10-04', 'Asia/Taipei', null, null, 7,    150,  'v9 0.23',  gen_random_uuid()),
  ('inhalation', now(), '2026-10-05', 'Asia/Taipei', null, null, 30,   600,  'day a',    gen_random_uuid()),
  ('water',      now(), '2026-10-05', 'Asia/Taipei', 500,  1.2,  null, null, 'day b',    gen_random_uuid());

do $$
declare r record;
begin
  for r in select notes, hq from public.entries where notes like 'v%' loop
    assert to_char(round(r.hq, 2), 'FM9990.00') = split_part(r.notes, ' ', 2),
           format('FAIL: vector %s computed %s', r.notes, r.hq);
  end loop;
  assert (select count(*) from public.entries where notes like 'v%') = 9, 'FAIL: expected 9 vectors';

  -- Full precision stored, not the rounded figure (R-039).
  assert (select abs(hq - 4.333333333333333) < 1e-12 and hq <> 4.33 from public.entries where notes = 'v8 4.33'),
         'FAIL: 130 min at 150 not stored at full precision';
  assert (select abs(hq - 0.233333333333333) < 1e-12 and hq <> 0.23 from public.entries where notes = 'v9 0.23'),
         'FAIL: 7 min at 150 not stored at full precision';

  -- Same day: 30 min at 600 + 500 mL at 1.2 = 4.75, both routes present.
  assert (select to_char(round(sum(hq), 2), 'FM9990.00') from public.entries where local_date = '2026-10-05') = '4.75',
         'FAIL: same-day total is not 4.75';
  assert (select count(distinct route) from public.entries where local_date = '2026-10-05') = 2,
         'FAIL: both-routes condition not met';
end $$;

-- hq cannot be written by a client.
do $$ begin
  begin
    insert into public.entries (route, session_start, local_date, tz, volume_ml, concentration_mg_l, hq, client_request_id)
    values ('water', now(), '2026-10-04', 'Asia/Taipei', 500, 1.6, 99, gen_random_uuid());
    raise exception 'FAIL: client was able to write hq';
  exception when generated_always or feature_not_supported or syntax_error then null;
  end;
end $$;

-- Double-save guard: the same client_request_id twice is refused.
do $$ begin
  insert into public.entries (route, session_start, local_date, tz, volume_ml, concentration_mg_l, client_request_id)
  values ('water', now(), '2026-10-04', 'Asia/Taipei', 250, 1.6, 'eeeeeeee-0000-4000-8000-00000000000a');
  begin
    insert into public.entries (route, session_start, local_date, tz, volume_ml, concentration_mg_l, client_request_id)
    values ('water', now(), '2026-10-04', 'Asia/Taipei', 250, 1.6, 'eeeeeeee-0000-4000-8000-00000000000a');
    raise exception 'FAIL: duplicate client_request_id was accepted';
  exception when unique_violation then null;
  end;
end $$;

-- Mixed fields are refused (no purity input, no water fields on inhalation). lint-allow
do $$ begin
  begin
    insert into public.entries (route, session_start, local_date, tz, minutes, h2_flow_ml_min, volume_ml, client_request_id)
    values ('inhalation', now(), '2026-10-04', 'Asia/Taipei', 30, 300, 500, gen_random_uuid());
    raise exception 'FAIL: inhalation entry with a volume was accepted';
  exception when check_violation then null;
  end;
end $$;

-- ============================================================ as user B
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-4000-8000-00000000000b","role":"authenticated"}', true);

do $$
declare n int;
begin
  assert (select count(*) from public.entries)  = 0, 'FAIL: B can see A''s entries';
  assert (select count(*) from public.devices)  = 0, 'FAIL: B can see A''s devices';
  assert (select count(*) from public.profiles) = 1, 'FAIL: B can see another profile';

  update public.entries set notes = 'hijacked' where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a';
  get diagnostics n = row_count;
  assert n = 0, 'FAIL: B updated A''s entries';

  delete from public.entries;
  get diagnostics n = row_count;
  assert n = 0, 'FAIL: B deleted A''s entries';

  update public.devices set name = 'hijacked';
  get diagnostics n = row_count;
  assert n = 0, 'FAIL: B updated A''s devices';

  update public.profiles set display_name = 'hijacked' where id = 'aaaaaaaa-0000-4000-8000-00000000000a';
  get diagnostics n = row_count;
  assert n = 0, 'FAIL: B updated A''s profile';

  -- B cannot write a row owned by A.
  begin
    insert into public.entries (user_id, route, session_start, local_date, tz, volume_ml, concentration_mg_l, client_request_id)
    values ('aaaaaaaa-0000-4000-8000-00000000000a', 'water', now(), '2026-10-04', 'Asia/Taipei', 500, 1.6, gen_random_uuid());
    raise exception 'FAIL: B inserted a row owned by A';
  exception when insufficient_privilege then null;
  end;

  -- B cannot attach A's device to B's own entry.
  begin
    insert into public.entries (device_id, route, session_start, local_date, tz, minutes, h2_flow_ml_min, client_request_id)
    values ('dddddddd-0000-4000-8000-00000000000a', 'inhalation', now(), '2026-10-04', 'Asia/Taipei', 30, 600, gen_random_uuid());
    raise exception 'FAIL: B referenced A''s device';
  exception when foreign_key_violation then null;
  end;

  -- B's own entry works, and B cannot hand it to A.
  insert into public.entries (route, session_start, local_date, tz, volume_ml, concentration_mg_l, notes, client_request_id)
  values ('water', now(), '2026-10-04', 'Asia/Taipei', 500, 1.6, 'b own', gen_random_uuid());
  assert (select count(*) from public.entries) = 1, 'FAIL: B cannot see own entry';
  begin
    update public.entries set user_id = 'aaaaaaaa-0000-4000-8000-00000000000a' where notes = 'b own';
    raise exception 'FAIL: B moved an entry to A';
  exception when insufficient_privilege or raise_exception then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
end $$;

-- ============================================================ logged out (anon)
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$ begin
  begin
    perform count(*) from public.entries;
    raise exception 'FAIL: anon can read entries';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.profiles;
    raise exception 'FAIL: anon can read profiles';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.delete_my_account();
    raise exception 'FAIL: anon can call delete_my_account';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ============================================================ B deletes own account
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-4000-8000-00000000000b","role":"authenticated"}', true);
select public.delete_my_account();
reset role;

do $$ begin
  assert not exists (select 1 from auth.users where id = 'bbbbbbbb-0000-4000-8000-00000000000b'), 'FAIL: B auth user remains';
  assert not exists (select 1 from public.profiles where id = 'bbbbbbbb-0000-4000-8000-00000000000b'), 'FAIL: B profile remains';
  assert not exists (select 1 from public.entries where user_id = 'bbbbbbbb-0000-4000-8000-00000000000b'), 'FAIL: B entries remain';
  assert exists (select 1 from auth.users where id = 'aaaaaaaa-0000-4000-8000-00000000000a'), 'FAIL: deleting B removed A';
  assert (select count(*) from public.entries where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a') = 12, 'FAIL: deleting B touched A''s entries';
end $$;

rollback;

select 'ALL RLS AND FORMULA TESTS PASSED' as result;
