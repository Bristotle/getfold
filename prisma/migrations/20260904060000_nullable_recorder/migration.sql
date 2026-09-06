-- DropForeignKey
ALTER TABLE "contributions" DROP CONSTRAINT "contributions_recorded_by_profile_id_fkey";

-- AlterTable
ALTER TABLE "contributions" ALTER COLUMN "recorded_by_profile_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_recorded_by_profile_id_fkey" FOREIGN KEY ("recorded_by_profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

