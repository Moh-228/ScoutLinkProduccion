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
			studentProfile: { select: { fullName: true, school: true, favoriteSport: true } },
			coachProfile: { select: { displayName: true, academicUnit: true } },
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
		},
	});
}
