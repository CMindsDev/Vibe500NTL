import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/s3";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"]);

function safeExt(contentType: string, name: string) {
  const fromName = name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg"
  };
  return map[contentType] ?? "bin";
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const scopeRaw = form.get("scope");
    const ownerRaw = form.get("owner");

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Archivo demasiado grande (máx 6MB)" }, { status: 413 });
    }
    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED.has(contentType)) {
      return NextResponse.json({ error: "Formato no soportado" }, { status: 415 });
    }

    const scope = typeof scopeRaw === "string" && scopeRaw.trim() ? scopeRaw.trim() : "onboarding";
    const owner =
      typeof ownerRaw === "string" && ownerRaw.trim()
        ? ownerRaw.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "anon"
        : "anon";
    const originalName = (file as File).name ?? "asset";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60) || "asset";
    const key = `ntl500/${scope}/${owner}/${Date.now()}-${safeName.replace(/\.[^.]+$/, "")}.${safeExt(contentType, safeName)}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, buffer, contentType);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Upload failed", error);
    return NextResponse.json({ error: "No se pudo subir el archivo" }, { status: 500 });
  }
}
