import { createHash, randomInt } from "crypto";

import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = registerSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{
					ok: false,
					message: "Datos de registro inválidos.",
					errors: parsed.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { email, password, role, fullName } = parsed.data;
		const passwordHash = await hash(password, 12);

		const user = await prisma.user.create({
			data: {
				email,
				passwordHash,
				role,
				...(role === "student"
					? { studentProfile: { create: { fullName } } }
					: { coachProfile: { create: { displayName: fullName } } }),
			},
			select: { id: true, email: true, role: true },
		});

		// Generate a 6-digit verification code
		const code = String(randomInt(100000, 1000000));
		const codeHash = createHash("sha256").update(code).digest("hex");
		const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

		await prisma.emailVerificationToken.create({
			data: { userId: user.id, codeHash, expiresAt },
		});

		// Send verification email — if it fails the user can request a resend from the verify page
		try {
			await sendVerificationEmail(email, code);
		} catch (emailError) {
			console.error("[email] Failed to send verification email:", emailError);
		}

		return Response.json(
			{ ok: true, message: "Cuenta creada. Revisa tu correo para verificar tu cuenta.", requiresVerification: true, email, role },
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
			return Response.json(
				{ ok: false, message: "El correo ya está registrado." },
				{ status: 409 },
			);
		}

		return Response.json(
			{ ok: false, message: "No se pudo completar el registro." },
			{ status: 500 },
		);
	}
}
