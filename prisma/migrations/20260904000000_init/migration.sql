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

