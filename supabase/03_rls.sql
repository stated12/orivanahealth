-- Row Level Security: every table is locked. Only published, public-safe content is readable by visitors.
-- Cases, documents, messages, donations, forms and staff data have NO public policy (the server uses the service-role key).
do $$ declare r record; begin for r in select tablename from pg_tables where schemaname='public' and tablename like 'oh\_%' loop execute format('alter table public.%I enable row level security', r.tablename); end loop; end $$;
create policy pub_pages on oh_pages for select using (is_published);
create policy pub_nav on oh_navigation_items for select using (is_visible);
create policy pub_leaders on oh_leaders for select using (is_published);
create policy pub_sgroups on oh_specialty_groups for select using (is_active);
create policy pub_specialties on oh_specialties for select using (is_published);
create policy pub_partners on oh_partners for select using (is_published);
create policy pub_providers on oh_providers for select using (is_published);
create policy pub_statuses on oh_case_statuses for select using (is_active);
create policy pub_tservices on oh_tourism_services for select using (is_published);
create policy pub_steps on oh_journey_steps for select using (is_published);
create policy pub_ccats on oh_course_categories for select using (is_active);
create policy pub_trainers on oh_trainers for select using (is_published);
create policy pub_courses on oh_courses for select using (is_published);
create policy pub_events on oh_events for select using (is_published);
create policy pub_reports on oh_community_reports for select using (is_published);
create policy pub_ecats on oh_equipment_categories for select using (is_active);
create policy pub_listings on oh_equipment_listings for select using (is_published);
create policy pub_eservices on oh_equipment_services for select using (is_published);
create policy pub_navigator on oh_navigator_options for select using (is_active);
create policy pub_faqs on oh_faqs for select using (is_published);
create policy own_profile on oh_profiles for select using (id = auth.uid());
create policy own_enroll on oh_enrollments for select using (user_id = auth.uid());
create policy own_progress on oh_lesson_progress for select using (user_id = auth.uid());
-- Storage: public media is readable; private case documents have no policy at all (only signed URLs created by the server).
do $$ begin if exists (select 1 from pg_tables where schemaname='storage' and tablename='objects') then
  execute 'create policy oh_media_read on storage.objects for select using (bucket_id = ''oh-media'')';
end if; end $$;
