import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

type ProfileBody = {
  userId?: string;
  picture?: string | null;
};

function cleanPicture(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return undefined;
  return trimmed;
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as ProfileBody;
    const userId = body.userId?.trim();
    const picture = cleanPicture(body.picture);

    if (!userId) {
      return NextResponse.json({ error: "Usuario requerido" }, { status: 400 });
    }

    if (picture === undefined) {
      return NextResponse.json({ error: "Imagen inválida" }, { status: 400 });
    }

    await prisma.accountUser.update({
      where: { id: userId },
      data: { picture }
    });

    const session = await getAuthSession(userId);
    if (!session) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user: session });
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json({ error: "No se pudo actualizar el perfil" }, { status: 500 });
  }
}
