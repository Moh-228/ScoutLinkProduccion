import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentProfileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
	const session = await verifySession();

	if (!session || session.role !== "student") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = studentProfileSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { fullName, birthDate, school, semester, gender, favoriteSport, socialLink } = parsed.data;

		const semesterValue = semester === "" ? null : Number(semester) || null;

		await prisma.studentProfile.upsert({
			where: { userId: session.userId },
			update: {
				fullName,
				birthDate: birthDate ? new Date(birthDate) : null,
				school: school || null,
				semester: semesterValue,
				gender: gender || null,
				favoriteSport: favoriteSport ?? null,
				socialLink: socialLink || null,
			},
			create: {
				userId: session.userId,
				fullName,
				birthDate: birthDate ? new Date(birthDate) : null,
				school: school || null,
				semester: semesterValue,
				gender: gender || null,
				favoriteSport: favoriteSport ?? null,
				socialLink: socialLink || null,
			},
		});

		return Response.json({ ok: true });
	} catch {
		return Response.json({ ok: false, message: "No se pudo guardar el perfil." }, { status: 500 });
	}
}
