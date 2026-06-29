import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const [generalCards, specializedCards, events] = await Promise.all([
		prisma.studentGeneralCard.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				student: { select: { id: true, email: true, studentProfile: { select: { fullName: true } } } },
			},
		}),
		prisma.studentSpecializedCard.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				student: { select: { id: true, email: true, studentProfile: { select: { fullName: true } } } },
			},
		}),
		prisma.event.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				coach: { select: { id: true, email: true, coachProfile: { select: { displayName: true } } } },
			},
		}),
	]);

	return Response.json({ ok: true, data: { generalCards, specializedCards, events } });
}
