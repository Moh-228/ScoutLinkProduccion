import { z } from "zod";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createFavoriteSchema = z.object({
	targetType: z.enum(["event", "ficha"]),
	targetId: z.string().uuid("ID inválido."),
});

export async function POST(request: Request) {
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autenticado." }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = createFavoriteSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 },
		);
	}

	const { targetType, targetId } = parsed.data;

	const favorite = await prisma.favorite.upsert({
		where: { userId_targetType_targetId: { userId: session.userId, targetType, targetId } },
		update: {},
		create: { userId: session.userId, targetType, targetId },
	});

	return Response.json({ ok: true, data: favorite }, { status: 201 });
}
