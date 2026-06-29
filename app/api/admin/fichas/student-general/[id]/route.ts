import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;

	const card = await prisma.studentGeneralCard.findUnique({ where: { id }, select: { id: true } });
	if (!card) {
		return Response.json({ ok: false, message: "Ficha no encontrada." }, { status: 404 });
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json() as Record<string, unknown>;
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const allowed = ["heightCm", "weightKg", "phone", "publicEmail", "experienceLevel", "isPublic"] as const;
	const data: Record<string, unknown> = {};
	for (const key of allowed) {
		if (key in body) data[key] = body[key] === "" ? null : body[key];
	}
	if (Object.keys(data).length === 0) {
		return Response.json({ ok: false, message: "Sin campos válidos para actualizar." }, { status: 400 });
	}

	const updated = await prisma.studentGeneralCard.update({ where: { id }, data });
	return Response.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;

	const card = await prisma.studentGeneralCard.findUnique({ where: { id } });
	if (!card) {
		return Response.json({ ok: false, message: "Ficha no encontrada." }, { status: 404 });
	}

	await prisma.studentGeneralCard.delete({ where: { id } });

	return Response.json({ ok: true, message: "Ficha general eliminada." });
}
