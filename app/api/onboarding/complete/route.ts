import { createSession, verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
	const session = await verifySession();

	if (!session) {
		return Response.json({ ok: false, message: "No autenticado." }, { status: 401 });
	}

	await prisma.user.update({
		where: { id: session.userId },
		data: { onboardingCompleted: true },
	});

	await createSession({ ...session, onboardingCompleted: true });

	return Response.json({ ok: true });
}
