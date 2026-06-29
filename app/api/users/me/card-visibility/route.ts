import { z } from "zod";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ isPublic: z.boolean() });

export async function PATCH(request: Request) {
	const session = await verifySession();
	if (!session || session.role !== "student") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ ok: false, message: "Datos inválidos." }, { status: 400 });
	}

	const card = await prisma.studentGeneralCard.findUnique({
		where: { studentId: session.userId },
		select: { id: true },
	});

	if (!card) {
		return Response.json(
			{ ok: false, message: "Completa tu ficha general antes de hacerla pública." },
			{ status: 404 },
		);
	}

	await prisma.studentGeneralCard.update({
		where: { studentId: session.userId },
		data: { isPublic: parsed.data.isPublic },
	});

	return Response.json({ ok: true });
}
