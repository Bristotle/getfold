-- CreateTable
CREATE TABLE "attendance_check_ins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "attendance_record_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_check_ins_organization_id_member_id_idx" ON "attendance_check_ins"("organization_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_check_ins_attendance_record_id_member_id_key" ON "attendance_check_ins"("attendance_record_id", "member_id");

-- AddForeignKey
ALTER TABLE "attendance_check_ins" ADD CONSTRAINT "attendance_check_ins_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_check_ins" ADD CONSTRAINT "attendance_check_ins_attendance_record_id_fkey" FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_check_ins" ADD CONSTRAINT "attendance_check_ins_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

