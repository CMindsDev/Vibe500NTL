// Cloudflare R2 via REST API directa (no AWS SDK)
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const API_TOKEN = process.env.R2_API_TOKEN!;
const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

const R2_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects`;

/**
 * Sube un objeto a Cloudflare R2.
 * Retorna la URL pública del objeto.
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType = "application/octet-stream",
): Promise<string> {
  const url = `${R2_BASE}/${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": contentType,
    },
    body: body as BodyInit,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed [${res.status}]: ${text}`);
  }

  return `${PUBLIC_URL}/${key}`;
}

/**
 * Elimina un objeto de Cloudflare R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const url = `${R2_BASE}/${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 delete failed [${res.status}]: ${text}`);
  }
}

/**
 * Retorna la URL pública de un objeto sin hacer ninguna llamada HTTP.
 */
export function getR2PublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

// Aliases para retrocompatibilidad con código que use los nombres anteriores
export const uploadToS3 = uploadToR2;
export const deleteFromS3 = deleteFromR2;
