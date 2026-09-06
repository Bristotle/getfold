-- Fold, complete database setup (tables + RLS).
-- Paste into the Supabase SQL Editor and Run, on an EMPTY database.
-- Kept as a fallback/reference; the live DB was provisioned via
-- `npm run prisma:deploy` + prisma db execute.

begin;

-- ===== PART 1: TABLES =====

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('local_church', 'circuit', 'diocese', 'denomination_hq');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('super_admin', 'admin', 'minister', 'finance_officer', 'class_leader', 'member');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('bible_class', 'fellowship', 'choir', 'ministry', 'other');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('active', 'transferred_out', 'archived');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('sunday_service', 'bible_class', 'prayer_meeting', 'communion_service', 'youth_service', 'children_service', 'other');

-- CreateEnum
CREATE TYPE "ContributionType" AS ENUM ('tithe', 'offering', 'pledge', 'donation', 'other');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'momo', 'bank_transfer', 'cheque', 'card');

-- CreateEnum
CREATE TYPE "VitalRecordType" AS ENUM ('baptism', 'confirmation', 'wedding', 'death');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'local_church',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Accra',
    "denomination" TEXT,
    "parent_organization_id" UUID,
    "address" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_groups" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GroupType" NOT NULL DEFAULT 'other',
    "leader_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" "Gender",
    "date_of_birth" TIMESTAMP(3),
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "photo_url" TEXT,
    "member_type" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'active',
    "member_group_id" UUID,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" "Gender",
    "phone" TEXT,
    "date_of_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "how_heard" TEXT,
    "converted_member_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_transfers" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "to_organization_id" UUID,
    "status" "TransferStatus" NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "member_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "male_count" INTEGER NOT NULL DEFAULT 0,
    "female_count" INTEGER NOT NULL DEFAULT 0,
    "recorded_by_profile_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funds" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_amount" DECIMAL(12,2),
    "current_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "member_id" UUID,
    "fund_id" UUID,
    "type" "ContributionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'cash',
    "note" TEXT,
    "recorded_by_profile_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_records" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "member_id" UUID,
    "type" "VitalRecordType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_parent_organization_id_idx" ON "organizations"("parent_organization_id");

-- CreateIndex
CREATE INDEX "organization_members_profile_id_idx" ON "organization_members"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organization_id_profile_id_key" ON "organization_members"("organization_id", "profile_id");

-- CreateIndex
CREATE INDEX "member_groups_organization_id_idx" ON "member_groups"("organization_id");

-- CreateIndex
CREATE INDEX "members_organization_id_idx" ON "members"("organization_id");

-- CreateIndex
CREATE INDEX "members_member_group_id_idx" ON "members"("member_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_converted_member_id_key" ON "visitors"("converted_member_id");

-- CreateIndex
CREATE INDEX "visitors_organization_id_idx" ON "visitors"("organization_id");

-- CreateIndex
CREATE INDEX "member_transfers_organization_id_idx" ON "member_transfers"("organization_id");

-- CreateIndex
CREATE INDEX "member_transfers_member_id_idx" ON "member_transfers"("member_id");

-- CreateIndex
CREATE INDEX "attendance_records_organization_id_date_idx" ON "attendance_records"("organization_id", "date");

-- CreateIndex
CREATE INDEX "funds_organization_id_idx" ON "funds"("organization_id");

-- CreateIndex
CREATE INDEX "contributions_organization_id_created_at_idx" ON "contributions"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "contributions_member_id_idx" ON "contributions"("member_id");

-- CreateIndex
CREATE INDEX "vital_records_organization_id_type_idx" ON "vital_records"("organization_id", "type");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_groups" ADD CONSTRAINT "member_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_groups" ADD CONSTRAINT "member_groups_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_member_group_id_fkey" FOREIGN KEY ("member_group_id") REFERENCES "member_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_converted_member_id_fkey" FOREIGN KEY ("converted_member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_transfers" ADD CONSTRAINT "member_transfers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_transfers" ADD CONSTRAINT "member_transfers_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_transfers" ADD CONSTRAINT "member_transfers_to_organization_id_fkey" FOREIGN KEY ("to_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_recorded_by_profile_id_fkey" FOREIGN KEY ("recorded_by_profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funds" ADD CONSTRAINT "funds_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_recorded_by_profile_id_fkey" FOREIGN KEY ("recorded_by_profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_records" ADD CONSTRAINT "vital_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_records" ADD CONSTRAINT "vital_records_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- ===== PART 2: ROW-LEVEL SECURITY =====

-- Fold, Row-Level Security setup. Apply this SECOND.
--
-- Step 1: `npx prisma migrate deploy` creates the tables
--         (prisma/migrations/20260904000000_init).
-- Step 2: run this file, e.g. paste into the Supabase SQL Editor.
--
-- Multi-tenancy is enforced HERE, at the database level, not in
-- application code. Every tenant-scoped table gets a policy that
-- checks the requesting user has an organization_member row for that
-- organization_id. This means even a bug in the Next.js app can't leak
-- one church's data into another's, Postgres refuses the query.

-- ---------- 1. Auto-create a profile row when a new auth user signs up ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- 2. Helper: does the current user belong to this organization? ----------

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.profile_id = auth.uid()
  );
