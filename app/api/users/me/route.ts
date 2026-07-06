import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const session = await verifySession();

	if (!session) {
		return Response.json(
			{ ok: false, data: null, message: "No autenticado." },
			{ status: 401 },
		);
	}

	const user = await prisma.user.findUnique({
		where: { id: session.userId },
		select: {
			id: true,
			email: true,
			role: true,
			isActive: true,
			createdAt: true,
			studentProfile: {
				select: {
					fullName: true,
					birthDate: true,
					school: true,
					semester: true,
					gender: true,
					favoriteSport: true,
					socialLink: true,
				},
			},
			coachProfile: {
				select: {
					displayName: true,
					academicUnit: true,
					phone: true,
					bio: true,
					sports: true,
				},
			},
			generalCard: {
				select: {
					heightCm: true,
					weightKg: true,
					phone: true,
					publicEmail: true,
					experienceLevel: true,
					isPublic: true,
					medicalInfo: true,
					documents: true,
				},
			},
		},
	});

	if (!user || !user.isActive) {
		return Response.json(
			{ ok: false, data: null, message: "Usuario no encontrado o inactivo." },
			{ status: 401 },
		);
	}

	return Response.json({
		ok: true,
		data: {
			id: user.id,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
			profile: user.studentProfile ?? user.coachProfile,
			generalCard: user.generalCard ?? null,
		},
	});
}
