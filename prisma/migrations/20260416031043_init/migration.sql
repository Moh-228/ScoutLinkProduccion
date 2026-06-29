-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'coach', 'admin');

-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('basketball', 'soccer', 'flag_football', 'volleyball');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('training', 'tournament', 'recruitment');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('postulado', 'preseleccionado', 'aceptado', 'rechazado');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" DATE,
    "school" TEXT,
    "semester" INTEGER,
    "gender" TEXT,
    "favoriteSport" "Sport",
    "socialLink" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "coach_profiles" (
    "userId" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "academicUnit" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "coach_verifications" (
    "id" UUID NOT NULL,
    "coachId" UUID NOT NULL,
    "sport" "Sport" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "documentUrl" TEXT,
    "rejectionReason" TEXT,
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_general_cards" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "phone" TEXT,
    "publicEmail" TEXT,
    "experienceLevel" TEXT,
    "availability" JSONB,
    "medicalInfo" JSONB,
    "documents" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_general_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_specialized_cards" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "sport" "Sport" NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_specialized_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "coachId" UUID NOT NULL,
    "type" "EventType" NOT NULL,
    "sport" "Sport" NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "locationText" TEXT,
    "mapsUrl" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "registrationDeadline" TIMESTAMP(3),
    "capacity" INTEGER,
    "status" "EventStatus" NOT NULL DEFAULT 'open',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_applications" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'postulado',
    "affinityPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "coach_verifications_coachId_sport_key" ON "coach_verifications"("coachId", "sport");

-- CreateIndex
CREATE UNIQUE INDEX "student_general_cards_studentId_key" ON "student_general_cards"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_specialized_cards_studentId_sport_key" ON "student_specialized_cards"("studentId", "sport");

-- CreateIndex
CREATE INDEX "event_applications_eventId_affinityPercent_idx" ON "event_applications"("eventId", "affinityPercent");

-- CreateIndex
CREATE UNIQUE INDEX "event_applications_eventId_studentId_key" ON "event_applications"("eventId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_targetType_targetId_key" ON "favorites"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_verifications" ADD CONSTRAINT "coach_verifications_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_verifications" ADD CONSTRAINT "coach_verifications_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_general_cards" ADD CONSTRAINT "student_general_cards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_specialized_cards" ADD CONSTRAINT "student_specialized_cards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_applications" ADD CONSTRAINT "event_applications_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_applications" ADD CONSTRAINT "event_applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
