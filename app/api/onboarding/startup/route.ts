import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../../../lib/auth-session";
import { prisma } from "../../../../lib/prisma";

type IdentityFields = {
  userId?: string;
  email?: string;
  googleSub?: string;
  name?: string;
  picture?: string;
};

type OnboardingBody =
  | (IdentityFields & {
      mode: "create";
      startupName?: string;
      category?: string;
      country?: string;
      basedCountry?: string;
      website?: string;
      oneLiner?: string;
      description?: string;
      impact?: string;
      track?: string;
      video?: string;
      data1?: string;
      data2?: string;
      data3?: string;
      dataImage1?: string;
      dataImage2?: string;
      dataImage3?: string;
      quote?: string;
      quoteName?: string;
      coverUrl?: string;
      image2Url?: string;
      quotePhotoUrl?: string;
      logoUrl?: string;
    })
  | (IdentityFields & {
      mode: "join";
      startupId?: number;
      inviteCode?: string;
    });

async function resolveAccountUser(identity: IdentityFields) {
  if (identity.userId) {
    const byId = await prisma.accountUser.findUnique({ where: { id: identity.userId } });
    if (byId) return byId;
  }

  const email = identity.email?.trim().toLowerCase();
  if (email) {
    const byEmail = await prisma.accountUser.findUnique({ where: { email } });
    if (byEmail) return byEmail;
  }

  if (identity.googleSub) {
    const bySub = await prisma.accountUser.findUnique({ where: { googleSub: identity.googleSub } });
    if (bySub) return bySub;
  }

  if (email && identity.name?.trim()) {
    return prisma.accountUser.create({
      data: {
        email,
        name: identity.name.trim(),
        googleSub: identity.googleSub ?? null,
        picture: identity.picture ?? null
      }
    });
  }

  return null;
}

function cleanOptional(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanWebsite(value: unknown) {
  const website = cleanOptional(value);
  if (!website) return null;
  return website.startsWith("http://") || website.startsWith("https://") ? website : `https://${website}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OnboardingBody;

    if (!body.userId && !body.email) {
      return NextResponse.json({ error: "Usuario requerido" }, { status: 400 });
    }

    const user = await resolveAccountUser(body);
    if (!user) {
      return NextResponse.json(
        { error: "Sesión expirada. Vuelve a iniciar sesión.", code: "USER_MISSING" },
        { status: 401 }
      );
    }

    if (body.mode === "create") {
      const name = body.startupName?.trim();
      if (!name || name.length < 2) {
        return NextResponse.json({ error: "Nombre de startup requerido" }, { status: 400 });
      }

      const existingStartup = await prisma.startup.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true }
      });

      if (existingStartup) {
        return NextResponse.json(
          { error: "Esa startup ya existe. Selecciónala en la pestaña de existente." },
          { status: 409 }
        );
      }

      const startup = await prisma.startup.create({
        data: {
          name,
          category: cleanOptional(body.category) ?? "Perfil en construcción",
          operatingCountry: cleanOptional(body.country),
          basedCountry: cleanOptional(body.basedCountry),
          website: cleanWebsite(body.website),
          tracks: cleanOptional(body.track) ?? cleanOptional(body.category),
          header: cleanOptional(body.oneLiner) ?? `${name} está preparando su perfil público.`,
          description:
            cleanOptional(body.description) ??
            cleanOptional(body.impact) ??
            "Perfil creado desde el onboarding de Natura500.",
          video: cleanOptional(body.video),
          impacto: cleanOptional(body.impact),
          data1: cleanOptional(body.data1),
          data2: cleanOptional(body.data2),
          data3: cleanOptional(body.data3),
          dataImage1: cleanOptional(body.dataImage1),
          dataImage2: cleanOptional(body.dataImage2),
          dataImage3: cleanOptional(body.dataImage3),
          quote: cleanOptional(body.quote),
          quoteName: cleanOptional(body.quoteName),
          image1: cleanOptional(body.coverUrl),
          image2: cleanOptional(body.image2Url),
          quotePhoto: cleanOptional(body.quotePhotoUrl) ?? cleanOptional(body.logoUrl)
        }
      });

      await prisma.startupMembership.create({
        data: {
          userId: user.id,
          startupId: startup.id,
          role: "OWNER"
        }
      });
    } else if (body.mode === "join") {
      if (!body.startupId) {
        return NextResponse.json({ error: "Selecciona una startup" }, { status: 400 });
      }

      const startup = await prisma.startup.findUnique({ where: { id: body.startupId } });
      if (!startup) return NextResponse.json({ error: "Startup no encontrada" }, { status: 404 });

      const owner = await prisma.startupMembership.findFirst({
        where: { startupId: startup.id, role: "OWNER" },
        select: { id: true }
      });

      await prisma.startupMembership.upsert({
        where: {
          userId_startupId: {
            userId: user.id,
            startupId: startup.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          startupId: startup.id,
          role: owner ? "GUEST" : "OWNER"
        }
      });
    } else {
      return NextResponse.json({ error: "Modo inválido" }, { status: 400 });
    }

    const session = await getAuthSession(user.id);
    return NextResponse.json({ user: session });
  } catch (error) {
    console.error("Startup onboarding failed", error);
    return NextResponse.json({ error: "No se pudo asociar la startup" }, { status: 500 });
  }
}
