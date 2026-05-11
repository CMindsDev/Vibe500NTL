"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { AuthControls, StartupNavItem } from "./AuthControls";
import { useAuth } from "./AuthProvider";
import { StartupProfileView } from "./StartupProfileView";

type EditableField =
  | "name"
  | "category"
  | "website"
  | "operatingCountry"
  | "basedCountry"
  | "header"
  | "description"
  | "tracks"
  | "video"
  | "image1"
  | "image2"
  | "image3"
  | "image4"
  | "impacto"
  | "data1"
  | "data2"
  | "data3"
  | "dataImage1"
  | "dataImage2"
  | "dataImage3"
  | "quote"
  | "quoteName"
  | "quotePhoto";

type StartupRecord = {
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
  quote: string | null;
  quoteName: string | null;
  quotePhoto: string | null;
  createdAt: string;
  updatedAt: string;
  memberships: Array<{
    id: string;
    role: "OWNER" | "GUEST";
    user: { id: string; name: string; email: string; picture: string | null };
  }>;
};

type FormState = Record<EditableField, string>;

const COMPLETION_FIELDS: EditableField[] = [
  "name",
  "category",
  "website",
  "operatingCountry",
  "basedCountry",
  "header",
  "description",
  "tracks",
  "video",
  "image1",
  "image2",
  "image3",
  "image4",
  "impacto",
  "data1",
  "data2",
  "data3",
  "dataImage1",
  "dataImage2",
  "dataImage3",
  "quote",
  "quoteName",
  "quotePhoto"
];

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"]);

type StudioUploadDraft = {
  previewUrl: string;
  name: string;
  status: "uploading" | "error";
  error?: string;
};

