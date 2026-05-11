"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import { isSoundEnabled, playSound, setSoundEnabled } from "@/lib/sound";
import type { Startup } from "@/lib/startups";
import type { AuthUser } from "@/lib/types";
import { AuthControls, StartupNavItem } from "./AuthControls";
import { useAuth } from "./AuthProvider";

type OnboardingExperienceProps = {
  initialMode: StartupMode;
  previewStartups: Startup[];
  redirectTo: string;
};

type StartupLookup = {
  id: number;
  name: string;
  category: string | null;
  operatingCountry: string | null;
  basedCountry: string | null;
  image1: string | null;
};

type StartupMode = "create" | "join";
type OnboardingStage = "signin" | "startup" | "launch";
type CreateStepId = "identity" | "territory" | "story" | "traction" | "media" | "voice" | "review";
type UploadKind = "cover" | "image2" | "quotePhoto";
type UploadAsset = {
  url: string;
  previewUrl: string;
  name: string;
  status: "uploading" | "done" | "error";
  error?: string;
};

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

const stageStatus: Record<OnboardingStage, { label: string; detail: string }> = {
  signin: { label: "Acceso", detail: "Cuenta pendiente" },
  startup: { label: "Perfil", detail: "Ruta activa" },
  launch: { label: "Workspace", detail: "Acceso listo" }
};

const createSteps: Array<{ id: CreateStepId; label: string; eyebrow: string; title: string; note: string }> = [
  {
    id: "identity",
    label: "Identidad",
    eyebrow: "01 / Identidad",
    title: "Define el perfil público",
    note: "Nombre, categoría y headline alimentan el hero del perfil de startup."
  },
  {
    id: "territory",
    label: "Territorio",
    eyebrow: "02 / Territorio",
    title: "Ubica operación y tracks",
    note: "Estos datos aparecen en el perfil, filtros de exploración y contexto para conexiones."
  },
  {
    id: "story",
    label: "Historia",
    eyebrow: "03 / Historia",
    title: "Cuenta la narrativa",
    note: "Descripción e impacto llenan las secciones editoriales del template público."
  },
  {
    id: "traction",
    label: "Impacto",
    eyebrow: "04 / Impacto",
    title: "Agrega tres datos",
    note: "Usa métricas cortas con formato Título: evidencia para poblar la sección de impacto."
  },
  {
    id: "media",
    label: "Media",
    eyebrow: "05 / Template media",
    title: "Sube las imágenes del template",
    note: "Cover, imagen secundaria y foto de quote construyen el hero, el fan visual y la voz del equipo."
  },
  {
    id: "voice",
    label: "Voz",
    eyebrow: "06 / Voz",
    title: "Agrega la quote del equipo",
    note: "La quote y el autor cierran el perfil con una voz humana."
  },
  {
    id: "review",
    label: "Launch",
    eyebrow: "07 / Launch",
    title: "Confirma el alta",
    note: "Al crear el workspace quedas como owner y todo queda editable en Studio."
  }
];

const categoryOptions = [
  "Biodiversidad y Restauración",
  "Datos y Tecnología Ambiental",
  "Economía Sostenible",
  "Agricultura regenerativa",
  "Economía azul"
];

const trackOptions = [
  "Bosques y selvas",
  "Agricultura sustentable",
  "Foodtech",
  "Aquacultura",
  "Ciudades positivas para la naturaleza",
  "MRV"
];

const motionTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const
};
const soundChangeEvent = "ntl500-onboarding-sound-change";

const cardMotion = {
  initial: { opacity: 0, y: 18, scale: 0.985, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, scale: 0.985, filter: "blur(6px)" }
};

function getInviteStartupId(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return null;

  const queryMatch = cleaned.match(/[?&](?:startupId|startup|id)=([0-9]+)/i);
  if (queryMatch?.[1]) return Number(queryMatch[1]);

  const pathMatch = cleaned.match(/(?:invite|startup|join)[/-]([0-9]+)/i);
  if (pathMatch?.[1]) return Number(pathMatch[1]);

  if (/^[0-9]+$/.test(cleaned)) return Number(cleaned);

  return null;
}

