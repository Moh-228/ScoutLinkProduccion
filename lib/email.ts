import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "ScoutLink <onboarding@resend.dev>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
	await resend.emails.send({
		from: FROM,
		to: email,
		subject: "Verifica tu cuenta en ScoutLink",
		html: `
			<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
				<h2 style="color:#18181b;margin-bottom:8px">Verifica tu correo electrónico</h2>
				<p style="color:#52525b;margin-bottom:24px">
					Usa el siguiente código para activar tu cuenta. Expira en <strong>15 minutos</strong>.
				</p>
				<div style="font-size:40px;font-weight:800;letter-spacing:12px;text-align:center;
					padding:24px;background:#f4f4f5;border-radius:12px;margin-bottom:24px;color:#18181b">
					${code}
				</div>
				<p style="color:#a1a1aa;font-size:13px">
					Si no creaste una cuenta en ScoutLink, puedes ignorar este correo.
				</p>
			</div>
		`,
	});
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
	const resetLink = `${BASE_URL}/auth/reset-password?token=${token}`;

	await resend.emails.send({
		from: FROM,
		to: email,
		subject: "Recupera tu contraseña en ScoutLink",
		html: `
			<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
				<h2 style="color:#18181b;margin-bottom:8px">Restablecer contraseña</h2>
				<p style="color:#52525b;margin-bottom:24px">
					Haz clic en el botón para restablecer tu contraseña. El enlace expira en <strong>1 hora</strong>.
				</p>
				<a href="${resetLink}"
					style="display:inline-block;padding:12px 28px;background:#18181b;color:#ffffff;
					text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;margin-bottom:20px">
					Restablecer contraseña
				</a>
				<p style="color:#71717a;font-size:13px;word-break:break-all">
					O copia este enlace en tu navegador:<br/>
					<a href="${resetLink}" style="color:#3b82f6">${resetLink}</a>
				</p>
				<p style="color:#a1a1aa;font-size:13px;margin-top:16px">
					Si no solicitaste esto, puedes ignorar este correo.
				</p>
			</div>
		`,
	});
}
