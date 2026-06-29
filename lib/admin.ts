import { verifySession } from "@/lib/auth";

/** Returns the session if caller is admin, or null otherwise. */
export async function requireAdmin() {
	const session = await verifySession();
	if (!session || session.role !== "admin") return null;
	return session;
}
