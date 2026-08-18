import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DOCUMENT_URL_TTL_SECONDS = 300;

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

// Documents are private in S3; callers must be authorized before requesting this URL.
export async function getSignedDocumentUrl(key: string) {
	const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
	return getSignedUrl(getClient(), command, { expiresIn: DOCUMENT_URL_TTL_SECONDS });
}
