import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const SIGNED_URL_TTL_SECONDS = 300;

let client: S3Client | null = null;

function getClient() {
	if (client) return client;

	const region = process.env.AWS_REGION;
	if (!region) throw new Error("AWS_REGION no está configurado.");

	client = new S3Client({ region });
	return client;
}

function getBucket() {
	const bucket = process.env.AWS_S3_BUCKET_NAME;
	if (!bucket) throw new Error("AWS_S3_BUCKET_NAME no está configurado.");
	return bucket;
}

export async function uploadPdfToS3(key: string, body: Buffer) {
	await getClient().send(
		new PutObjectCommand({
			Bucket: getBucket(),
			Key: key,
			Body: body,
			ContentType: "application/pdf",
		}),
	);
}

export async function uploadImageToS3(key: string, body: Buffer, contentType: string) {
	await getClient().send(
		new PutObjectCommand({
			Bucket: getBucket(),
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);
}

export async function deleteObjectFromS3(key: string) {
	await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

// Documents are private in S3; callers must be authorized before requesting this URL.
export async function getSignedDocumentUrl(key: string) {
	const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
	return getSignedUrl(getClient(), command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}

// Photos are private in S3 too; served only to signed-in users through /api/files/photo.
export async function getSignedPhotoUrl(key: string) {
	const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
	return getSignedUrl(getClient(), command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}
