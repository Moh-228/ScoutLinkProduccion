import { randomUUID } from "crypto";

import { verifySession } from "@/lib/auth";
import { validatePdfFile } from "@/lib/pdf-upload";
import { uploadPdfToS3 } from "@/lib/s3";

const ALLOWED_KINDS = new Set(["inscription-proof", "medical-insurance", "coach-certification"]);

export async function POST(request: Request) {
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return Response.json({ ok: false, message: "Solicitud inválida." }, { status: 400 });
	}

	const file = formData.get("file");
	const kind = String(formData.get("kind") ?? "");

	if (!(file instanceof File)) {
		return Response.json({ ok: false, message: "Selecciona un archivo." }, { status: 400 });
	}
	if (!ALLOWED_KINDS.has(kind)) {
		return Response.json({ ok: false, message: "Tipo de documento inválido." }, { status: 400 });
	}

	const validated = await validatePdfFile(file);
	if (!validated.ok) {
		return Response.json({ ok: false, message: validated.message }, { status: 400 });
	}

	const key = `documents/${session.userId}/${kind}/${randomUUID()}.pdf`;

	try {
		await uploadPdfToS3(key, validated.buffer);
	} catch (err) {
		console.error("[uploads/document]", err);
		return Response.json({ ok: false, message: "No se pudo subir el archivo." }, { status: 500 });
	}

	return Response.json({ ok: true, data: { key } });
}
