import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { interestedSportsSchema } from "@/lib/validations";

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

	const parsed = interestedSportsSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 },
		);
	}

	await prisma.studentProfile.update({
		where: { userId: session.userId },
		data: { interestedSports: parsed.data.sports },
	});

	return Response.json({ ok: true });
}
