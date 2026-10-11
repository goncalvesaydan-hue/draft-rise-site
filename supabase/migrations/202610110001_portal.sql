-- Aditiva: não altera tabelas existentes do site.
-- Leituras: JWT do utilizador + RLS. Escritas: apenas backend com service_role.
create table public.portal_team (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table public.portal_intakes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null unique references auth.users(id),
  version text not null,
  revision integer not null default 0 check (revision >= 0),
  status text not null default 'draft' check (status in ('draft','submitted')),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  updated_at timestamptz not null default now()
);
create index portal_intakes_updated on public.portal_intakes(updated_at desc);
create table public.portal_submissions (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null unique references public.portal_intakes(id),
  idempotency_key uuid not null,
  reference text not null unique,
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default now()
);
create table public.portal_outbox (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.portal_submissions(id),
  recipient text not null check (recipient in ('client','team')),
  subject text not null,
  status text not null default 'pending_configuration' check (status in ('pending_configuration','pending','sent','failed')),
  created_at timestamptz not null default now(),
  unique(submission_id,recipient)
);
create index portal_outbox_pending on public.portal_outbox(status,created_at);
create table public.portal_audit (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.portal_intakes(id),
  actor uuid not null references auth.users(id),
  action text not null check (action in ('submitted')),
  created_at timestamptz not null default now()
);
create index portal_audit_intake on public.portal_audit(intake_id,created_at);
create index portal_audit_actor on public.portal_audit(actor);

create function public.portal_is_team() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.portal_team where user_id = (select auth.uid()));
$$;
revoke all on function public.portal_is_team() from public, anon;
grant execute on function public.portal_is_team() to authenticated, service_role;

alter table public.portal_team enable row level security;
alter table public.portal_intakes enable row level security;
alter table public.portal_submissions enable row level security;
alter table public.portal_outbox enable row level security;
alter table public.portal_audit enable row level security;
create policy portal_team_self on public.portal_team for select to authenticated using (user_id=(select auth.uid()));
create policy portal_intake_read on public.portal_intakes for select to authenticated using (owner=(select auth.uid()) or (select public.portal_is_team()));
create policy portal_submission_read on public.portal_submissions for select to authenticated using (exists(select 1 from public.portal_intakes i where i.id=intake_id));
create policy portal_outbox_read on public.portal_outbox for select to authenticated using ((select public.portal_is_team()));
create policy portal_audit_read on public.portal_audit for select to authenticated using ((select public.portal_is_team()));
revoke all on public.portal_team,public.portal_intakes,public.portal_submissions,public.portal_outbox,public.portal_audit from anon,authenticated;
grant select on public.portal_team,public.portal_intakes,public.portal_submissions,public.portal_outbox,public.portal_audit to authenticated;
grant all on public.portal_team,public.portal_intakes,public.portal_submissions,public.portal_outbox,public.portal_audit to service_role;

create function public.portal_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'immutable submission'; end;
$$;
create trigger portal_preserve_submission before update or delete on public.portal_submissions for each row execute function public.portal_immutable();

create function public.portal_open(p_actor uuid,p_version text,p_email text) returns void language plpgsql set search_path='' as $$
begin
  if exists(select 1 from public.portal_team where user_id=p_actor) then return; end if;
  insert into public.portal_intakes(owner,version,answers) values(p_actor,p_version,
    jsonb_build_object('contact.email',jsonb_build_object('state','answered','value',p_email)))
    on conflict(owner) do nothing;
end;
$$;
create function public.portal_save(p_actor uuid,p_id uuid,p_revision integer,p_answers jsonb) returns jsonb language plpgsql set search_path='' as $$
declare i public.portal_intakes;
begin
  select * into i from public.portal_intakes where id=p_id and owner=p_actor for update;
  if not found then raise exception 'portal_not_found'; end if;
  if exists(select 1 from public.portal_team where user_id=p_actor) then raise exception 'portal_forbidden'; end if;
  if i.status <> 'draft' or i.revision <> p_revision then raise exception 'portal_conflict'; end if;
  update public.portal_intakes set answers=p_answers,revision=revision+1,updated_at=now() where id=p_id returning * into i;
  return to_jsonb(i);
end;
$$;
create function public.portal_submit(p_actor uuid,p_id uuid,p_revision integer,p_key uuid,p_snapshot jsonb) returns jsonb language plpgsql set search_path='' as $$
declare i public.portal_intakes; s public.portal_submissions; sid uuid := gen_random_uuid();
begin
  select * into i from public.portal_intakes where id=p_id and owner=p_actor for update;
  if not found then raise exception 'portal_not_found'; end if;
  if exists(select 1 from public.portal_team where user_id=p_actor) then raise exception 'portal_forbidden'; end if;
  select * into s from public.portal_submissions where intake_id=p_id;
  if found and s.idempotency_key=p_key then return to_jsonb(s); end if;
  if i.status <> 'draft' or i.revision <> p_revision then raise exception 'portal_conflict'; end if;
  if p_snapshot->>'version' is distinct from i.version then raise exception 'portal_conflict'; end if;
  insert into public.portal_submissions(id,intake_id,idempotency_key,reference,snapshot)
    values(sid,p_id,p_key,'REC-'||upper(replace(sid::text,'-','')),p_snapshot) returning * into s;
  update public.portal_intakes set status='submitted',revision=revision+1,updated_at=now() where id=p_id;
  insert into public.portal_outbox(submission_id,recipient,subject)
    values(sid,'client','Ficha recebida — '||s.reference),(sid,'team','Nova ficha — '||s.reference);
  insert into public.portal_audit(intake_id,actor,action) values(p_id,p_actor,'submitted');
  return to_jsonb(s);
end;
$$;
-- Nunca permitir contornar a validação HTTP chamando RPC diretamente do browser.
revoke all on function public.portal_open(uuid,text,text), public.portal_save(uuid,uuid,integer,jsonb), public.portal_submit(uuid,uuid,integer,uuid,jsonb), public.portal_immutable() from public,anon,authenticated;
grant execute on function public.portal_open(uuid,text,text), public.portal_save(uuid,uuid,integer,jsonb), public.portal_submit(uuid,uuid,integer,uuid,jsonb) to service_role;