function getWebsiteHost(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Pendiente";

  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`).hostname.replace(/^www\./, "");
  } catch {
    return trimmed;
  }
}

function getInitial(value?: string | null) {
  return value?.trim().charAt(0).toUpperCase() || "N";
}

function summarizeStartup(category?: string | null, country?: string | null) {
  return [category, country].filter(Boolean).join(" / ") || "Perfil en construcción";
}

function subscribeSoundPreference(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(soundChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(soundChangeEvent, onStoreChange);
  };
}

export function OnboardingExperience({ initialMode, previewStartups, redirectTo }: OnboardingExperienceProps) {
  const router = useRouter();
  const redirectTimerRef = useRef<number | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const { login, logout, user } = useAuth();
  const [error, setError] = useState("");
  const [completedUser, setCompletedUser] = useState<AuthUser | null>(user ?? null);
  const [selectedPath, setSelectedPath] = useState<StartupMode | null>(null);
  const [createStepIndex, setCreateStepIndex] = useState(0);
  const [startupName, setStartupName] = useState("");
  const [startupCategory, setStartupCategory] = useState("");
  const [startupCountry, setStartupCountry] = useState("");
  const [startupBasedCountry, setStartupBasedCountry] = useState("");
  const [startupWebsite, setStartupWebsite] = useState("");
  const [startupOneLiner, setStartupOneLiner] = useState("");
  const [startupDescription, setStartupDescription] = useState("");
  const [startupImpact, setStartupImpact] = useState("");
  const [startupTrack, setStartupTrack] = useState("");
  const [startupVideo, setStartupVideo] = useState("");
  const [startupData1, setStartupData1] = useState("");
  const [startupData2, setStartupData2] = useState("");
  const [startupData3, setStartupData3] = useState("");
  const [startupQuote, setStartupQuote] = useState("");
  const [startupQuoteName, setStartupQuoteName] = useState("");
  const [startupQuery, setStartupQuery] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [startupOptions, setStartupOptions] = useState<StartupLookup[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(null);
  const [submittingStartup, setSubmittingStartup] = useState(false);
  const [draggingUpload, setDraggingUpload] = useState<UploadKind | null>(null);
  const [coverAsset, setCoverAsset] = useState<UploadAsset | null>(null);
  const [image2Asset, setImage2Asset] = useState<UploadAsset | null>(null);
  const [quotePhotoAsset, setQuotePhotoAsset] = useState<UploadAsset | null>(null);
  const soundOn = useSyncExternalStore(subscribeSoundPreference, isSoundEnabled, () => true);

  const activeStartup = completedUser?.activeStartup ?? user?.activeStartup;
  const pendingUser = user && !user.activeStartup ? user : null;
  const visibleStage: OnboardingStage = activeStartup ? "launch" : pendingUser ? "startup" : "signin";
  const selectedStartup = startupOptions.find(startup => startup.id === selectedStartupId);
  const inviteStartupId = useMemo(() => getInviteStartupId(inviteInput), [inviteInput]);
  const createStep = createSteps[createStepIndex];
  const draftStartupName = startupName.trim() || undefined;
  const draftCategory = startupCategory.trim() || undefined;
  const draftCountry = startupCountry.trim() || undefined;
  const previewStartupName =
    activeStartup?.name ??
    (selectedPath === "join" ? selectedStartup?.name : draftStartupName) ??
    (pendingUser ? "Nueva startup" : "Natura OS");
  const previewCategory =
    activeStartup?.category ??
    (selectedPath === "join" ? selectedStartup?.category ?? undefined : draftCategory) ??
    "Sin categoría";
  const previewCountry =
    activeStartup?.country ??
    (selectedPath === "join" ? selectedStartup?.operatingCountry ?? selectedStartup?.basedCountry ?? undefined : draftCountry) ??
    "País pendiente";
  const currentStatus = stageStatus[visibleStage];
  const statusSummary = summarizeStartup(previewCategory, previewCountry);
  const hudLabel =
    visibleStage === "startup" && selectedPath === "create"
      ? createStep.label
      : visibleStage === "startup" && selectedPath === "join"
        ? "Vincular"
        : currentStatus.label;
  const progress =
    visibleStage === "launch"
      ? 100
      : visibleStage === "signin"
        ? 12
        : selectedPath === "create"
          ? 32 + ((createStepIndex + 1) / createSteps.length) * 58
          : selectedPath === "join"
            ? selectedStartupId
              ? 88
              : 58
            : 30;
  const levelText =
    visibleStage === "startup" && selectedPath === "create"
      ? `${createStepIndex + 1}/${createSteps.length}`
      : visibleStage === "startup" && selectedPath === "join"
        ? selectedStartupId
          ? "Lista"
          : "Buscar"
        : visibleStage === "launch"
          ? "Listo"
          : "Acceso";
  const uploadIsPending = [coverAsset, image2Asset, quotePhotoAsset].some(asset => asset?.status === "uploading");
  const tractionSignals = [startupData1, startupData2, startupData3].filter(value => value.trim()).length;
  const baseCreateIsComplete =
    startupName.trim().length >= 2 &&
    startupCategory.trim().length >= 2 &&
    startupCountry.trim().length >= 2 &&
    startupOneLiner.trim().length >= 10;
  const stepIsComplete =
    createStep.id === "identity"
      ? startupName.trim().length >= 2 &&
        startupCategory.trim().length >= 2 &&
        startupOneLiner.trim().length >= 10
      : createStep.id === "territory"
        ? startupCountry.trim().length >= 2
        : createStep.id === "review"
          ? baseCreateIsComplete
          : true;

  useEffect(
    () => () => {
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    },
    []
  );

  useEffect(() => {
    if (!pendingUser || selectedPath !== "join") return;

    let active = true;
    const controller = new AbortController();

    fetch(`/api/startups/lookup?q=${encodeURIComponent(startupQuery)}`, {
      signal: controller.signal
    })
      .then(response => response.json())
      .then((data: { startups?: StartupLookup[] }) => {
        if (!active) return;
        const startups = data.startups ?? [];
        setStartupOptions(startups);
        setSelectedStartupId(current =>
          startups.some(startup => startup.id === current) ? current : startups[0]?.id ?? null
        );
      })
      .catch(() => {
        if (active) setStartupOptions([]);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [pendingUser, selectedPath, startupQuery]);

  useEffect(() => {
    if (!pendingUser || selectedPath !== "join" || !inviteStartupId) return;

    let active = true;
    const controller = new AbortController();

    fetch(`/api/startups/lookup?id=${inviteStartupId}`, {
      signal: controller.signal
    })
      .then(response => response.json())
      .then((data: { startups?: StartupLookup[] }) => {
        if (!active) return;
        const inviteStartup = data.startups?.[0];
        if (!inviteStartup) return;
        setStartupOptions(current => {
          if (current.some(startup => startup.id === inviteStartup.id)) return current;
          return [inviteStartup, ...current];
        });
        setSelectedStartupId(inviteStartup.id);
      })
      .catch(() => undefined);

    return () => {
      active = false;
      controller.abort();
    };
  }, [inviteStartupId, pendingUser, selectedPath]);

  function toggleSound() {
    const next = !soundOn;
    setSoundEnabled(next);
    window.dispatchEvent(new Event(soundChangeEvent));
    if (next) playSound("select");
  }

  function goBack() {
    playSound("click");
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  function selectPath(path: StartupMode) {
    setError("");
    setSelectedPath(path);
    if (path === "create") setCreateStepIndex(0);
    playSound("select");
  }

  function finishSession(authUser: AuthUser, delay = 1100) {
    setCompletedUser(authUser);
    login(authUser);
    playSound("success");
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    redirectTimerRef.current = window.setTimeout(() => router.push(redirectTo), delay);
  }

  function moveCreateStep(direction: 1 | -1) {
    setError("");
    setCreateStepIndex(current => Math.min(createSteps.length - 1, Math.max(0, current + direction)));
    playSound(direction === 1 ? "advance" : "click");
  }

  function selectChip(setter: (value: string) => void, value: string) {
    setter(value);
    playSound("select");
  }

  function getUploadAsset(kind: UploadKind) {
    if (kind === "cover") return coverAsset;
    if (kind === "image2") return image2Asset;
    return quotePhotoAsset;
  }

  function setUploadAsset(kind: UploadKind, asset: UploadAsset | null) {
    if (kind === "cover") setCoverAsset(asset);
    else if (kind === "image2") setImage2Asset(asset);
    else setQuotePhotoAsset(asset);
  }

  async function uploadImage(kind: UploadKind, file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Sube una imagen PNG, JPG, SVG o WebP.");
      playSound("error");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError("La imagen pesa más de 6MB.");
      playSound("error");
      return;
    }

    setError("");
    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(previewUrl);
    const pendingAsset: UploadAsset = { url: "", previewUrl, name: file.name, status: "uploading" };
    setUploadAsset(kind, pendingAsset);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("scope", "onboarding");
      form.append("owner", pendingUser?.id ?? "anon");

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: form
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "No se pudo subir la imagen");

      setUploadAsset(kind, { url: data.url, previewUrl: data.url, name: file.name, status: "done" });
      playSound("select");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen";
      setUploadAsset(kind, { ...pendingAsset, status: "error", error: message });
      setError(message);
      playSound("error");
    }
  }

  function handleFileChange(kind: UploadKind, event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) void uploadImage(kind, file);
    event.currentTarget.value = "";
  }

  function handleDrop(kind: UploadKind, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDraggingUpload(null);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadImage(kind, file);
  }

  function removeAsset(kind: UploadKind) {
    setUploadAsset(kind, null);
    playSound("click");
  }

  async function submitStartup(mode: StartupMode) {
    if (!pendingUser) return;

    setError("");
    setSubmittingStartup(true);

    const identity = {
      userId: pendingUser.id,
      email: pendingUser.email,
      googleSub: pendingUser.googleSub,
      name: pendingUser.name,
      picture: pendingUser.picture
    };

    const payload =
      mode === "create"
        ? {
            mode: "create",
            ...identity,
            startupName,
            category: startupCategory,
            country: startupCountry,
            basedCountry: startupBasedCountry,
            website: startupWebsite,
            oneLiner: startupOneLiner,
            description: startupDescription,
            impact: startupImpact,
            track: startupTrack,
            video: startupVideo,
            data1: startupData1,
            data2: startupData2,
            data3: startupData3,
            quote: startupQuote,
            quoteName: startupQuoteName,
            coverUrl: coverAsset?.url,
            image2Url: image2Asset?.url,
            quotePhotoUrl: quotePhotoAsset?.url
          }
        : {
            mode: "join",
            ...identity,
            startupId: selectedStartupId,
            inviteCode: inviteInput
          };

    try {
      const response = await fetch("/api/onboarding/startup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as { user?: AuthUser; error?: string; code?: string };

      if (!response.ok || !data.user) {
        if (data.code === "USER_MISSING") {
          logout();
          throw new Error(data.error ?? "Sesión expirada. Vuelve a iniciar sesión.");
        }
        throw new Error(data.error ?? "No se pudo asociar la startup");
      }

      finishSession(data.user);
    } catch (startupError) {
      setError(startupError instanceof Error ? startupError.message : "No se pudo asociar la startup");
      playSound("error");
    } finally {
      setSubmittingStartup(false);
    }
  }

  return (
    <main className="onboarding-shell">
      <div className="onboarding-grid" aria-hidden="true" />

      <header className="topbar onboarding-main-topbar" aria-label="Navegación principal">
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
          <StartupNavItem active={Boolean(activeStartup)} />
        </nav>
        <div className="topbar-end">
          <button type="button" className="onboarding-nav-back" onClick={goBack}>
            Atrás
          </button>
          <AuthControls previewStartups={previewStartups} redirectAfterLogin={redirectTo} />
        </div>
      </header>

      <section className={["onboarding-stage", `onboarding-stage--${visibleStage}`].join(" ")} aria-live="polite">
        <div className="onboarding-stage__container">
          <motion.div
            className="onb-progress-hud"
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionTransition}
          >
            <div className="onboarding-progress" aria-label="Progreso de onboarding">
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="onb-hud-label">{hudLabel}</span>
            <button
              type="button"
              className="onb-meta__mute"
              onClick={toggleSound}
              aria-label={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
              title={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
            >
              {soundOn ? "♪" : "×"}
            </button>
            <div className="onboarding-level" aria-label={levelText}>
              {levelText}
            </div>
          </motion.div>

          <motion.div
            className="onb-pill"
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionTransition}
          >
            <span className="onb-pill__avatar">
              {activeStartup?.image ? (
                <Image src={activeStartup.image} alt="" fill sizes="36px" />
              ) : coverAsset?.previewUrl || quotePhotoAsset?.previewUrl ? (
                <span
                  className="onb-pill__media"
                  style={{ backgroundImage: `url(${coverAsset?.previewUrl ?? quotePhotoAsset?.previewUrl})` }}
                />
              ) : (
                getInitial(previewStartupName)
              )}
            </span>
            <span className="onb-pill__body">
              <strong>{previewStartupName}</strong>
              <small>{selectedPath === "join" ? "Vinculación a startup existente" : statusSummary}</small>
            </span>
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            {visibleStage === "signin" ? (
              <motion.section
                key="signin"
                className="onb-card"
                {...cardMotion}
                transition={motionTransition}
              >
                <p className="onb-eyebrow">Acceso 01</p>
                <h1 className="onb-title">Inicia sesión para configurar una startup</h1>
                <p className="onb-lead">
                  Vuelve desde la plataforma principal con una cuenta activa para crear o vincular una startup.
                </p>
                <div className="onb-actions">
                  <Link className="onb-cta" href="/">
                    Volver a explorar
                  </Link>
                </div>
              </motion.section>
            ) : null}

            {visibleStage === "startup" && !selectedPath ? (
              <motion.section
                key="choice"
                className="onb-card"
                {...cardMotion}
                transition={motionTransition}
              >
                <p className="onb-eyebrow">Perfil 02</p>
                <h1 className="onb-title">¿Vas a crear o unirte?</h1>
                <p className="onb-lead">
                  Elige crear un perfil nuevo o vincular tu cuenta a una startup que ya existe.
                </p>

                <div className="onb-paths" aria-label="Rutas de onboarding">
                  <motion.button
                    type="button"
                    className={["onb-path", initialMode === "create" ? "is-suggested" : ""].join(" ")}
                    onClick={() => selectPath("create")}
                    whileTap={{ scale: 0.985 }}
                  >
                    <span className="onb-path__index">01</span>
                    <span className="onb-path__title">Crear una nueva</span>
                    <span className="onb-path__note">Empieza un perfil desde cero y queda como owner.</span>
                    <span className="onb-path__role">Owner</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    className={["onb-path", initialMode === "join" ? "is-suggested" : ""].join(" ")}
                    onClick={() => selectPath("join")}
                    whileTap={{ scale: 0.985 }}
                  >
                    <span className="onb-path__index">02</span>
                    <span className="onb-path__title">Unirme a una</span>
                    <span className="onb-path__note">Busca la startup o pega una invitación.</span>
                    <span className="onb-path__role">Invitado</span>
                  </motion.button>
                </div>
              </motion.section>
            ) : null}

            {visibleStage === "startup" && selectedPath === "create" ? (
              <motion.section
                key={`create-${createStep.id}`}
                className="onb-card"
                {...cardMotion}
                transition={motionTransition}
              >
                <div className="onb-card__top">
                  <button
                    type="button"
                    className="onb-back"
                    onClick={() => {
                      setError("");
                      setSelectedPath(null);
                      playSound("click");
                    }}
                  >
                    Cambiar
                  </button>
                  <ol className="onb-stepper" aria-label="Pasos para crear startup">
                    {createSteps.map((step, index) => (
                      <li
                        key={step.id}
                        className={[
                          index === createStepIndex ? "is-active" : "",
                          index < createStepIndex ? "is-done" : ""
                        ].join(" ")}
                        aria-label={step.label}
                      />
                    ))}
                  </ol>
                </div>

                <p className="onb-eyebrow">{createStep.eyebrow}</p>
                <h1 className="onb-title">{createStep.title}</h1>
                <p className="onb-lead">{createStep.note}</p>

                {createStep.id === "identity" ? (
                  <div className="onb-row">
                    <div className="onb-field">
                      <label htmlFor="startup-name">Nombre de la startup</label>
                      <input
                        id="startup-name"
                        className="onb-input"
                        value={startupName}
                        onChange={event => setStartupName(event.target.value)}
                        placeholder="Ej. Amazonía Labs"
                        autoFocus
                      />
                    </div>
                    <div className="onb-field">
                      <label>Categoría</label>
                      <div className="onb-chips">
                        {categoryOptions.map(category => (
                          <button
                            key={category}
                            type="button"
                            className={["onb-chip", startupCategory === category ? "is-selected" : ""].join(" ")}
                            onClick={() => selectChip(setStartupCategory, category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="onb-field">
                      <label htmlFor="startup-headline">Headline del perfil</label>
                      <textarea
                        id="startup-headline"
                        className="onb-textarea"
                        value={startupOneLiner}
                        onChange={event => setStartupOneLiner(event.target.value)}
                        placeholder="Una frase que explique qué hace, para quién y por qué importa."
                        rows={2}
                      />
                    </div>
                  </div>
                ) : null}

                {createStep.id === "territory" ? (
                  <div className="onb-row">
                    <div className="onb-row onb-row--split">
                      <div className="onb-field">
                        <label htmlFor="startup-country">País de operación</label>
                        <input
                          id="startup-country"
                          className="onb-input"
                          value={startupCountry}
                          onChange={event => setStartupCountry(event.target.value)}
                          placeholder="Ej. Colombia"
                          autoFocus
                        />
                      </div>
                      <div className="onb-field">
                        <label htmlFor="startup-based-country">País base</label>
                        <input
                          id="startup-based-country"
                          className="onb-input"
                          value={startupBasedCountry}
                          onChange={event => setStartupBasedCountry(event.target.value)}
                          placeholder="Ej. México"
                        />
                      </div>
                    </div>
                    <div className="onb-field">
                      <label htmlFor="startup-website">Website</label>
                      <input
                        id="startup-website"
                        className="onb-input"
                        value={startupWebsite}
                        onChange={event => setStartupWebsite(event.target.value)}
                        placeholder="startup.com"
                      />
                    </div>
                    <div className="onb-field">
                      <label>Track</label>
                      <div className="onb-chips">
                        {trackOptions.map(track => (
                          <button
                            key={track}
                            type="button"
                            className={["onb-chip", startupTrack === track ? "is-selected" : ""].join(" ")}
                            onClick={() => selectChip(setStartupTrack, track)}
                          >
                            {track}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {createStep.id === "story" ? (
                  <div className="onb-row">
                    <div className="onb-field">
                      <label htmlFor="startup-description">Descripción larga</label>
                      <textarea
                        id="startup-description"
                        className="onb-textarea"
                        value={startupDescription}
                        onChange={event => setStartupDescription(event.target.value)}
                        placeholder="Cómo funciona, qué problema resuelve, para quién y qué la hace distinta."
                        autoFocus
                        rows={4}
                      />
                    </div>
                    <div className="onb-field">
                      <label htmlFor="startup-impact">Impacto esperado</label>
                      <textarea
                        id="startup-impact"
                        className="onb-textarea"
                        value={startupImpact}
                        onChange={event => setStartupImpact(event.target.value)}
                        placeholder="Qué cambia en territorio, mercado o ecosistema."
                        rows={4}
                      />
                    </div>
                  </div>
                ) : null}

                {createStep.id === "traction" ? (
                  <div className="onb-row">
                    <div className="onb-field">
                      <label htmlFor="startup-data-1">Dato 01</label>
                      <textarea
                        id="startup-data-1"
                        className="onb-textarea"
                        value={startupData1}
                        onChange={event => setStartupData1(event.target.value)}
                        placeholder="Hectáreas: 1,200 hectáreas restauradas en 2025"
                        autoFocus
                        rows={2}
                      />
                    </div>
                    <div className="onb-field">
                      <label htmlFor="startup-data-2">Dato 02</label>
                      <textarea
                        id="startup-data-2"
                        className="onb-textarea"
                        value={startupData2}
                        onChange={event => setStartupData2(event.target.value)}
                        placeholder="Comunidad: 18 alianzas con cooperativas locales"
                        rows={2}
                      />
                    </div>
                    <div className="onb-field">
                      <label htmlFor="startup-data-3">Dato 03</label>
                      <textarea
                        id="startup-data-3"
                        className="onb-textarea"
                        value={startupData3}
                        onChange={event => setStartupData3(event.target.value)}
                        placeholder="Revenue: 6x crecimiento YoY"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : null}

                {createStep.id === "media" ? (
                  <div className="onb-row">
                    <div className="onb-uploads onb-uploads--template">
                      <ImageDrop
                        kind="cover"
                        label="Cover / image1"
                        detail="Hero principal"
                        asset={getUploadAsset("cover")}
                        isDragging={draggingUpload === "cover"}
                        onChange={handleFileChange}
                        onDrop={handleDrop}
                        onDragEnter={setDraggingUpload}
                        onRemove={removeAsset}
                      />
                      <ImageDrop
                        kind="image2"
                        label="Imagen secundaria / image2"
                        detail="Fan visual"
                        asset={getUploadAsset("image2")}
                        isDragging={draggingUpload === "image2"}
                        onChange={handleFileChange}
                        onDrop={handleDrop}
                        onDragEnter={setDraggingUpload}
                        onRemove={removeAsset}
                      />
                      <ImageDrop
                        kind="quotePhoto"
                        label="Foto quote / quotePhoto"
                        detail="Autor o equipo"
                        asset={getUploadAsset("quotePhoto")}
                        isDragging={draggingUpload === "quotePhoto"}
                        onChange={handleFileChange}
                        onDrop={handleDrop}
                        onDragEnter={setDraggingUpload}
                        onRemove={removeAsset}
                      />
                    </div>
                    <div className="onb-field">
                      <label htmlFor="startup-video">Video (URL)</label>
                      <input
                        id="startup-video"
                        className="onb-input"
                        value={startupVideo}
                        onChange={event => setStartupVideo(event.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ) : null}

                {createStep.id === "voice" ? (
                  <div className="onb-row">
                    <div className="onb-field">
                      <label htmlFor="startup-quote">Quote</label>
                      <textarea
                        id="startup-quote"
                        className="onb-textarea"
                        value={startupQuote}
                        onChange={event => setStartupQuote(event.target.value)}
                        placeholder="Una frase del equipo que represente la mirada de la startup."
                        autoFocus
                        rows={3}
                      />
                    </div>
                    <div className="onb-field">
                      <label htmlFor="startup-quote-name">Nombre y rol</label>
                      <input
                        id="startup-quote-name"
                        className="onb-input"
                        value={startupQuoteName}
                        onChange={event => setStartupQuoteName(event.target.value)}
                        placeholder="Ana Lopez - Founder"
                      />
                    </div>
                  </div>
                ) : null}

                {createStep.id === "review" ? (
                  <div className="onb-review">
                    {[
                      ["Startup", startupName || "Pendiente"],
                      ["Vertical", startupCategory || "Pendiente"],
                      ["Operación", startupCountry || "Pendiente"],
                      ["Base", startupBasedCountry || "Pendiente"],
                      ["Sitio", getWebsiteHost(startupWebsite)],
                      ["Headline", startupOneLiner || "Pendiente"],
                      ["Descripción", startupDescription ? "Lista" : "Opcional"],
                      ["Impacto", startupImpact ? "Listo" : "Opcional"],
                      ["Métricas", tractionSignals ? `${tractionSignals}/3` : "Opcional"],
                      ["Cover", coverAsset?.status === "done" ? "Subido" : "Opcional"],
                      ["Image2", image2Asset?.status === "done" ? "Subida" : "Opcional"],
                      ["Quote photo", quotePhotoAsset?.status === "done" ? "Subida" : "Opcional"],
                      ["Video", startupVideo ? "URL agregada" : "Opcional"],
                      ["Quote", startupQuote ? "Lista" : "Opcional"],
                      ["Track", startupTrack || startupCategory || "Pendiente"]
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}

                {error ? <p className="onb-alert">{error}</p> : null}

                <div className="onb-actions">
                  <button
                    type="button"
                    className="onb-secondary"
                    disabled={createStepIndex === 0 || submittingStartup}
                    onClick={() => moveCreateStep(-1)}
                  >
                    Atrás
                  </button>
                  <div className="onb-actions__group">
                    {createStep.id === "review" ? (
                      <button
                        className="onb-cta"
                        type="button"
                        disabled={!stepIsComplete || submittingStartup || uploadIsPending}
                        onClick={() => submitStartup("create")}
                      >
                        {submittingStartup ? "Creando..." : "Crear perfil"}
                      </button>
                    ) : (
                      <button
                        className="onb-cta"
                        type="button"
                        disabled={!stepIsComplete || submittingStartup || uploadIsPending}
                        onClick={() => moveCreateStep(1)}
                      >
                        Continuar
                      </button>
                    )}
                  </div>
                </div>
              </motion.section>
            ) : null}

            {visibleStage === "startup" && selectedPath === "join" ? (
              <motion.section
                key="join"
                className="onb-card"
                {...cardMotion}
                transition={motionTransition}
              >
                <div className="onb-card__top">
                  <button
                    type="button"
                    className="onb-back"
                    onClick={() => {
                      setError("");
                      setSelectedPath(null);
                      playSound("click");
                    }}
                  >
                    Cambiar
                  </button>
                  <span className="onb-path__role">Vinculación</span>
                </div>

                <p className="onb-eyebrow">Perfil 02 / Invitado</p>
                <h1 className="onb-title">Busca la startup correcta</h1>
                <p className="onb-lead">
                  Si ya existe en Natura OS, selecciónala. Si tienes invitación, pégala y la detectamos.
                </p>

                <div className="onb-row">
                  <div className="onb-row onb-row--split">
                    <div className="onb-field">
                      <label htmlFor="startup-query">Buscar</label>
                      <input
                        id="startup-query"
                        className="onb-input"
                        value={startupQuery}
                        onChange={event => setStartupQuery(event.target.value)}
                        placeholder="Nombre, vertical o país"
                        autoFocus
                      />
                    </div>
                    <div className="onb-field">
                        <label htmlFor="invite-code">Link o código</label>
                      <input
                        id="invite-code"
                        className="onb-input"
                        value={inviteInput}
                        onChange={event => setInviteInput(event.target.value)}
                        placeholder="Link o código"
                      />
                    </div>
                  </div>

                  <div className="onb-join-meta">
                    <div className="onb-results" aria-label="Startups encontradas">
                      {startupOptions.map(startup => (
                        <button
                          key={startup.id}
                          type="button"
                          className={["onb-result", startup.id === selectedStartupId ? "is-selected" : ""].join(" ")}
                          onClick={() => {
                            setSelectedStartupId(startup.id);
                            playSound("select");
                          }}
                        >
                          <span className="onb-result__thumb">
                            {startup.image1 ? <Image src={startup.image1} alt="" fill sizes="40px" /> : getInitial(startup.name)}
                          </span>
                          <span className="onb-result__body">
                            <strong>{startup.name}</strong>
                            <small>
                              {summarizeStartup(startup.category, startup.operatingCountry ?? startup.basedCountry)}
                            </small>
                          </span>
                        </button>
                      ))}
                      {startupOptions.length === 0 ? <p className="onb-empty">No encontramos una startup con esa búsqueda.</p> : null}
                    </div>

                    <aside className="onb-selection">
                      <p className="onb-eyebrow">{inviteStartupId ? "Invitación detectada" : "Selección"}</p>
                      <strong className="onb-selection-title">{selectedStartup?.name ?? "Elige una startup"}</strong>
                      <span className="onb-selection-copy">
                        {selectedStartup
                          ? summarizeStartup(selectedStartup.category, selectedStartup.operatingCountry ?? selectedStartup.basedCountry)
                          : "Cuando la selecciones, pediremos acceso a ese perfil."}
                      </span>
                    </aside>
                  </div>
                </div>

                {error ? <p className="onb-alert">{error}</p> : null}

                <div className="onb-actions">
                  <button
                    type="button"
                    className="onb-secondary"
                    onClick={() => {
                      setError("");
                      setSelectedPath(null);
                      playSound("click");
                    }}
                  >
                    Atrás
                  </button>
                  <button
                    className="onb-cta"
                    type="button"
                    disabled={!selectedStartupId || submittingStartup}
                    onClick={() => submitStartup("join")}
                  >
                    {submittingStartup ? "Vinculando..." : "Solicitar acceso"}
                  </button>
                </div>
              </motion.section>
            ) : null}

            {visibleStage === "launch" ? (
              <motion.section
                key="launch"
                className="onb-card"
                {...cardMotion}
                transition={motionTransition}
              >
                <div className="onb-launch-head">
                  <span className="onb-success" aria-hidden="true" />
                  <div>
                    <p className="onb-eyebrow">Workspace listo</p>
                    <h1 className="onb-title">{activeStartup?.name ?? "Startup activa"}</h1>
                  </div>
                </div>
                <p className="onb-lead">
                  El perfil quedó activo. Studio, conexiones y premios ya trabajan desde esta startup.
                </p>
                <div className="onb-launch__badges">
                  <span>{activeStartup?.role ?? "OWNER"}</span>
                  <span>{activeStartup?.category ?? "Natura OS"}</span>
                  <span>{activeStartup?.country ?? "Latam"}</span>
                </div>
                <div className="onb-actions">
                  <Link className="onb-cta" href={redirectTo}>
                    Entrar al Studio
                  </Link>
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>

        </div>
      </section>
    </main>
  );
}

function ImageDrop({
  kind,
  label,
  detail,
  asset,
  isDragging,
  onChange,
  onDrop,
  onDragEnter,
  onRemove
}: {
  kind: UploadKind;
  label: string;
  detail: string;
  asset: UploadAsset | null;
  isDragging: boolean;
  onChange: (kind: UploadKind, event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (kind: UploadKind, event: DragEvent<HTMLDivElement>) => void;
  onDragEnter: (kind: UploadKind | null) => void;
  onRemove: (kind: UploadKind) => void;
}) {
  return (
    <div
      className={[
        "onb-drop",
        asset?.previewUrl ? "has-image" : "",
        isDragging ? "is-drag" : ""
      ].join(" ")}
      onDrop={event => onDrop(kind, event)}
      onDragOver={event => event.preventDefault()}
      onDragEnter={() => onDragEnter(kind)}
      onDragLeave={() => onDragEnter(null)}
    >
      {asset?.previewUrl ? (
        <span className="onb-drop__preview" style={{ backgroundImage: `url(${asset.previewUrl})` }} />
      ) : null}
      <span className="onb-drop__label">
        {asset?.status === "uploading" ? "Subiendo..." : asset?.status === "done" ? asset.name : label}
        <small>{asset?.status === "error" ? asset.error : detail}</small>
      </span>
      {asset ? (
        <button
          type="button"
          className="onb-drop__remove"
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            onRemove(kind);
          }}
          aria-label={`Quitar ${label.toLowerCase()}`}
        >
          ×
        </button>
      ) : null}
      {asset?.status === "uploading" ? (
        <span className="onb-drop__progress">
          <span style={{ width: "68%" }} />
        </span>
      ) : null}
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        aria-label={`Subir ${label.toLowerCase()}`}
        onChange={event => onChange(kind, event)}
      />
    </div>
  );
}
