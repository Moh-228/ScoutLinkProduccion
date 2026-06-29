import { notFound, redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { EventEditForm } from "./_components/EventEditForm";

type Props = { params: Promise<{ id: string }> };

export default async function EventEditPage({ params }: Props) {
  const { id } = await params;
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  // Permission check
  if (event.coachId !== session.userId && session.role !== "admin") {
    redirect(`/dashboard/events/${id}`);
  }

  const req = (event.requirements ?? {}) as Record<string, unknown>;

  // Serialise to plain object safe for client props
  const initial = {
    type: event.type as "tournament" | "training" | "recruitment",
    sport: event.sport,
    title: event.title,
    visibility: event.visibility,
    academicUnit: (req.academicUnit as string) ?? "",
    shortDescription: event.shortDescription ?? "",
    longDescription: event.longDescription ?? "",
    locationText: event.locationText ?? "",
    mapsUrl: event.mapsUrl ?? "",
    startAt: event.startAt ? event.startAt.toISOString().slice(0, 16) : "",
    endAt: event.endAt ? event.endAt.toISOString().slice(0, 16) : "",
    registrationDeadline: event.registrationDeadline
      ? event.registrationDeadline.toISOString().slice(0, 16)
      : "",
    capacity: event.capacity ? String(event.capacity) : "",
    cost: (req.cost as string) ?? "",
    notes: (req.notes as string) ?? "",
    autoClose: (req.autoClose as boolean) ?? false,
    // tournament
    format: (req.format as string) ?? "",
    category: (req.category as string) ?? "",
    minTeams: req.minTeams != null ? String(req.minTeams) : "",
    maxTeams: req.maxTeams != null ? String(req.maxTeams) : "",
    playersPerTeam: req.playersPerTeam != null ? String(req.playersPerTeam) : "",
    substitutes: req.substitutes != null ? String(req.substitutes) : "",
    rulesLink: (req.rulesLink as string) ?? "",
    gameDays: Array.isArray(req.gameDays) ? (req.gameDays as string[]) : [],
    timeWindow: (req.timeWindow as string) ?? "",
    registrationRequirements: (req.registrationRequirements as string) ?? "",
    // training
    scheduleDays: Array.isArray(req.scheduleDays) ? (req.scheduleDays as string[]) : [],
    startTime: (req.startTime as string) ?? "",
    endTime: (req.endTime as string) ?? "",
    // recruitment
    targetTeam: (req.targetTeam as string) ?? "",
    level: (req.level as string) ?? "",
    sportsCharacteristics:
      req.sportsCharacteristics && typeof req.sportsCharacteristics === "object"
        ? (req.sportsCharacteristics as Record<string, string>)
        : {},
    whatToBring: (req.whatToBring as string) ?? "",
    evaluationFormat: (req.evaluationFormat as string) ?? "",
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Editar evento</h1>
        <p className="text-sm text-white/60">{event.title}</p>
      </header>
      <EventEditForm eventId={id} initial={initial} />
    </div>
  );
}
