/*
  Warnings:

  - The `academicUnit` column on the `coach_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `token` on the `password_reset_tokens` table. All the data in the column will be lost.
  - The `experienceLevel` column on the `student_general_cards` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `school` column on the `student_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gender` column on the `student_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[tokenHash]` on the table `password_reset_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "School" AS ENUM ('ESIME', 'ESIQIE', 'ESFM', 'ESIA', 'ESIT', 'ENCB', 'ESCOM', 'UPIITA', 'UPIBI');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- DropIndex
DROP INDEX "password_reset_tokens_token_key";

-- AlterTable
ALTER TABLE "coach_profiles" DROP COLUMN "academicUnit",
ADD COLUMN     "academicUnit" "School";

-- Clear existing reset tokens before adding NOT NULL tokenHash (old plain tokens cannot be migrated)
DELETE FROM "password_reset_tokens";

-- AlterTable
ALTER TABLE "password_reset_tokens" DROP COLUMN "token",
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student_general_cards" DROP COLUMN "experienceLevel",
ADD COLUMN     "experienceLevel" "ExperienceLevel";

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "school",
ADD COLUMN     "school" "School",
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");
