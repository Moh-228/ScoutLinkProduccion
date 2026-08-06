import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentSpecializedCardSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
	const session = await verifySession();

	if (!session || session.role !== "student") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = studentSpecializedCardSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { sport, data } = parsed.data;
		const jsonData = data as Prisma.InputJsonValue;

		await prisma.studentSpecializedCard.upsert({
			where: { studentId_sport: { studentId: session.userId, sport } },
			update: { data: jsonData },
			create: { studentId: session.userId, sport, data: jsonData },
		});

		return Response.json({ ok: true });
	} catch (err) {
		console.error("[specialized card]", err);
		return Response.json({ ok: false, message: "No se pudo guardar la ficha." }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	const session = await verifySession();

	if (!session || session.role !== "student") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const parsedSport = studentSpecializedCardSchema.shape.sport.safeParse(searchParams.get("sport"));

	if (!parsedSport.success) {
		return Response.json({ ok: false, message: "Deporte inválido." }, { status: 400 });
	}

	await prisma.studentSpecializedCard.deleteMany({
		where: { studentId: session.userId, sport: parsedSport.data },
	});

	return Response.json({ ok: true });
}
