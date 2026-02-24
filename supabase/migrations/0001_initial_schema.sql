-- ============================================================
-- Twinstars ERP – Initial multi-tenant schema
-- ============================================================

-- ── Tenants ─────────────────────────────────────────────────
create table if not exists public.tenants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ── Profiles (links auth.users → tenant + role) ──────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  role        text not null default 'member' check (role in ('admin', 'member')),
  created_at  timestamptz not null default now()
);

-- ── Receipts ─────────────────────────────────────────────────
create table if not exists public.receipts (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  created_by  uuid not null references auth.users(id) on delete cascade,
  amount      numeric(14,2) not null,
  description text not null,
  payer       text not null,
  date        date,
  created_at  timestamptz not null default now()
);

-- ── Vouchers ─────────────────────────────────────────────────
create table if not exists public.vouchers (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  created_by  uuid not null references auth.users(id) on delete cascade,
  amount      numeric(14,2) not null,
  description text not null,
  payee       text not null,
  date        date,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.tenants  enable row level security;
alter table public.profiles enable row level security;
alter table public.receipts enable row level security;
alter table public.vouchers enable row level security;

-- Helper function: return the tenant_id of the current user
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
as $$
  select tenant_id from public.profiles where id = auth.uid() limit 1;
$$;

-- ── Profiles: each user can only read/update their own profile ─
create policy "profiles: user can read own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: user can update own"
  on public.profiles for update
  using (id = auth.uid());

-- ── Tenants: users can read their own tenant ─────────────────
create policy "tenants: user can read own tenant"
  on public.tenants for select
  using (id = public.current_tenant_id());

-- ── Receipts RLS ─────────────────────────────────────────────
create policy "receipts: tenant members can select"
  on public.receipts for select
  using (tenant_id = public.current_tenant_id());

create policy "receipts: tenant members can insert"
  on public.receipts for insert
  with check (tenant_id = public.current_tenant_id());

create policy "receipts: tenant members can update own"
  on public.receipts for update
  using (tenant_id = public.current_tenant_id() and created_by = auth.uid());

create policy "receipts: tenant members can delete own"
  on public.receipts for delete
  using (tenant_id = public.current_tenant_id() and created_by = auth.uid());

-- ── Vouchers RLS ─────────────────────────────────────────────
create policy "vouchers: tenant members can select"
  on public.vouchers for select
  using (tenant_id = public.current_tenant_id());

create policy "vouchers: tenant members can insert"
  on public.vouchers for insert
  with check (tenant_id = public.current_tenant_id());

create policy "vouchers: tenant members can update own"
  on public.vouchers for update
  using (tenant_id = public.current_tenant_id() and created_by = auth.uid());

create policy "vouchers: tenant members can delete own"
  on public.vouchers for delete
  using (tenant_id = public.current_tenant_id() and created_by = auth.uid());

-- ============================================================
-- Single-tenant bootstrap
-- ============================================================
-- Run this once to set up the initial Twinstars tenant and
-- attach the first admin user.  Replace the UUIDs / email as needed.
--
-- Step 1 – insert the tenant:
--   insert into public.tenants (id, name)
--   values ('00000000-0000-0000-0000-000000000001', 'Twinstars Group');
--
-- Step 2 – attach the admin user (run after they first log in via Google):
--   insert into public.profiles (id, tenant_id, role)
--   values (
--     (select id from auth.users where email = 'admin@twinstarsgroup.com'),
--     '00000000-0000-0000-0000-000000000001',
--     'admin'
--   );
