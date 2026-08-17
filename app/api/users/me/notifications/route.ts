import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificationPreferencesSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
	const session = await verifySession();
	if (!session || (session.role !== "student" && session.role !== "coach")) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = notificationPreferencesSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 },
		);
	}

	await prisma.user.update({
		where: { id: session.userId },
		data: {
			notificationsEnabled: parsed.data.notificationsEnabled,
			notificationPreferences: parsed.data.preferences as never,
		},
	});

	return Response.json({ ok: true });
}
