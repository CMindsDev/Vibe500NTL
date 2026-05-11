import "dotenv/config";
import { uploadToR2, deleteFromR2, getR2PublicUrl } from "./lib/s3";

const TEST_KEY = `test/connection-test-${Date.now()}.txt`;
const TEST_CONTENT = `R2 connection test - ${new Date().toISOString()}`;

async function main() {
  console.log("=== Cloudflare R2 Test ===\n");

  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  console.log(`Account ID : ${accountId}`);
  console.log(`Bucket     : ${bucket}`);
  console.log(`Public URL : ${publicUrl}`);
  console.log(`Test key   : ${TEST_KEY}\n`);

  // 1. Upload
  console.log("▶ Uploading test file...");
  try {
    const url = await uploadToR2(TEST_KEY, TEST_CONTENT, "text/plain");
    console.log(`✅ Upload OK → ${url}\n`);
  } catch (err) {
    console.error("❌ Upload FAILED:", err);
    process.exit(1);
  }

  // 2. Verify public URL is accessible
  console.log("▶ Verifying public URL...");
  try {
    const publicFileUrl = getR2PublicUrl(TEST_KEY);
    const res = await fetch(publicFileUrl);
    if (res.ok) {
      const text = await res.text();
      console.log(`✅ Public URL OK [${res.status}] → "${text}"\n`);
    } else {
      console.warn(`⚠️  Public URL responded [${res.status}] — el bucket puede no ser público\n`);
    }
  } catch (err) {
    console.warn("⚠️  No se pudo verificar la URL pública (puede ser normal si el bucket es privado):", err);
  }

  // 3. Delete
  console.log("▶ Deleting test file...");
  try {
    await deleteFromR2(TEST_KEY);
    console.log("✅ Delete OK\n");
  } catch (err) {
    console.error("❌ Delete FAILED:", err);
    process.exit(1);
  }

  console.log("=== R2 Test PASSED ✅ ===");
}

main();
