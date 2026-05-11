import "dotenv/config";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const API_TOKEN = process.env.R2_API_TOKEN!;
const BUCKET = process.env.R2_BUCKET_NAME!;

async function main() {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects`,
    { headers: { Authorization: `Bearer ${API_TOKEN}` } },
  );
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main();
