const PDF_MAGIC_BYTES = "%PDF-";

export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type PdfValidationResult =
	| { ok: true; buffer: Buffer }
	| { ok: false; message: string };

// Trusts neither the file extension nor the client-reported MIME type; checks the actual bytes.
export async function validatePdfFile(file: File): Promise<PdfValidationResult> {
	if (file.size === 0) {
		return { ok: false, message: "El archivo está vacío." };
	}
	if (file.size > MAX_PDF_SIZE_BYTES) {
		return { ok: false, message: "El PDF no puede pesar más de 10 MB." };
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	if (buffer.subarray(0, PDF_MAGIC_BYTES.length).toString("latin1") !== PDF_MAGIC_BYTES) {
		return { ok: false, message: "El archivo debe ser un PDF válido." };
	}

	return { ok: true, buffer };
}
