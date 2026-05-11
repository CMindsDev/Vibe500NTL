import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const id = Number(req.nextUrl.searchParams.get("id") ?? "");

  const startups = await prisma.startup.findMany({
    where: Number.isInteger(id) && id > 0
      ? { id }
      : q
        ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { operatingCountry: { contains: q, mode: "insensitive" } }
          ]
        }
        : undefined,
    select: {
      id: true,
      name: true,
      category: true,
      operatingCountry: true,
      basedCountry: true,
      image1: true
    },
    orderBy: { name: "asc" },
    take: 12
  });

  return NextResponse.json({ startups });
}