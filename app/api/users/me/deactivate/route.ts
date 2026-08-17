import { deleteSession, verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Self-service account deactivation. Access is blocked at login until an admin reactivates the account. */
export async function POST() {
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	await prisma.user.update({
		where: { id: session.userId },
		data: { isActive: false },
	});

	await deleteSession();

	return Response.json({ ok: true, message: "Tu cuenta ha sido desactivada." });
}
