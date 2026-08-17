import { verifySession } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { updateEventStatusSchema } from "@/lib/validations";

type Props = { params: Promise<{ id: string }> };

/** Lets the event organizer (or an admin) open/close applications without editing the full event form. */
export async function PATCH(request: Request, { params }: Props) {
	const { id } = await params;
	const session = await verifySession();
	if (!session) return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });

	const event = await prisma.event.findUnique({ where: { id }, select: { coachId: true, title: true, status: true } });
	if (!event) return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });

	if (event.coachId !== session.userId && session.role !== "admin") {
		return Response.json({ ok: false, message: "Sin permiso sobre este evento." }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = updateEventStatusSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ ok: false, message: "Estado inválido." }, { status: 400 });
	}

	const updated = await prisma.event.update({
		where: { id },
		data: { status: parsed.data.status },
		select: { id: true, status: true },
	});

	if (session.role === "admin" && event.coachId !== session.userId) {
		await logAdminAction({
			adminId: session.userId,
			action: parsed.data.status === "open" ? "event_reopened" : "event_closed",
			targetType: "event",
			targetId: id,
			metadata: { title: event.title, fromStatus: event.status, toStatus: parsed.data.status },
		});
	}

	return Response.json({ ok: true, data: updated });
}