$$;

create or replace function public.org_role(org_id uuid)
returns text
language sql
security definer
stable
as $$
  select role::text
  from public.organization_members om
  where om.organization_id = org_id
    and om.profile_id = auth.uid()
  limit 1;
$$;

-- ---------- 3. Enable RLS on every tenant-scoped table ----------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.member_groups enable row level security;
alter table public.members enable row level security;
alter table public.visitors enable row level security;
alter table public.member_transfers enable row level security;
alter table public.attendance_records enable row level security;
alter table public.funds enable row level security;
alter table public.contributions enable row level security;
alter table public.vital_records enable row level security;

-- ---------- 4. Policies ----------
-- Pattern repeated per table: members of an org can read that org's
-- rows; admin/minister/finance_officer roles can write. Adjust the
-- write-role list per table as the app's permission model firms up.

-- profiles: a user can see their own profile, and profiles of people
-- who share at least one organization with them (so staff lists work).
create policy "profiles: self and org-mates readable"
  on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.organization_members mine
      join public.organization_members theirs
        on theirs.organization_id = mine.organization_id
      where mine.profile_id = auth.uid()
        and theirs.profile_id = public.profiles.id
    )
  );

create policy "profiles: self update"
  on public.profiles for update
  using (id = auth.uid());

-- organizations: visible to members; only super_admin/admin can update.
create policy "organizations: members can read"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "organizations: admins can update"
  on public.organizations for update
  using (public.org_role(id) in ('super_admin', 'admin'));

-- organization_members: visible to org-mates; only admins manage roles.
create policy "organization_members: org-mates readable"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "organization_members: admins manage"
  on public.organization_members for insert
  with check (public.org_role(organization_id) in ('super_admin', 'admin'));

create policy "organization_members: admins update"
  on public.organization_members for update
  using (public.org_role(organization_id) in ('super_admin', 'admin'));

create policy "organization_members: admins delete"
  on public.organization_members for delete
  using (public.org_role(organization_id) in ('super_admin', 'admin'));

-- Generic tenant-table policy generator, applied per table below.
-- (Written out explicitly per table for clarity in a starter scaffold, -- once the pattern is proven, wrap this in a plpgsql loop.)

do $$
declare
  t text;
  tenant_tables text[] := array[
    'member_groups', 'members', 'visitors', 'member_transfers',
    'attendance_records', 'funds', 'contributions', 'vital_records'
  ];
begin
  foreach t in array tenant_tables loop
    execute format(
      'create policy "%1$s: org-mates read" on public.%1$s for select
         using (public.is_org_member(organization_id));', t
    );
    execute format(
      'create policy "%1$s: staff write" on public.%1$s for insert
         with check (public.org_role(organization_id) in
           (''super_admin'',''admin'',''minister'',''finance_officer'',''class_leader''));', t
    );
    execute format(
      'create policy "%1$s: staff update" on public.%1$s for update
         using (public.org_role(organization_id) in
           (''super_admin'',''admin'',''minister'',''finance_officer'',''class_leader''));', t
    );
    execute format(
      'create policy "%1$s: admins delete" on public.%1$s for delete
         using (public.org_role(organization_id) in (''super_admin'',''admin''));', t
    );
  end loop;
end $$;


commit;
