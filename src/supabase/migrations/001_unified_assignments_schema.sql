-- Unified Assignments and Triage Schema Migration
-- This migration extends the earlier schema and models every field used in triage and assignment cards

-- 1) Enums - idempotent helpers
do $$ begin
  create type task_status    as enum ('todo','in_progress','review','done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority  as enum ('low','medium','high','critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type step_state     as enum ('pending','running','done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type triage_type    as enum ('requesting_approval','exception','fyi');
exception when duplicate_object then null; end $$;

do $$ begin
  create type risk_level     as enum ('low','medium','high','critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type citation_type  as enum ('log','pdf','confluence','metrics','security','database');
exception when duplicate_object then null; end $$;

-- 2) Core tables (assignments + steps)
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  summary text,                       -- triage summary line
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  progress int not null default 0 check (progress between 0 and 100),

  -- Triaging / review fields
  triage_kind triage_type,            -- requesting_approval | exception | fyi
  risk risk_level,
  agent text,                         -- "SecurityBot-v1.3"
  autonomy_level text,                -- Low / Medium / High (string keeps it flexible)
  confidence_pct int check (confidence_pct between 0 and 100),
  source text,                        -- "Security Monitor"
  assignee text,                      -- simple now; can switch to user_id later
  due_at timestamptz,                 -- null == N/A

  -- Details (expanded panel)
  recommendation text,
  rationale text,
  impact text,
  simulation text,

  created_by text,
  created_at timestamptz not null default now(),
  estimated_hours float
);

create index if not exists assignments_status_idx on public.assignments (status);
create index if not exists assignments_status_priority_idx on public.assignments (status, priority);
create index if not exists assignments_due_idx on public.assignments (due_at nulls last);

create table if not exists public.assignment_steps (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  title text not null,
  description text,
  state step_state not null default 'pending',
  agent text,
  order_index int not null default 0
);
create index if not exists assignment_steps_order_idx on public.assignment_steps (assignment_id, order_index);

-- 3) Triage relations (provenance, approvals, citations, comments)
create table if not exists public.assignment_provenance (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  label text not null                -- e.g., "CloudWatch"
);
create index if not exists assignment_provenance_fk_idx on public.assignment_provenance (assignment_id);

create table if not exists public.assignment_approval_chain (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  approver text not null,            -- "SecurityBot-v1.3", "Lisa Park", ...
  order_index int not null default 0
);
create index if not exists assignment_approval_chain_fk_idx on public.assignment_approval_chain (assignment_id, order_index);

create table if not exists public.assignment_citations (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  title text not null,
  type citation_type not null,
  url text not null,
  ts timestamptz                     -- nullable; when omitted your UI hides the time
);
create index if not exists assignment_citations_fk_idx on public.assignment_citations (assignment_id);

create table if not exists public.assignment_comments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  author text not null,              -- simple for now
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists assignment_comments_fk_idx on public.assignment_comments (assignment_id, created_at desc);

-- 4) RLS (simple read-all; tighten later)
alter table public.assignments            enable row level security;
alter table public.assignment_steps       enable row level security;
alter table public.assignment_provenance  enable row level security;
alter table public.assignment_approval_chain enable row level security;
alter table public.assignment_citations   enable row level security;
alter table public.assignment_comments    enable row level security;

create policy "read_all" on public.assignments for select to authenticated using (true);
create policy "read_all" on public.assignment_steps for select to authenticated using (true);
create policy "read_all" on public.assignment_provenance for select to authenticated using (true);
create policy "read_all" on public.assignment_approval_chain for select to authenticated using (true);
create policy "read_all" on public.assignment_citations for select to authenticated using (true);
create policy "read_all" on public.assignment_comments for select to authenticated using (true);

-- 5) Convenience view for Triaging/Review
-- This view returns the "card-shaped" object your React expects (with nested lists). 
-- Use it to power Triage and Live Assignments → Review.

create or replace view public.v_triage_assignments as
select
  a.*,
  coalesce(
    (select array_agg(p.label order by p.label)
     from assignment_provenance p where p.assignment_id = a.id), '{}'
  ) as provenance,
  coalesce(
    (select json_agg(json_build_object(
              'id', ac.id,
              'title', ac.title,
              'type', ac.type,
              'url', ac.url,
              'timestamp', ac.ts
            ) order by ac.ts nulls last, ac.title)
     from assignment_citations ac where ac.assignment_id = a.id), '[]'::json
  ) as citations,
  coalesce(
    (select json_agg(json_build_object(
              'author', c.author,
              'text',   c.body,
              'time',   c.created_at
            ) order by c.created_at desc)
     from assignment_comments c where c.assignment_id = a.id), '[]'::json
  ) as comments,
  coalesce(
    (select array_agg(ch.approver order by ch.order_index)
     from assignment_approval_chain ch where ch.assignment_id = a.id), '{}'
  ) as approval_chain
from public.assignments a
where a.status = 'review';

-- 6) Example: seed one "Critical security patch deployment"
insert into public.assignments
  (title, description, summary, status, priority, triage_kind, risk,
   agent, autonomy_level, confidence_pct, source, assignee, due_at,
   recommendation, rationale, impact, simulation, progress, created_by)
values
  ('Critical security patch deployment',
   'Deploy critical CVE-2024-1234 patch to all production servers within maintenance window',
   'Deploy critical CVE-2024-1234 patch to all production servers within maintenance window',
   'review','critical','requesting_approval','critical',
   'SecurityBot-v1.3','Low',78,'Security Monitor','Lisa Park', now() + interval '2 hours',
   'Deploy security patch CVE-2024-1234 to all production servers during next maintenance window',
   'Critical vulnerability affects authentication system. Zero-day exploit detected in the wild. Vendor recommends immediate patching.',
   'Security risk mitigation: Eliminates critical auth bypass vulnerability. Deployment time: 45 minutes. Service downtime: <5 minutes per server.',
   null, 80, 'system')
returning id \gset

insert into public.assignment_provenance (assignment_id,label)
values (:id,'CVE Database'),(:id,'Security Scanner'),(:id,'Vendor Advisory');

insert into public.assignment_approval_chain (assignment_id, approver, order_index)
values (:id,'SecurityBot-v1.3',0),(:id,'Lisa Park',1),(:id,'Security Team Lead',2);

insert into public.assignment_citations (assignment_id,title,type,url,ts) values
(:id,'CVE-2024-1234 Vulnerability Report','security','/security/cve-2024-1234', now()),
(:id,'Vendor Security Advisory - Critical Update','pdf','/security/vendor-advisory.pdf', null),
(:id,'Production Server Scan Results','log','/security/scan-results', now() - interval '20 min'),
(:id,'Patch Management Confluence Page','confluence','/confluence/patch-management', null);

insert into public.assignment_comments (assignment_id,author,body)
values
(:id,'SecurityBot-v1.3','Critical severity - immediate action required'),
(:id,'Security Scanner','Vulnerability confirmed across 12 production servers');