const SECTIONS = [
  {
    id: "identidad",
    label: "Identidad",
    title: "¿Quién es la startup?",
    helper: "Nombre, categoría y headline que se ven primero en el hero."
  },
  {
    id: "territorio",
    label: "Territorio",
    title: "¿Dónde opera?",
    helper: "País, sitio web y tracks. Aparece en bandera, pills y CTA."
  },
  {
    id: "narrativa",
    label: "Narrativa",
    title: "Cuenta la historia",
    helper: "Descripción larga e impacto. Bloque debajo del hero y track temático."
  },
  {
    id: "traccion",
    label: "Tracción",
    title: "Datos que prueban impacto",
    helper: "Tres evidencias cortas con contexto visual. Se publican como info adicional del perfil."
  },
  {
    id: "voz",
    label: "Voz",
    title: "Una frase del equipo",
    helper: "Quote, nombre, rol y foto del autor. Sección quote."
  },
  {
    id: "media",
    label: "Media",
    title: "Imágenes y video",
    helper: "Cover principal, secundaria, foto del autor y video. Hero + abanico."
  }
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const SECTION_FIELDS: Record<SectionId, Array<{ field: EditableField; label: string; target: string }>> = {
  identidad: [
    { field: "name", label: "Nombre", target: "Título grande del hero" },
    { field: "category", label: "Categoría", target: "Subtítulo debajo del nombre" },
    { field: "header", label: "Headline", target: "One-liner visible en hero e historia" }
  ],
  territorio: [
    { field: "operatingCountry", label: "País de operación", target: "Bandera/chip sobre el hero" },
    { field: "basedCountry", label: "País base", target: "Metadata interna del perfil" },
    { field: "website", label: "Sitio web", target: "Botón del hero y sección Visítanos" },
    { field: "tracks", label: "Tracks", target: "Pills temáticos del perfil" }
  ],
  narrativa: [
    { field: "description", label: "Descripción larga", target: "Bloque de historia principal" },
    { field: "impacto", label: "Impacto", target: "Texto bajo el track temático" }
  ],
  traccion: [
    { field: "data1", label: "Dato 01", target: "Primera fila de IMPACTO" },
    { field: "data2", label: "Dato 02", target: "Segunda fila de IMPACTO" },
    { field: "data3", label: "Dato 03", target: "Tercera fila de IMPACTO" },
    { field: "dataImage1", label: "Imagen dato 01", target: "Imagen de la primera tarjeta" },
    { field: "dataImage2", label: "Imagen dato 02", target: "Imagen de la segunda tarjeta" },
    { field: "dataImage3", label: "Imagen dato 03", target: "Imagen de la tercera tarjeta" }
  ],
  voz: [
    { field: "quote", label: "Quote", target: "Frase destacada del equipo" },
    { field: "quoteName", label: "Nombre y rol", target: "Firma debajo del quote" },
    { field: "quotePhoto", label: "Foto", target: "Retrato del quote y abanico" }
  ],
  media: [
    { field: "image1", label: "Cover", target: "Imagen full-bleed del hero" },
    { field: "image2", label: "Galería 01", target: "Primera imagen del strip visual" },
    { field: "image3", label: "Galería 02", target: "Segunda imagen del strip visual" },
    { field: "image4", label: "Galería 03", target: "Tercera imagen del strip visual" },
    { field: "quotePhoto", label: "Foto quote", target: "Retrato del quote" },
    { field: "video", label: "Video", target: "Media futura del perfil" }
  ]
};

const SECTION_ORDER = SECTIONS.map(item => item.id);

function isEditableField(value: string | undefined): value is EditableField {
  return Boolean(value && (COMPLETION_FIELDS as readonly string[]).includes(value));
}

function firstFieldForSection(section: SectionId): EditableField {
  return SECTION_FIELDS[section][0].field;
}

function sectionForField(field: EditableField, preferredSection?: SectionId): SectionId {
  if (preferredSection && SECTION_FIELDS[preferredSection].some(entry => entry.field === field)) return preferredSection;
  return SECTIONS.find(item => SECTION_FIELDS[item.id].some(entry => entry.field === field))?.id ?? "identidad";
}

const ESSENTIAL_FIELDS: EditableField[] = [
  "name",
  "category",
  "header",
  "operatingCountry",
  "website",
  "description",
  "impacto",
  "image1"
];

const FIELD_GUIDES: Record<EditableField, { hint: string; example: string }> = {
  name: {
    hint: "Debe leerse como la marca en el hero.",
    example: "RushFrame"
  },
  category: {
    hint: "Di el territorio en 2 o 3 palabras.",
    example: "Economía azul"
  },
  website: {
    hint: "Activa el CTA del hero.",
    example: "https://startup.com"
  },
  operatingCountry: {
    hint: "País que verá el público primero.",
    example: "México"
  },
  basedCountry: {
    hint: "Útil para contexto interno y matches.",
    example: "México"
  },
  header: {
    hint: "Una frase clara: qué haces, para quién y por qué importa.",
    example: "IA para que cooperativas costeras midan y vendan impacto verificable."
  },
  description: {
    hint: "Cuenta problema, solución, usuario y diferencial.",
    example: "Ayudamos a comunidades costeras a medir restauración, conectar compradores y reportar impacto."
  },
  tracks: {
    hint: "Separa 2 o 3 temas con coma.",
    example: "Biodiversidad, Datos climáticos, Comunidades"
  },
  video: {
    hint: "Opcional. Úsalo si ya tienes demo o pitch.",
    example: "https://..."
  },
  image1: {
    hint: "La imagen principal debe explicar el mundo de la startup.",
    example: "Equipo, producto o territorio en acción."
  },
  image2: {
    hint: "Refuerza el contexto visual del perfil.",
    example: "Producto, proceso o comunidad."
  },
  image3: {
    hint: "Agrega otra foto independiente para la galería pública.",
    example: "Usuario, operación, territorio o resultado."
  },
  image4: {
    hint: "Completa el strip visual con una escena distinta.",
    example: "Equipo, evidencia en campo o detalle del producto."
  },
  impacto: {
    hint: "Describe el cambio concreto que generas.",
    example: "Reduce fricción para financiar restauración marina con datos verificables."
  },
  data1: {
    hint: "Abre con un número y explica por qué importa.",
    example: "1,200 ha: restauradas y monitoreadas durante 2025."
  },
  data2: {
    hint: "Muestra adopción, clientes, alianzas o uso real.",
    example: "18 alianzas: cooperativas y compradores piloto."
  },
  data3: {
    hint: "Cierra con crecimiento, negocio o resultado medible.",
    example: "6x: crecimiento anual en proyectos activos."
  },
  dataImage1: {
    hint: "Foto, captura o gráfico que respalde el dato 01.",
    example: "Campo, producto, dashboard o resultado real."
  },
  dataImage2: {
    hint: "Evidencia visual de adopción, alianza u operación.",
    example: "Aliado, usuario, equipo o proceso en campo."
  },
  dataImage3: {
    hint: "Imagen que haga tangible el resultado final.",
    example: "Dashboard, reporte, equipo o antes/después."
  },
  quote: {
    hint: "Que suene humano, no como pitch.",
    example: "Queremos que cada hectárea restaurada pueda probar su valor."
  },
  quoteName: {
    hint: "Nombre + rol para dar confianza.",
    example: "Ana López · Founder"
  },
  quotePhoto: {
    hint: "Retrato claro de quien firma la frase.",
    example: "Foto de founder o vocero."
  }
};

const SECTION_GUIDES: Record<SectionId, {
  mission: string;
  goal: string;
  goodProfile: string;
  example: string;
}> = {
  identidad: {
    mission: "Haz que se entienda en 5 segundos",
    goal: "Nombre, categoría y headline construyen la primera impresión del perfil.",
    goodProfile: "Un perfil fuerte dice qué es, qué hace y por qué merece un segundo vistazo.",
    example: "RushFrame · Economía azul · IA para que cooperativas costeras midan y vendan impacto verificable."
  },
  territorio: {
    mission: "Ubica la oportunidad",
    goal: "País, web y tracks ayudan a que el perfil aparezca en búsquedas y matches correctos.",
    goodProfile: "Quien lo vea sabe dónde opera, cómo entrar y en qué temas conecta.",
    example: "México · https://rushframe.ai · Biodiversidad, Datos climáticos, Comunidades."
  },
  narrativa: {
    mission: "Cuenta la historia sin hacerlo pesado",
    goal: "Explica problema, solución, usuario e impacto con frases cortas y concretas.",
    goodProfile: "La narrativa llena se siente como una mini página pública, no como un formulario.",
    example: "Ayudamos a comunidades costeras a medir restauración y conectar compradores con impacto verificable."
  },
  traccion: {
    mission: "Demuestra que ya está ocurriendo",
    goal: "Convierte logros en pruebas rápidas de leer: número, contexto y evidencia visual.",
    goodProfile: "La tracción fuerte se entiende aunque alguien solo escanee las tarjetas.",
    example: "1,200 ha: restauradas en 2025 · 18 alianzas: cooperativas piloto · 6x: crecimiento anual."
  },
  voz: {
    mission: "Dale voz humana al perfil",
    goal: "Un quote con firma hace que la startup tenga intención, criterio y rostro.",
    goodProfile: "La frase suena a equipo fundador y deja clara la convicción detrás del producto.",
    example: "Queremos que cada hectárea restaurada pueda probar su valor. · Ana López · Founder"
  },
  media: {
    mission: "Haz que el perfil se vea vivo",
    goal: "Las imágenes deben mostrar producto, territorio, equipo o usuarios reales.",
    goodProfile: "Una buena galería ayuda a entender la startup antes de leer todo.",
    example: "Cover de operación real, imagen secundaria del producto y retrato limpio de quien firma."
  }
};

function toFormState(startup: StartupRecord): FormState {
  return {
    name: startup.name ?? "",
    category: startup.category ?? "",
    website: startup.website ?? "",
    operatingCountry: startup.operatingCountry ?? "",
    basedCountry: startup.basedCountry ?? "",
    header: startup.header ?? "",
    description: startup.description ?? "",
    tracks: startup.tracks ?? "",
    video: startup.video ?? "",
    image1: startup.image1 ?? "",
    image2: startup.image2 ?? "",
    image3: startup.image3 ?? "",
    image4: startup.image4 ?? "",
    impacto: startup.impacto ?? "",
    data1: startup.data1 ?? "",
    data2: startup.data2 ?? "",
    data3: startup.data3 ?? "",
    dataImage1: startup.dataImage1 ?? "",
    dataImage2: startup.dataImage2 ?? "",
    dataImage3: startup.dataImage3 ?? "",
    quote: startup.quote ?? "",
    quoteName: startup.quoteName ?? "",
    quotePhoto: startup.quotePhoto ?? ""
  };
}

function diffFields(initial: FormState, current: FormState) {
  const result: Partial<Record<EditableField, string | null>> = {};
  (Object.keys(current) as EditableField[]).forEach(key => {
    const next = current[key].trim();
    const prev = initial[key].trim();
    if (next !== prev) result[key] = next.length ? next : null;
  });
  return result;
}

function formatRelative(iso: string | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return date.toLocaleDateString();
}

export function StartupStudio() {
  const { user } = useAuth();
  const activeStartup = user?.activeStartup;

  if (!user || !activeStartup) return <StartupStudioSetup />;

  return <StudioWorkspace key={activeStartup.id} userIdentity={user} startupId={activeStartup.id} />;
}

type StudioWorkspaceProps = {
  userIdentity: {
    id: string;
    email: string;
    googleSub?: string;
    name: string;
    picture?: string;
  };
  startupId: string;
};

function StudioWorkspace({ userIdentity, startupId }: StudioWorkspaceProps) {
  const [startup, setStartup] = useState<StartupRecord | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [section, setSection] = useState<SectionId>("identidad");
  const [activeField, setActiveField] = useState<EditableField>("name");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<EditableField | null>(null);
  const [draggingUpload, setDraggingUpload] = useState<EditableField | null>(null);
  const [uploadDrafts, setUploadDrafts] = useState<Partial<Record<EditableField, StudioUploadDraft>>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const objectUrlsRef = useRef<string[]>([]);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;

    void Promise.resolve().then(() => {
      if (!alive) return;
      setLoading(true);
      setError("");
      fetch(`/api/startups/${startupId}`, { cache: "no-store" })
        .then(async res => {
          const data = (await res.json()) as { startup?: StartupRecord; error?: string };
          if (!alive) return;
          if (!res.ok || !data.startup) {
            setError(data.error ?? "No se pudo cargar la startup");
            return;
          }
          setStartup(data.startup);
          const next = toFormState(data.startup);
          setForm(next);
          setInitialForm(next);
        })
        .catch(() => alive && setError("No se pudo cargar la startup"))
        .finally(() => alive && setLoading(false));
    });

    return () => {
      alive = false;
    };
  }, [startupId]);

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    },
    []
  );

  const scrollPreviewToSection = useCallback((nextSection: SectionId, field?: EditableField) => {
    window.requestAnimationFrame(() => {
      const preview = previewScrollRef.current;
      if (!preview) return;
      const target =
        (field ? preview.querySelector<HTMLElement>(`[data-preview-field="${field}"]`) : null) ??
        preview.querySelector<HTMLElement>(`[data-section="${nextSection}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    });
  }, []);

  const scrollEditorToField = useCallback((field: EditableField, focus = false) => {
    window.requestAnimationFrame(() => {
      const element = document.getElementById(`studio-${field}`);
      const target = document.querySelector<HTMLElement>(`[data-studio-field="${field}"]`) ?? element;
      target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      if (focus && element instanceof HTMLElement && element.offsetParent !== null) element.focus({ preventScroll: true });
    });
  }, []);

  const handleField = useCallback((field: EditableField, value: string) => {
    setActiveField(field);
    setForm(prev => (prev ? { ...prev, [field]: value } : prev));
    setUploadDrafts(prev => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setNotice("");
  }, []);

  const activateSection = useCallback((nextSection: SectionId, options?: { scrollEditor?: boolean; scrollPreview?: boolean; focusEditor?: boolean }) => {
    const nextField = firstFieldForSection(nextSection);
    setSection(nextSection);
    setActiveField(nextField);
    setNotice("");
    if (options?.scrollEditor) scrollEditorToField(nextField, options.focusEditor);
    if (options?.scrollPreview) scrollPreviewToSection(nextSection, nextField);
  }, [scrollEditorToField, scrollPreviewToSection]);

  const activateField = useCallback((field: EditableField, options?: { scrollEditor?: boolean; scrollPreview?: boolean; focusEditor?: boolean; preferredSection?: SectionId }) => {
    const nextSection = sectionForField(field, options?.preferredSection);
    setSection(nextSection);
    setActiveField(field);
    setNotice("");
    if (options?.scrollEditor) scrollEditorToField(field, options.focusEditor);
    if (options?.scrollPreview) scrollPreviewToSection(nextSection, field);
  }, [scrollEditorToField, scrollPreviewToSection]);

  const syncActiveFieldFromEvent = useCallback((event: { target: EventTarget | null }) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const fieldFromContainer = target.closest<HTMLElement>("[data-studio-field]")?.dataset.studioField;
    const fieldFromId = target.id.startsWith("studio-") ? target.id.slice("studio-".length) : undefined;
    const nextField = fieldFromContainer ?? fieldFromId;

    if (isEditableField(nextField)) {
      setActiveField(nextField);
      scrollPreviewToSection(sectionForField(nextField, section), nextField);
    }
  }, [scrollPreviewToSection, section]);

  const dirtyDiff = useMemo(() => {
    if (!form || !initialForm) return {};
    return diffFields(initialForm, form);
  }, [form, initialForm]);

  const isDirty = Object.keys(dirtyDiff).length > 0;

  const completion = useMemo(() => {
    if (!form) return 0;
    const filled = COMPLETION_FIELDS.filter(field => form[field]?.trim().length).length;
    return Math.round((filled / COMPLETION_FIELDS.length) * 100);
  }, [form]);

  const sectionStats = useMemo(() => {
    if (!form) return {} as Record<SectionId, { filled: number; total: number }>;
    return Object.fromEntries(
      SECTIONS.map(item => {
        const fields = SECTION_FIELDS[item.id];
        const filled = fields.filter(({ field }) => form[field].trim().length > 0).length;
        return [item.id, { filled, total: fields.length }];
      })
    ) as Record<SectionId, { filled: number; total: number }>;
  }, [form]);

  function validateUpload(file: File) {
    if (!ALLOWED_UPLOAD_TYPES.has(file.type)) return "Sube una imagen PNG, JPG, SVG o WebP.";
    if (file.size > MAX_UPLOAD_BYTES) return "La imagen pesa más de 6MB.";
    return "";
  }

  function clearUploadDraft(field: EditableField) {
    setUploadDrafts(prev => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function uploadFile(field: EditableField, file: File) {
    setActiveField(field);
    const validationMessage = validateUpload(file);
    if (validationMessage) {
      setError(validationMessage);
      setNotice("");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(previewUrl);
    setUploadingField(field);
    setUploadDrafts(prev => ({
      ...prev,
      [field]: { previewUrl, name: file.name, status: "uploading" }
    }));
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("scope", "studio");
      body.append("owner", userIdentity.id);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Error al subir archivo");
      handleField(field, data.url);
      setNotice("Imagen subida. Guarda para publicar el cambio.");
      clearUploadDraft(field);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Error al subir archivo";
      setError(message);
      setUploadDrafts(prev => ({
        ...prev,
        [field]: { previewUrl, name: file.name, status: "error", error: message }
      }));
    } finally {
      setUploadingField(null);
    }
  }

  function handleFileInput(field: EditableField, event: ChangeEvent<HTMLInputElement>) {
    setActiveField(field);
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file) void uploadFile(field, file);
  }

  function handleFileDrop(field: EditableField, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setActiveField(field);
    setDraggingUpload(null);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadFile(field, file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isDirty || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/startups/${startupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdentity.id,
          email: userIdentity.email,
          googleSub: userIdentity.googleSub,
          fields: dirtyDiff
        })
      });
      const data = (await res.json()) as { startup?: StartupRecord; error?: string };
      if (!res.ok || !data.startup) throw new Error(data.error ?? "No se pudo guardar");
      setStartup(data.startup);
      const next = toFormState(data.startup);
      setForm(next);
      setInitialForm(next);
      setUploadDrafts({});
      setNotice("Cambios guardados");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!initialForm) return;
    setForm(initialForm);
    setUploadDrafts({});
    setDraggingUpload(null);
    setError("");
    setNotice("");
  }

  if (loading || !form || !startup) {
    return (
      <main className="studio-shell">
        <StudioTopbar />
        <div className="studio-workspace studio-workspace--loading">
          <p className="studio-loading">{error || "Cargando perfil de la startup…"}</p>
        </div>
      </main>
    );
  }

  const currentSection = SECTIONS.find(item => item.id === section) ?? SECTIONS[0];
  const currentStats = sectionStats[section] ?? { filled: 0, total: SECTION_FIELDS[section].length };
  const currentFields = SECTION_FIELDS[section];
  const currentMissingFields = currentFields.filter(({ field }) => form[field].trim().length === 0);
  const currentActiveField = currentFields.find(item => item.field === activeField) ?? currentMissingFields[0] ?? currentFields[0];
  const currentSectionComplete = currentMissingFields.length === 0;
  const currentSectionIndex = Math.max(SECTION_ORDER.indexOf(section), 0);
  const essentialFilled = ESSENTIAL_FIELDS.filter(field => form[field].trim().length > 0).length;
  const essentialCompletion = Math.round((essentialFilled / ESSENTIAL_FIELDS.length) * 100);
  const nextIncompleteSection =
    SECTIONS.slice(currentSectionIndex + 1).find(item => {
      const stats = sectionStats[item.id] ?? { filled: 0, total: SECTION_FIELDS[item.id].length };
      return stats.filled < stats.total;
    }) ??
    SECTIONS.find(item => {
      const stats = sectionStats[item.id] ?? { filled: 0, total: SECTION_FIELDS[item.id].length };
      return item.id !== section && stats.filled < stats.total;
    });

  return (
    <main className="studio-shell">
      <StudioTopbar />

      <div className="studio-workspace">
        <section className="studio-stage" aria-label="Editor del perfil">
          <form className="studio-form" onSubmit={handleSubmit}>
            <div className="studio-stage__top">
              <div>
                <p className="studio-eyebrow">
                  Misión {currentSectionIndex + 1}/{SECTIONS.length} · {currentSection.label} · {currentStats.filled}/{currentStats.total}
                </p>
                <h2>{currentSection.title}</h2>
                <span>{currentSection.helper}</span>
              </div>
              <div className="studio-actions">
                <button
                  type="button"
                  className="onb-secondary"
                  onClick={handleDiscard}
                  disabled={!isDirty || saving}
                >
                  Descartar
                </button>
                <button className="studio-publish" type="submit" disabled={!isDirty || saving}>
                  <StudioCheckIcon />
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>

            {error ? <p className="onb-alert" role="alert">{error}</p> : null}
            {notice ? <p className="studio-notice">{notice}</p> : null}

            <div className="studio-canvas studio-canvas--split">
              <div className="studio-canvas__bar studio-canvas__bar--builder">
                <span className="studio-canvas__status">
                  <StudioSyncIcon />
                  {isDirty ? "Cambios sin guardar" : `Guardado · ${formatRelative(startup.updatedAt)}`}
                </span>
                <div className="studio-section-tabs" aria-label="Secciones del perfil">
                  {SECTIONS.map(item => {
                    const stats = sectionStats[item.id] ?? { filled: 0, total: SECTION_FIELDS[item.id].length };
                    const isComplete = stats.filled === stats.total;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`studio-section-tab ${section === item.id ? "is-active" : ""} ${isComplete ? "is-complete" : ""}`}
                        onClick={() => activateSection(item.id, { scrollPreview: true })}
                      >
                        <span>{item.label}</span>
                        <small>{stats.filled}/{stats.total}</small>
                      </button>
                    );
                  })}
                </div>
                <span className="studio-canvas__score">Perfil {completion}%</span>
                <Link href={`/startup/${startup.id}`} target="_blank" rel="noreferrer">
                  /startup/{startup.id} ↗
                </Link>
              </div>

              <div className="studio-split">
                <div className="studio-split__form">
                  <StudioCoachPanel
                    section={section}
                    stats={currentStats}
                    fields={currentFields}
                    form={form}
                    essentialCompletion={essentialCompletion}
                    missingFields={currentMissingFields}
                    activeField={currentActiveField.field}
                    isComplete={currentSectionComplete}
                    nextSectionId={nextIncompleteSection?.id}
                    onSectionChange={nextSection => activateSection(nextSection, { scrollPreview: true })}
                    onFieldFocus={field => activateField(field, { scrollPreview: true, preferredSection: section })}
                  />
                  <motion.div
                    key={`form-${section}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="studio-section"
                    data-active-field={activeField}
                    onFocusCapture={syncActiveFieldFromEvent}
                    onPointerDownCapture={syncActiveFieldFromEvent}
                  >
                    {section === "identidad" ? (
                      <IdentitySection form={form} onChange={handleField} />
                    ) : null}
                    {section === "territorio" ? (
                      <TerritorySection form={form} onChange={handleField} />
                    ) : null}
                    {section === "narrativa" ? (
                      <NarrativeSection form={form} onChange={handleField} />
                    ) : null}
                    {section === "traccion" ? (
                      <TractionSection
                        form={form}
                        onChange={handleField}
                        onUpload={handleFileInput}
                        onDrop={handleFileDrop}
                        onDragState={setDraggingUpload}
                        uploadingField={uploadingField}
                        draggingField={draggingUpload}
                        uploadDrafts={uploadDrafts}
                      />
                    ) : null}
                    {section === "voz" ? (
                      <VoiceSection
                        form={form}
                        onChange={handleField}
                        onUpload={handleFileInput}
                        onDrop={handleFileDrop}
                        onDragState={setDraggingUpload}
                        uploadingField={uploadingField}
                        draggingField={draggingUpload}
                        uploadDrafts={uploadDrafts}
                      />
                    ) : null}
                    {section === "media" ? (
                      <MediaSection
                        form={form}
                        onChange={handleField}
                        onUpload={handleFileInput}
                        onDrop={handleFileDrop}
                        onDragState={setDraggingUpload}
                        uploadingField={uploadingField}
                        draggingField={draggingUpload}
                        uploadDrafts={uploadDrafts}
                      />
                    ) : null}
                  </motion.div>
                </div>

                <div className="studio-split__preview" aria-label="Vista previa pública">
                  <div className="studio-split__preview-bar">
                    <span className="studio-split__preview-label">VISTA PÚBLICA — LIVE</span>
                    <span className="studio-split__preview-hint studio-split__preview-focus">
                      <span className="studio-split__preview-pulse" aria-hidden="true" />
                      <span>
                        Estás editando <strong>{currentSection.label}</strong>
                      </span>
                      <em>{currentActiveField.label}: {currentActiveField.target}</em>
                    </span>
                  </div>
                  <div className="studio-section studio-section--preview" ref={previewScrollRef}>
                    <ProfilePreview
                      form={form}
                      highlightSection={section}
                      activeSectionLabel={currentSection.label}
                      activeFieldLabel={currentActiveField.label}
                      activeFieldId={currentActiveField.field}
                      onSectionClick={(id: string, field?: EditableField) => {
                        if (field && isEditableField(field)) {
                          activateField(field, { scrollEditor: true, focusEditor: true, preferredSection: id as SectionId });
                          return;
                        }
                        activateSection(id as SectionId, { scrollEditor: true, focusEditor: true });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

type SectionProps = {
  form: FormState;
  onChange: (field: EditableField, value: string) => void;
};

type SectionWithUploadProps = SectionProps & {
  onUpload: (field: EditableField, event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (field: EditableField, event: DragEvent<HTMLDivElement>) => void;
  onDragState: (field: EditableField | null) => void;
  uploadingField: EditableField | null;
  draggingField: EditableField | null;
  uploadDrafts: Partial<Record<EditableField, StudioUploadDraft>>;
};

function StudioCoachPanel({
  section,
  stats,
  fields,
  form,
  essentialCompletion,
  missingFields,
  activeField,
  isComplete,
  nextSectionId,
  onSectionChange,
  onFieldFocus
}: {
  section: SectionId;
  stats: { filled: number; total: number };
  fields: Array<{ field: EditableField; label: string; target: string }>;
  form: FormState;
  essentialCompletion: number;
  missingFields: Array<{ field: EditableField; label: string; target: string }>;
  activeField: EditableField;
  isComplete: boolean;
  nextSectionId?: SectionId;
  onSectionChange: (id: SectionId) => void;
  onFieldFocus: (field: EditableField) => void;
}) {
  const guide = SECTION_GUIDES[section];
  const nextField = missingFields[0];

  function focusField(field: EditableField) {
    const element = document.getElementById(`studio-${field}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (element instanceof HTMLElement) element.focus({ preventScroll: true });
  }

  return (
    <aside className={`studio-coach ${isComplete ? "is-complete" : ""}`} aria-live="polite">
      <div className="studio-coach__head">
        <span>{isComplete ? "Misión completa" : "Misión activa"}</span>
        <strong>{stats.filled}/{stats.total}</strong>
      </div>

      <div className="studio-coach__mission">
        <h3>{guide.mission}</h3>
      </div>

      <div className="studio-coach__meter" aria-label={`Perfil esencial ${essentialCompletion}%`}>
        <span style={{ width: `${essentialCompletion}%` }} />
      </div>

      <div className="studio-coach__next">
        <span>{isComplete ? "Listo" : "Siguiente"}</span>
        <p>{isComplete ? "Esta misión ya está completa." : `Falta ${nextField?.label}.`}</p>
        {isComplete && nextSectionId ? (
          <button type="button" onClick={() => onSectionChange(nextSectionId)}>
            Siguiente
          </button>
        ) : null}
      </div>

      <div className="studio-coach__fields" aria-label="Checklist de campos">
        {fields.map(item => {
          const filled = form[item.field].trim().length > 0;
          return (
            <button
              key={item.field}
              type="button"
              className={`studio-coach__field ${filled ? "is-filled" : ""} ${activeField === item.field ? "is-active" : ""}`}
              onClick={() => {
                onFieldFocus(item.field);
                focusField(item.field);
              }}
            >
              <span>{item.label}</span>
              <small aria-hidden="true">{filled ? "✓" : ""}</small>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function FieldFrame({ field, children }: { field: EditableField; children: ReactNode }) {
  return (
    <label className="onb-field" data-studio-field={field}>
      {children}
    </label>
  );
}

function FieldHeading({ field, title, value }: { field: EditableField; title: string; value: string }) {
  const guide = FIELD_GUIDES[field];
  const filled = value.trim().length > 0;

  return (
    <span className="studio-field-heading">
      <span>
        <strong>{title}</strong>
        <small>{guide.hint}</small>
      </span>
      <em className={filled ? "is-filled" : ""}>{filled ? "Listo" : "Falta"}</em>
    </span>
  );
}

function IdentitySection({ form, onChange }: SectionProps) {
  return (
    <div className="studio-fields">
      <FieldFrame field="name">
        <FieldHeading field="name" title="Nombre" value={form.name} />
        <input
          id="studio-name"
          className="onb-input"
          value={form.name}
          onChange={event => onChange("name", event.currentTarget.value)}
          placeholder="Nombre de la startup"
        />
      </FieldFrame>
      <FieldFrame field="category">
        <FieldHeading field="category" title="Categoría" value={form.category} />
        <input
          id="studio-category"
          className="onb-input"
          value={form.category}
          onChange={event => onChange("category", event.currentTarget.value)}
          placeholder="Datos y tecnología ambiental, Economía azul…"
        />
      </FieldFrame>
      <FieldFrame field="header">
        <FieldHeading field="header" title="Headline (one-liner)" value={form.header} />
        <input
          id="studio-header"
          className="onb-input"
          value={form.header}
          onChange={event => onChange("header", event.currentTarget.value)}
          placeholder="Una frase que defina la startup"
          maxLength={180}
        />
      </FieldFrame>
    </div>
  );
}

function TerritorySection({ form, onChange }: SectionProps) {
  return (
    <div className="studio-fields">
      <div className="onb-row onb-row--split">
        <FieldFrame field="operatingCountry">
          <FieldHeading field="operatingCountry" title="País de operación" value={form.operatingCountry} />
          <input
            id="studio-operatingCountry"
            className="onb-input"
            value={form.operatingCountry}
            onChange={event => onChange("operatingCountry", event.currentTarget.value)}
            placeholder="México"
          />
        </FieldFrame>
        <FieldFrame field="basedCountry">
          <FieldHeading field="basedCountry" title="País base" value={form.basedCountry} />
          <input
            id="studio-basedCountry"
            className="onb-input"
            value={form.basedCountry}
            onChange={event => onChange("basedCountry", event.currentTarget.value)}
            placeholder="México"
          />
        </FieldFrame>
      </div>
      <FieldFrame field="website">
        <FieldHeading field="website" title="Sitio web" value={form.website} />
        <input
          id="studio-website"
          className="onb-input"
          value={form.website}
          onChange={event => onChange("website", event.currentTarget.value)}
          placeholder="https://startup.com"
        />
      </FieldFrame>
      <FieldFrame field="tracks">
        <FieldHeading field="tracks" title="Tracks (separados por coma)" value={form.tracks} />
        <input
          id="studio-tracks"
          className="onb-input"
          value={form.tracks}
          onChange={event => onChange("tracks", event.currentTarget.value)}
          placeholder="Aquacultura, Biodiversidad"
        />
      </FieldFrame>
    </div>
  );
}

function NarrativeSection({ form, onChange }: SectionProps) {
  return (
    <div className="studio-fields">
      <FieldFrame field="description">
        <FieldHeading field="description" title="Descripción larga" value={form.description} />
        <textarea
          id="studio-description"
          className="onb-textarea"
          value={form.description}
          onChange={event => onChange("description", event.currentTarget.value)}
          placeholder="Cómo funciona, qué problema resuelve y para quién"
          rows={5}
        />
      </FieldFrame>
      <FieldFrame field="impacto">
        <FieldHeading field="impacto" title="Impacto" value={form.impacto} />
        <textarea
          id="studio-impacto"
          className="onb-textarea"
          value={form.impacto}
          onChange={event => onChange("impacto", event.currentTarget.value)}
          placeholder="Qué cambia en territorio gracias a la startup"
          rows={4}
        />
      </FieldFrame>
    </div>
  );
}

const TRACTION_ITEMS = [
  {
    dataField: "data1",
    imageField: "dataImage1",
    label: "Dato 01",
    placeholder: "1,200 ha: restauradas y monitoreadas en 2025"
  },
  {
    dataField: "data2",
    imageField: "dataImage2",
    label: "Dato 02",
    placeholder: "18 alianzas: cooperativas locales activas"
  },
  {
    dataField: "data3",
    imageField: "dataImage3",
    label: "Dato 03",
    placeholder: "6x: crecimiento anual en proyectos activos"
  }
] as const satisfies Array<{
  dataField: EditableField;
  imageField: EditableField;
  label: string;
  placeholder: string;
}>;

function TractionSection({
  form,
  onChange,
  onUpload,
  onDrop,
  onDragState,
  uploadingField,
  draggingField,
  uploadDrafts
}: SectionWithUploadProps) {
  return (
    <div className="studio-fields studio-traction-fields">
      <p className="studio-section-note">
        Usa evidencia que se pueda escanear rápido: <code>Número: contexto concreto</code>. La imagen debe ayudar a creer el dato.
      </p>
      <div className="studio-traction-cards">
        {TRACTION_ITEMS.map(item => (
          <section className="studio-traction-card" key={item.dataField}>
            <FieldFrame field={item.dataField}>
              <FieldHeading field={item.dataField} title={item.label} value={form[item.dataField]} />
              <textarea
                id={`studio-${item.dataField}`}
                className="onb-textarea"
                value={form[item.dataField]}
                onChange={event => onChange(item.dataField, event.currentTarget.value)}
                placeholder={item.placeholder}
                rows={4}
              />
            </FieldFrame>
            <UploadField
              label={`Evidencia visual ${item.label.slice(-2)}`}
              helper="Foto, captura o gráfico que haga tangible el dato"
              field={item.imageField}
              value={form[item.imageField]}
              onChange={onChange}
              onUpload={onUpload}
              onDrop={onDrop}
              onDragState={onDragState}
              uploadingField={uploadingField}
              draggingField={draggingField}
              uploadDraft={uploadDrafts[item.imageField]}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

function VoiceSection({
  form,
  onChange,
  onUpload,
  onDrop,
  onDragState,
  uploadingField,
  draggingField,
  uploadDrafts
}: SectionWithUploadProps) {
  return (
    <div className="studio-fields">
      <FieldFrame field="quote">
        <FieldHeading field="quote" title="Quote" value={form.quote} />
        <textarea
          id="studio-quote"
          className="onb-textarea"
          value={form.quote}
          onChange={event => onChange("quote", event.currentTarget.value)}
          placeholder="Una frase del equipo que represente la mirada"
          rows={3}
        />
      </FieldFrame>
      <div className="onb-row onb-row--split">
        <FieldFrame field="quoteName">
          <FieldHeading field="quoteName" title="Nombre y rol" value={form.quoteName} />
          <input
            id="studio-quoteName"
            className="onb-input"
            value={form.quoteName}
            onChange={event => onChange("quoteName", event.currentTarget.value)}
            placeholder="Ana López · Founder"
          />
        </FieldFrame>
      </div>
      <UploadField
        label="Foto de quien firma"
        helper="Retrato claro de founder, vocero o integrante del equipo"
        field="quotePhoto"
        value={form.quotePhoto}
        onChange={onChange}
        onUpload={onUpload}
        onDrop={onDrop}
        onDragState={onDragState}
        uploadingField={uploadingField}
        draggingField={draggingField}
        uploadDraft={uploadDrafts.quotePhoto}
      />
    </div>
  );
}

function MediaSection({
  form,
  onChange,
  onUpload,
  onDrop,
  onDragState,
  uploadingField,
  draggingField,
  uploadDrafts
}: SectionWithUploadProps) {
  return (
    <div className="studio-fields studio-media-assets">
      <UploadField
        label="Cover principal"
        helper="Primera imagen que se ve en hero y explorar"
        field="image1"
        value={form.image1}
        onChange={onChange}
        onUpload={onUpload}
        onDrop={onDrop}
        onDragState={onDragState}
        uploadingField={uploadingField}
        draggingField={draggingField}
        uploadDraft={uploadDrafts.image1}
        large
      />
      <div className="studio-media-assets__grid">
        <UploadField
          label="Galería 01"
          helper="Imagen independiente para el strip visual del perfil"
          field="image2"
          value={form.image2}
          onChange={onChange}
          onUpload={onUpload}
          onDrop={onDrop}
          onDragState={onDragState}
          uploadingField={uploadingField}
          draggingField={draggingField}
          uploadDraft={uploadDrafts.image2}
        />
        <UploadField
          label="Galería 02"
          helper="Otra escena: territorio, usuario, producto o proceso"
          field="image3"
          value={form.image3}
          onChange={onChange}
          onUpload={onUpload}
          onDrop={onDrop}
          onDragState={onDragState}
          uploadingField={uploadingField}
          draggingField={draggingField}
          uploadDraft={uploadDrafts.image3}
        />
        <UploadField
          label="Galería 03"
          helper="Refuerza la historia visual con una toma distinta"
          field="image4"
          value={form.image4}
          onChange={onChange}
          onUpload={onUpload}
          onDrop={onDrop}
          onDragState={onDragState}
          uploadingField={uploadingField}
          draggingField={draggingField}
          uploadDraft={uploadDrafts.image4}
        />
        <UploadField
          label="Foto del quote"
          helper="Retrato que acompaña la frase del equipo"
          field="quotePhoto"
          value={form.quotePhoto}
          onChange={onChange}
          onUpload={onUpload}
          onDrop={onDrop}
          onDragState={onDragState}
          uploadingField={uploadingField}
          draggingField={draggingField}
          uploadDraft={uploadDrafts.quotePhoto}
        />
      </div>
      <div className="studio-video-row">
        <FieldFrame field="video">
          <FieldHeading field="video" title="Video (URL)" value={form.video} />
          <input
            id="studio-video"
            className="onb-input"
            value={form.video}
            onChange={event => onChange("video", event.currentTarget.value)}
            placeholder="https://..."
          />
        </FieldFrame>
        <div className="studio-media-note" aria-label="Uso de media en el template">
          <strong>Imagen correcta</strong>
          <span>Usa fotos reales, nítidas y con una historia visible. Evita fondos genéricos o demasiado oscuros.</span>
        </div>
      </div>
    </div>
  );
}

function UploadField({
  label,
  helper,
  field,
  value,
  onChange,
  onUpload,
  onDrop,
  onDragState,
  uploadingField,
  draggingField,
  uploadDraft,
  large
}: {
  label: string;
  helper?: string;
  field: EditableField;
  value: string;
  onChange: (field: EditableField, value: string) => void;
  onUpload: (field: EditableField, event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (field: EditableField, event: DragEvent<HTMLDivElement>) => void;
  onDragState: (field: EditableField | null) => void;
  uploadingField: EditableField | null;
  draggingField: EditableField | null;
  uploadDraft?: StudioUploadDraft;
  large?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadingField === field;
  const isDragging = draggingField === field;
  const previewSrc = uploadDraft?.previewUrl ?? value.trim();
  const [failedPreviewSrc, setFailedPreviewSrc] = useState("");
  const isBusy = isUploading || uploadDraft?.status === "uploading";
  const imageFailed = Boolean(previewSrc && failedPreviewSrc === previewSrc);
  const statusText = uploadDraft?.status === "error"
    ? uploadDraft.error ?? "No se pudo subir"
    : isBusy
      ? "Subiendo imagen..."
      : previewSrc
        ? "Imagen cargada"
        : "Sin imagen";

  return (
    <div
      className={`studio-upload ${large ? "studio-upload--large" : ""} ${isDragging ? "is-dragging" : ""}`}
      data-studio-field={field}
    >
      <div className="studio-upload__head">
        <span>
          <strong>{label}</strong>
          {helper ? <small>{helper}</small> : null}
        </span>
        <em>{statusText}</em>
      </div>
      <div
        className={`studio-upload__dropzone ${previewSrc ? "has-image" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={event => onDrop(field, event)}
        onDragOver={event => event.preventDefault()}
        onDragEnter={() => onDragState(field)}
        onDragLeave={event => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) onDragState(null);
        }}
        aria-label={`${value ? "Reemplazar" : "Subir"} ${label.toLowerCase()}`}
      >
        {previewSrc && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" onError={() => setFailedPreviewSrc(previewSrc)} />
        ) : (
          <span className="studio-upload__empty">
            {imageFailed ? "No se pudo cargar" : "Sin imagen"}
          </span>
        )}
        <span className="studio-upload__cue">
          {isBusy ? "Subiendo..." : previewSrc ? "Cambiar imagen" : "Subir imagen"}
        </span>
        {isBusy ? (
          <span className="studio-upload__progress" aria-hidden="true">
            <span />
          </span>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        hidden
        onChange={event => onUpload(field, event)}
      />
      <div className="studio-upload__controls">
        <button
          type="button"
          className="onb-secondary"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
        >
          {isBusy ? "Subiendo..." : value ? "Reemplazar" : "Subir archivo"}
        </button>
        {value ? (
          <button
            type="button"
            className="onb-back"
            onClick={() => onChange(field, "")}
            disabled={isBusy}
          >
            Quitar
          </button>
        ) : null}
      </div>
      <details className="studio-upload__url-wrap" open={!value && !uploadDraft}>
        <summary>URL manual</summary>
        <input
          id={`studio-${field}`}
          className="onb-input studio-upload__url"
          value={value}
          onChange={event => onChange(field, event.currentTarget.value)}
          placeholder="https://..."
        />
      </details>
    </div>
  );
}

function ProfilePreview({
  form,
  highlightSection,
  activeSectionLabel,
  activeFieldLabel,
  activeFieldId,
  onSectionClick
}: {
  form: FormState;
  highlightSection?: SectionId;
  activeSectionLabel?: string;
  activeFieldLabel?: string;
  activeFieldId?: EditableField;
  onSectionClick?: (id: SectionId, field?: EditableField) => void;
}) {
  return (
    <StartupProfileView
      data={{
        name: form.name,
        category: form.category,
        website: form.website,
        operatingCountry: form.operatingCountry,
        basedCountry: form.basedCountry,
        header: form.header,
        description: form.description,
        tracks: form.tracks,
        video: form.video,
        image1: form.image1,
        image2: form.image2,
        image3: form.image3,
        image4: form.image4,
        impacto: form.impacto,
        data1: form.data1,
        data2: form.data2,
        data3: form.data3,
        dataImage1: form.dataImage1,
        dataImage2: form.dataImage2,
        dataImage3: form.dataImage3,
        quote: form.quote,
        quoteName: form.quoteName,
        quotePhoto: form.quotePhoto
      }}
      highlightSection={highlightSection}
      activeSectionLabel={activeSectionLabel}
      activeFieldLabel={activeFieldLabel}
      activeFieldId={activeFieldId}
      onSectionClick={onSectionClick as ((id: string, field?: string) => void) | undefined}
    />
  );
}

function StudioTopbar() {
  return (
    <header className="topbar studio-topbar" aria-label="Navegación principal">
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
  );
}

function StartupStudioSetup() {
  return (
    <main className="studio-shell studio-shell--setup">
      <StudioTopbar />

      <section className="studio-setup" aria-labelledby="studio-setup-title">
        <span className="studio-eyebrow">Startup studio</span>
        <h1 id="studio-setup-title">Asocia una startup</h1>
        <p>
          Inicia sesión con Google y elige si crearás una startup nueva o te unirás a una existente.
        </p>
        <AuthControls redirectAfterLogin="/studio" />
      </section>
    </main>
  );
}

function StudioCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3 8.5 3 3L13 4" />
    </svg>
  );
}

function StudioSyncIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M12.5 5.5A5 5 0 0 0 3 6M3.5 10.5A5 5 0 0 0 13 10M12.5 2.5v3h-3M3.5 13.5v-3h3" />
    </svg>
  );
}
