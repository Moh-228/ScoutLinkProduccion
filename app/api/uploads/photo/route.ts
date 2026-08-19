import { randomUUID } from "crypto";

import { verifySession } from "@/lib/auth";
import { validateImageFile } from "@/lib/image-upload";
import { uploadImageToS3 } from "@/lib/s3";

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
	if (!(file instanceof File)) {
		return Response.json({ ok: false, message: "Selecciona una imagen." }, { status: 400 });
	}

	const validated = await validateImageFile(file);
	if (!validated.ok) {
		return Response.json({ ok: false, message: validated.message }, { status: 400 });
	}

	const key = `photos/${session.userId}/${randomUUID()}.${validated.extension}`;

	try {
		await uploadImageToS3(key, validated.buffer, validated.contentType);
	} catch (err) {
		console.error("[uploads/photo]", err);
		return Response.json({ ok: false, message: "No se pudo subir la foto." }, { status: 500 });
	}

	return Response.json({ ok: true, data: { key } });
}
