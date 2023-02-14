/*
  Warnings:

  - You are about to drop the column `contact_link` on the `ContactMethods` table. All the data in the column will be lost.
  - You are about to drop the column `contact_type` on the `ContactMethods` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `ContactMethods` table. All the data in the column will be lost.
  - You are about to drop the column `email_address` on the `Managers` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `Managers` table. All the data in the column will be lost.
  - You are about to drop the column `foundation_date` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `long_description` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_users` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `Projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactLink` to the `ContactMethods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactType` to the `ContactMethods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ContactMethods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Managers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foundationDate` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longDescription` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfUsers` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContactMethods" DROP CONSTRAINT "ContactMethods_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Managers" DROP CONSTRAINT "Managers_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_organization_id_fkey";

-- DropIndex
DROP INDEX "Organization_owner_id_key";

-- AlterTable
ALTER TABLE "ContactMethods" DROP COLUMN "contact_link",
DROP COLUMN "contact_type",
DROP COLUMN "organization_id",
ADD COLUMN     "contactLink" TEXT NOT NULL,
ADD COLUMN     "contactType" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Managers" DROP COLUMN "email_address",
DROP COLUMN "organization_id",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "foundation_date",
DROP COLUMN "long_description",
DROP COLUMN "number_of_users",
DROP COLUMN "owner_id",
ADD COLUMN     "foundationDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "longDescription" TEXT NOT NULL,
ADD COLUMN     "numberOfUsers" INTEGER NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "organization_id",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrganizationToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_text_key" ON "Tag"("text");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToTag_AB_unique" ON "_OrganizationToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToTag_B_index" ON "_OrganizationToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_ownerId_key" ON "Organization"("ownerId");

-- AddForeignKey
ALTER TABLE "ContactMethods" ADD CONSTRAINT "ContactMethods_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Managers" ADD CONSTRAINT "Managers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTag" ADD CONSTRAINT "_OrganizationToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTag" ADD CONSTRAINT "_OrganizationToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
