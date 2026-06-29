import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;
	const body = await request.json() as Record<string, unknown>;

	const allowed = ["title", "shortDescription", "longDescription", "status", "locationText", "startAt", "endAt", "capacity"] as const;
	const data: Record<string, unknown> = {};
	for (const key of allowed) {
		if (key in body) data[key] = body[key];
	}

	if (Object.keys(data).length === 0) {
		return Response.json({ ok: false, message: "Sin cambios validos." }, { status: 400 });
	}

	const updated = await prisma.event.update({
		where: { id },
		data,
		select: { id: true, title: true, status: true, type: true, sport: true },
	});

	return Response.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;

	const event = await prisma.event.findUnique({ where: { id }, select: { id: true } });
	if (!event) {
		return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });
	}

	await prisma.event.delete({ where: { id } });

	return Response.json({ ok: true, message: "Evento eliminado." });
}
