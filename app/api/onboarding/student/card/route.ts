import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentGeneralCardSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
	const session = await verifySession();

	if (!session || session.role !== "student") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = studentGeneralCardSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { heightCm, weightKg, phone, publicEmail, experienceLevel, isPublic, medicalInfo, documents } = parsed.data;

		const heightValue = heightCm === "" ? null : Number(heightCm) || null;
		const weightValue = weightKg === "" ? null : Number(weightKg) || null;
		const medicalInfoJson = (medicalInfo ?? {}) as Prisma.InputJsonValue;
		const documentsJson = (documents ?? {}) as Prisma.InputJsonValue;

		await prisma.studentGeneralCard.upsert({
			where: { studentId: session.userId },
			update: {
				heightCm: heightValue,
				weightKg: weightValue,
				phone: phone || null,
				publicEmail: publicEmail || null,
				experienceLevel: experienceLevel ?? null,
				isPublic,
				medicalInfo: medicalInfoJson,
				documents: documentsJson,
			},
			create: {
				studentId: session.userId,
				heightCm: heightValue,
				weightKg: weightValue,
				phone: phone || null,
				publicEmail: publicEmail || null,
				experienceLevel: experienceLevel ?? null,
				isPublic,
				medicalInfo: medicalInfoJson,
				documents: documentsJson,
			},
		});

		return Response.json({ ok: true });
	} catch (err) {
		console.error("[general card]", err);
		return Response.json({ ok: false, message: "No se pudo guardar la ficha." }, { status: 500 });
	}
}
