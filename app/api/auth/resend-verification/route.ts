import { createHash, randomInt } from "crypto";

import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const { email } = await request.json();

		if (!email || typeof email !== "string") {
			return Response.json({ ok: false, message: "Correo inválido." }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, isActive: true, emailVerified: true },
		});

		// Always respond success to prevent email enumeration
		if (!user || !user.isActive || user.emailVerified) {
			return Response.json({ ok: true, message: "Si corresponde, recibirás un nuevo código en tu correo." });
		}

		// Delete existing token and create a new one
		await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

		const code = String(randomInt(100000, 1000000));
		const codeHash = createHash("sha256").update(code).digest("hex");
		const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

		await prisma.emailVerificationToken.create({
			data: { userId: user.id, codeHash, expiresAt },
		});

		await sendVerificationEmail(email, code);

		return Response.json({ ok: true, message: "Se envió un nuevo código a tu correo." });
	} catch {
		return Response.json({ ok: false, message: "No se pudo reenviar el código." }, { status: 500 });
	}
}
