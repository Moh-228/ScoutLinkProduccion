import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { createNotificationIfEnabled } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { moderateCommentSchema } from "@/lib/validations";

type Props = { params: Promise<{ commentId: string }> };

/** Removes reported content and records the moderation reason in the audit history. */
export async function DELETE(request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { commentId } = await params;

	const comment = await prisma.comment.findUnique({
		where: { id: commentId },
		select: {
			content: true,
			eventId: true,
			authorId: true,
			event: { select: { title: true } },
		},
	});
	if (!comment) {
		return Response.json({ ok: false, message: "Comentario no encontrado." }, { status: 404 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = moderateCommentSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: parsed.error.flatten().fieldErrors.reason?.[0] ?? "Motivo inválido." },
			{ status: 400 },
		);
	}

	await prisma.comment.delete({ where: { id: commentId } });

	await logAdminAction({
		adminId: session.userId,
		action: "comment_removed",
		targetType: "comment",
		targetId: commentId,
		reason: parsed.data.reason,
		metadata: { content: comment.content, eventId: comment.eventId, eventTitle: comment.event.title, authorId: comment.authorId },
	});

	if (comment.authorId !== session.userId) {
		await createNotificationIfEnabled({
			userId: comment.authorId,
			type: "comment_removed",
			prefKey: "moderationAlerts",
			payload: {
				title: "Comentario eliminado por moderación",
				message: `Tu comentario en "${comment.event.title}" fue reportado y eliminado por un administrador. Motivo: ${parsed.data.reason}`,
				eventId: comment.eventId,
			},
		});
	}

	return Response.json({ ok: true, message: "Comentario eliminado." });
}
