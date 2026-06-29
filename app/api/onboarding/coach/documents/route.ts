import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coachDocumentsSchema } from "@/lib/validations";

export async function GET() {
	const session = await verifySession();

	if (!session || session.role !== "coach") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	const verifications = await prisma.coachVerification.findMany({
		where: { coachId: session.userId },
		select: { sport: true, documentUrl: true, status: true },
		orderBy: { sport: "asc" },
	});

	return Response.json({ ok: true, data: verifications });
}

export async function PATCH(request: Request) {
	const session = await verifySession();

	if (!session || session.role !== "coach") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = coachDocumentsSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		await prisma.$transaction(
			parsed.data.documents.map(({ sport, documentUrl }) =>
				prisma.coachVerification.update({
					where: { coachId_sport: { coachId: session.userId, sport } },
					data: { documentUrl },
				}),
			),
		);

		return Response.json({ ok: true });
	} catch {
		return Response.json({ ok: false, message: "No se pudo guardar los documentos." }, { status: 500 });
	}
}
