import { z } from "zod";

import { verifySession } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { isNotificationEnabled } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type RouteProps = { params: Promise<{ id: string; appId: string }> };

const updateApplicationSchema = z
	.object({
		status: z.enum(["preseleccionado", "aceptado", "rechazado"]).optional(),
		feedback: z.string().trim().min(1).max(2000).optional(),
		// Coach-only visual aid; never used in affinity/ranking calculations. `null` clears the rating.
		coachRating: z.union([z.number().int().min(1).max(5), z.null()]).optional(),
	})
	.refine((data) => data.status !== undefined || data.feedback !== undefined || data.coachRating !== undefined, {
		message: "No hay cambios para aplicar.",
	})
	.refine((data) => data.status === undefined || (data.feedback !== undefined && data.feedback.length > 0), {
		message: "Debes agregar un comentario de retroalimentación al cambiar el estado.",
		path: ["feedback"],
	});

const STATUS_MESSAGES: Record<string, string> = {
	preseleccionado: "Fuiste preseleccionado para el evento.",
	aceptado: "¡Felicidades! Fuiste invitado al evento.",
	rechazado: "Tu postulación fue descartada en esta ocasión.",
};

export async function PATCH(request: Request, { params }: RouteProps) {
	const { id: eventId, appId } = await params;
	const session = await verifySession();

	if (!session || (session.role !== "coach" && session.role !== "admin")) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 403 });
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { coachId: true },
	});

	if (!event) {
		return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });
	}

	if (session.role === "coach" && event.coachId !== session.userId) {
		return Response.json({ ok: false, message: "Sin permiso sobre este evento." }, { status: 403 });
	}

	const application = await prisma.eventApplication.findUnique({
		where: { id: appId },
		select: { id: true, eventId: true, studentId: true },
	});

	if (!application || application.eventId !== eventId) {
		return Response.json({ ok: false, message: "Postulación no encontrada." }, { status: 404 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = updateApplicationSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 },
		);
	}

	const { status, feedback, coachRating } = parsed.data;

	// Rating is a coach-only visual aid, never visible/settable by admins or students.
	if (coachRating !== undefined && session.role !== "coach") {
		return Response.json({ ok: false, message: "Solo el entrenador puede calificar postulantes." }, { status: 403 });
	}

	const data: { status?: typeof status; coachFeedback?: string; coachRating?: number | null } = {};
	if (status !== undefined) data.status = status;
	if (feedback !== undefined) data.coachFeedback = feedback;
	if (coachRating !== undefined) data.coachRating = coachRating;

	const notifyStudent = status !== undefined && (await isNotificationEnabled(application.studentId, "applicationStatus"));

	const [updated] = await prisma.$transaction([
		prisma.eventApplication.update({
			where: { id: appId },
			data,
		}),
		...(notifyStudent
			? [
					prisma.notification.create({
						data: {
							userId: application.studentId,
							type: `application_${status}`,
							payload: {
								title: "Actualización de postulación",
								message: feedback ? `${STATUS_MESSAGES[status!]} Comentario: ${feedback}` : STATUS_MESSAGES[status!],
								eventId,
								applicationId: appId,
							},
						},
					}),
				]
			: []),
	]);

	if (status !== undefined && session.role === "admin" && event.coachId !== session.userId) {
		await logAdminAction({
			adminId: session.userId,
			action: "application_status_change",
			targetType: "application",
			targetId: appId,
			metadata: { eventId, studentId: application.studentId, newStatus: status },
		});
	}

	return Response.json({ ok: true, data: updated });
}

