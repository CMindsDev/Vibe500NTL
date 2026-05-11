import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const startups = await prisma.startup.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { operatingCountry: { contains: q, mode: "insensitive" } },
            { tracks: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      image1: true,
      image2: true,
      quotePhoto: true,
      operatingCountry: true,
      tracks: true,
      category: true,
    },
    orderBy: { name: "asc" },
    take: 60,
  });

  return NextResponse.json(startups.map(startup => ({
    id: startup.id,
    name: startup.name,
    image1: startup.image1 ?? startup.image2 ?? startup.quotePhoto,
    operatingCountry: startup.operatingCountry,
    tracks: startup.tracks,
    category: startup.category,
  })));
}
