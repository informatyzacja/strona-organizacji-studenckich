/*
  Warnings:

  - Added the required column `fieldOfStudy` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "areasOfInterest" TEXT,
ADD COLUMN     "distinguishingFeatures" TEXT,
ADD COLUMN     "fieldOfStudy" TEXT NOT NULL,
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "skillsAndChallenges" TEXT;
