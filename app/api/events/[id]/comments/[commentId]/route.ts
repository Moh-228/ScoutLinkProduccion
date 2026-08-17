import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations";

type Props = { params: Promise<{ id: string; commentId: string }> };

export async function PATCH(request: Request, { params }: Props) {
	const { id: eventId, commentId } = await params;
	const session = await verifySession();
	if (!session) return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });

	const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { authorId: true, eventId: true } });
	if (!comment || comment.eventId !== eventId) {
		return Response.json({ ok: false, message: "Comentario no encontrado." }, { status: 404 });
	}

	if (comment.authorId !== session.userId) {
		return Response.json({ ok: false, message: "Solo puedes editar tus propios comentarios." }, { status: 403 });
	}

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

	const updated = await prisma.comment.update({
		where: { id: commentId },
		data: { content: parsed.data.content },
	});

	return Response.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: Props) {
	const { id: eventId, commentId } = await params;
	const session = await verifySession();
	if (!session) return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });

	const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { authorId: true, eventId: true } });
	if (!comment || comment.eventId !== eventId) {
		return Response.json({ ok: false, message: "Comentario no encontrado." }, { status: 404 });
	}

	if (comment.authorId !== session.userId && session.role !== "admin") {
		return Response.json({ ok: false, message: "Solo puedes eliminar tus propios comentarios." }, { status: 403 });
	}

	await prisma.comment.delete({ where: { id: commentId } });

	return Response.json({ ok: true });
}
