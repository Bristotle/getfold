-- Give `id` and `updated_at` database-level defaults.
--
-- Prisma generates uuid() and @updatedAt values in the CLIENT, so the
-- columns it emits are NOT NULL with no DB default. This app's runtime
-- writes go through supabase-js / PostgREST, never the Prisma client,
-- so without these defaults every INSERT would fail on a null id or
-- updated_at. Mirrored in schema.prisma via dbgenerated("gen_random_uuid()")
-- and @default(now()), so `prisma migrate diff` stays drift-free.

ALTER TABLE "organizations"        ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "profiles"             ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "organization_members" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "member_groups"        ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "members"              ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "visitors"             ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "member_transfers"     ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "attendance_records"   ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "funds"                ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "contributions"        ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "vital_records"        ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "organizations" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "members"       ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
