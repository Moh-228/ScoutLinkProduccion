import { redirect } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { EventCreateForm } from "./_components/EventCreateForm";

export default async function NewEventPage() {
  const session = await verifySession();

  if (!session) redirect("/auth/login");
  if (session.role === "student") redirect("/dashboard/events");

  let organizerName = "Administrador";
  let defaultAcademicUnit = "";
  let verifiedSports: string[] = [];

  if (session.role === "coach") {
    const [profile, verifications] = await Promise.all([
      prisma.coachProfile.findUnique({
        where: { userId: session.userId },
        select: { displayName: true, academicUnit: true },
      }),
      prisma.coachVerification.findMany({
        where: { coachId: session.userId, status: "verified" },
        select: { sport: true },
      }),
    ]);
    if (profile) {
      organizerName = profile.displayName;
      defaultAcademicUnit = profile.academicUnit ?? "";
    }
    verifiedSports = verifications.map((v) => v.sport);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title="Crear evento"
        description="Publica un torneo, entrenamiento o convocatoria de reclutamiento."
      />
      <EventCreateForm
        organizerName={organizerName}
        defaultAcademicUnit={defaultAcademicUnit}
        verifiedSports={session.role === "coach" ? verifiedSports : undefined}
      />
    </div>
  );
}
