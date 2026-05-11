import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type DiagnosticStat = {
  label: string;
  value: string;
  detail: string;
};

type DiagnosticDimension = {
  label: string;
  score: number;
  signal: string;
  recommendation: string;
};

type DiagnosticNextStep = {
  title: string;
  owner: string;
  impact: string;
};

type DiagnosticReport = {
  score: number;
  scoreDetail: string;
  summary: string;
  insights: string[];
  stats: DiagnosticStat[];
  dimensions: DiagnosticDimension[];
  nextSteps: DiagnosticNextStep[];
};

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const fallbackDiagnostic: DiagnosticReport = {
  score: 84,
  scoreDetail: "sube con 3 ajustes",
  summary: "El perfil tiene base clara, pero necesita más evidencia verificable para reducir fricción.",
  insights: [
    "El problema y la solución se entienden; falta convertir impacto en pruebas comparables.",
    "La oportunidad más inmediata parece estar en programas, premios y aliados antes que capital puro.",
    "Cada bloque debería cerrar con una señal verificable: número, fecha, aliado, piloto o aprendizaje."
  ],
  stats: [
    { label: "Confianza pública", value: "84%", detail: "perfil entendible para terceros" },
    { label: "Claridad narrativa", value: "7.8", detail: "problema, solución e impacto" },
    { label: "Evidencias", value: "6", detail: "señales útiles detectadas" },
    { label: "Fricción", value: "Media", detail: "faltan pruebas verificables" }
  ],
  dimensions: [
    {
      label: "Claridad narrativa",
      score: 88,
      signal: "La primera lectura explica qué hace la startup y por qué importa.",
      recommendation: "Cerrar con una métrica de impacto verificable en el primer bloque del perfil."
    },
    {
      label: "Evidencia de tracción",
      score: 72,
      signal: "Hay señales de adopción, pero no todas tienen magnitud o fecha.",
      recommendation: "Convertir alianzas, pilotos y crecimiento en tres datos comparables."
    },
    {
      label: "Confianza visual",
      score: 69,
      signal: "Las imágenes explican territorio, aunque falta una evidencia de producto o equipo.",
      recommendation: "Subir una foto de proceso o resultado para reforzar confianza."
    },
    {
      label: "Premios y aliados",
      score: 81,
      signal: "El perfil ya calza con rutas regenerativas y de biodiversidad.",
      recommendation: "Preparar video corto y evidencia comunitaria antes de abrir convocatoria."
    }
  ],
  nextSteps: [
    { title: "Completar evidencia visual", owner: "Studio", impact: "+9 pts visuales" },
    { title: "Agregar dato financiero", owner: "Perfil", impact: "+6 pts confianza" },
    { title: "Pulir frase de impacto", owner: "N500 Agent", impact: "+5 pts narrativa" }
  ]
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asScore(value: unknown, fallback: number): number {
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(score)) return fallback;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .map(item => typeof item === "string" ? item.trim() : "")
    .filter(Boolean)
    .slice(0, 5);
  return items.length ? items : fallback;
}

function asStats(value: unknown): DiagnosticStat[] {
  if (!Array.isArray(value)) return fallbackDiagnostic.stats;
  const stats = value
    .map(item => {
      const record = asRecord(item);
      if (!record) return null;
      return {
        label: asString(record.label, "Señal"),
        value: asString(record.value, "-"),
        detail: asString(record.detail, "pendiente de revisar")
      };
    })
    .filter((item): item is DiagnosticStat => item !== null)
    .slice(0, 4);
  return stats.length ? stats : fallbackDiagnostic.stats;
}

function asDimensions(value: unknown): DiagnosticDimension[] {
  if (!Array.isArray(value)) return fallbackDiagnostic.dimensions;
  const dimensions = value
    .map(item => {
      const record = asRecord(item);
      if (!record) return null;
      return {
        label: asString(record.label, "Dimensión"),
        score: asScore(record.score, 70),
        signal: asString(record.signal, "Hay señales útiles, pero falta más evidencia."),
        recommendation: asString(record.recommendation, "Agregar una prueba verificable en el perfil.")
      };
    })
    .filter((item): item is DiagnosticDimension => item !== null)
    .slice(0, 4);
  return dimensions.length ? dimensions : fallbackDiagnostic.dimensions;
}

function asNextSteps(value: unknown): DiagnosticNextStep[] {
  if (!Array.isArray(value)) return fallbackDiagnostic.nextSteps;
  const nextSteps = value
    .map(item => {
      const record = asRecord(item);
      if (!record) return null;
      return {
        title: asString(record.title, "Mejorar perfil"),
        owner: asString(record.owner, "N500 Agent"),
        impact: asString(record.impact, "+3 pts confianza")
      };
    })
    .filter((item): item is DiagnosticNextStep => item !== null)
    .slice(0, 4);
  return nextSteps.length ? nextSteps : fallbackDiagnostic.nextSteps;
}

