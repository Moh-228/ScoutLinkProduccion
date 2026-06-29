import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coachCardSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function PATCH(request: Request) {
	const session = await verifySession();

	if (!session || session.role !== "coach") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = coachCardSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const hasCategories = parsed.data.categories && parsed.data.categories.length > 0;

		await prisma.coachProfile.update({
			where: { userId: session.userId },
			data: {
				certifications: parsed.data.certifications || null,
				experience: parsed.data.experience || null,
				yearsExperience:
					parsed.data.yearsExperience === "" || parsed.data.yearsExperience === undefined
						? null
						: Number(parsed.data.yearsExperience),
				...(hasCategories
					? { categories: parsed.data.categories as Prisma.InputJsonValue }
					: { categories: Prisma.DbNull }),
				achievements: parsed.data.achievements || null,
			},
		});

		return Response.json({ ok: true });
	} catch (err) {
		console.error("[coach card]", err);
		return Response.json({ ok: false, message: "No se pudo guardar la ficha." }, { status: 500 });
	}
}
