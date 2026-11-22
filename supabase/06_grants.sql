-- Lets the server (service_role key) use the oh_ tables. Safe to re-run.
grant usage on schema public to service_role;
do $$ declare r record; begin
  for r in select tablename from pg_tables where schemaname='public' and tablename like 'oh\_%' loop execute format('grant all privileges on table public.%I to service_role', r.tablename); end loop;
  for r in select sequencename from pg_sequences where schemaname='public' and sequencename like 'oh\_%' loop execute format('grant all privileges on sequence public.%I to service_role', r.sequencename); end loop;
  for r in select viewname from pg_views where schemaname='public' and viewname like 'oh\_%' loop execute format('grant all privileges on table public.%I to service_role', r.viewname); end loop;
end $$;
do $$ begin if exists (select 1 from information_schema.schemata where schema_name='storage') then grant usage on schema storage to service_role; grant all on all tables in schema storage to service_role; end if; end $$;
