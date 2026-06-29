import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coachProfileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
	const session = await verifySession();

	if (!session || session.role !== "coach") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = coachProfileSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { displayName, academicUnit, phone, bio, sports } = parsed.data;

		await prisma.$transaction(async (tx) => {
			await tx.coachProfile.upsert({
				where: { userId: session.userId },
				update: { displayName, academicUnit: academicUnit || null, phone: phone || null, bio: bio || null, sports },
				create: {
					userId: session.userId,
					displayName,
					academicUnit: academicUnit || null,
					phone: phone || null,
					bio: bio || null,
					sports,
				},
			});

			// Create pending verification entries for each selected sport
			for (const sport of sports) {
				await tx.coachVerification.upsert({
					where: { coachId_sport: { coachId: session.userId, sport } },
					update: {},
					create: { coachId: session.userId, sport, status: "pending" },
				});
			}
		});

		return Response.json({ ok: true, data: { sports } });
	} catch {
		return Response.json({ ok: false, message: "No se pudo guardar el perfil." }, { status: 500 });
	}
}
