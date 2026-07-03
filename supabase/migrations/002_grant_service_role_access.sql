grant usage on schema public to service_role;

grant select, insert, update, delete on table public.questionnaires to service_role;
grant select, insert, update, delete on table public.questionnaire_sections to service_role;
grant select, insert, update, delete on table public.questions to service_role;
grant select, insert, update, delete on table public.submissions to service_role;
grant select, insert, update, delete on table public.answers to service_role;
grant select, insert, update, delete on table public.referrals to service_role;
grant select, insert, update, delete on table public.institutional_classifications to service_role;

grant usage, select on all sequences in schema public to service_role;