function normalizeDiagnostic(value: unknown): DiagnosticReport {
  const record = asRecord(value);
  if (!record) return fallbackDiagnostic;

  return {
    score: asScore(record.score, fallbackDiagnostic.score),
    scoreDetail: asString(record.scoreDetail, fallbackDiagnostic.scoreDetail),
    summary: asString(record.summary, fallbackDiagnostic.summary),
    insights: asStringArray(record.insights, fallbackDiagnostic.insights),
    stats: asStats(record.stats),
    dimensions: asDimensions(record.dimensions),
    nextSteps: asNextSteps(record.nextSteps)
  };
}

function parseStartupId(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function cleanIdentityValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

type DiagnosticIdentity = {
  userId?: string;
  email?: string;
  googleSub?: string;
  startupRole?: string;
};

function canUseLocalPreview(identity: DiagnosticIdentity) {
  return (
    process.env.NODE_ENV !== "production" &&
    identity.userId?.startsWith("local-") &&
    identity.startupRole === "OWNER"
  );
}

async function findMembership(startupId: number, identity: DiagnosticIdentity) {
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

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta conectar la llave de OpenAI en el servidor.", code: "OPENAI_KEY_MISSING" },
        { status: 503 }
      );
    }

  const body = await request.json().catch(() => null) as {
    startupId?: unknown;
    userId?: unknown;
    email?: unknown;
    googleSub?: unknown;
    startupRole?: unknown;
  } | null;
  const startupId = parseStartupId(body?.startupId);
  if (!startupId) {
    return NextResponse.json({ error: "startupId es requerido." }, { status: 400 });
  }

  const identity = {
    userId: cleanIdentityValue(body?.userId),
    email: cleanIdentityValue(body?.email),
    googleSub: cleanIdentityValue(body?.googleSub),
    startupRole: cleanIdentityValue(body?.startupRole)
  };
  const membership = await findMembership(startupId, identity);

  if (!membership && !canUseLocalPreview(identity)) {
    return NextResponse.json({ error: "Esta lectura solo está disponible para miembros de la startup." }, { status: 403 });
  }

  const startup = await prisma.startup.findUnique({
    where: { id: startupId },
    select: {
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
      quote: true,
      quoteName: true
    }
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup no encontrada." }, { status: 404 });
  }

  const profile = {
    name: startup.name,
    category: startup.category,
    website: startup.website,
    countries: { operating: startup.operatingCountry, based: startup.basedCountry },
    headline: startup.header,
    description: startup.description,
    tracks: startup.tracks,
    impact: startup.impacto,
    tractionData: [startup.data1, startup.data2, startup.data3].filter(Boolean),
    mediaSignals: {
      hasVideo: Boolean(startup.video),
      profileImages: [startup.image1, startup.image2, startup.image3, startup.image4].filter(Boolean).length,
      dataImages: [startup.dataImage1, startup.dataImage2, startup.dataImage3].filter(Boolean).length,
      hasQuote: Boolean(startup.quote),
      quoteName: startup.quoteName
    }
  };

  const model = process.env.OPENAI_DIAGNOSTIC_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres N500 Agent, un analista de confianza pública para startups regenerativas. Diagnostica perfiles públicos en español, con criterio de inversionistas, premios y aliados. No inventes cifras: si falta evidencia, dilo como brecha. Responde solo JSON válido."
        },
        {
          role: "user",
          content: JSON.stringify({
            profile,
            expectedSchema: {
              score: "number 0-100",
              scoreDetail: "short Spanish phrase",
              summary: "one concise diagnostic paragraph",
              insights: ["3 to 5 diagnostic findings"],
              stats: [{ label: "short", value: "short", detail: "short" }],
              dimensions: [{ label: "short", score: "number 0-100", signal: "observed signal", recommendation: "specific fix" }],
              nextSteps: [{ title: "action", owner: "Studio, Perfil, Founder or N500 Agent", impact: "+N pts area" }]
            }
          })
        }
      ]
    })
  });

  const rawResponse = await response.text();
  let openAIData: OpenAIChatResponse = {};
  try {
    openAIData = JSON.parse(rawResponse || "{}") as OpenAIChatResponse;
  } catch {
    return NextResponse.json(
      { error: "N500 Agent no pudo interpretar la lectura en este momento." },
      { status: 502 }
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "N500 Agent no pudo completar la lectura en este momento." },
      { status: 502 }
    );
  }

  const content = openAIData.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "OpenAI respondió sin contenido." }, { status: 502 });
  }

  let parsedDiagnostic: unknown;
  try {
    parsedDiagnostic = JSON.parse(content);
  } catch {
    return NextResponse.json({ error: "N500 Agent respondió con JSON inválido." }, { status: 502 });
  }

    const diagnostic = normalizeDiagnostic(parsedDiagnostic);
    return NextResponse.json({ diagnostic });
  } catch (error) {
    console.error("Startup diagnostic failed", error);
    return NextResponse.json(
      { error: "N500 Agent no pudo completar la lectura en este momento." },
      { status: 500 }
    );
  }
}
