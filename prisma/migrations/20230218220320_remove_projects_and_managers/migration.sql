/*
  Warnings:

  - You are about to drop the column `numberOfUsers` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the `Managers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Projects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Managers" DROP CONSTRAINT "Managers_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_organizationId_fkey";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "numberOfUsers",
ALTER COLUMN "longDescription" DROP NOT NULL;

-- DropTable
DROP TABLE "Managers";

-- DropTable
DROP TABLE "Projects";
