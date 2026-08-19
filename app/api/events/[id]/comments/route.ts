import { verifySession } from "@/lib/auth";
import { createNotificationIfEnabled } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
	const { id: eventId } = await params;
	const session = await verifySession();
	if (!session) return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });

	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, title: true, coachId: true },
	});
	if (!event) return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = createCommentSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 },
		);
	}

	const { content, parentId } = parsed.data;

	let parent: { id: string; authorId: string; eventId: string } | null = null;
	if (parentId) {
		parent = await prisma.comment.findUnique({
			where: { id: parentId },
			select: { id: true, authorId: true, eventId: true },
		});
		if (!parent || parent.eventId !== eventId) {
			return Response.json({ ok: false, message: "Comentario a responder no encontrado." }, { status: 404 });
		}
	}

	const comment = await prisma.comment.create({
		data: { eventId, authorId: session.userId, content, parentId: parentId ?? null },
	});

	// Notify the original comment's author about the reply.
	if (parent && parent.authorId !== session.userId) {
		await createNotificationIfEnabled({
			userId: parent.authorId,
			type: "comment_reply",
			prefKey: "commentReplies",
			payload: {
				title: "Nueva respuesta a tu comentario",
				message: `Alguien respondió a tu comentario en "${event.title}".`,
				eventId,
			},
		});
	}

	// Notify the event organizer about new activity on their event.
	if (event.coachId !== session.userId) {
		await createNotificationIfEnabled({
			userId: event.coachId,
			type: "event_comment",
			prefKey: "eventActivity",
			payload: {
				title: "Nuevo comentario en tu evento",
				message: `Hay un nuevo comentario en "${event.title}".`,
				eventId,
			},
		});
	}

	// Notify students who applied about activity on the event they follow.
	const applicants = await prisma.eventApplication.findMany({
		where: { eventId, studentId: { not: session.userId } },
		select: { studentId: true },
		distinct: ["studentId"],
	});
	for (const applicant of applicants) {
		await createNotificationIfEnabled({
			userId: applicant.studentId,
			type: "event_comment",
			prefKey: "postActivity",
			payload: {
				title: "Nueva actividad en una publicación",
				message: `Hay un nuevo comentario en "${event.title}".`,
				eventId,
			},
		});
	}

	return Response.json({ ok: true, data: comment }, { status: 201 });
}
