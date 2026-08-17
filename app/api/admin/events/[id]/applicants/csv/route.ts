import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<string, string> = {
	postulado: "Postulado",
	preseleccionado: "Preseleccionado",
	aceptado: "Invitado",
	rechazado: "Descartado",
};

function csvEscape(value: string) {
	if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
	return value;
}

/** Exports the full applicant list for a given event as a downloadable CSV. */
export async function GET(_request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id: eventId } = await params;

	const event = await prisma.event.findUnique({ where: { id: eventId }, select: { title: true } });
	if (!event) {
		return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });
	}

	const applications = await prisma.eventApplication.findMany({
		where: { eventId },
		orderBy: { createdAt: "asc" },
		include: {
			student: {
				select: {
					email: true,
					studentProfile: { select: { fullName: true, school: true, semester: true } },
				},
			},
		},
	});

	const header = ["Nombre", "Correo institucional", "Escuela", "Semestre", "Estado", "Afinidad %", "Fecha de postulación"];
	const rows = applications.map((a) => [
		a.student.studentProfile?.fullName ?? "",
		a.student.email,
		a.student.studentProfile?.school ?? "",
		a.student.studentProfile?.semester?.toString() ?? "",
		STATUS_LABELS[a.status] ?? a.status,
		a.affinityPercent.toString(),
		a.createdAt.toISOString(),
	]);

	const csv = [header, ...rows].map((row) => row.map((v) => csvEscape(String(v))).join(",")).join("\n");
	const filename = `postulantes-${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`;

	return new Response(csv, {
		status: 200,
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="${filename}"`,
		},
	});
}
