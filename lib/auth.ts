import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
	const secret = process.env.AUTH_SECRET;
	if (!secret) throw new Error("AUTH_SECRET env var is not set");
	return new TextEncoder().encode(secret);
}

export type SessionPayload = {
	userId: string;
	email: string;
	role: "student" | "coach" | "admin";
	onboardingCompleted?: boolean;
};

export async function createSession(payload: SessionPayload) {
	const token = await new SignJWT(payload as unknown as Record<string, unknown>)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(`${SESSION_MAX_AGE}s`)
		.sign(getSecret());

	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_MAX_AGE,
	});
}

export async function verifySession(): Promise<SessionPayload | null> {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get(SESSION_COOKIE)?.value;
		if (!token) return null;

		const { payload } = await jwtVerify(token, getSecret());

		return {
			userId: payload.userId as string,
			email: payload.email as string,
			role: payload.role as SessionPayload["role"],
		};
	} catch {
		return null;
	}
}

export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE);
}
