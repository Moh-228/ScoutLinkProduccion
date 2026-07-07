import { createHash } from "crypto";

import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const { email, code } = await request.json();

		if (!email || !code || typeof code !== "string" || code.length !== 6) {
			return Response.json({ ok: false, message: "Datos inválidos." }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, role: true, isActive: true, emailVerified: true, onboardingCompleted: true },
		});

		if (!user || !user.isActive) {
			return Response.json({ ok: false, message: "Correo o código inválido." }, { status: 400 });
		}

		if (user.emailVerified) {
			return Response.json({ ok: false, message: "El correo ya fue verificado. Inicia sesión." }, { status: 400 });
		}

		const codeHash = createHash("sha256").update(code.trim()).digest("hex");

		const verificationToken = await prisma.emailVerificationToken.findFirst({
			where: { userId: user.id, codeHash },
		});

		if (!verificationToken) {
			return Response.json({ ok: false, message: "El código es incorrecto." }, { status: 400 });
		}

		if (verificationToken.expiresAt < new Date()) {
			await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });
			return Response.json({ ok: false, message: "El código expiró. Solicita uno nuevo." }, { status: 400 });
		}

		await prisma.$transaction([
			prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
			prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } }),
		]);

		await createSession({
			userId: user.id,
			email,
			role: user.role,
			onboardingCompleted: user.onboardingCompleted,
		});

		return Response.json({
			ok: true,
			message: "Correo verificado correctamente.",
			role: user.role,
			onboardingCompleted: user.onboardingCompleted,
		});
	} catch {
		return Response.json({ ok: false, message: "No se pudo verificar el código." }, { status: 500 });
	}
}
