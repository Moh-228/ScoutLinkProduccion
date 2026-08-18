import { verifySession } from "@/lib/auth";
import { getSignedDocumentUrl } from "@/lib/s3";

export async function GET(request: Request) {
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	const key = new URL(request.url).searchParams.get("key");
	if (!key || !key.startsWith("documents/")) {
		return Response.json({ ok: false, message: "Documento inválido." }, { status: 400 });
	}

	const ownerId = key.split("/")[1];
	if (session.role !== "admin" && session.userId !== ownerId) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 403 });
	}

	try {
		const url = await getSignedDocumentUrl(key);
		return Response.redirect(url);
	} catch (err) {
		console.error("[files/document]", err);
		return Response.json({ ok: false, message: "No se pudo obtener el documento." }, { status: 500 });
	}
}
