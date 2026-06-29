import { createHash, randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = forgotPasswordSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json({ ok: false, message: "Correo inválido." }, { status: 400 });
		}

		const { email } = parsed.data;
		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, isActive: true },
		});

		// Always respond success to prevent email enumeration
		if (!user || !user.isActive) {
			return Response.json({ ok: true, message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña." });
		}

		// Invalidate previous tokens for this user
		await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

		const token = randomBytes(32).toString("hex");
		const tokenHash = createHash("sha256").update(token).digest("hex");
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

		await prisma.passwordResetToken.create({
			data: { userId: user.id, tokenHash, expiresAt },
		});

		// TODO: Send reset email in production
		// resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`
		if (process.env.NODE_ENV !== "production") {
			console.log(`[DEV] Password reset token for ${email}: ${token}`);
		}

		return Response.json({
			ok: true,
			message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.",
			// DEV ONLY — remove when email provider is configured
			...(process.env.NODE_ENV !== "production" ? { devToken: token } : {}),
		});
	} catch {
		return Response.json({ ok: false, message: "No se pudo procesar la solicitud." }, { status: 500 });
	}
}
