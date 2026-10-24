import { requireAdmin } from "@/lib/admin";
import { EVENT_SPORT_LABELS, EVENT_TYPE_LABELS, csvResponse, isoDate } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

/** Exports every event, with applicant counts per status, as CSV. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
  }

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      coach: { select: { email: true, coachProfile: { select: { displayName: true } } } },
      applications: { select: { status: true } },
    },
  });

  const header = [
    "Evento", "Tipo", "Deporte", "Estado", "Entrenador", "Correo del entrenador", "Ubicación",
    "Inicio", "Fin", "Cierre de registro", "Cupo", "Postulantes", "Postulado", "Preseleccionado",
    "Invitado", "Descartado", "Creado",
  ];
  const count = (apps: { status: string }[], status: string) => apps.filter((a) => a.status === status).length;
  const rows = events.map((e) => [
    e.title,
    EVENT_TYPE_LABELS[e.type] ?? e.type,
    EVENT_SPORT_LABELS[e.sport] ?? e.sport,
    e.status === "open" ? "Abierto" : "Cerrado",
    e.coach.coachProfile?.displayName,
    e.coach.email,
    e.locationText,
    isoDate(e.startAt),
    isoDate(e.endAt),
    isoDate(e.registrationDeadline),
    e.capacity,
    e.applications.length,
    count(e.applications, "postulado"),
    count(e.applications, "preseleccionado"),
    count(e.applications, "aceptado"),
    count(e.applications, "rechazado"),
    isoDate(e.createdAt),
  ]);

  return csvResponse(header, rows, "eventos.csv");
}
