import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const verifications = await prisma.coachVerification.findMany({
		orderBy: { createdAt: "asc" },
		include: {
			coach: {
				select: { id: true, email: true, coachProfile: { select: { displayName: true } } },
			},
		},
	});

	return Response.json({ ok: true, data: verifications });
}
