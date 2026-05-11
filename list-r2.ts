import "dotenv/config";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const API_TOKEN = process.env.R2_API_TOKEN!;
const BUCKET = process.env.R2_BUCKET_NAME!;

type R2Object = {
  key: string;
  size: number;
  uploaded?: string;
  last_modified?: string;
};

type R2ListResponse = {
  result?: R2Object[] | {
    objects?: R2Object[];
  };
};

function getObjects(data: R2ListResponse): R2Object[] {
  if (Array.isArray(data.result)) return data.result;
  return data.result?.objects ?? [];
}

// Intentamos con prefijos comunes y también sin prefijo para ver todo
async function listObjects(prefix?: string): Promise<R2ListResponse> {
  const url = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects`,
  );
  if (prefix) url.searchParams.set("prefix", prefix);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });

  return (await res.json()) as R2ListResponse;
}

async function main() {
  console.log(`Bucket: ${BUCKET}\n`);

  // Probar distintos prefijos comunes
  const prefixes = ["ntl500/startups/", "ntl500/", "NTL500", "NTL-500", "ntl500", "ntl-500", ""];

  for (const prefix of prefixes) {
    const label = prefix === "" ? "(sin prefijo — todo el bucket)" : `prefijo "${prefix}"`;
    const data = await listObjects(prefix || undefined);

    const objects = getObjects(data);
    if (objects.length > 0) {
      console.log(`✅ ${label} → ${objects.length} objeto(s):`);
      objects.forEach((o) =>
        console.log(`   📄 ${o.key}  [${(o.size / 1024).toFixed(1)} KB]  ${o.uploaded ?? o.last_modified ?? ""}`),
      );
      console.log();
      if (prefix === "") break; // si listamos todo, no seguimos
    } else {
      console.log(`— ${label}: vacío`);
    }
  }
}

main();
