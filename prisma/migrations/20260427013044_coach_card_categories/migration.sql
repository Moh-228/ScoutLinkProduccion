-- AlterTable
ALTER TABLE "coach_profiles" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "categories" JSONB,
ADD COLUMN     "yearsExperience" INTEGER;
