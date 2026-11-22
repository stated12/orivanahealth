create or replace function oh_cases_before() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' and new.case_ref is null then new.case_ref := (case when new.kind = 'tourism' then 'ORT-' else 'ORC-' end) || to_char(now(), 'YYYY') || '-' || nextval('oh_case_seq'); end if;
  new.updated_at := now(); return new;
end $$;
create trigger oh_cases_bi before insert or update on oh_cases for each row execute function oh_cases_before();
create or replace function oh_donations_before() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' and new.donation_ref is null then new.donation_ref := 'ODN-' || to_char(now(), 'YYYY') || '-' || nextval('oh_donation_seq'); end if;
  new.updated_at := now(); return new;
end $$;
create trigger oh_donations_bi before insert or update on oh_donations for each row execute function oh_donations_before();
create or replace function oh_rate_hit(p_key text, p_window int, p_max int) returns boolean language plpgsql security definer set search_path = public as $$
declare r oh_rate_limits%rowtype;
begin
  insert into oh_rate_limits(key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when oh_rate_limits.window_start < now() - make_interval(secs => p_window) then 1 else oh_rate_limits.hits + 1 end,
    window_start = case when oh_rate_limits.window_start < now() - make_interval(secs => p_window) then now() else oh_rate_limits.window_start end
  returning * into r;
  return r.hits <= p_max;
end $$;
-- Money raised for a case: only donations that are really paid, minus recorded refunds.
create or replace view oh_case_funding with (security_invoker = true) as
  select c.id as case_id, coalesce(sum(d.amount - d.refund_amount) filter (where d.status in ('paid','refunded')), 0) as raised, count(*) filter (where d.status = 'paid') as paid_count
  from oh_cases c left join oh_donations d on d.case_id = c.id group by c.id;
revoke all on function oh_rate_hit(text,int,int) from public, anon, authenticated;
grant execute on function oh_rate_hit(text,int,int) to service_role;
do $$ begin if exists (select 1 from information_schema.tables where table_schema='storage' and table_name='buckets') then
  insert into storage.buckets (id, name, public) values ('oh-media','oh-media',true) on conflict (id) do nothing;
  insert into storage.buckets (id, name, public) values ('oh-private','oh-private',false) on conflict (id) do nothing;
end if; end $$;
