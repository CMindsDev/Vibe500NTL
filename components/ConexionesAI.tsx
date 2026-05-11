"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { AuthControls, StartupNavItem } from "./AuthControls";
import { useAuth } from "./AuthProvider";
import { StartupProfileView, type StartupProfileData } from "./StartupProfileView";

type ConnectionId = "diagnostico" | "matchmaker" | "premio-regenera" | "alertas";
type ConnectionSymbolName = "circle" | "semicircle" | "leafs" | "sparkle";
type ConnectionVisual = "photo" | "avatars" | "logo" | "tiles";

type Connection = {
  id: ConnectionId;
  kicker: string;
  title: string;
  tabLabel: string;
  description: string;
  cardDescription: string;
  accent: string;
  cardColor: string;
  cardInk: string;
  cardMuted: string;
  symbol: ConnectionSymbolName;
  visual: ConnectionVisual;
  image: string;
  metric: string;
  metricLabel: string;
  status: string;
  cta: string;
  outputs: string[];
  route: string;
};

type CarouselItem = {
  connection: Connection;
  index: number;
  offset: number;
  key: string;
  isClone: boolean;
};

type SlotStyle = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

type MatchObjectiveId = "capital" | "programas" | "mercado" | "premios";
type MatchEntityId = "founders" | "startups" | "grants" | "programs" | "buyers";
type MatchViewMode = "mapa" | "comparar" | "ruta";

type MatchObjective = {
  id: MatchObjectiveId;
  label: string;
  description: string;
  metric: string;
};

type MatchCard = {
  id: string;
  title: string;
  type: string;
  objective: MatchObjectiveId;
  entity: MatchEntityId;
  score: number;
  status: string;
  summary: string;
  reasons: string[];
  gaps: string[];
  nextAction: string;
};

