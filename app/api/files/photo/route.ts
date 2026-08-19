import { verifySession } from "@/lib/auth";
import { getSignedPhotoUrl } from "@/lib/s3";

// Profile photos are visible to any signed-in user (shown across fichas, profiles, admin review).
export async function GET(request: Request) {
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	const key = new URL(request.url).searchParams.get("key");
	if (!key || !key.startsWith("photos/")) {
		return Response.json({ ok: false, message: "Foto inválida." }, { status: 400 });
	}

	try {
		const url = await getSignedPhotoUrl(key);
		return Response.redirect(url);
	} catch (err) {
		console.error("[files/photo]", err);
		return Response.json({ ok: false, message: "No se pudo obtener la foto." }, { status: 500 });
	}
}
