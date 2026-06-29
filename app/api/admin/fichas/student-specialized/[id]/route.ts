import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;

	const card = await prisma.studentSpecializedCard.findUnique({ where: { id }, select: { id: true } });
	if (!card) {
		return Response.json({ ok: false, message: "Ficha especializada no encontrada." }, { status: 404 });
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json() as Record<string, unknown>;
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	// Only allow updating the `data` JSON field
	if (!("data" in body) || typeof body.data !== "object" || body.data === null) {
		return Response.json({ ok: false, message: "El campo 'data' es requerido y debe ser un objeto." }, { status: 400 });
	}

	const updated = await prisma.studentSpecializedCard.update({
		where: { id },
		data: { data: body.data as never },
	});
	return Response.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;

	const card = await prisma.studentSpecializedCard.findUnique({ where: { id } });
	if (!card) {
		return Response.json({ ok: false, message: "Ficha especializada no encontrada." }, { status: 404 });
	}

	await prisma.studentSpecializedCard.delete({ where: { id } });

	return Response.json({ ok: true, message: "Ficha especializada eliminada." });
}
