import { verifySession } from "@/lib/auth";
import { createNotificationIfEnabled } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

/**
 * Reveals a user's institutional/contact email only when explicitly requested
 * via "Contactar", and only if that user's privacy setting allows it.
 */
export async function GET(_request: Request, { params }: Props) {
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	const { id } = await params;

	const target = await prisma.user.findUnique({
		where: { id },
		select: {
			email: true,
			role: true,
			contactEmailVisible: true,
			studentProfile: { select: { fullName: true } },
			coachProfile: { select: { displayName: true } },
		},
	});

	if (!target) {
		return Response.json({ ok: false, message: "Usuario no encontrado." }, { status: 404 });
	}

	if (target.role === "student" && session.role !== "coach" && session.role !== "admin") {
		return Response.json({ ok: false, message: "Sin permiso para contactar a este usuario." }, { status: 403 });
	}

	if (!target.contactEmailVisible) {
		return Response.json({
			ok: false,
			message: "Este usuario no comparte su correo de contacto.",
		});
	}

	if (id !== session.userId) {
		await createNotificationIfEnabled({
			userId: id,
			type: "contact_reveal",
			prefKey: "contactInteractions",
			payload: {
				title: "Alguien te contactó",
				message: "Un usuario vio tu correo de contacto a través de la opción \"Contactar\".",
			},
		});
	}

	return Response.json({ ok: true, data: { email: target.email } });
}
