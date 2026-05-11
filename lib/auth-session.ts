import { prisma } from "./prisma";
import type { AuthStartup, AuthUser, StartupRole } from "./types";

type MembershipForSession = {
  role: StartupRole;
  startup: {
    id: number;
    name: string;
    category: string | null;
    operatingCountry: string | null;
    basedCountry: string | null;
    image1: string | null;
    quotePhoto: string | null;
  };
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "startup";
}

function mapMembership(membership: MembershipForSession): AuthStartup {
  const startup = membership.startup;

  return {
    id: String(startup.id),
    name: startup.name,
    role: membership.role,
    slug: slugify(startup.name),
    category: startup.category ?? undefined,
    country: startup.operatingCountry ?? startup.basedCountry ?? undefined,
    image: startup.image1 ?? startup.quotePhoto ?? undefined
  };
}

export async function getAuthSession(userId: string): Promise<AuthUser | null> {
  const user = await prisma.accountUser.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          startup: {
            select: {
              id: true,
              name: true,
              category: true,
              operatingCountry: true,
              basedCountry: true,
              image1: true,
              quotePhoto: true
            }
          }
        }
      }
    }
  });

  if (!user) return null;

  const memberships = user.memberships
    .map(mapMembership)
    .sort((left, right) => Number(right.role === "OWNER") - Number(left.role === "OWNER"));

  return {
    id: user.id,
    googleSub: user.googleSub ?? undefined,
    name: user.name,
    email: user.email,
    picture: user.picture ?? undefined,
    activeStartup: memberships[0],
    memberships,
    needsStartupOnboarding: memberships.length === 0
  };
}