type ImageKind = "image/jpeg" | "image/png" | "image/webp";

const MAGIC_BYTES: { contentType: ImageKind; extension: string; bytes: number[] }[] = [
	{ contentType: "image/jpeg", extension: "jpg", bytes: [0xff, 0xd8, 0xff] },
	{ contentType: "image/png", extension: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
	{ contentType: "image/webp", extension: "webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF" (WEBP checked separately below)
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type ImageValidationResult =
	| { ok: true; buffer: Buffer; contentType: ImageKind; extension: string }
	| { ok: false; message: string };

// Trusts neither the file extension nor the client-reported MIME type; checks the actual bytes.
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
	if (file.size === 0) {
		return { ok: false, message: "El archivo está vacío." };
	}
	if (file.size > MAX_IMAGE_SIZE_BYTES) {
		return { ok: false, message: "La imagen no puede pesar más de 5 MB." };
	}

	const buffer = Buffer.from(await file.arrayBuffer());

	for (const candidate of MAGIC_BYTES) {
		const header = buffer.subarray(0, candidate.bytes.length);
		if (header.equals(Buffer.from(candidate.bytes))) {
			if (candidate.contentType === "image/webp" && buffer.subarray(8, 12).toString("latin1") !== "WEBP") {
				continue;
			}
			return { ok: true, buffer, contentType: candidate.contentType, extension: candidate.extension };
		}
	}

	return { ok: false, message: "La imagen debe ser JPG, PNG o WEBP." };
}
