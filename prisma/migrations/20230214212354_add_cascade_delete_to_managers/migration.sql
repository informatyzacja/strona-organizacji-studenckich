-- DropForeignKey
ALTER TABLE "Managers" DROP CONSTRAINT "Managers_organizationId_fkey";

-- AddForeignKey
ALTER TABLE "Managers" ADD CONSTRAINT "Managers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
