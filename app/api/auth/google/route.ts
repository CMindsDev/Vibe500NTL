import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../../../lib/auth-session";
import { prisma } from "../../../../lib/prisma";

type GoogleAuthBody = {
  googleSub?: string;
  name?: string;
  email?: string;
  picture?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GoogleAuthBody;
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim();

    if (!email || !name) {
      return NextResponse.json({ error: "Perfil de Google incompleto" }, { status: 400 });
    }

    const existingUser = await prisma.accountUser.findFirst({
      where: {
        OR: [
          { email },
          ...(body.googleSub ? [{ googleSub: body.googleSub }] : [])
        ]
      }
    });

    const user = existingUser
      ? await prisma.accountUser.update({
          where: { id: existingUser.id },
          data: {
            googleSub: body.googleSub ?? existingUser.googleSub,
            name,
            email,
            picture: body.picture ?? null
          }
        })
      : await prisma.accountUser.create({
          data: {
            googleSub: body.googleSub,
            name,
            email,
            picture: body.picture
          }
        });

    const session = await getAuthSession(user.id);
    return NextResponse.json({ user: session });
  } catch (error) {
    console.error("Google auth failed", error);
    return NextResponse.json({ error: "No se pudo iniciar sesión" }, { status: 500 });
  }
}