import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { StartupProfileView, type StartupProfileData } from "@/components/StartupProfileView";
import { AuthControls, StartupNavItem } from "@/components/AuthControls";
import { startups as fallbackStartups, type Startup as FallbackStartup } from "@/lib/startups";
import { StartupOwnerActions } from "./StartupOwnerActions";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

type ReelStartup = {
  id: number | string;
  name: string;
  category: string | null;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  quotePhoto: string | null;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "startup";
}

function parseStartupId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getNextStartup(startups: ReelStartup[], currentId: number | string): ReelStartup | null {
  const candidates = startups.filter(startup => startup.id !== currentId);
  if (candidates.length === 0) return null;

  const currentIndex = startups.findIndex(startup => startup.id === currentId);
  if (currentIndex >= 0) {
    for (let offset = 1; offset < startups.length; offset += 1) {
      const next = startups[(currentIndex + offset) % startups.length];
      if (next.id !== currentId) return next;
    }
  }

  if (typeof currentId === "number") {
    return candidates.find(startup => typeof startup.id === "number" && startup.id > currentId) ?? candidates[0];
  }

  return candidates[0];
}

function getPreviousStartup(startups: ReelStartup[], currentId: number | string): ReelStartup | null {
  const candidates = startups.filter(startup => startup.id !== currentId);
  if (candidates.length === 0) return null;

  const currentIndex = startups.findIndex(startup => startup.id === currentId);
  if (currentIndex >= 0) {
    for (let offset = 1; offset < startups.length; offset += 1) {
      const previous = startups[(currentIndex - offset + startups.length) % startups.length];
      if (previous.id !== currentId) return previous;
    }
  }

  if (typeof currentId === "number") {
    return candidates.filter(startup => typeof startup.id === "number" && startup.id < currentId).at(-1) ?? candidates.at(-1) ?? null;
  }

  return candidates.at(-1) ?? null;
}

function mapFallbackProfile(startup: FallbackStartup): StartupProfileData {
  const metricText = startup.metrics.map(metric => `${metric.label}: ${metric.value} ${metric.detail}`);

  return {
    id: startup.id,
    name: startup.name,
    category: startup.category,
    website: null,
    operatingCountry: startup.country,
    basedCountry: startup.region,
    header: startup.headline,
    description: startup.description,
    tracks: startup.technologies.join(", "),
    video: null,
    image1: startup.image,
    image2: null,
    image3: null,
    image4: null,
    impacto: startup.description,
    data1: metricText[0] ?? null,
    data2: metricText[1] ?? null,
    data3: metricText[2] ?? null,
    dataImage1: null,
    dataImage2: null,
    dataImage3: null,
    quote: null,
    quoteName: null,
    quotePhoto: null
  };
}

function mapFallbackReel(startup: FallbackStartup): ReelStartup {
  return {
    id: startup.id,
    name: startup.name,
    category: startup.category,
    image1: startup.image,
    image2: null,
    image3: null,
    image4: null,
    quotePhoto: null
  };
}

export default async function StartupProfilePage({ params }: Params) {
  const { id } = await params;
  const routeId = decodeURIComponent(id);
  const numericId = parseStartupId(routeId);
  const routeSlug = slugify(routeId);
  const databaseStartups = await prisma.startup.findMany({
    orderBy: {
      id: "asc"
    },
    take: 60
  });
  const databaseStartup = numericId
    ? databaseStartups.find(startup => startup.id === numericId)
    : databaseStartups.find(startup => slugify(startup.name) === routeSlug);
  const fallbackStartup = databaseStartup
    ? null
    : fallbackStartups.find(startup => startup.id === routeId || slugify(startup.id) === routeSlug || slugify(startup.name) === routeSlug);

  if (!databaseStartup && !fallbackStartup) return notFound();

  const startup = databaseStartup ?? mapFallbackProfile(fallbackStartup!);
  const reelStartups: ReelStartup[] = databaseStartup
    ? databaseStartups.map(startup => ({
        id: startup.id,
        name: startup.name,
        category: startup.category,
        image1: startup.image1,
        image2: startup.image2,
        image3: startup.image3,
        image4: startup.image4,
        quotePhoto: startup.quotePhoto
      }))
    : fallbackStartups.map(mapFallbackReel);
  const currentStartupId = databaseStartup?.id ?? fallbackStartup!.id;
  const nextStartup = getNextStartup(reelStartups, currentStartupId);
  const previousStartup = getPreviousStartup(reelStartups, currentStartupId);

  return (
    <main className="startup-public-shell">
      <header className="topbar startup-public-topbar" aria-label="Navegación principal">
        <Link className="brand-mark" href="/" aria-label="500 explorar">
          <Image src="/assets/programs-logos/500.svg" alt="500" width={48} height={20} priority />
        </Link>
        <div className="topbar-divider" aria-hidden="true" />
        <nav className="topbar-nav">
          <Link className="nav-item" href="/">
            <Image src="/icons/explore.svg" alt="" width={14} height={16} />
            <span>Explorar</span>
          </Link>
          <Link className="nav-item" href="/conexiones">
            <span>Conexiones</span>
            <b className="nav-ai-badge">AI</b>
          </Link>
          <Link className="nav-item" href="/premio">
            <span>Premio</span>
          </Link>
          <StartupNavItem active />
        </nav>
        <div className="topbar-end">
          <AuthControls />
        </div>
      </header>

      <div className="startup-public-stage">
        <StartupProfileView
          data={startup}
          cinematic
          previousStartup={previousStartup ? {
            id: previousStartup.id,
            name: previousStartup.name,
            category: previousStartup.category,
            image: previousStartup.image1 ?? previousStartup.image2 ?? previousStartup.image3 ?? previousStartup.image4 ?? previousStartup.quotePhoto
          } : null}
          nextStartup={nextStartup ? {
            id: nextStartup.id,
            name: nextStartup.name,
            category: nextStartup.category,
            image: nextStartup.image1 ?? nextStartup.image2 ?? nextStartup.image3 ?? nextStartup.image4 ?? nextStartup.quotePhoto
          } : null}
        />
      </div>

      {databaseStartup ? <StartupOwnerActions startupId={databaseStartup.id} /> : null}
    </main>
  );
}
