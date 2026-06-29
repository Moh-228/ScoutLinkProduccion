import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const users = await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			email: true,
			role: true,
			isActive: true,
			onboardingCompleted: true,
			createdAt: true,
			studentProfile: { select: { fullName: true } },
			coachProfile: { select: { displayName: true } },
		},
	});

	return Response.json({ ok: true, data: users });
}
