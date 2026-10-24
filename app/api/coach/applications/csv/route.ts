import { verifySession } from "@/lib/auth";
import { APPLICATION_STATUS_LABELS, csvResponse, isoDate, slug } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

/**
 * Exports the coach's applicants as CSV: every event of theirs, or a single
 * one with `?eventId=`.
 */
export async function GET(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== "coach") {
    return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
  }

  const eventId = new URL(request.url).searchParams.get("eventId");
  let filename = "mis-postulaciones.csv";

  if (eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, coachId: session.userId },
      select: { title: true },
    });
    if (!event) {
      return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });
    }
    filename = `postulantes-${slug(event.title)}.csv`;
  }

  const applications = await prisma.eventApplication.findMany({
    where: { event: { coachId: session.userId, ...(eventId ? { id: eventId } : {}) } },
    orderBy: [{ eventId: "asc" }, { createdAt: "asc" }],
    include: {
      event: { select: { title: true } },
      student: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true, school: true, semester: true } },
        },
      },
    },
  });

  const header = ["Evento", "Nombre", "Correo institucional", "Escuela", "Semestre", "Estado", "Afinidad %", "Fecha de postulación"];
  const rows = applications.map((a) => [
    a.event.title,
    a.student.studentProfile?.fullName,
    a.student.email,
    a.student.studentProfile?.school,
    a.student.studentProfile?.semester,
    APPLICATION_STATUS_LABELS[a.status] ?? a.status,
    a.affinityPercent,
    isoDate(a.createdAt),
  ]);

  return csvResponse(header, rows, filename);
}
