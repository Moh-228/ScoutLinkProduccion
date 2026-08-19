import { z } from "zod";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ photoUrl: z.string().min(1).max(500) });

/** Lets a student/coach change their profile photo without going through the full onboarding edit form. */
export async function PATCH(request: Request) {
	const session = await verifySession();
	if (!session || (session.role !== "student" && session.role !== "coach")) {
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

	if (session.role === "student") {
		const profile = await prisma.studentProfile.findUnique({ where: { userId: session.userId }, select: { userId: true } });
		if (!profile) {
			return Response.json({ ok: false, message: "Completa tu perfil antes de cambiar la foto." }, { status: 404 });
		}
		await prisma.studentProfile.update({ where: { userId: session.userId }, data: { photoUrl: parsed.data.photoUrl } });
	} else {
		const profile = await prisma.coachProfile.findUnique({ where: { userId: session.userId }, select: { userId: true } });
		if (!profile) {
			return Response.json({ ok: false, message: "Completa tu perfil antes de cambiar la foto." }, { status: 404 });
		}
		await prisma.coachProfile.update({ where: { userId: session.userId }, data: { photoUrl: parsed.data.photoUrl } });
	}

	return Response.json({ ok: true, data: { photoUrl: parsed.data.photoUrl } });
}
