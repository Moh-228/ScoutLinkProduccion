import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Crear evento</h1>
        <p className="text-sm text-white/60">
          Publica un torneo, entrenamiento o convocatoria de reclutamiento.
        </p>
      </header>
      <EventCreateForm
        organizerName={organizerName}
        defaultAcademicUnit={defaultAcademicUnit}
        verifiedSports={session.role === "coach" ? verifiedSports : undefined}
      />
    </div>
  );
}
