import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "../../../../app/generated/prisma/client";
import { prisma } from "../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

const EDITABLE_TEXT_FIELDS = [
  "name",
  "category",
  "website",
  "operatingCountry",
  "basedCountry",
  "header",
  "description",
  "tracks",
  "video",
  "image1",
  "image2",
  "image3",
  "image4",
  "impacto",
  "data1",
  "data2",
  "data3",
  "dataImage1",
  "dataImage2",
  "dataImage3",
  "quote",
  "quoteName",
  "quotePhoto"
] as const;

type EditableField = (typeof EDITABLE_TEXT_FIELDS)[number];

const REQUIRED_FIELDS: EditableField[] = ["name", "header"];

function parseStartupId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function trimOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

async function findOwnerOrGuest(startupId: number, identity: { userId?: string; email?: string; googleSub?: string }) {
  const candidateIds = new Set<string>();
  if (identity.userId) candidateIds.add(identity.userId);

  const email = identity.email?.trim().toLowerCase();
  if (email) {
    const byEmail = await prisma.accountUser.findUnique({ where: { email } });
    if (byEmail) candidateIds.add(byEmail.id);
  }
  if (identity.googleSub) {
    const bySub = await prisma.accountUser.findUnique({ where: { googleSub: identity.googleSub } });
    if (bySub) candidateIds.add(bySub.id);
  }

  if (candidateIds.size === 0) return null;
  return prisma.startupMembership.findFirst({
    where: { startupId, userId: { in: Array.from(candidateIds) } }
  });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id: rawId } = await params;
  const id = parseStartupId(rawId);
  if (!id) return NextResponse.json({ error: "Startup inválida" }, { status: 400 });

  const startup = await prisma.startup.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          user: { select: { id: true, name: true, email: true, picture: true } }
        }
      }
    }
  });

  if (!startup) return NextResponse.json({ error: "Startup no encontrada" }, { status: 404 });

  return NextResponse.json({ startup });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: rawId } = await params;
  const id = parseStartupId(rawId);
  if (!id) return NextResponse.json({ error: "Startup inválida" }, { status: 400 });

  const body = (await req.json()) as {
    userId?: string;
    email?: string;
    googleSub?: string;
    fields?: Partial<Record<EditableField, string | null>>;
  };

  const membership = await findOwnerOrGuest(id, body);
  if (!membership || membership.role !== "OWNER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const incoming = body.fields ?? {};
  const data: Prisma.StartupUpdateInput = {};

  for (const key of EDITABLE_TEXT_FIELDS) {
    if (!(key in incoming)) continue;
    const value = trimOrNull(incoming[key]);
    if (REQUIRED_FIELDS.includes(key) && !value) {
      return NextResponse.json({ error: `Campo requerido: ${key}` }, { status: 400 });
    }
    if (key === "name" || key === "header") {
      if (value !== null) data[key] = value;
    } else {
      data[key] = value;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  }

  const startup = await prisma.startup.update({
    where: { id },
    data,
    include: {
      memberships: {
        include: {
          user: { select: { id: true, name: true, email: true, picture: true } }
        }
      }
    }
  });

  return NextResponse.json({ startup });
}
