-- ==============================================================================
-- DRAFT & RISE · Portal WhatsApp Business AI (Setup Rápido Supabase)
-- Copia e cola este script diretamente no SQL Editor do teu projeto Supabase
-- ==============================================================================

-- 0. Garantir existência de roles do Supabase/PostgreSQL (se não existirem)
do $$
begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
end
$$;

-- 1. Fichas de Questionário
create table if not exists public.portal_intakes (
  id uuid primary key default gen_random_uuid(),
  owner text not null,
  version text not null default '1.0.0',
  revision integer not null default 0 check (revision >= 0),
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portal_intakes_owner on public.portal_intakes(owner);
create index if not exists idx_portal_intakes_updated on public.portal_intakes(updated_at desc);

-- 2. Submissões Finais Imutáveis
create table if not exists public.portal_submissions (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null unique references public.portal_intakes(id) on delete cascade,
  idempotency_key uuid not null,
  reference text not null unique,
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists idx_portal_submissions_intake on public.portal_submissions(intake_id);
create index if not exists idx_portal_submissions_created on public.portal_submissions(created_at desc);

-- 3. Códigos de Acesso de 6 Dígitos
create table if not exists public.portal_access_codes (
  email text primary key,
  client_name text not null,
  company_name text not null,
  code text not null,
  intake_id uuid not null references public.portal_intakes(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at bigint not null
);

create index if not exists idx_portal_access_codes_expires on public.portal_access_codes(expires_at);

-- 4. Sessões de Navegação (HTTP-only)
create table if not exists public.portal_sessions (
  token_hash text primary key,
  identity jsonb not null check (jsonb_typeof(identity) = 'object'),
  expires_at bigint not null
);

create index if not exists idx_portal_sessions_expires on public.portal_sessions(expires_at);

-- 5. Proteção Anti-Brute-Force
create table if not exists public.portal_auth_attempts (
  target text primary key,
  failures integer not null default 1,
  locked_until bigint not null default 0
);

-- 6. Auditoria de Ações
create table if not exists public.portal_audit_events (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.portal_intakes(id) on delete cascade,
  actor text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_portal_audit_intake on public.portal_audit_events(intake_id, created_at desc);

-- 7. Histórico de Notificações / Envios
create table if not exists public.portal_outbox (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.portal_submissions(id) on delete cascade,
  recipient text not null,
  subject text not null,
  body jsonb not null default '{}'::jsonb,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

-- 8. Ativar RLS e Restringir Acesso ao Backend (Service Role)
alter table public.portal_intakes enable row level security;
alter table public.portal_submissions enable row level security;
alter table public.portal_access_codes enable row level security;
alter table public.portal_sessions enable row level security;
alter table public.portal_auth_attempts enable row level security;
alter table public.portal_audit_events enable row level security;
alter table public.portal_outbox enable row level security;

revoke all on public.portal_intakes from anon, authenticated;
revoke all on public.portal_submissions from anon, authenticated;
revoke all on public.portal_access_codes from anon, authenticated;
revoke all on public.portal_sessions from anon, authenticated;
revoke all on public.portal_auth_attempts from anon, authenticated;
revoke all on public.portal_audit_events from anon, authenticated;
revoke all on public.portal_outbox from anon, authenticated;

grant all on public.portal_intakes to service_role;
grant all on public.portal_submissions to service_role;
grant all on public.portal_access_codes to service_role;
grant all on public.portal_sessions to service_role;
grant all on public.portal_auth_attempts to service_role;
grant all on public.portal_audit_events to service_role;
grant all on public.portal_outbox to service_role;