type MatchVisualNode = {
  id: string;
  kind: "source" | "match" | "signal";
  entity?: MatchEntityId;
  label: string;
  title: string;
  image?: string;
  matchId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type MatchVisualLink = {
  from: string;
  to: string;
  strength?: "strong";
};

type MatchEntityGroup = {
  id: MatchEntityId;
  label: string;
  count: number;
  detail: string;
};

type MatchCorrelation = {
  label: string;
  value: number;
  detail: string;
};

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

type DiagnosticWizardStepId = "perfil" | "lectura" | "brechas" | "plan";
type DiagnosticProcessStageId = "source" | "reading" | "checking" | "scoring" | "planning" | "complete" | "error";

type DiagnosticSourceFocusId = "identidad" | "narrativa" | "traccion" | "media";

type DiagnosticWizardStep = {
  id: DiagnosticWizardStepId;
  label: string;
  title: string;
};

type DiagnosticProcessStage = {
  id: DiagnosticProcessStageId;
  stepId: DiagnosticWizardStepId;
  label: string;
  detail: string;
  progress: number;
};

type DiagnosticSourceFocus = {
  id: DiagnosticSourceFocusId;
  label: string;
  fieldId: string;
  fieldLabel: string;
  detail: string;
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

const smoothEase = [0.22, 1, 0.36, 1] as const;

const matchObjectives: MatchObjective[] = [
  {
    id: "capital",
    label: "Capital",
    description: "Fondos, grants y vehículos de inversión con tesis compatible.",
    metric: "7 posibles"
  },
  {
    id: "programas",
    label: "Programas",
    description: "Aceleradoras, asistencia técnica, mentorías y cohortes activas.",
    metric: "5 posibles"
  },
  {
    id: "mercado",
    label: "Mercado",
    description: "Empresas, compradores, pilotos y cadenas de suministro.",
    metric: "4 posibles"
  },
  {
    id: "premios",
    label: "Premios",
    description: "Convocatorias, showcases y rutas de visibilidad curada.",
    metric: "2 posibles"
  }
];

const matchCards: MatchCard[] = [
  {
    id: "fondo-verde-lac",
    title: "Fondo Verde LAC",
    type: "Fondo de impacto",
    objective: "capital",
    entity: "grants",
    score: 86,
    status: "Lista para intro",
    summary: "Tesis activa en restauración, biodiversidad y MRV para startups con primeras ventas.",
    reasons: ["Invierte en restauración y MRV", "Opera en Colombia", "Busca primeras ventas"],
    gaps: ["Definir ticket objetivo", "Agregar métrica financiera"],
    nextAction: "Preparar intro"
  },
  {
    id: "natura-accelerator",
    title: "Natura Accelerator",
    type: "Programa de crecimiento",
    objective: "programas",
    entity: "programs",
    score: 82,
    status: "Alta compatibilidad",
    summary: "Cohorte regional para bioeconomía, regeneración y pilotos con aliados corporativos.",
    reasons: ["Acepta etapa de primeras ventas", "Cubre LAC", "Incluye asistencia técnica"],
    gaps: ["Completar video corto", "Ordenar evidencias del piloto"],
    nextAction: "Aplicar con perfil"
  },
  {
    id: "andes-supply-lab",
    title: "Andes Supply Lab",
    type: "Comprador / piloto",
    objective: "mercado",
    entity: "buyers",
    score: 79,
    status: "Exploratorio fuerte",
    summary: "Empresa buscando soluciones de trazabilidad, regeneración e ingredientes naturales.",
    reasons: ["Busca proveedores regenerativos", "Interés en Colombia", "Encaja con trazabilidad"],
    gaps: ["Aclarar capacidad operativa", "Subir caso de uso comercial"],
    nextAction: "Enviar interés"
  },
  {
    id: "premio-natura500",
    title: "Premio Natura500",
    type: "Convocatoria",
    objective: "premios",
    entity: "programs",
    score: 76,
    status: "Pre-registro activo",
    summary: "Ruta de visibilidad y premio para iniciativas regenerativas con potencial regional.",
    reasons: ["Impacto socioambiental claro", "País elegible", "Track alineado"],
    gaps: ["Refinar narrativa de impacto", "Completar evidencia visual"],
    nextAction: "Revisar requisitos"
  },
  {
    id: "lucia-rojas",
    title: "Lucía Rojas",
    type: "Founder regenerativa",
    objective: "mercado",
    entity: "founders",
    score: 81,
    status: "Peer intro útil",
    summary: "Founder con aprendizaje operativo en pilotos rurales y alianzas de compra regenerativa.",
    reasons: ["Opera con productores LAC", "Puede compartir ruta de pilotos", "Tiene red de compradores"],
    gaps: ["Alinear disponibilidad", "Definir tema de intercambio"],
    nextAction: "Pedir conversación peer"
  },
  {
    id: "biotrace-andes",
    title: "BioTrace Andes",
    type: "Startup espejo",
    objective: "programas",
    entity: "startups",
    score: 78,
    status: "Alianza posible",
    summary: "Startup con señales cercanas en trazabilidad, MRV y cadenas de suministro de biodiversidad.",
    reasons: ["Caso de uso comparable", "Complementa tecnología", "Comparte territorio"],
    gaps: ["Mapear integración", "Validar prioridades comerciales"],
    nextAction: "Explorar colaboración"
  },
  {
    id: "grant-mrv-lac",
    title: "Grant MRV LAC",
    type: "Grant técnico",
    objective: "capital",
    entity: "grants",
    score: 74,
    status: "Ventana abierta",
    summary: "Capital no dilutivo para fortalecer evidencia, medición y trazabilidad en proyectos regenerativos.",
    reasons: ["Financia evidencia MRV", "Acepta etapa temprana", "Cubre Colombia"],
    gaps: ["Completar presupuesto", "Subir evidencia técnica"],
    nextAction: "Preparar aplicación"
  },
  {
    id: "ceiba-operators",
    title: "CEIBA Operators",
    type: "Mentoría operativa",
    objective: "programas",
    entity: "programs",
    score: 73,
    status: "Mentoría sugerida",
    summary: "Red de operadores para ordenar métricas, piloto comercial y narrativa antes de levantar capital.",
    reasons: ["Acelera preparación", "Conecta con operadores", "Mejora evidencia"],
    gaps: ["Definir métrica norte", "Traer caso de uso"],
    nextAction: "Agendar mentoría"
  }
];

const introTimeline = ["Solicitud recibida", "Revisión de encaje", "Intro curada", "Seguimiento"];
const matchEntityGroups: MatchEntityGroup[] = [
  { id: "founders", label: "Founders", count: 12, detail: "pares con tesis cercana" },
  { id: "startups", label: "Startups", count: 18, detail: "alianzas y casos espejo" },
  { id: "grants", label: "Grants", count: 7, detail: "capital no dilutivo" },
  { id: "programs", label: "Programas", count: 5, detail: "cohortes activas" },
  { id: "buyers", label: "Buyers", count: 4, detail: "pilotos y mercado" }
];
const matchModeDetails: Record<MatchViewMode, { label: string; status: string }> = {
  mapa: { label: "Mapa vivo", status: "prioriza nodos por intención y entidad" },
  comparar: { label: "Comparación", status: "ordena candidatos por score y fricción" },
  ruta: { label: "Ruta de intro", status: "convierte el match en siguientes pasos" }
};
const matchCorrelationsByObjective: Record<MatchObjectiveId, MatchCorrelation[]> = {
  capital: [
    { label: "tesis", value: 92, detail: "restauración + MRV" },
    { label: "etapa", value: 74, detail: "primeras ventas" },
    { label: "territorio", value: 88, detail: "Colombia / LAC" }
  ],
  programas: [
    { label: "cohorte", value: 84, detail: "bioeconomía abierta" },
    { label: "mentorías", value: 79, detail: "crecimiento y pilotos" },
    { label: "evidencia", value: 68, detail: "video pendiente" }
  ],
  mercado: [
    { label: "comprador", value: 82, detail: "trazabilidad requerida" },
    { label: "capacidad", value: 66, detail: "operación por aclarar" },
    { label: "territorio", value: 86, detail: "interés Colombia" }
  ],
  premios: [
    { label: "impacto", value: 90, detail: "narrativa regenerativa" },
    { label: "ventana", value: 76, detail: "pre-registro activo" },
    { label: "media", value: 62, detail: "falta evidencia visual" }
  ]
};
const matchVisualNodes: MatchVisualNode[] = [
  { id: "source", kind: "source", label: "perfil fuente", title: "RushFrame", x: 50, y: 50, width: 116, height: 66, rotation: 0 },
  { id: "fondo-verde-lac", kind: "match", entity: "grants", label: "grant", title: "Fondo Verde LAC", image: "/assets/02.webp", matchId: "fondo-verde-lac", x: 72, y: 22, width: 116, height: 74, rotation: -2 },
  { id: "natura-accelerator", kind: "match", entity: "programs", label: "programa", title: "Natura Accelerator", image: "/assets/05.webp", matchId: "natura-accelerator", x: 39, y: 22, width: 82, height: 116, rotation: 1 },
  { id: "andes-supply-lab", kind: "match", entity: "buyers", label: "comprador", title: "Andes Supply Lab", image: "/assets/06.webp", matchId: "andes-supply-lab", x: 20, y: 58, width: 126, height: 76, rotation: -1 },
  { id: "premio-natura500", kind: "match", entity: "programs", label: "premio", title: "Premio Natura500", image: "/assets/04.webp", matchId: "premio-natura500", x: 80, y: 62, width: 108, height: 124, rotation: 2 },
  { id: "lucia-rojas", kind: "match", entity: "founders", label: "founder", title: "Lucía Rojas", image: "/assets/01.webp", matchId: "lucia-rojas", x: 15, y: 30, width: 102, height: 60, rotation: 1 },
  { id: "biotrace-andes", kind: "match", entity: "startups", label: "startup", title: "BioTrace Andes", image: "/assets/03.webp", matchId: "biotrace-andes", x: 56, y: 76, width: 108, height: 70, rotation: -2 },
  { id: "regenera-lab", kind: "signal", entity: "startups", label: "startup", title: "Regeneración", image: "/assets/02.webp", x: 31, y: 82, width: 88, height: 56, rotation: 2 },
  { id: "ceiba-operators", kind: "match", entity: "programs", label: "programa", title: "CEIBA Operators", image: "/assets/05.webp", matchId: "ceiba-operators", x: 90, y: 38, width: 86, height: 58, rotation: -1 },
  { id: "grant-mrv-lac", kind: "match", entity: "grants", label: "grant", title: "Grant MRV LAC", image: "/assets/06.webp", matchId: "grant-mrv-lac", x: 52, y: 8, width: 92, height: 54, rotation: 1 }
];
const matchVisualLinks: MatchVisualLink[] = [
  { from: "source", to: "fondo-verde-lac", strength: "strong" },
  { from: "source", to: "natura-accelerator", strength: "strong" },
  { from: "source", to: "andes-supply-lab", strength: "strong" },
  { from: "source", to: "premio-natura500", strength: "strong" },
  { from: "source", to: "lucia-rojas", strength: "strong" },
  { from: "source", to: "biotrace-andes", strength: "strong" },
  { from: "source", to: "grant-mrv-lac", strength: "strong" },
  { from: "lucia-rojas", to: "fondo-verde-lac" },
  { from: "lucia-rojas", to: "andes-supply-lab" },
  { from: "biotrace-andes", to: "fondo-verde-lac" },
  { from: "biotrace-andes", to: "andes-supply-lab" },
  { from: "regenera-lab", to: "premio-natura500" },
  { from: "regenera-lab", to: "natura-accelerator" },
  { from: "ceiba-operators", to: "natura-accelerator" },
  { from: "ceiba-operators", to: "premio-natura500" },
  { from: "grant-mrv-lac", to: "fondo-verde-lac" },
  { from: "grant-mrv-lac", to: "source" },
  { from: "fondo-verde-lac", to: "premio-natura500" },
  { from: "natura-accelerator", to: "andes-supply-lab" },
  { from: "andes-supply-lab", to: "premio-natura500" }
];

const diagnosticStats: DiagnosticStat[] = [
  { label: "Confianza externa", value: "84%", detail: "perfil claro para terceros" },
  { label: "Narrativa", value: "7.8", detail: "problema, solución e impacto" },
  { label: "Pruebas", value: "6", detail: "señales útiles detectadas" },
  { label: "Fricción", value: "Media", detail: "faltan pruebas verificables" }
];

const diagnosticDimensions: DiagnosticDimension[] = [
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
];

const agentInsights = [
  "La tesis se entiende; lo que falta es convertirla en confianza verificable.",
  "Hoy el perfil abre mejor puertas de programas y premios. Capital necesita tracción más comparable.",
  "El siguiente salto es cerrar cada bloque con una prueba: métrica, fecha, aliado, piloto o aprendizaje."
];

const diagnosticNextSteps: DiagnosticNextStep[] = [
  { title: "Completar evidencia visual", owner: "Studio", impact: "+9 pts visuales" },
  { title: "Agregar dato financiero", owner: "Perfil", impact: "+6 pts confianza" },
  { title: "Pulir frase de impacto", owner: "N500 Agent", impact: "+5 pts narrativa" }
];

const diagnosticWizardSteps: DiagnosticWizardStep[] = [
  { id: "perfil", label: "Perfil", title: "Fuente visible" },
  { id: "lectura", label: "Lectura", title: "Diagnóstico vivo" },
  { id: "brechas", label: "Brechas", title: "Qué frena confianza" },
  { id: "plan", label: "Plan", title: "Siguiente movimiento" }
];

const diagnosticProcessStages: DiagnosticProcessStage[] = [
  {
    id: "source",
    stepId: "perfil",
    label: "Fuente visible",
    detail: "N500 Agent parte del perfil público tal como lo vería un aliado externo.",
    progress: 12
  },
  {
    id: "reading",
    stepId: "lectura",
    label: "Leyendo perfil",
    detail: "Revisa identidad, categoría, territorio, narrativa y media visible.",
    progress: 34
  },
  {
    id: "checking",
    stepId: "lectura",
    label: "Comparando señales",
    detail: "Cruza lo que ya existe contra lo que necesita creer un aliado o premio.",
    progress: 58
  },
  {
    id: "scoring",
    stepId: "brechas",
    label: "Detectando brechas",
    detail: "Ordena fricciones de confianza: claridad, evidencia, contexto y tracción.",
    progress: 78
  },
  {
    id: "planning",
    stepId: "brechas",
    label: "Armando plan",
    detail: "Convierte la lectura en acciones para Studio, perfil y narrativa pública.",
    progress: 92
  },
  {
    id: "complete",
    stepId: "plan",
    label: "Lectura viva lista",
    detail: "Ya tienes brechas priorizadas y próximos movimientos accionables.",
    progress: 100
  },
  {
    id: "error",
    stepId: "lectura",
    label: "Lectura pausada",
    detail: "No se completó la lectura viva. Puedes revisar la fuente y volver a intentar.",
    progress: 48
  }
];

const diagnosticSourceFocuses: DiagnosticSourceFocus[] = [
  {
    id: "identidad",
    label: "Identidad",
    fieldId: "name",
    fieldLabel: "Nombre y primera impresión",
    detail: "Qué entiende alguien en los primeros segundos."
  },
  {
    id: "narrativa",
    label: "Narrativa",
    fieldId: "description",
    fieldLabel: "Historia e impacto",
    detail: "Cómo conecta problema, solución y oportunidad."
  },
  {
    id: "traccion",
    label: "Evidencia",
    fieldId: "data1",
    fieldLabel: "Datos y pruebas",
    detail: "Qué señales sostienen confianza verificable."
  },
  {
    id: "media",
    label: "Media",
    fieldId: "image1",
    fieldLabel: "Cover y señales visuales",
    detail: "Qué tan claro se ve producto, territorio o equipo."
  }
];

const prizeNatura = {
  name: "Premio Natura500",
  label: "Convocatoria 2026",
  score: 86,
  window: "Abre 22 mayo 2026",
  href: "/premio#natura500",
  summary:
    "Capital y visibilidad para startups, cooperativas y organizaciones que ya construyen impacto real en biodiversidad, clima y comunidades de LAC.",
  checks: ["País elegible en LAC", "Solución regenerativa", "Perfil público en Radar"],
  evidence: ["Video corto de presentación", "Métricas de impacto verificables", "Foto de territorio, comunidad o solución"],
  levels: [
    { name: "Pionera", amount: "USD $5,000", stage: "Etapa temprana" },
    { name: "Creciente", amount: "USD $25,000", stage: "Tracción inicial" },
    { name: "Líder", amount: "USD $100,000", stage: "Modelo demostrado" }
  ],
  benefits: ["Perfil público en Radar", "3 masterclasses exclusivas", "Escenarios internacionales", "Red bioregional"]
} as const;

const prizeTimelinePreview = [
  { date: "Ahora", title: "Prepara perfil y evidencias" },
  { date: "22 mayo", title: "Apertura de convocatoria" },
  { date: "15 julio", title: "Cierre de envío de videos" },
  { date: "jul - ago", title: "Revisión NTL + Consejo CEIBA" },
  { date: "15 - 30 ago", title: "Aplicación completa para lista corta" },
  { date: "sep - oct", title: "Ganadoras y anuncio público" }
];

const alertRules = [
  {
    id: "fondos",
    label: "Fondos y grants",
    cadence: "Diario",
    count: 4,
    query: "regeneración, biodiversidad, primeras ventas, LAC"
  },
  {
    id: "programas",
    label: "Programas",
    cadence: "Semanal",
    count: 3,
    query: "aceleradoras, asistencia técnica, pilotos corporativos"
  },
  {
    id: "premios",
    label: "Premios",
    cadence: "En vivo",
    count: 2,
    query: "convocatorias, showcases, premios regenerativos"
  }
] as const;

type AlertRuleId = (typeof alertRules)[number]["id"];

const alertFeed = [
  { title: "Grant biodiversidad LAC", source: "Fondo Verde LAC", fit: 91, time: "hoy" },
  { title: "Cohorte bioeconomía", source: "Natura Accelerator", fit: 84, time: "2 días" },
  { title: "Showcase regenerativo", source: "Premio Natura500", fit: 79, time: "5 días" }
];

type AlertChannelId = "email" | "whatsapp" | "instagram" | "slack" | "studio";

type AlertChannel = {
  id: AlertChannelId;
  label: string;
  hint: string;
  destinationLabel: string;
  destinationPlaceholder: string;
  cadence: string;
};

const alertChannels: AlertChannel[] = [
  {
    id: "email",
    label: "Email",
    hint: "Resumen al inbox que ya revisas todos los días",
    destinationLabel: "Correo",
    destinationPlaceholder: "tu@correo.com",
    cadence: "Resumen lun y jue · 8:00 am"
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    hint: "Mensaje directo en cuanto aparece una señal viva",
    destinationLabel: "Número",
    destinationPlaceholder: "+52 55 0000 0000",
    cadence: "Solo si afinidad ≥ 80%"
  },
  {
    id: "instagram",
    label: "Instagram",
    hint: "DM al perfil del equipo, sin saturar feed",
    destinationLabel: "Handle",
    destinationPlaceholder: "@tu-startup",
    cadence: "Hasta 2 DMs por semana"
  },
  {
    id: "slack",
    label: "Slack",
    hint: "Hilo en tu workspace para que el equipo lo vea junto",
    destinationLabel: "Canal",
    destinationPlaceholder: "#radar-natura",
    cadence: "Tiempo real, sin acumular"
  },
  {
    id: "studio",
    label: "Studio",
    hint: "Inbox dentro del producto, perfecto si vives aquí",
    destinationLabel: "Workspace",
    destinationPlaceholder: "Tu workspace activo",
    cadence: "Siempre activo"
  }
];

const connections: Connection[] = [
  {
    id: "diagnostico",
    kicker: "01 / Perfil público",
    title: "Diagnóstico",
    tabLabel: "Diagnóstico",
    description:
      "Lee el perfil como lo haría un aliado externo: claridad, evidencia, confianza y fricciones antes de abrir una conversación.",
    cardDescription:
      "Una lectura profunda del perfil público, tracción, narrativa, visuales y señales.",
    accent: "#a2d200",
    cardColor: "#b8e600",
    cardInk: "#081005",
    cardMuted: "rgba(8, 16, 5, 0.72)",
    symbol: "circle",
    visual: "photo",
    image: "/assets/02.webp",
    metric: "92%",
    metricLabel: "confianza pública",
    status: "Lectura lista",
    cta: "Entrar al diagnóstico",
    outputs: ["confianza", "brechas críticas", "siguientes pasos"],
    route: "/conexiones#diagnostico"
  },
  {
    id: "matchmaker",
    kicker: "02 / Capital inteligente",
    title: "Matchmaking",
    tabLabel: "Matchmaking",
    description:
      "Ordena capital, programas, mercado y premios según la intención de la startup y la calidad de sus señales públicas.",
    cardDescription:
      "Encuentra tus matches de fondos, aliados y programas que encajan con tu startup.",
    accent: "#f88f04",
    cardColor: "#edff4a",
    cardInk: "#080f05",
    cardMuted: "rgba(8, 15, 5, 0.68)",
    symbol: "semicircle",
    visual: "avatars",
    image: "/assets/05.webp",
    metric: "18",
    metricLabel: "conexiones sugeridas",
    status: "Actualizado hoy",
    cta: "Encontrar matches",
    outputs: ["afinidad de red", "razón de conexión", "siguiente intro"],
    route: "/conexiones#matchmaking"
  },
  {
    id: "premio-regenera",
    kicker: "03 / Convocatoria",
    title: "Premio",
    tabLabel: "Premio",
    description:
      "Conecta el perfil de la startup con la ruta del premio, requisitos, evidencias necesarias y ventana de aplicación.",
    cardDescription:
      "Conecta el perfil de tu startup con la ruta del premio, requisitos, evidencias necesarias y ventana de aplicación.",
    accent: "#ebff57",
    cardColor: "#6235ff",
    cardInk: "#fbf8ff",
    cardMuted: "rgba(251, 248, 255, 0.76)",
    symbol: "leafs",
    visual: "logo",
    image: "/assets/04.webp",
    metric: "18",
    metricLabel: "días para abrir",
    status: "Pre-registro listo",
    cta: "Aplica ahora",
    outputs: ["checklist de elegibilidad", "timeline", "evidencias pendientes"],
    route: "/premio"
  },
  {
    id: "alertas",
    kicker: "04 / Radar",
    title: "Alertas",
    tabLabel: "Alertas",
    description:
      "Un monitor vivo de oportunidades: fondos, grants, eventos, mentors y señales que cambian según el avance de tu startup.",
    cardDescription:
      "Un monitor vivo de oportunidades: fondos, grants, eventos y mentores que cambian según tu avance.",
    accent: "#f88f04",
    cardColor: "#ff9300",
    cardInk: "#fff8ec",
    cardMuted: "rgba(255, 248, 236, 0.76)",
    symbol: "sparkle",
    visual: "tiles",
    image: "/assets/06.webp",
    metric: "9",
    metricLabel: "señales nuevas",
    status: "Monitoreando",
    cta: "Configurar alertas",
    outputs: ["oportunidades nuevas", "notificaciones", "filtros por etapa"],
    route: "/conexiones#alertas"
  }
];

const carouselOrder: ConnectionId[] = ["diagnostico", "matchmaker", "premio-regenera", "alertas"];
const defaultConnectionId: ConnectionId = "premio-regenera";
const connectionMap = new Map(connections.map(connection => [connection.id, connection]));
const carouselConnections = carouselOrder.map(id => connectionMap.get(id)!);
const dragStepDistance = 170;
const carouselSlotOffsets = [-1, 0, 1, 2];
const carouselWheelThreshold = 104;
const carouselSlideDuration = 0.58;
const carouselSlideEase = "back.out(1.12)";

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function getCarouselOffset(index: number, activeIndex: number, length: number) {
  let offset = index - activeIndex;

  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;

  return offset;
}

function getSlotName(offset: number) {
  if (offset === 0) return "center";
  if (offset === -1) return "left";
  if (offset === 1) return "right";
  return offset < 0 ? "far-left" : "far-right";
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function getCarouselItemsForIndex(activeVirtualIndex: number): CarouselItem[] {
  return carouselSlotOffsets.map(offset => {
    const virtualIndex = activeVirtualIndex + offset;
    const index = wrapIndex(virtualIndex, carouselConnections.length);

    return {
      connection: carouselConnections[index],
      index,
      offset,
      key: `virtual-${virtualIndex}`,
      isClone: offset !== 0
    };
  });
}

function getSlotStyle(offset: number, width: number, height: number): SlotStyle {
  const clampedOffset = clampNumber(offset, -3, 3);
  const side = clampedOffset < 0 ? -1 : 1;
  const distance = Math.abs(clampedOffset);
  const band = clampNumber(distance, 0, 3);
  const lower = Math.floor(band);
  const progress = band - lower;
  const firstX = clampNumber(width * 0.27, 190, 360);
  const peekX = clampNumber(width * 0.57, 300, 760);
  const hiddenLeftX = clampNumber(width * 0.74, 720, 1120);
  const outerX = clampNumber(width * 0.92, 900, 1420);
  const firstY = clampNumber(height * 0.08, 24, 52);
  const peekY = clampNumber(height * 0.22, 90, 145);
  const hiddenLeftY = clampNumber(height * 0.3, 130, 190);
  const outerY = clampNumber(height * 0.34, 150, 220);
  const positivePoints = [
    { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, zIndex: 30 },
    { x: firstX, y: firstY, rotation: 8, scale: 0.98, opacity: 1, zIndex: 20 },
    { x: peekX, y: peekY, rotation: 12, scale: 0.92, opacity: 0.98, zIndex: 6 },
    { x: outerX, y: outerY, rotation: 14, scale: 0.88, opacity: 0, zIndex: 1 }
  ];
  const negativePoints = [
    { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, zIndex: 30 },
    { x: firstX, y: firstY, rotation: 8, scale: 0.98, opacity: 1, zIndex: 20 },
    { x: hiddenLeftX, y: hiddenLeftY, rotation: 13, scale: 0.9, opacity: 0, zIndex: 1 },
    { x: outerX, y: outerY, rotation: 14, scale: 0.88, opacity: 0, zIndex: 1 }
  ];
  const points = side < 0 ? negativePoints : positivePoints;

  const from = points[lower] ?? points[3];
  const to = points[Math.min(lower + 1, 3)] ?? points[3];

  return {
    x: side * lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
    rotation: side * lerp(from.rotation, to.rotation, progress),
    scale: lerp(from.scale, to.scale, progress),
    opacity: lerp(from.opacity, to.opacity, progress),
    zIndex: Math.round(lerp(from.zIndex, to.zIndex, progress))
  };
}

export function ConexionesAI() {
  const { user } = useAuth();
  const startupName = user?.activeStartup?.name ?? "tu startup";
  const defaultIndex = carouselConnections.findIndex(connection => connection.id === defaultConnectionId);
  const [activeVirtualIndex, setActiveVirtualIndex] = useState(defaultIndex);
  const [diagnosticSpaceOpen, setDiagnosticSpaceOpen] = useState(false);
  const [matchSpaceOpen, setMatchSpaceOpen] = useState(false);
  const [prizeSpaceOpen, setPrizeSpaceOpen] = useState(false);
  const [alertsSpaceOpen, setAlertsSpaceOpen] = useState(false);
  const jukeboxRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const activeTweenRef = useRef<gsap.core.Timeline | null>(null);
  const layoutInitializedRef = useRef(false);
  const skipNextLayoutAnimationRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const queuedDirectionRef = useRef<1 | -1 | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelResetTimerRef = useRef<number | null>(null);
  const suppressCardClickRef = useRef(false);
  const dragStateRef = useRef<{
    startX: number;
    lastX: number;
    pointerId: number;
    moved: boolean;
    targetOffset: number;
    targetConnectionId?: ConnectionId;
  } | null>(null);
  const activeIndex = wrapIndex(activeVirtualIndex, carouselConnections.length);

  const activeConnection = useMemo(
    () => carouselConnections[activeIndex],
    [activeIndex]
  );

  const carouselItems = useMemo(
    () => getCarouselItemsForIndex(activeVirtualIndex),
    [activeVirtualIndex]
  );

  const clearWheelIntent = useCallback(() => {
    wheelAccumulatorRef.current = 0;

    if (wheelResetTimerRef.current) {
      window.clearTimeout(wheelResetTimerRef.current);
      wheelResetTimerRef.current = null;
    }
  }, []);

  const applyCarouselLayout = useCallback(
    (progress = 0, immediate = false, onComplete?: () => void) => {
      const container = jukeboxRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const nextItems = getCarouselItemsForIndex(activeVirtualIndex);
      activeTweenRef.current?.kill();
      activeTweenRef.current = null;
      const targets: Array<{ card: HTMLElement; slot: SlotStyle }> = [];

      nextItems.forEach(item => {
        const card = cardRefs.current[item.key];
        if (!card) return;

        const slot = getSlotStyle(item.offset - progress, rect.width, rect.height);
        targets.push({ card, slot });
      });

      if (immediate || !layoutInitializedRef.current) {
        targets.forEach(({ card, slot }) => gsap.set(card, {
          xPercent: -50,
          x: slot.x,
          y: slot.y,
          rotation: slot.rotation,
          scale: slot.scale,
          opacity: slot.opacity,
          zIndex: slot.zIndex,
          force3D: true
        }));

        layoutInitializedRef.current = true;
        onComplete?.();
        return;
      }

      const timeline = gsap.timeline({
        defaults: {
          duration: carouselSlideDuration,
          ease: carouselSlideEase,
          overwrite: true
        },
        onComplete: () => {
          activeTweenRef.current = null;
          onComplete?.();
        }
      });

      targets.forEach(({ card, slot }) => {
        gsap.set(card, { xPercent: -50, zIndex: slot.zIndex, force3D: true });
        timeline.to(card, {
          x: slot.x,
          y: slot.y,
          rotation: slot.rotation,
          scale: slot.scale,
          opacity: slot.opacity
        }, 0);
      });

      activeTweenRef.current = timeline;

    },
    [activeVirtualIndex]
  );

  const stepConnection = useCallback(
    (direction: 1 | -1) => {
      if (isAnimatingRef.current) {
        queuedDirectionRef.current = direction;
        return;
      }

      isAnimatingRef.current = true;
      applyCarouselLayout(direction, false, () => {
        skipNextLayoutAnimationRef.current = true;
        setActiveVirtualIndex(current => current + direction);
      });
    },
    [applyCarouselLayout]
  );

  const moveCarouselByOffset = useCallback(
    (offset: number) => {
      if (offset === 0) return;

      const direction = offset > 0 ? 1 : -1;
      const distance = Math.min(Math.abs(offset), carouselConnections.length - 1);

      clearWheelIntent();
      activeTweenRef.current?.kill();
      activeTweenRef.current = null;

      if (isAnimatingRef.current) {
        queuedDirectionRef.current = direction;
        return;
      }

      isAnimatingRef.current = true;
      applyCarouselLayout(offset, false, () => {
        skipNextLayoutAnimationRef.current = true;
        setActiveVirtualIndex(current => current + direction * distance);
      });
    },
    [applyCarouselLayout, clearWheelIntent]
  );

  const runQueuedStep = useCallback(() => {
    const queuedDirection = queuedDirectionRef.current;
    queuedDirectionRef.current = null;

    if (queuedDirection) {
      window.requestAnimationFrame(() => stepConnection(queuedDirection));
    }
  }, [stepConnection]);

  const selectConnection = useCallback(
    (connectionId: ConnectionId) => {
      const nextIndex = carouselConnections.findIndex(connection => connection.id === connectionId);
      if (nextIndex < 0) return;

      const visibleOffset = carouselItems.find(item => item.index === nextIndex)?.offset;
      const offset = visibleOffset ?? getCarouselOffset(nextIndex, activeIndex, carouselConnections.length);
      if (offset === 0) return;

      moveCarouselByOffset(offset);
    },
    [activeIndex, carouselItems, moveCarouselByOffset]
  );

  useLayoutEffect(() => {
    const immediate = skipNextLayoutAnimationRef.current;
    skipNextLayoutAnimationRef.current = false;
    isAnimatingRef.current = true;
    applyCarouselLayout(0, immediate, () => {
      isAnimatingRef.current = false;
      runQueuedStep();
    });

    return () => {
      activeTweenRef.current?.kill();
    };
  }, [activeVirtualIndex, applyCarouselLayout, runQueuedStep]);

  useEffect(() => {
    const onResize = () => applyCarouselLayout(0, true);

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyCarouselLayout]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const strongestDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      if (Math.abs(strongestDelta) < 2) return;

      event.preventDefault();

      if (isAnimatingRef.current) {
        if (Math.abs(strongestDelta) > carouselWheelThreshold * 0.62) {
          queuedDirectionRef.current = strongestDelta > 0 ? 1 : -1;
        }
        return;
      }

      wheelAccumulatorRef.current += strongestDelta;

      if (wheelResetTimerRef.current) {
        window.clearTimeout(wheelResetTimerRef.current);
      }

      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelAccumulatorRef.current = 0;
        isAnimatingRef.current = true;
        applyCarouselLayout(0, false, () => {
          isAnimatingRef.current = false;
        });
      }, 140);

      const wheelProgress = clampNumber(wheelAccumulatorRef.current / dragStepDistance, -1, 1);

      if (Math.abs(wheelAccumulatorRef.current) < carouselWheelThreshold) {
        applyCarouselLayout(wheelProgress, true);
        return;
      }

      stepConnection(wheelAccumulatorRef.current > 0 ? 1 : -1);
      clearWheelIntent();
    },
    [applyCarouselLayout, clearWheelIntent, stepConnection]
  );

  useEffect(() => {
    const jukebox = jukeboxRef.current;
    if (!jukebox) return;

    jukebox.addEventListener("wheel", handleWheel, { passive: false });
    return () => jukebox.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button")) return;

    const targetCard = (event.target as HTMLElement).closest<HTMLElement>(".cx-jukebox-card");
    clearWheelIntent();
    activeTweenRef.current?.kill();
    activeTweenRef.current = null;
    isAnimatingRef.current = false;
    dragStateRef.current = {
      startX: event.clientX,
      lastX: event.clientX,
      pointerId: event.pointerId,
      moved: false,
      targetOffset: Number(targetCard?.dataset.carouselOffset ?? "0"),
      targetConnectionId: targetCard?.dataset.connectionId as ConnectionId | undefined
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [clearWheelIntent]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      dragState.lastX = event.clientX;
      const distance = event.clientX - dragState.startX;
      const progress = clampNumber(-distance / dragStepDistance, -1, 1);
      dragState.moved = dragState.moved || Math.abs(distance) > 4;

      applyCarouselLayout(progress, true);
    },
    [applyCarouselLayout]
  );

  const openConnection = useCallback((connectionId: ConnectionId) => {
    if (connectionId === "diagnostico") setDiagnosticSpaceOpen(true);
    else if (connectionId === "matchmaker") setMatchSpaceOpen(true);
    else if (connectionId === "premio-regenera") setPrizeSpaceOpen(true);
    else if (connectionId === "alertas") setAlertsSpaceOpen(true);
  }, []);

  const finishPointerDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const dragDistance = dragState.lastX - dragState.startX;
      const progress = clampNumber(-dragDistance / dragStepDistance, -1, 1);
      dragStateRef.current = null;
      suppressCardClickRef.current = dragState.moved;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (dragState.moved) {
        window.setTimeout(() => {
          suppressCardClickRef.current = false;
        }, 160);
      } else {
        if (dragState.targetConnectionId) {
          suppressCardClickRef.current = true;
          window.setTimeout(() => {
            suppressCardClickRef.current = false;
          }, 160);

          if (dragState.targetOffset === 0) openConnection(dragState.targetConnectionId);
          else moveCarouselByOffset(dragState.targetOffset);
        } else {
          suppressCardClickRef.current = false;
        }

        return;
      }

      if (Math.abs(progress) > 0.28) {
        stepConnection(progress > 0 ? 1 : -1);
        return;
      }

      isAnimatingRef.current = true;
      applyCarouselLayout(0, false, () => {
        isAnimatingRef.current = false;
      });
    },
    [applyCarouselLayout, moveCarouselByOffset, openConnection, stepConnection]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (diagnosticSpaceOpen) setDiagnosticSpaceOpen(false);
        else if (matchSpaceOpen) setMatchSpaceOpen(false);
        else if (prizeSpaceOpen) setPrizeSpaceOpen(false);
        else if (alertsSpaceOpen) setAlertsSpaceOpen(false);
      }
      if (event.key === "ArrowRight") stepConnection(1);
      if (event.key === "ArrowLeft") stepConnection(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (wheelResetTimerRef.current) window.clearTimeout(wheelResetTimerRef.current);
    };
  }, [diagnosticSpaceOpen, matchSpaceOpen, prizeSpaceOpen, alertsSpaceOpen, stepConnection]);

  return (
    <main className={["cx-shell", "cx-shell--ready", matchSpaceOpen ? "cx-shell--match-space" : "", diagnosticSpaceOpen ? "cx-shell--diagnostic-space" : "", prizeSpaceOpen ? "cx-shell--prize-space" : "", alertsSpaceOpen ? "cx-shell--alerts-space" : ""].join(" ")}>
      <header className="topbar cx-topbar" aria-label="Navegación principal">
        <Link className="brand-mark" href="/" aria-label="500 explorar">
          <Image src="/assets/programs-logos/500.svg" alt="500" width={48} height={20} priority />
        </Link>
        <div className="topbar-divider" aria-hidden="true" />
        <nav className="topbar-nav">
          <Link className="nav-item" href="/">
            <Image src="/icons/explore.svg" alt="" width={14} height={16} />
            <span>Explorar</span>
          </Link>
          <Link className="nav-item is-active" href="/conexiones">
            <span>Conexiones</span>
            <b className="nav-ai-badge">AI</b>
          </Link>
          <Link className="nav-item" href="/premio">
            <span>Premio</span>
          </Link>
          <StartupNavItem />
        </nav>
        <div className="topbar-end">
          <AuthControls redirectAfterLogin="/conexiones" />
        </div>
      </header>

      <div className="cx-terrain" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {diagnosticSpaceOpen ? (
          <DiagnosticWizardSpace
            key="diagnostic-space"
            connection={connectionMap.get("diagnostico")!}
            startupName={startupName}
            onBack={() => setDiagnosticSpaceOpen(false)}
          />
        ) : matchSpaceOpen ? (
          <MatchmakingSpace
            key="matchmaking-space"
            connection={connectionMap.get("matchmaker")!}
            startupName={startupName}
            onBack={() => setMatchSpaceOpen(false)}
          />
        ) : prizeSpaceOpen ? (
          <PrizeWizardSpace
            key="prize-space"
            connection={connectionMap.get("premio-regenera")!}
            startupName={startupName}
            onBack={() => setPrizeSpaceOpen(false)}
          />
        ) : alertsSpaceOpen ? (
          <AlertsWizardSpace
            key="alerts-space"
            connection={connectionMap.get("alertas")!}
            startupName={startupName}
            onBack={() => setAlertsSpaceOpen(false)}
          />
        ) : (
          <section
            key="cx-playground"
            className="cx-playground"
            aria-label={`Conexiones disponibles para ${startupName}`}
          >
            <div className="cx-hero-copy">
              <h1>CONEXIONES</h1>
              <p>
                Tu startup en el lugar donde la visibilidad se convierte en conexiones, oportunidades
                y próximos pasos reales.
              </p>

              <nav className="cx-tabs" aria-label="Tipos de conexión">
                {carouselConnections.map(connection => {
                  const isActive = connection.id === activeConnection.id;

                  return (
                    <button
                      key={connection.id}
                      type="button"
                      className={isActive ? "is-active" : ""}
                      style={{ "--connection-accent": connection.accent } as CSSProperties}
                      onClick={() => selectConnection(connection.id)}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <ConnectionSymbol name={connection.symbol} />
                      <span>{connection.tabLabel}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div
              ref={jukeboxRef}
              className="cx-jukebox"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerDrag}
              onPointerCancel={finishPointerDrag}
              aria-label="Carrusel de conexiones. Usa scroll, arrastra o navega con las flechas."
            >
              <div className="cx-jukebox__arc" aria-hidden="true" />
              <div className="cx-jukebox__cards">
                {carouselItems.map(item => (
                  <ConnectionCard
                    key={item.key}
                    cardKey={item.key}
                    connection={item.connection}
                    offset={item.offset}
                    isClone={item.isClone}
                    isActive={item.offset === 0}
                    onCardMount={(node) => {
                      if (node) {
                        cardRefs.current[item.key] = node;
                      } else {
                        delete cardRefs.current[item.key];
                      }
                    }}
                    onActivate={() => {
                      if (!suppressCardClickRef.current) {
                        moveCarouselByOffset(item.offset);
                      }
                    }}
                    onOpen={() => {
                      if (suppressCardClickRef.current) return;
                      openConnection(item.connection.id);
                    }}
                  />
                ))}
              </div>

              <div className="cx-jukebox__mobile-controls" aria-label="Cambiar conexión">
                <button type="button" onClick={() => stepConnection(-1)} aria-label="Conexión anterior">
                  <ConnectionIcon name="arrow" />
                </button>
                <span aria-live="polite">{activeConnection.tabLabel}</span>
                <button type="button" onClick={() => stepConnection(1)} aria-label="Siguiente conexión">
                  <ConnectionIcon name="arrow" />
                </button>
              </div>
            </div>
          </section>
        )}
      </AnimatePresence>
    </main>
  );
}

function ConnectionCard({
  cardKey,
  connection,
  offset,
  isClone,
  isActive,
  onCardMount,
  onActivate,
  onOpen
}: {
  cardKey: string;
  connection: Connection;
  offset: number;
  isClone: boolean;
  isActive: boolean;
  onCardMount: (node: HTMLElement | null) => void;
  onActivate: () => void;
  onOpen: () => void;
}) {
  const slotName = getSlotName(offset);

  return (
    <article
      ref={onCardMount}
      className={[
        "cx-jukebox-card",
        `cx-jukebox-card--${slotName}`,
        isActive ? "is-active" : "",
        isClone ? "is-clone" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--card-bg": connection.cardColor,
          "--card-ink": connection.cardInk,
          "--card-muted": connection.cardMuted,
          "--connection-accent": connection.accent
        } as CSSProperties
      }
      data-connection-id={connection.id}
      data-carousel-offset={offset}
      role="button"
      tabIndex={0}
      aria-label={`${isActive ? "Abrir" : "Seleccionar"} ${connection.title}`}
      data-carousel-card={cardKey}
      onClick={() => {
        if (isActive) {
          onOpen();
        } else {
          onActivate();
        }
      }}
      onKeyDown={event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (isActive) {
          onOpen();
        } else {
          onActivate();
        }
      }}
    >
      <div className="cx-jukebox-card__content">
        <div className="cx-jukebox-card__topline">
          <span>CONEXIONES</span>
        </div>

        <div className="cx-jukebox-card__titleblock">
          <ConnectionSymbol name={connection.symbol} />
          <div>
            <h2>{connection.title}</h2>
            <p>{connection.cardDescription}</p>
          </div>
        </div>

        <ConnectionCardVisual connection={connection} priority={isActive} />

        <button
          type="button"
          className="cx-jukebox-card__cta"
          onClick={event => {
            event.stopPropagation();
            if (isActive) {
              onOpen();
            } else {
              onActivate();
            }
          }}
        >
          <span>{connection.cta}</span>
          <ConnectionIcon name="arrow" />
        </button>
      </div>
    </article>
  );
}

function ConnectionCardVisual({
  connection,
  priority
}: {
  connection: Connection;
  priority: boolean;
}) {
  if (connection.visual === "logo") {
    return (
      <div className="cx-jukebox-card__visual cx-jukebox-card__visual--prize" aria-hidden="true">
        <div className="cx-card-logo-mark">
          <Image src="/500svg.svg" alt="" width={174} height={72} priority={priority} />
        </div>
      </div>
    );
  }

  if (connection.visual === "avatars") {
    const avatars = ["/assets/01.webp", "/assets/03.webp", "/assets/05.webp", "/assets/02.webp", "/assets/06.webp"];

    return (
      <div className="cx-jukebox-card__visual cx-jukebox-card__visual--network" aria-hidden="true">
        <span className="cx-card-node cx-card-node--core">
          <ConnectionSymbol name={connection.symbol} />
        </span>
        <div className="cx-card-avatar-strip">
          {avatars.map((src, index) => (
            <span key={`${src}-${index}`} className="cx-card-node cx-card-node--avatar">
              <Image src={src} alt="" fill sizes="38px" priority={priority && index === 0} />
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (connection.visual === "tiles") {
    return (
      <div className="cx-jukebox-card__visual cx-jukebox-card__visual--radar" aria-hidden="true">
        <div className="cx-card-radar-tiles">
          <span>
            <Image src="/assets/03.webp" alt="" fill sizes="82px" priority={priority} />
          </span>
          <span>
            <Image src="/assets/06.webp" alt="" fill sizes="82px" />
          </span>
          <span>
            <Image src="/assets/01.webp" alt="" fill sizes="82px" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="cx-jukebox-card__visual cx-jukebox-card__visual--scan" aria-hidden="true">
      <div className="cx-card-photo-frame">
        <Image src={connection.image} alt="" fill sizes="190px" priority={priority} />
      </div>
    </div>
  );
}

function ConnectionSymbol({ name }: { name: ConnectionSymbolName }) {
  if (name === "circle") {
    return (
      <span className="cx-symbol cx-symbol--circle" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
          <g clipPath="url(#cxCircleClip)">
            <path d="M10.1074 20.2148C15.6895 20.2148 20.2148 15.6895 20.2148 10.1074C20.2148 4.52523 15.6895 0 10.1074 0C4.52523 0 0 4.52523 0 10.1074C0 15.6895 4.52523 20.2148 10.1074 20.2148Z" fill="url(#cxCircleGradient)" />
          </g>
          <defs>
            <radialGradient id="cxCircleGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(10.1074 10.1074) scale(10.1074)">
              <stop stopColor="#0C1600" />
              <stop offset="1" stopColor="#A2D200" />
            </radialGradient>
            <clipPath id="cxCircleClip">
              <rect width="20.2128" height="20.2128" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </span>
    );
  }

  if (name === "semicircle") {
    return (
      <span className="cx-symbol cx-symbol--semicircle" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="21" viewBox="0 0 23 21" fill="none">
          <path d="M11.2796 20.322C17.51 20.3524 22.5811 15.8498 22.6083 10.2644L0.049518 10.1544C0.0222903 15.7398 5.05132 20.2917 11.2796 20.322Z" fill="url(#cxSemiBottom)" />
          <path d="M11.3289 10.1676C17.5593 10.198 22.6304 5.6954 22.6576 0.109971L0.0988344 1.99413e-06C0.0716067 5.58543 5.09854 10.1372 11.3289 10.1676Z" fill="url(#cxSemiTop)" />
          <defs>
            <linearGradient id="cxSemiBottom" x1="22.5836" y1="15.3217" x2="0.0248645" y2="15.2118" gradientUnits="userSpaceOnUse">
              <stop offset="0.02" stopColor="#F2DB0C" />
              <stop offset="1" stopColor="#F88F04" />
            </linearGradient>
            <linearGradient id="cxSemiTop" x1="22.633" y1="5.16733" x2="22.4242" y2="5.16631" gradientUnits="userSpaceOnUse">
              <stop offset="0.02" stopColor="#F2DB0C" />
              <stop offset="1" stopColor="#F88F04" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    );
  }

  if (name === "leafs") {
    return (
      <span className="cx-symbol cx-symbol--leafs" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" viewBox="0 0 22 25" fill="none">
          <path d="M5.3357 10.1764C5.70885 10.5747 6.10923 10.9282 6.53924 11.2236C6.9552 11.5092 7.90305 12.1581 9.34828 12.4209C9.85945 12.5105 10.2976 12.5339 10.5957 12.536L10.5954 12.5419C10.8809 12.542 11.3374 12.5189 11.8617 12.4279C13.3152 12.1664 14.3317 11.5183 14.7741 11.2331C15.2427 10.9265 15.6731 10.585 16.068 10.1871C16.8006 9.45935 17.4191 8.69655 17.8726 7.81912C18.4276 6.72621 18.7352 5.58853 18.8387 4.40415L18.8795 3.45858C18.8851 3.03724 18.8098 2.9809 18.3554 2.95739C17.3688 2.91228 16.4239 3.11573 15.5118 3.48035C14.493 3.88958 13.5721 4.45807 12.8128 5.17615C12.447 5.52937 11.5508 6.40466 10.9596 7.74803C10.8785 7.91109 10.8326 8.05281 10.7921 8.15376C10.7586 8.05084 10.7141 7.90907 10.6581 7.74206C10.183 6.39821 9.36244 5.52214 9.02712 5.16861C8.32978 4.45181 7.4581 3.88057 6.47464 3.47043C5.58856 3.10693 4.66185 2.88904 3.67084 2.94685C3.20187 2.96799 3.1343 3.02621 3.10345 3.44754L3.06262 4.39312C3.06389 5.57754 3.27498 6.71545 3.73378 7.80882C4.1111 8.69634 4.67631 9.45967 5.33381 10.1784L5.3357 10.1764Z" fill="#EBFF57" />
          <path d="M18.2151 11.9375C17.2285 11.8924 16.2836 12.0958 15.3715 12.4604C14.3527 12.8697 13.4318 13.4381 12.6725 14.1562C12.3067 14.5094 11.4105 15.3847 10.8194 16.7281C10.7382 16.8911 10.6924 17.0329 10.6518 17.1338C10.6183 17.0309 10.5739 16.8891 10.5178 16.7221C10.0427 15.3783 9.22217 14.5022 8.88685 14.1487C8.18951 13.4319 7.31783 12.8606 6.33437 12.4505C5.4538 12.0851 4.52702 11.8691 3.53609 11.925C3.06704 11.9481 2.99955 12.0043 2.96871 12.4257L2.92788 13.3712C2.92914 14.5557 3.14024 15.6936 3.59903 16.7869C3.97635 17.6744 4.54156 18.4378 5.19905 19.1565C5.5722 19.5547 5.97258 19.9083 6.40259 20.2036C6.81855 20.4892 7.76639 21.1381 9.21162 21.4009C9.72279 21.4905 10.1609 21.514 10.459 21.516L10.4588 21.5219C10.7443 21.522 11.2007 21.4989 11.7251 21.4079C13.1785 21.1464 14.195 20.4984 14.6374 20.2131C15.106 19.9066 15.5364 19.565 15.9313 19.1672C16.6639 18.4394 17.2824 17.6766 17.7359 16.7992C18.2909 15.7063 18.5985 14.5686 18.702 13.3842L18.7428 12.4387C18.7484 12.0173 18.6731 11.961 18.2187 11.9375L18.2151 11.9375Z" fill="#EBFF57" />
        </svg>
      </span>
    );
  }

  return (
    <span className="cx-symbol cx-symbol--sparkle" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
        <path d="M10.2709 0.00815635L10.4908 0.0326254C10.6782 0.122345 11.1995 1.84333 11.3379 2.16959C11.6393 2.87103 12.128 3.69482 12.5597 4.33918C14.4494 7.15311 17.2594 9.11879 20.5093 10.0649C20.7048 10.1873 20.7048 10.4727 20.5093 10.5869C16.4938 11.7451 12.9914 14.6733 11.3216 18.5312C11.0773 19.0858 10.9144 19.9423 10.6375 20.4398C10.4501 20.7742 10.2302 20.6845 10.0429 20.4153C8.78852 15.8396 5.34316 12.3813 0.920385 10.8072C0.586437 10.6848 0.154756 10.7745 0 10.3259C0 10.2036 0.154754 10.0976 0.252495 10.0405C0.7412 9.77946 1.58014 9.60002 2.1503 9.34717C5.27801 7.98506 8.0066 5.29347 9.37498 2.16143C9.61933 1.59049 9.82296 0.693289 10.0755 0.212065C10.1243 0.122345 10.165 0.0407817 10.2709 0V0.00815635Z" fill="#EBFF57" />
      </svg>
    </span>
  );
}

function ConnectionDetail({
  connection,
  startupName,
  onClose,
  onOpenMatchSpace
}: {
  connection: Connection;
  startupName: string;
  onClose: () => void;
  onOpenMatchSpace: () => void;
}) {
  if (connection.id === "diagnostico") {
    return <DiagnosticDetail connection={connection} startupName={startupName} onClose={onClose} />;
  }

  if (connection.id === "matchmaker") {
    return (
      <MatchmakingDetail
        connection={connection}
        startupName={startupName}
        onClose={onClose}
        onOpenMatchSpace={onOpenMatchSpace}
      />
    );
  }

  if (connection.id === "premio-regenera") {
    return <PrizeDetail connection={connection} startupName={startupName} onClose={onClose} />;
  }

  return <AlertsDetail connection={connection} startupName={startupName} onClose={onClose} />;
}

function ConnectionModalFrame({
  connection,
  titleId,
  panelClassName = "",
  children,
  onClose
}: {
  connection: Connection;
  titleId: string;
  panelClassName?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const modalStyle = {
    "--connection-accent": connection.cardColor,
    "--connection-card-secondary": connection.accent,
    "--connection-card-bg": connection.cardColor,
    "--connection-card-ink": connection.cardInk,
    "--connection-card-muted": connection.cardMuted,
    "--card-bg": connection.cardColor,
    "--card-ink": connection.cardInk,
    "--card-muted": connection.cardMuted
  } as CSSProperties;

  return (
    <motion.section
      className="cx-detail cx-experience-detail"
      style={modalStyle}
      data-connection-id={connection.id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.article
        className={["cx-experience-panel", panelClassName].filter(Boolean).join(" ")}
        data-connection-id={connection.id}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.28, ease: smoothEase }}
        onClick={event => event.stopPropagation()}
      >
        <button type="button" className="cx-detail__close" onClick={onClose} aria-label="Cerrar">
          <span />
          <span />
        </button>
        {children}
      </motion.article>
    </motion.section>
  );
}

function ConnectionExperienceHeader({
  connection,
  titleId,
  title,
  description,
  scoreLabel,
  score,
  scoreDetail,
  action
}: {
  connection: Connection;
  titleId: string;
  title: string;
  description: ReactNode;
  scoreLabel: string;
  score: string;
  scoreDetail: string;
  action: ReactNode;
}) {
  return (
    <header className="cx-exp-header">
      <div className="cx-exp-header__copy">
        <div className="cx-exp-header__meta">
          <span className="cx-exp-header__mark" aria-hidden="true">
            <ConnectionSymbol name={connection.symbol} />
          </span>
          <span className="cx-exp-kicker">{connection.kicker}</span>
        </div>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>
      <aside className="cx-exp-score" aria-label={scoreLabel}>
        <span>{scoreLabel}</span>
        <strong>{score}</strong>
        <small>{scoreDetail}</small>
        {action}
      </aside>
    </header>
  );
}

function useStartupDiagnostic(initialMessage: string) {
  const { user } = useAuth();
  const [agentReport, setAgentReport] = useState<DiagnosticReport | null>(null);
  const [agentStatus, setAgentStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [agentMessage, setAgentMessage] = useState(initialMessage);

  async function runAgentDiagnostic() {
    const startupId = user?.activeStartup?.id;
    if (!startupId) {
      setAgentStatus("error");
      setAgentMessage("El diagnóstico necesita una startup activa para leer señales reales.");
      return false;
    }

    setAgentStatus("loading");
    setAgentMessage("N500 Agent está leyendo claridad, evidencia y fricción del perfil...");

    try {
      const response = await fetch("/api/diagnostics/startup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupId,
          userId: user?.id,
          email: user?.email,
          googleSub: user?.googleSub,
          startupRole: user?.activeStartup?.role
        })
      });
      const responseText = await response.text();
      let data: { diagnostic?: DiagnosticReport; error?: string; code?: string } = {};

      try {
        data = responseText ? JSON.parse(responseText) as typeof data : {};
      } catch {
        data = { error: "N500 Agent no pudo devolver una lectura clara. Inténtalo de nuevo en un momento." };
      }

      if (!response.ok || !data.diagnostic) {
        const setupHint = data.code === "OPENAI_KEY_MISSING"
          ? "N500 Agent todavía no está conectado en este entorno. Revisa la configuración del servidor y vuelve a intentar."
          : data.error ?? "La lectura no pudo completarse ahora. Conservamos el diagnóstico base para que puedas avanzar.";
        throw new Error(setupHint);
      }

      setAgentReport(data.diagnostic);
      setAgentStatus("ready");
      setAgentMessage("Lectura viva actualizada con los datos del perfil.");
      return true;
    } catch (error) {
      setAgentStatus("error");
      setAgentMessage(error instanceof Error ? error.message : "La lectura no pudo completarse ahora.");
      return false;
    }
  }

  return { user, agentReport, agentStatus, agentMessage, runAgentDiagnostic };
}

function DiagnosticWizardSpace({
  connection,
  startupName,
  onBack
}: {
  connection: Connection;
  startupName: string;
  onBack: () => void;
}) {
  const { user, agentReport, agentStatus, agentMessage, runAgentDiagnostic } = useStartupDiagnostic(
    "Listo para leer el perfil visible y convertirlo en un diagnóstico accionable."
  );
  const [activeStepId, setActiveStepId] = useState<DiagnosticWizardStepId>("perfil");
  const [activeDimensionIndex, setActiveDimensionIndex] = useState(0);
  const [processStageId, setProcessStageId] = useState<DiagnosticProcessStageId>("source");
  const [sourceFocusId, setSourceFocusId] = useState<DiagnosticSourceFocusId>("identidad");
  const [sourceProfileRequest, setSourceProfileRequest] = useState<{
    startupId: string;
    profile: StartupProfileData | null;
    status: "ready" | "error";
  } | null>(null);
  const processTimersRef = useRef<number[]>([]);
  const reportDimensions = agentReport?.dimensions.length ? agentReport.dimensions : diagnosticDimensions;
  const reportStats = agentReport?.stats.length ? agentReport.stats : diagnosticStats;
  const reportInsights = agentReport?.insights.length ? agentReport.insights : agentInsights;
  const reportNextSteps = agentReport?.nextSteps.length ? agentReport.nextSteps : diagnosticNextSteps;
  const activeDimension = reportDimensions[Math.min(activeDimensionIndex, reportDimensions.length - 1)] ?? reportDimensions[0];
  const currentProcessStage = diagnosticProcessStages.find(stage => stage.id === processStageId) ?? diagnosticProcessStages[0];
  const sourceFocus = diagnosticSourceFocuses.find(focus => focus.id === sourceFocusId) ?? diagnosticSourceFocuses[0];
  const activeStepIndex = diagnosticWizardSteps.findIndex(step => step.id === activeStepId);
  const visibleStepIndex = Math.max(activeStepIndex, 0);
  const startup = user?.activeStartup;
  const startupId = startup?.id ?? null;
  const sourceProfile = sourceProfileRequest?.startupId === startupId ? sourceProfileRequest.profile : null;
  const sourceProfileStatus = startupId
    ? sourceProfileRequest?.startupId === startupId ? sourceProfileRequest.status : "loading"
    : "idle";
  const sourcePreviewData = sourceProfile ?? {
    id: startup?.id ?? "preview",
    name: startup?.name ?? startupName,
    category: startup?.category ?? "Perfil público",
    website: null,
    operatingCountry: startup?.country ?? null,
    basedCountry: null,
    header: `${startup?.name ?? startupName} está preparando su perfil público para aliados, premios y capital.`,
    description: "Esta vista resume lo que N500 Agent puede leer ahora mismo: identidad, narrativa, territorio, media y evidencias visibles.",
    tracks: startup?.category ?? null,
    video: null,
    image1: startup?.image ?? null,
    image2: null,
    image3: null,
    image4: null,
    impacto: null,
    data1: null,
    data2: null,
    data3: null,
    dataImage1: null,
    dataImage2: null,
    dataImage3: null,
    quote: null,
    quoteName: null,
    quotePhoto: null
  } satisfies StartupProfileData;
  const spaceStyle = {
    "--connection-accent": connection.cardColor,
    "--connection-card-secondary": connection.accent,
    "--connection-card-bg": connection.cardColor,
    "--connection-card-ink": connection.cardInk,
    "--connection-card-muted": connection.cardMuted,
    "--card-bg": connection.cardColor,
    "--card-ink": connection.cardInk,
    "--card-muted": connection.cardMuted
  } as CSSProperties;

  function clearProcessTimers() {
    processTimersRef.current.forEach(timer => window.clearTimeout(timer));
    processTimersRef.current = [];
  }

  useEffect(() => () => clearProcessTimers(), []);

  useEffect(() => {
    if (!startupId) return;

    let active = true;
    const controller = new AbortController();

    fetch(`/api/startups/${startupId}`, { signal: controller.signal })
      .then(response => response.json())
      .then((data: { startup?: StartupProfileData }) => {
        if (!active) return;
        if (data.startup) {
          setSourceProfileRequest({ startupId, profile: data.startup, status: "ready" });
        } else {
          setSourceProfileRequest({ startupId, profile: null, status: "error" });
        }
      })
      .catch(() => {
        if (active) setSourceProfileRequest({ startupId, profile: null, status: "error" });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [startupId]);

  useEffect(() => {
    if (activeStepId !== "perfil" || agentStatus === "loading") return;

    const interval = window.setInterval(() => {
      setSourceFocusId(current => {
        const currentIndex = diagnosticSourceFocuses.findIndex(focus => focus.id === current);
        return diagnosticSourceFocuses[(currentIndex + 1) % diagnosticSourceFocuses.length].id;
      });
    }, 2800);

    return () => window.clearInterval(interval);
  }, [activeStepId, agentStatus]);

  async function startLiveDiagnostic() {
    clearProcessTimers();
    setProcessStageId("reading");
    setActiveStepId("lectura");
    setActiveDimensionIndex(0);

    const stagedUpdates: Array<{ delay: number; stage: DiagnosticProcessStageId; focus?: DiagnosticSourceFocusId }> = [
      { delay: 560, stage: "checking", focus: "narrativa" },
      { delay: 1240, stage: "scoring", focus: "traccion" },
      { delay: 1980, stage: "planning", focus: "media" }
    ];

    processTimersRef.current = stagedUpdates.map(update => window.setTimeout(() => {
      const nextStage = diagnosticProcessStages.find(stage => stage.id === update.stage);
      if (!nextStage) return;
      setProcessStageId(update.stage);
      setActiveStepId(nextStage.stepId);
      if (update.focus) setSourceFocusId(update.focus);
    }, update.delay));

    const minimumRun = new Promise(resolve => window.setTimeout(resolve, 2400));
    const [succeeded] = await Promise.all([runAgentDiagnostic(), minimumRun]);
    clearProcessTimers();
    setProcessStageId(succeeded ? "complete" : "error");
    setActiveStepId(succeeded ? "brechas" : "lectura");
  }

  return (
    <motion.section
      className="dx-space dx-wizard-space"
      style={spaceStyle}
      aria-label={`Wizard de diagnóstico para ${startupName}`}
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.32, ease: smoothEase }}
    >
      <div className="dx-wizard-topbar">
        <button type="button" className="dx-wizard-back" onClick={onBack}>
          <ConnectionIcon name="arrow" />
          Conexiones
        </button>
        <div className="dx-wizard-brand" aria-label={`Diagnóstico para ${startupName}`}>
          <span>{startupName}</span>
          <strong>N500 Agent</strong>
        </div>
        <div className={`dx-wizard-status is-${agentStatus}`} aria-live="polite">
          <span>{agentReport ? `${agentReport.score}%` : "84%"}</span>
          <small>{agentStatus === "loading" ? "leyendo" : agentReport ? "lectura viva" : "base lista"}</small>
        </div>
      </div>

      <div className="dx-wizard-shell">
        <aside className="dx-wizard-rail">
          <span className="dx-wizard-kicker">01 / Diagnóstico</span>
          <h1>Lectura de confianza para {startupName}</h1>
          <p>
            Una revisión guiada del perfil: qué entiende un aliado, qué necesita creer y qué conviene ajustar antes de abrir una conversación importante.
          </p>

          <nav className="dx-wizard-steps" aria-label="Pasos del diagnóstico">
            {diagnosticWizardSteps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={[index === visibleStepIndex ? "is-current" : "", index < visibleStepIndex ? "is-complete" : ""].join(" ")}
                onClick={() => setActiveStepId(step.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
                <small>{step.title}</small>
              </button>
            ))}
          </nav>

          <div className={`dx-wizard-note is-${agentStatus}`} aria-live="polite">
            <span>{currentProcessStage.label}</span>
            <strong>{agentStatus === "loading" ? currentProcessStage.detail : agentMessage}</strong>
            <i style={{ width: `${currentProcessStage.progress}%` }} />
          </div>
        </aside>

        <section className="dx-wizard-stage">
          <AnimatePresence mode="wait">
            {activeStepId === "perfil" ? (
              <motion.div
                key="dx-step-source"
                className="dx-wizard-view dx-wizard-view--source"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.26, ease: smoothEase }}
              >
                <div className="dx-source-hero">
                  <span>N500 Agent</span>
                  <h2>Primero miramos el perfil como lo ve alguien que todavía no te conoce.</h2>
                  <p>
                    No califica el tamaño de la startup. Ordena señales: claridad, evidencia, contexto y fricciones que podrían aparecer antes de una intro, premio o conversación de capital.
                  </p>
                  <div className="dx-source-coach" aria-label="Cómo se usará la información existente">
                    <strong>Esto es lo que ya estamos leyendo.</strong>
                    <small>La preview usa el perfil real; N500 Agent no rellena datos faltantes, solo interpreta señales visibles.</small>
                  </div>
                  <div className="dx-source-focuses" aria-label="Secciones que entran al diagnóstico">
                    {diagnosticSourceFocuses.map(focus => (
                      <button
                        key={focus.id}
                        type="button"
                        className={focus.id === sourceFocusId ? "is-active" : ""}
                        onClick={() => setSourceFocusId(focus.id)}
                      >
                        <span>{focus.label}</span>
                        <small>{focus.detail}</small>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="dx-primary"
                    onClick={startLiveDiagnostic}
                    disabled={agentStatus === "loading"}
                  >
                    {agentStatus === "loading" ? "Leyendo perfil" : "Correr diagnóstico"}
                    <ConnectionIcon name="arrow" />
                  </button>
                </div>
                <aside className="dx-source-preview-panel" aria-label="Snapshot del perfil que alimenta el diagnóstico">
                  <div className="dx-source-preview-head">
                    <span>{sourceProfileStatus === "ready" ? "Snapshot del perfil" : sourceProfileStatus === "loading" ? "Cargando perfil" : "Snapshot base"}</span>
                    <strong>{startupName}</strong>
                    <small>Vista pública sin modo edición.</small>
                  </div>
                  <div className="dx-source-preview-frame">
                    <div className="dx-preview-snapshot" aria-hidden="true">
                      <StartupProfileView data={sourcePreviewData} />
                    </div>
                  </div>
                </aside>
              </motion.div>
            ) : null}

            {activeStepId === "lectura" ? (
              <motion.div
                key="dx-step-reading"
                className="dx-wizard-view dx-wizard-view--reading"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.26, ease: smoothEase }}
              >
                <section className="dx-reading-score" aria-label="Confianza del perfil">
                  <div className="dx-score-orbit" style={{ "--dx-score": `${agentReport?.score ?? 84}%` } as CSSProperties}>
                    <strong>{agentReport?.score ?? 84}%</strong>
                    <span>confianza</span>
                  </div>
                  <div>
                    <span>Lectura principal</span>
                    <h2>{agentReport ? "Diagnóstico vivo listo" : "Base de diagnóstico preparada"}</h2>
                    <p>
                      {agentReport?.summary ?? "El perfil ya comunica una tesis entendible. El trabajo ahora es convertir esa claridad en pruebas comparables y señales que reduzcan fricción."}
                    </p>
                    <div className={`dx-process-card is-${agentStatus}`} aria-live="polite">
                      <div>
                        <span>{currentProcessStage.label}</span>
                        <strong>{agentStatus === "loading" ? currentProcessStage.detail : agentMessage}</strong>
                      </div>
                      <i style={{ width: `${currentProcessStage.progress}%` }} />
                    </div>
                    <button
                      type="button"
                      className="dx-primary"
                      onClick={startLiveDiagnostic}
                      disabled={agentStatus === "loading"}
                    >
                      {agentStatus === "loading" ? "Actualizando" : agentReport ? "Actualizar lectura" : "Encender lectura viva"}
                      <ConnectionIcon name="arrow" />
                    </button>
                  </div>
                </section>
                <div className="dx-process-runner" aria-label="Proceso del diagnóstico">
                  {diagnosticProcessStages.slice(1, 5).map(stage => {
                    const isDone = currentProcessStage.progress > stage.progress;
                    const isActive = processStageId === stage.id && agentStatus === "loading";
                    return (
                      <article key={stage.id} className={[isDone ? "is-done" : "", isActive ? "is-active" : ""].join(" ")}>
                        <span>{isDone ? "OK" : isActive ? "RUN" : ""}</span>
                        <strong>{stage.label}</strong>
                        <small>{stage.detail}</small>
                      </article>
                    );
                  })}
                </div>
                <div className="dx-insight-stack" aria-label="Insights del diagnóstico">
                  {reportInsights.map((insight, index) => (
                    <article key={insight}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <p>{insight}</p>
                    </article>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {activeStepId === "brechas" ? (
              <motion.div
                key="dx-step-gaps"
                className="dx-wizard-view dx-wizard-view--gaps"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.26, ease: smoothEase }}
              >
                <div className="dx-stat-strip" aria-label="Estadísticas del diagnóstico">
                  {reportStats.map(stat => (
                    <article key={stat.label}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      <small>{stat.detail}</small>
                    </article>
                  ))}
                </div>

                <section className="dx-gap-board">
                  <div className="dx-gap-tabs" aria-label="Dimensiones analizadas">
                    {reportDimensions.map((dimension, index) => (
                      <button
                        key={dimension.label}
                        type="button"
                        className={index === activeDimensionIndex ? "is-active" : ""}
                        onClick={() => setActiveDimensionIndex(index)}
                      >
                        <span>{dimension.score}%</span>
                        {dimension.label}
                      </button>
                    ))}
                  </div>
                  <article className="dx-gap-detail">
                    <span>Prioridad seleccionada</span>
                    <h2>{activeDimension.label}</h2>
                    <p>{activeDimension.signal}</p>
                    <div className="dx-gap-meter" aria-label={`${activeDimension.label} ${activeDimension.score}%`}>
                      <i style={{ width: `${activeDimension.score}%` }} />
                    </div>
                    <strong>{activeDimension.recommendation}</strong>
                  </article>
                </section>
              </motion.div>
            ) : null}

            {activeStepId === "plan" ? (
              <motion.div
                key="dx-step-plan"
                className="dx-wizard-view dx-wizard-view--plan"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.26, ease: smoothEase }}
              >
                <section className="dx-plan-head">
                  <span>Siguiente movimiento</span>
                  <h2>No se trata de verse más grande. Se trata de verse más verificable.</h2>
                  <p>
                    El plan baja la lectura a tareas concretas para Studio, perfil y narrativa pública. Cada acción apunta a reducir una duda antes de que aparezca en una conversación.
                  </p>
                </section>
                <div className="dx-plan-list" aria-label="Acciones recomendadas">
                  {reportNextSteps.map((action, index) => (
                    <article key={action.title}>
                      <span>{String(index + 1).padStart(2, "0")} / {action.owner}</span>
                      <strong>{action.title}</strong>
                      <small>{action.impact}</small>
                    </article>
                  ))}
                </div>
                <footer className="dx-plan-actions">
                  <Link className="dx-primary" href="/studio">
                    Editar perfil
                    <ConnectionIcon name="arrow" />
                  </Link>
                  <button type="button" className="dx-secondary" onClick={() => setActiveStepId("lectura")}>
                    Volver a lectura
                  </button>
                </footer>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>

      <div className="dx-wizard-footnav" aria-label="Navegación del wizard">
        <button
          type="button"
          className="dx-secondary"
          onClick={() => setActiveStepId(diagnosticWizardSteps[Math.max(visibleStepIndex - 1, 0)].id)}
          disabled={visibleStepIndex === 0}
        >
          Anterior
        </button>
        <button
          type="button"
          className="dx-primary"
          onClick={() => setActiveStepId(diagnosticWizardSteps[Math.min(visibleStepIndex + 1, diagnosticWizardSteps.length - 1)].id)}
          disabled={visibleStepIndex === diagnosticWizardSteps.length - 1}
        >
          Siguiente
          <ConnectionIcon name="arrow" />
        </button>
      </div>
    </motion.section>
  );
}

function DiagnosticDetail({
  connection,
  startupName,
  onClose
}: {
  connection: Connection;
  startupName: string;
  onClose: () => void;
}) {
  const { agentReport, agentStatus, agentMessage, runAgentDiagnostic } = useStartupDiagnostic(
    "Lectura inicial preparada con las señales visibles del perfil."
  );
  const [activeDimensionIndex, setActiveDimensionIndex] = useState(0);
  const reportDimensions = agentReport?.dimensions.length ? agentReport.dimensions : diagnosticDimensions;
  const reportStats = agentReport?.stats.length ? agentReport.stats : diagnosticStats;
  const reportInsights = agentReport?.insights.length ? agentReport.insights : agentInsights;
  const reportNextSteps = agentReport?.nextSteps.length ? agentReport.nextSteps : diagnosticNextSteps;
  const activeDimension = reportDimensions[Math.min(activeDimensionIndex, reportDimensions.length - 1)] ?? reportDimensions[0];

  async function updateDiagnostic() {
    const succeeded = await runAgentDiagnostic();
    if (succeeded) setActiveDimensionIndex(0);
  }

  return (
    <ConnectionModalFrame
      connection={connection}
      titleId="diagnostic-detail-title"
      panelClassName="dx-panel"
      onClose={onClose}
    >
      <ConnectionExperienceHeader
        connection={connection}
        titleId="diagnostic-detail-title"
        title="Diagnóstico de perfil"
        description={
          <>
            Así se ve {startupName} desde afuera: qué inspira confianza, qué todavía pide prueba y
            qué movería una conversación con aliados, premios o capital.
          </>
        }
        scoreLabel="Confianza"
        score={`${agentReport?.score ?? 84}%`}
        scoreDetail={agentReport?.scoreDetail ?? "3 señales por reforzar"}
        action={
          <Link className="cx-exp-primary" href="/studio" onClick={onClose}>
            Editar perfil
            <ConnectionIcon name="arrow" />
          </Link>
        }
      />

      <div className="cx-exp-body dx-body">
        <section className="dx-command">
          <div className="cx-ai-card">
            <span>N500 Agent</span>
            <h3>{agentReport ? "Lectura actualizada" : "Lectura inicial"}</h3>
            {agentReport?.summary ? <p>{agentReport.summary}</p> : null}
            {reportInsights.map(insight => (
              <p key={insight}>{insight}</p>
            ))}
            <div className="cx-agent-actions">
              <button
                type="button"
                className="cx-agent-run"
                onClick={updateDiagnostic}
                disabled={agentStatus === "loading"}
              >
                {agentStatus === "loading" ? "Leyendo señales..." : "Actualizar lectura"}
              </button>
              <small className={`cx-agent-note is-${agentStatus}`}>{agentMessage}</small>
            </div>
          </div>

          <div className="dx-stat-grid" aria-label="Estadísticas del perfil">
            {reportStats.map(stat => (
              <article key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.detail}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="dx-analysis">
          <div className="cx-exp-section-head">
            <span>Dimensiones</span>
            <strong>{activeDimension.score}%</strong>
          </div>

          <div className="dx-dimension-tabs" aria-label="Dimensiones analizadas">
            {reportDimensions.map((dimension, index) => (
              <button
                key={dimension.label}
                type="button"
                className={index === activeDimensionIndex ? "is-active" : ""}
                onClick={() => setActiveDimensionIndex(index)}
              >
                <span>{dimension.score}%</span>
                {dimension.label}
              </button>
            ))}
          </div>

          <article className="dx-dimension-detail">
            <span>Prioridad seleccionada</span>
            <h3>{activeDimension.label}</h3>
            <p>{activeDimension.signal}</p>
            <div className="cx-meter" aria-label={`${activeDimension.label} ${activeDimension.score}%`}>
              <i style={{ width: `${activeDimension.score}%` }} />
            </div>
            <strong>{activeDimension.recommendation}</strong>
          </article>

          <div className="dx-next-actions">
            {reportNextSteps.map(action => (
              <article key={action.title}>
                <span>{action.owner}</span>
                <strong>{action.title}</strong>
                <small>{action.impact}</small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </ConnectionModalFrame>
  );
}

function PrizeDetail({
  connection,
  startupName,
  onClose
}: {
  connection: Connection;
  startupName: string;
  onClose: () => void;
}) {
  return (
    <ConnectionModalFrame
      connection={connection}
      titleId="prize-detail-title"
      panelClassName="prize-panel"
      onClose={onClose}
    >
      <ConnectionExperienceHeader
        connection={connection}
        titleId="prize-detail-title"
        title="Ruta de premio"
        description={
          <>
            Conecta {startupName} con la convocatoria más probable, sus requisitos, evidencias
            faltantes y el siguiente paso real dentro de Natura500.
          </>
        }
        scoreLabel="Afinidad estimada"
        score={`${prizeNatura.score}%`}
        scoreDetail={prizeNatura.label}
        action={
          <Link className="cx-exp-primary" href={prizeNatura.href} onClick={onClose}>
            Ver Premio Natura
            <ConnectionIcon name="arrow" />
          </Link>
        }
      />

      <div className="cx-exp-body prize-body">
        <section className="prize-natura-card" aria-label="Premio activo">
          <span>{prizeNatura.label}</span>
          <strong>{prizeNatura.name}</strong>
          <small>{prizeNatura.window}</small>
          <p>{prizeNatura.summary}</p>
          <Link className="prize-natura-card__link" href={prizeNatura.href} onClick={onClose}>
            Abrir página del premio
            <ConnectionIcon name="arrow" />
          </Link>
        </section>

        <section className="prize-route-detail">
          <span className="cx-exp-kicker">Preparación de {startupName}</span>
          <h3>Qué necesita quedar claro antes de la apertura.</h3>
          <div className="prize-check-grid">
            {prizeNatura.checks.map(check => (
              <div key={check}>
                <ConnectionIcon name="check" />
                <strong>{check}</strong>
              </div>
            ))}
          </div>
          <div className="prize-evidence">
            <span>Evidencias a preparar</span>
            {prizeNatura.evidence.map(item => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="prize-levels-mini" aria-label="Niveles del premio">
            {prizeNatura.levels.map(level => (
              <article key={level.name}>
                <span>{level.name}</span>
                <strong>{level.amount}</strong>
                <small>{level.stage}</small>
              </article>
            ))}
          </div>
        </section>

        <aside className="prize-timeline" aria-label="Próximos pasos del premio">
          <span>Timeline Natura500</span>
          {prizeTimelinePreview.map((item, index) => (
            <article key={item.title} className={index === 0 ? "is-current" : ""}>
              <b>{item.date}</b>
              <strong>{item.title}</strong>
            </article>
          ))}
        </aside>

        <section className="prize-benefits-strip" aria-label="Beneficios al registrarte">
          <span>Al registrarte</span>
          {prizeNatura.benefits.map(benefit => (
            <strong key={benefit}>{benefit}</strong>
          ))}
        </section>
      </div>
    </ConnectionModalFrame>
  );
}

function AlertsDetail({
  connection,
  startupName,
  onClose
}: {
  connection: Connection;
  startupName: string;
  onClose: () => void;
}) {
  const [selectedRuleId, setSelectedRuleId] = useState<AlertRuleId>("fondos");
  const [isArmed, setIsArmed] = useState(false);
  const selectedRule = alertRules.find(rule => rule.id === selectedRuleId) ?? alertRules[0];

  return (
    <ConnectionModalFrame
      connection={connection}
      titleId="alerts-detail-title"
      panelClassName="alerts-panel"
      onClose={onClose}
    >
      <ConnectionExperienceHeader
        connection={connection}
        titleId="alerts-detail-title"
        title="Radar de alertas"
        description={
          <>
            Un monitor preparado para señales vivas: filtros por etapa, oportunidades nuevas y
            lectura de N500 Agent sobre qué vale revisar primero para {startupName}.
          </>
        }
        scoreLabel="Señales nuevas"
        score="9"
        scoreDetail={isArmed ? "radar activo" : "listo para activar"}
        action={
          <button type="button" className="cx-exp-primary" onClick={() => setIsArmed(current => !current)}>
            {isArmed ? "Radar activo" : "Activar radar"}
            <ConnectionIcon name="arrow" />
          </button>
        }
      />

      <div className="cx-exp-body alerts-body">
        <section className="alerts-rules" aria-label="Reglas de alertas">
          {alertRules.map(rule => (
            <button
              key={rule.id}
              type="button"
              className={rule.id === selectedRule.id ? "is-active" : ""}
              onClick={() => setSelectedRuleId(rule.id)}
            >
              <span>{rule.cadence}</span>
              <strong>{rule.label}</strong>
              <small>{rule.query}</small>
              <b>{rule.count}</b>
            </button>
          ))}
        </section>

        <section className="alerts-feed">
          <div className="cx-exp-section-head">
            <span>Lectura N500 Agent</span>
            <strong>{selectedRule.label}</strong>
          </div>
          <p>
            Prioriza oportunidades con afinidad superior a 80%, ventana menor a 30 días y evidencia que
            puedas preparar desde Studio sin pedir información nueva al equipo.
          </p>
          {alertFeed.map(item => (
            <article key={item.title}>
              <div>
                <span>{item.source}</span>
                <strong>{item.title}</strong>
                <small>Detectado {item.time}</small>
              </div>
              <b>{item.fit}%</b>
            </article>
          ))}
        </section>

        <aside className="alerts-channels">
          <span>Entrega</span>
          {alertChannels.map(channel => (
            <article key={channel.id}>
              <strong>{channel.label}</strong>
              <small>{channel.cadence}</small>
            </article>
          ))}
          <Link className="cx-exp-secondary" href="/studio" onClick={onClose}>
            Ajustar perfil fuente
          </Link>
        </aside>
      </div>
    </ConnectionModalFrame>
  );
}

function MatchmakingDetail({
  connection,
  startupName,
  onClose,
  onOpenMatchSpace
}: {
  connection: Connection;
  startupName: string;
  onClose: () => void;
  onOpenMatchSpace: () => void;
}) {
  const [objective, setObjective] = useState<MatchObjectiveId>("capital");
  const [selectedMatchId, setSelectedMatchId] = useState(matchCards[0].id);

  const visibleMatches = useMemo(
    () =>
      [...matchCards].sort((left, right) => {
        const leftPriority = left.objective === objective ? 1 : 0;
        const rightPriority = right.objective === objective ? 1 : 0;
        return rightPriority - leftPriority || right.score - left.score;
      }),
    [objective]
  );

  const selectedMatch = visibleMatches.find(match => match.id === selectedMatchId) ?? visibleMatches[0];
  const topMatches = visibleMatches.slice(0, 3);

  function chooseObjective(nextObjective: MatchObjectiveId) {
    setObjective(nextObjective);
    setSelectedMatchId(matchCards.find(match => match.objective === nextObjective)?.id ?? matchCards[0].id);
  }

  return (
    <ConnectionModalFrame
      connection={connection}
      titleId="mm-detail-title"
      panelClassName="cx-detail__panel--matchmaker mm-panel is-network-brief"
      onClose={onClose}
    >
      <header className="mm-header">
        <div className="mm-header__copy">
          <div className="cx-exp-header__meta">
            <span className="cx-exp-header__mark" aria-hidden="true">
              <ConnectionSymbol name={connection.symbol} />
            </span>
            <span className="mm-kicker">02 / Capital inteligente</span>
          </div>
          <h2 id="mm-detail-title">Matchmaking</h2>
          <p>
            {startupName} entra a una red priorizada por intención, etapa y señales de confianza.
            La vista ordena con quién conviene hablar primero y por qué vale abrir esa conversación.
          </p>
        </div>
      </header>

      <div className="mm-body">
        <motion.div
          className="mm-view mm-view--brief"
          initial={{ opacity: 0, x: -24, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -28, filter: "blur(8px)" }}
          transition={{ duration: 0.34, ease: smoothEase }}
        >
          <section className="mm-entry-card">
            <div
              className="mm-orbit-score"
              style={{ "--match-score": "82%" } as CSSProperties}
              aria-label="Perfil 82 por ciento listo"
            >
              <strong>82%</strong>
              <span>señales listas</span>
            </div>
            <div>
              <span className="mm-chip">Confianza</span>
              <h3>Red lista para abrirse</h3>
              <p>
                Ya hay señales suficientes para sugerir primeras conversaciones. El mapa separa capital,
                programas, mercado y visibilidad para que el siguiente paso no sea buscar más, sino elegir mejor.
              </p>
            </div>
            <footer className="mm-step-actions">
              <button type="button" className="mm-primary" onClick={onOpenMatchSpace}>
                Abrir red
                <ConnectionIcon name="arrow" />
              </button>
              <button type="button" className="mm-secondary" onClick={onClose}>
                Seguir explorando
              </button>
            </footer>
          </section>

          <section className="mm-network-preview" aria-label="Vista previa del espacio de networking">
            <MatchNetworkMap startupName={startupName} selectedMatchId={selectedMatch.id} />
            <div className="mm-brief-toplist" aria-label="Top matches iniciales">
              {topMatches.map(match => (
                <button
                  key={match.id}
                  type="button"
                  className={match.id === selectedMatch.id ? "is-selected" : ""}
                  onClick={() => setSelectedMatchId(match.id)}
                >
                  <span>{match.type}</span>
                  <strong>{match.title}</strong>
                  <b>{match.score}%</b>
                </button>
              ))}
            </div>
            <div className="mm-target-grid">
              {matchObjectives.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === objective ? "is-selected" : ""}
                  onClick={() => chooseObjective(item.id)}
                >
                  <span>{item.label}</span>
                  <strong>{item.metric.split(" ")[0]}</strong>
                  <small>{item.metric.replace(/^\S+\s*/, "")}</small>
                </button>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </ConnectionModalFrame>
  );
}

function PrizeWizardSpace({
  connection,
  startupName,
  onBack
}: {
  connection: Connection;
  startupName: string;
  onBack: () => void;
}) {
  const spaceStyle = {
    "--connection-accent": connection.cardColor,
    "--connection-card-secondary": connection.accent,
    "--connection-card-bg": connection.cardColor,
    "--connection-card-ink": connection.cardInk,
    "--connection-card-muted": connection.cardMuted,
    "--card-bg": connection.cardColor,
    "--card-ink": connection.cardInk,
    "--card-muted": connection.cardMuted
  } as CSSProperties;

  return (
    <motion.section
      className="dx-space dx-wizard-space cx-prize500-space"
      style={spaceStyle}
      aria-label={`Ruta del Premio Natura500 para ${startupName}`}
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.32, ease: smoothEase }}
    >
      <div className="dx-wizard-topbar">
        <button type="button" className="dx-wizard-back" onClick={onBack}>
          <ConnectionIcon name="arrow" />
          Conexiones
        </button>
        <div className="dx-wizard-brand" aria-label={`Premio Natura500 para ${startupName}`}>
          <span>{startupName}</span>
          <strong>Premio Natura500</strong>
        </div>
        <div className="dx-wizard-status is-ready" aria-live="polite">
          <span>{prizeNatura.score}%</span>
          <small>afinidad estimada</small>
        </div>
      </div>

      <div className="cx-prize500-shell">
        <aside className="cx-prize500-hero">
          <span className="cx-prize500-kicker">Premio Natura500 · 2026</span>
          <h1>{startupName} en ruta al premio.</h1>
          <p>
            Un resumen accionable de la página del Premio Natura500: afinidad, capital posible,
            entregas clave y la evidencia que conviene preparar ahora.
          </p>

          <div className="cx-prize500-award" aria-label="Capital reservado en el premio">
            <span>Hasta</span>
            <strong>USD $100K</strong>
            <small>Tres niveles según etapa</small>
          </div>

          <Link className="cx-prize500-primary" href={prizeNatura.href} onClick={onBack}>
            Abrir Premio Natura500
            <ConnectionIcon name="arrow" />
          </Link>
        </aside>

        <section className="cx-prize500-main" aria-label="Resumen compacto del premio">
          <article className="cx-prize500-panel cx-prize500-panel--match">
            <div className="cx-prize500-panel__copy">
              <span className="cx-prize500-eyebrow">Match estimado</span>
              <h2>Capital para soluciones regenerativas con evidencia pública.</h2>
              <p>{prizeNatura.summary}</p>
            </div>
            <div className="cx-prize500-score">
              <strong>{prizeNatura.score}%</strong>
              <span>Afinidad</span>
            </div>
          </article>

          <article className="cx-prize500-panel cx-prize500-panel--route">
            <header className="cx-prize500-section-head">
              <span>La ruta</span>
              <h2>Seis hitos. Una entrega clara en cada uno.</h2>
            </header>
            <ol className="cx-prize500-route">
              {prizeTimelinePreview.map((item, index) => (
                <li key={item.title} className={index === 0 ? "is-current" : ""}>
                  <span>{index === 0 ? "Ahora" : item.date}</span>
                  <strong>{item.title}</strong>
                </li>
              ))}
            </ol>
          </article>

          <div className="cx-prize500-grid">
            <article className="cx-prize500-panel">
              <header className="cx-prize500-section-head">
                <span>Niveles</span>
                <h2>Participas desde tu etapa, no desde tu tamaño.</h2>
              </header>
              <div className="cx-prize500-levels">
                {prizeNatura.levels.map((level, index) => (
                  <div key={level.name}>
                    <span>0{index + 1}</span>
                    <strong>{level.amount}</strong>
                    <h3>{level.name}</h3>
                    <p>{level.stage}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="cx-prize500-panel">
              <header className="cx-prize500-section-head">
                <span>Listo para aplicar</span>
                <h2>Lo mínimo que Conexiones necesita monitorear.</h2>
              </header>
              <ul className="cx-prize500-checks">
                {prizeNatura.checks.map(check => (
                  <li key={check}>
                    <ConnectionIcon name="check" />
                    {check}
                  </li>
                ))}
              </ul>
              <div className="cx-prize500-evidence">
                <span>Evidencia pendiente</span>
                {prizeNatura.evidence.map(item => (
                  <small key={item}>{item}</small>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </motion.section>
  );
}

function AlertsWizardSpace({
  connection,
  startupName,
  onBack
}: {
  connection: Connection;
  startupName: string;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [selectedRuleId, setSelectedRuleId] = useState<AlertRuleId>("fondos");
  const [isArmed, setIsArmed] = useState(false);
  const [activeChannels, setActiveChannels] = useState<AlertChannelId[]>(["email", "studio"]);
  const [destinations, setDestinations] = useState<Record<AlertChannelId, string>>({
    email: user?.email ?? "",
    whatsapp: "",
    instagram: "",
    slack: "",
    studio: user?.activeStartup?.name ?? "Tu workspace activo"
  });
  const selectedRule = alertRules.find(rule => rule.id === selectedRuleId) ?? alertRules[0];
  const totalActive = alertRules.reduce((sum, rule) => sum + rule.count, 0);
  const spaceStyle = {
    "--alert-accent": connection.cardColor,
    "--alert-secondary": connection.accent,
    "--connection-card-bg": connection.cardColor
  } as CSSProperties;

  function toggleChannel(id: AlertChannelId) {
    setActiveChannels(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  function updateDestination(id: AlertChannelId, value: string) {
    setDestinations(prev => ({ ...prev, [id]: value }));
  }

  return (
    <motion.section
      className={["aw-space", isArmed ? "is-armed" : ""].join(" ")}
      style={spaceStyle}
      aria-label={`Radar de alertas para ${startupName}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: smoothEase }}
    >
      <header className="aw-topbar">
        <button type="button" className="aw-back" onClick={onBack}>
          <ConnectionIcon name="arrow" />
          <span>Volver</span>
        </button>
        <div className="aw-brand" aria-label={`Radar Natura500 · ${startupName}`}>
          <span className="aw-brand__pulse" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>Radar · {startupName}</strong>
        </div>
        <div className={["aw-status", isArmed ? "is-live" : ""].join(" ")} aria-live="polite">
          <span className="aw-status__dot" aria-hidden="true" />
          <strong>{isArmed ? "EN VIVO" : "EN PAUSA"}</strong>
          <small>{totalActive} señales</small>
        </div>
      </header>

      <div className="aw-scroll">
        <section className="aw-hero" aria-labelledby="aw-hero-title">
          <div className="aw-hero__eyebrow">
            <span>04 · Alertas</span>
          </div>

          <h1 id="aw-hero-title" className="aw-hero__title">
            Solo lo <mark>serio</mark>.
          </h1>

          <div className="aw-hero__actions">
            <button
              type="button"
              className={["aw-cta", isArmed ? "is-armed" : ""].join(" ")}
              onClick={() => setIsArmed(current => !current)}
              aria-pressed={isArmed}
            >
              <span className="aw-cta__core">
                <span className="aw-cta__label">{isArmed ? "Radar activo" : "Encender radar"}</span>
              </span>
              <span className="aw-cta__icon" aria-hidden="true">
                {isArmed ? "■" : "▶"}
              </span>
            </button>
            <Link className="aw-ghost" href="/studio" onClick={onBack}>
              Ajustar perfil
              <ConnectionIcon name="arrow" />
            </Link>
          </div>

          <div className="aw-waveform" aria-hidden="true">
            {Array.from({ length: 28 }).map((_, idx) => (
              <span key={idx} style={{ "--bar": idx } as CSSProperties} />
            ))}
          </div>
        </section>

        <section className="aw-block aw-detect" aria-labelledby="aw-detect-title">
          <div className="aw-block__head">
            <span>01 · Qué buscamos</span>
            <h2 id="aw-detect-title">Tipo de oportunidad</h2>
          </div>
          <div className="aw-rules">
            {alertRules.map(rule => {
              const active = rule.id === selectedRule.id;
              return (
                <button
                  key={rule.id}
                  type="button"
                  className={["aw-rule", active ? "is-active" : ""].join(" ")}
                  onClick={() => setSelectedRuleId(rule.id)}
                  aria-pressed={active}
                >
                  <span className="aw-rule__cadence">{rule.cadence}</span>
                  <strong className="aw-rule__name">{rule.label}</strong>
                  <span className="aw-rule__count">
                    <em>{rule.count}</em>
                    <small>act.</small>
                  </span>
                  <span className="aw-rule__check" aria-hidden="true">
                    {active ? <ConnectionIcon name="check" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="aw-block aw-feed" aria-labelledby="aw-feed-title">
          <div className="aw-block__head">
            <span>02 · Vivo ahora</span>
            <h2 id="aw-feed-title">{selectedRule.label}</h2>
          </div>
          <ul className="aw-ticker">
            {alertFeed.map((item, index) => (
              <li key={item.title} style={{ "--row": index } as CSSProperties}>
                <span className="aw-ticker__index">{String(index + 1).padStart(2, "0")}</span>
                <div className="aw-ticker__body">
                  <span className="aw-ticker__source">{item.source}</span>
                  <strong>{item.title}</strong>
                  <small>{item.time}</small>
                </div>
                <div className="aw-ticker__fit" aria-label={`${item.fit} por ciento de afinidad`}>
                  <em>{item.fit}%</em>
                  <i aria-hidden="true" style={{ "--fit": `${item.fit}%` } as CSSProperties} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="aw-block aw-channels" aria-labelledby="aw-channels-title">
          <div className="aw-block__head">
            <span>03 · Canales</span>
            <h2 id="aw-channels-title">Dónde te avisamos</h2>
          </div>
          <ul className="aw-channels__grid" role="list">
            {alertChannels.map(channel => {
              const active = activeChannels.includes(channel.id);
              const destination = destinations[channel.id];
              return (
                <li
                  key={channel.id}
                  className={["aw-channel", active ? "is-on" : ""].join(" ")}
                  data-channel={channel.id}
                >
                  <button
                    type="button"
                    className="aw-channel__row"
                    onClick={() => toggleChannel(channel.id)}
                    aria-pressed={active}
                    aria-label={`${active ? "Desactivar" : "Activar"} alertas por ${channel.label}`}
                  >
                    <span className="aw-channel__icon" aria-hidden="true">
                      <AlertChannelIcon id={channel.id} />
                    </span>
                    <span className="aw-channel__copy">
                      <strong>{channel.label}</strong>
                    </span>
                    <span className="aw-channel__switch" aria-hidden="true">
                      <i />
                    </span>
                  </button>
                  {active ? (
                    <div className="aw-channel__field">
                      <label>
                        <span>{channel.destinationLabel}</span>
                        <input
                          type={channel.id === "email" ? "email" : channel.id === "whatsapp" ? "tel" : "text"}
                          value={destination}
                          placeholder={channel.destinationPlaceholder}
                          onChange={event => updateDestination(channel.id, event.target.value)}
                          spellCheck={false}
                          autoComplete="off"
                          disabled={channel.id === "studio"}
                        />
                      </label>
                      <small>{channel.cadence}</small>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="aw-foot">
          <small>{isArmed ? `Vigilando · ${activeChannels.length} canal${activeChannels.length === 1 ? "" : "es"}` : "En pausa"}</small>
          <button
            type="button"
            className={["aw-cta aw-cta--small", isArmed ? "is-armed" : ""].join(" ")}
            onClick={() => setIsArmed(current => !current)}
          >
            <span className="aw-cta__core">
              <span className="aw-cta__label">{isArmed ? "Pausar" : "Encender"}</span>
            </span>
            <span className="aw-cta__icon" aria-hidden="true">
              {isArmed ? "■" : "▶"}
            </span>
          </button>
        </footer>
      </div>
    </motion.section>
  );
}


function MatchmakingSpace({
  connection,
  startupName,
  onBack
}: {
  connection: Connection;
  startupName: string;
  onBack: () => void;
}) {
  const [objective, setObjective] = useState<MatchObjectiveId>("capital");
  const [entityFocus, setEntityFocus] = useState<MatchEntityId>("grants");
  const [selectedMatchId, setSelectedMatchId] = useState(matchCards[0].id);
  const [viewMode, setViewMode] = useState<MatchViewMode>("mapa");
  const [matchQuery, setMatchQuery] = useState("");
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [introRequested, setIntroRequested] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTotal, setGeneratedTotal] = useState(18);
  const panStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  const normalizedMatchQuery = matchQuery.trim().toLowerCase();
  const orderedMatches = useMemo(
    () =>
      [...matchCards].sort((left, right) => {
        const leftPriority = left.objective === objective ? 1 : 0;
        const rightPriority = right.objective === objective ? 1 : 0;
        const leftEntityPriority = left.entity === entityFocus ? 1 : 0;
        const rightEntityPriority = right.entity === entityFocus ? 1 : 0;
        return rightPriority - leftPriority || rightEntityPriority - leftEntityPriority || right.score - left.score;
      }),
    [entityFocus, objective]
  );

  const visibleMatches = useMemo(
    () => {
      if (!normalizedMatchQuery) return orderedMatches;

      return orderedMatches.filter(match => {
        const searchableMatch = [
          match.title,
          match.type,
          match.status,
          match.summary,
          match.objective,
          match.entity,
          match.nextAction,
          ...match.reasons,
          ...match.gaps
        ].join(" ").toLowerCase();

        return searchableMatch.includes(normalizedMatchQuery);
      });
    },
    [normalizedMatchQuery, orderedMatches]
  );

  const selectedMatch = visibleMatches.find(match => match.id === selectedMatchId) ?? visibleMatches[0] ?? orderedMatches[0] ?? matchCards[0];
  const selectedObjective = matchObjectives.find(item => item.id === selectedMatch.objective) ?? matchObjectives[0];
  const selectedEntity = matchEntityGroups.find(item => item.id === selectedMatch.entity) ?? matchEntityGroups[0];
  const selectedCorrelations = matchCorrelationsByObjective[selectedMatch.objective];
  const selectedMode = matchModeDetails[viewMode];
  const entityMatches = orderedMatches
    .filter(match => match.entity === entityFocus)
    .sort((left, right) => right.score - left.score);
  const comparisonSource = [
    selectedMatch,
    ...visibleMatches,
    ...orderedMatches.filter(match => match.objective === selectedMatch.objective || match.entity === selectedMatch.entity),
    ...orderedMatches
  ];
  const comparisonMatches = Array.from(new Map(comparisonSource.map(match => [match.id, match])).values())
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
  const strongestSignal = selectedCorrelations[0];
  const scoredMatches = visibleMatches.length ? visibleMatches : orderedMatches;
  const connectionProbability = Math.round(
    scoredMatches.slice(0, 3).reduce((total, match) => total + match.score, 0) / Math.min(scoredMatches.length, 3)
  );
  const spaceStyle = {
    "--connection-accent": connection.cardColor,
    "--connection-card-secondary": connection.accent,
    "--connection-card-bg": connection.cardColor,
    "--connection-card-ink": connection.cardInk,
    "--connection-card-muted": connection.cardMuted,
    "--card-bg": connection.cardColor,
    "--card-ink": connection.cardInk,
    "--card-muted": connection.cardMuted
  } as CSSProperties;

  function chooseObjective(nextObjective: MatchObjectiveId) {
    const entityByObjective: Record<MatchObjectiveId, MatchEntityId> = {
      capital: "grants",
      programas: "programs",
      mercado: "buyers",
      premios: "programs"
    };

    setObjective(nextObjective);
    setEntityFocus(entityByObjective[nextObjective]);
    setMatchQuery("");
    setSelectedMatchId(matchCards.find(match => match.objective === nextObjective)?.id ?? matchCards[0].id);
    setIntroRequested(false);
  }

  function selectNetworkMatch(matchId: string) {
    const nextMatch = matchCards.find(match => match.id === matchId);

    if (nextMatch) {
      setObjective(nextMatch.objective);
      setEntityFocus(matchVisualNodes.find(node => node.matchId === matchId)?.entity ?? entityFocus);
    }

    setSelectedMatchId(matchId);
    setIntroRequested(false);
  }

  function chooseEntity(nextEntity: MatchEntityId) {
    const firstEntityMatch = matchCards.find(match => match.entity === nextEntity);

    setEntityFocus(nextEntity);
    setMatchQuery("");

    if (firstEntityMatch) {
      setObjective(firstEntityMatch.objective);
      setSelectedMatchId(firstEntityMatch.id);
    }

    setIntroRequested(false);
  }

  function generateMatches() {
    setIntroRequested(false);
    setMatchQuery("");
    setViewMode("mapa");
    setIsGenerating(true);
    setGeneratedTotal(total => total + 3);
    window.setTimeout(() => {
      setSelectedMatchId(visibleMatches[0]?.id ?? matchCards[0].id);
      setIsGenerating(false);
    }, 900);
  }

  function adjustZoom(delta: number) {
    setMapZoom(current => clampNumber(Number((current + delta).toFixed(2)), 0.82, 1.28));
  }

  function resetMapView() {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
  }

  function handleMapPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("button, a, .mm-explorer-dossier, .mm-entity-rail, .mm-correlation-hud, .mm-map-controls")) return;

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: mapPan.x,
      startY: mapPan.y
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleMapPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!panStartRef.current) return;

    const nextX = panStartRef.current.startX + event.clientX - panStartRef.current.x;
    const nextY = panStartRef.current.startY + event.clientY - panStartRef.current.y;
    setMapPan({
      x: clampNumber(nextX, -120, 120),
      y: clampNumber(nextY, -90, 90)
    });
  }

  function handleMapPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    panStartRef.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleMapWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.04 : 0.04;
    adjustZoom(delta);
  }

  return (
    <motion.section
      className="mm-space mm-space--explorer"
      style={spaceStyle}
      aria-label={`Sala de networking para ${startupName}`}
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.32, ease: smoothEase }}
    >
      <div className="mm-explorer-topbar">
        <button type="button" className="mm-space__back" onClick={onBack}>
          <ConnectionIcon name="arrow" />
          Conexiones
        </button>
        <div className="mm-explorer-brand" aria-label={`Matchmaking para ${startupName}`}>
          <span>{startupName}</span>
          <strong>matchmaking</strong>
        </div>
        <div className="mm-explorer-score" aria-label={`Confianza de red ${connectionProbability} por ciento`}>
          <span>{connectionProbability}%</span>
          <small>afinidad top 3</small>
        </div>
        <button
          type="button"
          className={["mm-generate", isGenerating ? "is-generating" : ""].join(" ")}
          onClick={generateMatches}
          disabled={isGenerating}
        >
          {isGenerating ? "Generando" : "Generar tus matches"}
        </button>
      </div>

      <section className="mm-guide-shell mm-guide-shell--simple" aria-label="Buscar matches">
        <nav className="mm-explorer-filters" aria-label="Intención de matchmaking">
          {matchObjectives.map(item => (
            <button
              key={item.id}
              type="button"
              className={item.id === objective ? "is-selected" : ""}
              onClick={() => chooseObjective(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <label className="mm-match-search mm-match-search--simple">
          <span>Buscar</span>
          <input
            type="search"
            value={matchQuery}
            placeholder="Founder, grant, comprador..."
            onChange={event => {
              const nextQuery = event.target.value;
              const nextNormalizedQuery = nextQuery.trim().toLowerCase();
              const nextMatch = orderedMatches.find(match => {
                const searchableMatch = [
                  match.title,
                  match.type,
                  match.status,
                  match.summary,
                  match.objective,
                  match.entity,
                  match.nextAction,
                  ...match.reasons,
                  ...match.gaps
                ].join(" ").toLowerCase();

                return nextNormalizedQuery && searchableMatch.includes(nextNormalizedQuery);
              });

              setMatchQuery(nextQuery);
              if (nextMatch) {
                setObjective(nextMatch.objective);
                setEntityFocus(nextMatch.entity);
                setSelectedMatchId(nextMatch.id);
              }
              setIntroRequested(false);
            }}
          />
        </label>

        <div className="mm-simple-summary" aria-label="Match seleccionado">
          <span>{visibleMatches.length} matches</span>
          <strong>{selectedMatch.title}</strong>
          <small>{selectedMatch.score}% afinidad</small>
        </div>

        <button
          type="button"
          className={["mm-generate mm-generate--inline", isGenerating ? "is-generating" : ""].join(" ")}
          onClick={generateMatches}
          disabled={isGenerating}
        >
          {isGenerating ? "Buscando" : "Generar"}
        </button>
      </section>

      <div className="mm-explorer-stage">
        <div className="mm-map-controls" aria-label="Controles del mapa de matches">
          <div className="mm-view-toggle" role="group" aria-label="Modo de exploración">
            {(["mapa", "comparar", "ruta"] as MatchViewMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? "is-selected" : ""}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="mm-zoom-tools" role="group" aria-label="Zoom del mapa">
            <button type="button" onClick={() => adjustZoom(-0.08)} aria-label="Alejar mapa">-</button>
            <span>{Math.round(mapZoom * 100)}%</span>
            <button type="button" onClick={() => adjustZoom(0.08)} aria-label="Acercar mapa">+</button>
            <button type="button" onClick={resetMapView}>Reset</button>
          </div>
        </div>

        <MatchNetworkMap
          startupName={startupName}
          selectedMatchId={selectedMatch.id}
          objective={objective}
          entityFocus={entityFocus}
          isGenerating={isGenerating}
          isPanning={isPanning}
          introRequested={introRequested}
          viewMode={viewMode}
          mapZoom={mapZoom}
          mapPan={mapPan}
          onSelect={selectNetworkMatch}
          onPointerDown={handleMapPointerDown}
          onPointerMove={handleMapPointerMove}
          onPointerUp={handleMapPointerUp}
          onWheel={handleMapWheel}
        />

        <section className="mm-match-strip" aria-label="Matches activos">
          {(visibleMatches.length ? visibleMatches : orderedMatches).slice(0, 3).map((match, index) => (
            <button
              key={match.id}
              type="button"
              className={match.id === selectedMatch.id ? "is-selected" : ""}
              onClick={() => selectNetworkMatch(match.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{match.title}</strong>
              <b>{match.score}%</b>
            </button>
          ))}
        </section>

        <section className="mm-correlation-hud" aria-label="Correlaciones del match seleccionado">
          <header>
            <span>correlaciones</span>
            <strong>{selectedEntity.label}</strong>
          </header>
          {selectedCorrelations.map(item => (
            <div key={item.label}>
              <span>{item.label}</span>
              <b>{item.value}%</b>
              <i><em style={{ width: `${item.value}%` }} /></i>
              <small>{item.detail}</small>
            </div>
          ))}
        </section>

        <motion.aside
          key={selectedMatch.id + String(introRequested)}
          className={["mm-explorer-dossier", introRequested ? "is-confirmed" : ""].join(" ")}
          data-mode={viewMode}
          aria-live="polite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: smoothEase }}
        >
          <header>
            <span>{selectedObjective.label} / {selectedMatch.status}</span>
            <h1>{introRequested ? "Intro en cola" : selectedMatch.title}</h1>
            <p>
              {introRequested
                ? "La conexión quedó marcada para curaduría. La red conserva el contexto para preparar una conversación concreta."
                : selectedMatch.summary}
            </p>
          </header>
          <div className="mm-explorer-dossier__entity">
            <span>Conectar con</span>
            <strong>{selectedEntity.label}</strong>
            <small>{selectedEntity.detail}</small>
          </div>
          <div className="mm-explorer-dossier__score">
            <strong>{selectedMatch.score}%</strong>
            <span>{selectedMatch.type}</span>
          </div>
          <div className="mm-match-proof">
            <span>Por qué es tu match</span>
            <strong>{selectedObjective.label} + {selectedEntity.label} + {strongestSignal.label} {strongestSignal.value}%</strong>
            <small>La afinidad sube cuando el perfil de {startupName} comparte intención, etapa, territorio o evidencia con la entidad seleccionada.</small>
          </div>
          {viewMode === "comparar" ? (
            <div className="mm-compare-matrix" aria-label="Comparación de candidatos">
              {comparisonMatches.map(match => (
                <button
                  key={match.id}
                  type="button"
                  className={match.id === selectedMatch.id ? "is-selected" : ""}
                  onClick={() => selectNetworkMatch(match.id)}
                >
                  <span>{match.type}</span>
                  <strong>{match.title}</strong>
                  <i><em style={{ width: `${match.score}%` }} /></i>
                  <small>{match.status}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="mm-explorer-dossier__body">
              <section>
                <span>{viewMode === "ruta" ? "Paso recomendado" : "Por qué conecta"}</span>
                <ul>
                  {(viewMode === "ruta" ? [selectedMatch.nextAction, ...selectedMatch.gaps] : selectedMatch.reasons).map(reason => <li key={reason}>{reason}</li>)}
                </ul>
              </section>
              <section>
                <span>Brechas antes de hablar</span>
                <ul>
                  {selectedMatch.gaps.map(gap => <li key={gap}>{gap}</li>)}
                </ul>
              </section>
            </div>
          )}
          <ol className="mm-explorer-route" aria-label="Ruta de intro">
            {introTimeline.map((item, index) => (
              <li key={item} className={index <= (introRequested ? 2 : 0) ? "is-active" : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ol>
          <footer>
            {introRequested ? (
              <button type="button" className="mm-primary" onClick={onBack}>
                Volver a conexiones
              </button>
            ) : (
              <button type="button" className="mm-primary" onClick={() => setIntroRequested(true)}>
                Solicitar intro curada
                <ConnectionIcon name="arrow" />
              </button>
            )}
          </footer>
        </motion.aside>
      </div>
    </motion.section>
  );
}

function MatchNetworkMap({
  startupName,
  selectedMatchId,
  objective,
  entityFocus,
  isGenerating,
  isPanning,
  introRequested,
  viewMode,
  mapZoom,
  mapPan,
  onSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel
}: {
  startupName: string;
  selectedMatchId: string;
  objective?: MatchObjectiveId;
  entityFocus?: MatchEntityId;
  isGenerating?: boolean;
  isPanning?: boolean;
  introRequested?: boolean;
  viewMode?: MatchViewMode;
  mapZoom?: number;
  mapPan?: { x: number; y: number };
  onSelect?: (matchId: string) => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onWheel?: (event: ReactWheelEvent<HTMLDivElement>) => void;
}) {
  const selectedMatch = matchCards.find(match => match.id === selectedMatchId) ?? matchCards[0];
  const selectedObjective = matchObjectives.find(item => item.id === selectedMatch.objective) ?? matchObjectives[0];
  const selectedMode = matchModeDetails[viewMode ?? "mapa"];
  const visualNodeMap = new Map(matchVisualNodes.map(node => [node.id, node]));

  return (
    <div
      className={["mm-root-field mm-network-explorer", isGenerating ? "is-generating" : ""].join(" ")}
      data-objective={objective ?? selectedMatch.objective}
      data-entity={entityFocus ?? "grants"}
      data-mode={viewMode ?? "mapa"}
      data-panning={isPanning ? "true" : "false"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <div
        className="mm-network-viewport"
        style={{
          "--map-x": `${mapPan?.x ?? 0}px`,
          "--map-y": `${mapPan?.y ?? 0}px`,
          "--map-scale": mapZoom ?? 1
        } as CSSProperties}
      >
        <svg className="mm-network-lines" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
          {matchVisualLinks.map(link => {
            const from = visualNodeMap.get(link.from);
            const to = visualNodeMap.get(link.to);
            if (!from || !to) return null;

            const fromX = from.x * 10;
            const fromY = from.y * 6.2;
            const toX = to.x * 10;
            const toY = to.y * 6.2;
            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2;
            const isSelected = link.to === selectedMatch.id || link.from === selectedMatch.id;

            return (
              <path
                key={`${link.from}-${link.to}`}
                className={[link.strength === "strong" ? "is-strong" : "", isSelected ? "is-selected" : ""].join(" ")}
                d={`M${fromX} ${fromY} C${midX} ${fromY} ${midX} ${toY} ${toX} ${toY}`}
              />
            );
          })}
        </svg>

        <div className="mm-network-plane">
        {matchVisualNodes.map((node, index) => {
          const nodeMatch = node.matchId ? matchCards.find(match => match.id === node.matchId) : undefined;
          const isSelected = node.matchId === selectedMatch.id;
          const isDimmed = node.kind === "match" && nodeMatch?.objective !== (objective ?? selectedMatch.objective);
          const isEntity = Boolean(entityFocus && node.entity === entityFocus);
          const nodeStyle = {
            "--tile-x": `${node.x}%`,
            "--tile-y": `${node.y}%`,
            "--tile-w": `${node.width}px`,
            "--tile-h": `${node.height}px`,
            "--tile-r": `${node.rotation}deg`,
            "--tile-delay": `${index * 0.16}s`
          } as CSSProperties;

          if (node.kind === "source") {
            return (
              <div key={node.id} className="mm-network-source" style={nodeStyle}>
                <span>{node.label}</span>
                <strong>{startupName}</strong>
              </div>
            );
          }

          const nodeContent = (
            <>
              <span className="mm-network-tile__image">
                {node.image ? <Image src={node.image} alt="" fill sizes="140px" /> : null}
              </span>
              <span className="mm-network-tile__label">{node.label}</span>
              <strong>{node.title}</strong>
              {nodeMatch ? <b>{nodeMatch.score}%</b> : null}
            </>
          );

          if (node.matchId && onSelect) {
            return (
              <button
                key={node.id}
                type="button"
                className={["mm-network-tile", `mm-network-tile--${node.kind}`, isSelected ? "is-selected" : "", isDimmed ? "is-dimmed" : "", isEntity ? "is-entity" : ""].join(" ")}
                style={nodeStyle}
                onClick={() => onSelect(node.matchId!)}
              >
                {nodeContent}
              </button>
            );
          }

          return (
            <div
              key={node.id}
              className={["mm-network-tile", `mm-network-tile--${node.kind}`, isEntity ? "is-entity" : ""].join(" ")}
              style={nodeStyle}
            >
              {nodeContent}
            </div>
          );
        })}
        </div>
      </div>

      <div className="mm-network-readout" aria-live="polite">
        <span>{selectedObjective.label}</span>
        <strong>{selectedMatch.title}</strong>
        <small>{introRequested ? "intro solicitada" : `${selectedMatch.score}% compatibilidad - ${selectedMode.status}`}</small>
      </div>

      <div className="mm-generation-radar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="mm-network-watermark" aria-hidden="true">
        explore<br />connections
        <small>{selectedMatch.title}</small>
      </div>
    </div>
  );
}

function ConnectionIcon({ name }: { name: "arrow" | "check" }) {
  if (name === "check") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="m3 8.5 3 3L13 4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 12 12 4M6 4h6v6" />
    </svg>
  );
}

function AlertChannelIcon({ id }: { id: AlertChannelId }) {
  if (id === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2.4" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }
  if (id === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-3.6-7.2L21 3l-1.5 4.2A9 9 0 0 1 21 12Z" />
        <path d="M8.5 9c.4 1.6 1.4 3.2 2.8 4.6 1.4 1.4 3 2.4 4.6 2.8" />
        <path d="M16 13.4c.5.5.7 1.2.4 1.8-.4.7-1.6 1.1-2.6.7a8.6 8.6 0 0 1-3.7-2.5A8.6 8.6 0 0 1 7.6 9.7c-.3-1 0-2.1.7-2.6.6-.3 1.3-.1 1.8.4l.9 1.4-.9.7c-.3.3-.4.7-.2 1 .4.7 1 1.5 1.7 2.2.7.7 1.5 1.3 2.2 1.7.3.2.7.1 1-.2l.7-.9 1.5.9Z" />
      </svg>
    );
  }
  if (id === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (id === "slack") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9.5" y="3.5" width="3" height="11" rx="1.5" />
        <rect x="3.5" y="9.5" width="11" height="3" rx="1.5" />
        <rect x="11.5" y="9.5" width="9" height="3" rx="1.5" />
        <rect x="9.5" y="9.5" width="3" height="11" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h12M4 18h8" />
      <circle cx="20" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}
