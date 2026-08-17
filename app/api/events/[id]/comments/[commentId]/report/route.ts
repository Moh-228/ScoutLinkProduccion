import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportCommentSchema } from "@/lib/validations";

type Props = { params: Promise<{ id: string; commentId: string }> };

/** Requires a valid, non-empty reason before flagging a comment for moderation. */
export async function POST(request: Request, { params }: Props) {
	const { id: eventId, commentId } = await params;
	const session = await verifySession();
	if (!session) return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });

	const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { authorId: true, eventId: true } });
	if (!comment || comment.eventId !== eventId) {
		return Response.json({ ok: false, message: "Comentario no encontrado." }, { status: 404 });
	}

	if (comment.authorId === session.userId) {
		return Response.json({ ok: false, message: "No puedes reportar tu propio comentario." }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = reportCommentSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: parsed.error.flatten().fieldErrors.reason?.[0] ?? "Motivo inválido.", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 },
		);
	}

	const existing = await prisma.commentReport.findUnique({
		where: { commentId_reporterId: { commentId, reporterId: session.userId } },
		select: { id: true },
	});
	if (existing) {
		return Response.json({ ok: false, message: "Ya reportaste este comentario." }, { status: 409 });
	}

	await prisma.commentReport.create({
		data: { commentId, reporterId: session.userId, reason: parsed.data.reason },
	});

	return Response.json({ ok: true, message: "Comentario reportado. Gracias por avisarnos." }, { status: 201 });
}
