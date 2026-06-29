import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autenticado." }, { status: 401 });
	}

	await prisma.notification.updateMany({
		where: { userId: session.userId, readAt: null },
		data: { readAt: new Date() },
	});

	return Response.json({ ok: true });
}
