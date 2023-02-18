/*
  Warnings:

  - You are about to drop the column `residence` on the `Organization` table. All the data in the column will be lost.
  - Added the required column `type` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "residence",
ADD COLUMN     "department" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "foundationDate" DROP NOT NULL,
ALTER COLUMN "numberOfUsers" DROP NOT NULL;
