import { prisma } from "./prisma";
import { startups as fallbackStartups, type PhotoStat, type Startup, type StartupMetric } from "./startups";

type DatabaseStartup = {
  id: number;
  name: string;
  category: string | null;
  website: string | null;
  operatingCountry: string | null;
  basedCountry: string | null;
  header: string;
  description: string | null;
  tracks: string | null;
  video: string | null;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  impacto: string | null;
  data1: string | null;
  data2: string | null;
  data3: string | null;
  dataImage1: string | null;
  dataImage2: string | null;
  dataImage3: string | null;
  quotePhoto: string | null;
};

const metricLabels = ["Impacto", "Tecnologia", "Evidencia"];

function splitList(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function buildMetric(value: string | null, index: number): StartupMetric {
  const fallbackLabel = metricLabels[index] ?? "Dato";

  if (!value) {
    return {
      value: String(index + 1).padStart(2, "0"),
      label: fallbackLabel,
      detail: "Informacion pendiente de completar en la base de datos."
    };
  }

  const [rawTitle, ...rest] = value.split(":");
  const title = rawTitle.trim();
  const detail = rest.join(":").trim();

  if (detail && title.length <= 58) {
    return {
      value: String(index + 1).padStart(2, "0"),
      label: title,
      detail: truncate(detail, 170)
    };
  }

  const [firstSentence, ...remaining] = value.split(/(?<=[.!?])\s+/);

  return {
    value: String(index + 1).padStart(2, "0"),
    label: truncate(firstSentence || fallbackLabel, 58),
    detail: truncate(remaining.join(" ") || value, 170)
  };
}

function buildPhotoStats(startup: DatabaseStartup, tracks: string[]): PhotoStat[] {
  const mediaCount = [
    startup.image1,
    startup.image2,
    startup.image3,
    startup.image4,
    startup.video,
    startup.quotePhoto,
    startup.dataImage1,
    startup.dataImage2,
    startup.dataImage3
  ].filter(Boolean).length;
  const country = startup.operatingCountry ?? startup.basedCountry ?? "LAC";
  const firstTrack = tracks[0] ?? startup.category ?? "NatureTech";

  return [
    { label: "territorio", value: truncate(country, 18), detail: "operacion" },
    { label: "track", value: truncate(firstTrack, 18), detail: `${Math.max(tracks.length, 1)} vertical${tracks.length === 1 ? "" : "es"}` },
    { label: "media", value: String(mediaCount), detail: "assets R2" }
  ];
}

function ensureContactHref(value: string | null): string {
  if (!value) return "mailto:contacto@naturatech.org";
  if (value.includes("@") && !value.startsWith("http")) return `mailto:${value}`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function mapDatabaseStartup(startup: DatabaseStartup): Startup {
  const tracks = splitList(startup.tracks);
  const country = startup.operatingCountry ?? startup.basedCountry ?? "Latam";
  const category = startup.category ?? tracks[0] ?? "NatureTech";
  const description = startup.description ?? startup.impacto ?? startup.header;

  return {
    id: String(startup.id),
    name: startup.name,
    country,
    region: startup.basedCountry ?? country,
    category,
    image: startup.image1 ?? startup.image2 ?? startup.image3 ?? startup.image4 ?? startup.quotePhoto ?? "/assets/01.webp",
    headline: startup.header,
    description,
    technologies: tracks.length > 0 ? tracks : [category],
    metrics: [startup.data1, startup.data2, startup.data3].map(buildMetric),
    photoStats: buildPhotoStats(startup, tracks),
    contact: ensureContactHref(startup.website)
  };
}

export async function getExplorerStartups(): Promise<Startup[]> {
  try {
    const databaseStartups = await prisma.startup.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        website: true,
        operatingCountry: true,
        basedCountry: true,
        header: true,
        description: true,
        tracks: true,
        video: true,
        image1: true,
        image2: true,
        image3: true,
        image4: true,
        impacto: true,
        data1: true,
        data2: true,
        data3: true,
        dataImage1: true,
        dataImage2: true,
        dataImage3: true,
        quotePhoto: true
      },
      orderBy: {
        id: "asc"
      },
      take: 60
    });

    if (databaseStartups.length === 0) return fallbackStartups;

    return databaseStartups.map(mapDatabaseStartup);
  } catch (error) {
    console.error("Failed to load startups from database", error);
    return fallbackStartups;
  }
}
