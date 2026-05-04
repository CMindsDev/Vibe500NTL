"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type BlockKind = "hero" | "text" | "gallery" | "metrics" | "instagram" | "linkedin" | "update";
type StudioMode = "builder" | "preview";
type Tone = "lime" | "cyan" | "coral" | "violet";

type StudioBlock = {
  id: string;
  kind: BlockKind;
  label: string;
  title: string;
  summary: string;
  source: string;
  status: "Publicado" | "Borrador" | "Sincronizado";
  tone: Tone;
};

type SocialConnection = {
  id: "instagram" | "linkedin";
  label: string;
  handle: string;
  status: string;
  active: boolean;
  tone: Tone;
};

const user = {
  name: "Bryan",
  email: "bryan@cminds.co",
  picture: "/assets/01.webp",
  startup: "RushFrame"
};

const blockLibrary: Array<{
  kind: BlockKind;
  label: string;
  title: string;
  summary: string;
  source: string;
  tone: Tone;
}> = [
  {
    kind: "text",
    label: "Texto",
    title: "Narrativa",
    summary: "Manifiesto, problema, insight o update editorial.",
    source: "Manual",
    tone: "lime"
  },
  {
    kind: "gallery",
    label: "Imágenes",
    title: "Galería",
    summary: "Screens, producto, equipo o evidencia visual.",
    source: "Media kit",
    tone: "cyan"
  },
  {
    kind: "metrics",
    label: "Métricas",
    title: "Traction strip",
    summary: "KPIs destacados con contexto corto.",
    source: "Data room",
    tone: "coral"
  },
  {
    kind: "instagram",
    label: "Instagram",
    title: "Posts importados",
    summary: "Tarjetas sociales sincronizadas desde el perfil.",
    source: "@rushframe",
    tone: "violet"
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
    title: "Founders feed",
    summary: "Posts, hiring notes y anuncios públicos.",
    source: "RushFrame",
    tone: "cyan"
  },
  {
    kind: "update",
    label: "Update",
    title: "Hito reciente",
    summary: "Una novedad lista para subir a Explorar.",
    source: "Equipo",
    tone: "lime"
  }
];

const initialBlocks: StudioBlock[] = [
  {
    id: "hero-1",
    kind: "hero",
    label: "Portada",
    title: "RushFrame convierte grabaciones largas en clips listos para performance en minutos.",
    summary:
      "Un builder de video corto para equipos de marketing que necesitan publicar más rápido sin perder control creativo.",
    source: "Perfil público",
    status: "Publicado",
    tone: "lime"
  },
  {
    id: "text-1",
    kind: "text",
    label: "Historia",
    title: "De edición manual a pipeline creativo",
    summary:
      "La plataforma detecta momentos, arma variantes, propone copies y organiza piezas para TikTok, Reels, Shorts y paid social.",
    source: "Manual",
    status: "Publicado",
    tone: "cyan"
  },
  {
    id: "gallery-1",
    kind: "gallery",
    label: "Galería",
    title: "Producto en acción",
    summary: "Tres capturas seleccionadas para la tarjeta expandida de Explorar.",
    source: "Media kit",
    status: "Publicado",
    tone: "coral"
  },
  {
    id: "metrics-1",
    kind: "metrics",
    label: "Métricas",
    title: "Tracción",
    summary: "Datos compactos para que inversionistas y aliados escaneen valor en segundos.",
    source: "Data room",
    status: "Publicado",
    tone: "lime"
  },
  {
    id: "instagram-1",
    kind: "instagram",
    label: "Instagram",
    title: "Últimos lanzamientos visuales",
    summary: "Tarjetas importadas desde @rushframe con preview directo en el feed.",
    source: "@rushframe",
    status: "Sincronizado",
    tone: "violet"
  },
  {
    id: "linkedin-1",
    kind: "linkedin",
    label: "LinkedIn",
    title: "Founder notes y hiring",
    summary: "Anuncios y pensamiento de producto listos para aparecer como updates.",
    source: "RushFrame",
    status: "Sincronizado",
    tone: "cyan"
  }
];

const stats = [
  { label: "Bloques publicados", value: "12", detail: "+3 esta semana" },
  { label: "Tarjetas sociales", value: "38", detail: "9 nuevas" },
  { label: "Completitud", value: "92%", detail: "perfil fuerte" },
  { label: "Vista previa", value: "Live", detail: "Explorar" }
];

const productImages = ["/assets/01.webp", "/assets/04.webp", "/assets/06.webp"];

export function StartupStudio() {
  const [blocks, setBlocks] = useState<StudioBlock[]>(initialBlocks);
  const [selectedId, setSelectedId] = useState(initialBlocks[0].id);
  const [mode, setMode] = useState<StudioMode>("builder");
  const [connections, setConnections] = useState<SocialConnection[]>([
    {
      id: "instagram",
      label: "Instagram",
      handle: "@rushframe",
      status: "Sincroniza cada 20 min",
      active: true,
      tone: "violet"
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      handle: "RushFrame",
      status: "4 posts en cola",
      active: true,
      tone: "cyan"
    }
  ]);

  const selectedBlock = useMemo(
    () => blocks.find(block => block.id === selectedId) ?? blocks[0],
    [blocks, selectedId]
  );

  const publishedCount = blocks.filter(block => block.status !== "Borrador").length;
  const completion = Math.round((publishedCount / Math.max(blocks.length, 1)) * 100);

  function addBlock(kind: BlockKind) {
    const template = blockLibrary.find(block => block.kind === kind);
    if (!template) return;

    const nextBlock: StudioBlock = {
      ...template,
      id: `${kind}-${Date.now()}`,
      status: kind === "instagram" || kind === "linkedin" ? "Sincronizado" : "Borrador"
    };

    setBlocks(prev => [...prev, nextBlock]);
    setSelectedId(nextBlock.id);
    setMode("builder");
  }

  function toggleConnection(id: SocialConnection["id"]) {
    setConnections(prev =>
      prev.map(connection =>
        connection.id === id ? { ...connection, active: !connection.active } : connection
      )
    );
  }

  const instagramActive = connections.find(connection => connection.id === "instagram")?.active;
  const linkedinActive = connections.find(connection => connection.id === "linkedin")?.active;

  return (
    <main className="studio-shell">
      <header className="topbar studio-topbar" aria-label="Navegación principal">
        <a className="brand-mark" href="/" aria-label="500 explorar">
          <Image src="/assets/programs-logos/500.svg" alt="500" width={88} height={36} priority />
        </a>
        <div className="topbar-divider" aria-hidden="true" />
        <nav className="topbar-nav">
          <a className="nav-item" href="/">
            <Image src="/icons/explore.svg" alt="" width={14} height={16} />
            <span>Explorar</span>
          </a>
          <a className="nav-item" href="/conexiones">
            <span>Conexiones</span>
          </a>
          <a className="nav-item" href="/premio">
            <span>Premio</span>
          </a>
          <a className="nav-item nav-item--startup is-active" href="/studio">
            <span>{user.startup}</span>
          </a>
        </nav>
        <div className="topbar-end">
          <div className="user-badge">
            <div className="user-badge__inner">
              <span className="user-badge__avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.picture} alt="" referrerPolicy="no-referrer" />
              </span>
              <span className="user-badge__name">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="studio-workspace">
        <aside className="studio-panel studio-panel--left" aria-label="Bloques y perfil">
          <div className="studio-profile">
            <span className="studio-avatar" aria-hidden="true">RF</span>
            <div>
              <p className="studio-eyebrow">Startup studio</p>
              <h1>RushFrame</h1>
              <span>Media AI · México</span>
            </div>
          </div>

          <div className="studio-score" aria-label={`Perfil ${completion}% completo`}>
            <div className="studio-score__head">
              <span>Perfil público</span>
              <strong>{completion}%</strong>
            </div>
            <div className="studio-progress">
              <span style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="studio-palette">
            <div className="studio-panel__head">
              <span>Agregar bloque</span>
              <small>{blocks.length} activos</small>
            </div>
            {blockLibrary.map(item => (
              <button
                key={item.kind}
                type="button"
                className={`studio-tool studio-tone--${item.tone}`}
                onClick={() => addBlock(item.kind)}
              >
                <span className="studio-tool__icon">
                  <StudioIcon name={item.kind} />
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.summary}</small>
                </span>
                <StudioIcon name="plus" />
              </button>
            ))}
          </div>
        </aside>

        <section className="studio-stage" aria-label="Editor de feed">
          <div className="studio-stage__top">
            <div>
              <p className="studio-eyebrow">Feed builder</p>
              <h2>Lo que verá Explorar</h2>
              <span>Ordena bloques, mezcla contenido propio y sincroniza tarjetas sociales.</span>
            </div>
            <div className="studio-actions">
              <div className="studio-segmented" aria-label="Modo de vista">
                <button
                  type="button"
                  className={mode === "builder" ? "is-active" : ""}
                  onClick={() => setMode("builder")}
                >
                  Builder
                </button>
                <button
                  type="button"
                  className={mode === "preview" ? "is-active" : ""}
                  onClick={() => setMode("preview")}
                >
                  Preview
                </button>
              </div>
              <button className="studio-publish" type="button">
                <StudioIcon name="check" />
                Publicar
              </button>
            </div>
          </div>

          <div className="studio-stat-grid" aria-label="Resumen del perfil">
            {stats.map(stat => (
              <div className="studio-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.detail}</small>
              </div>
            ))}
          </div>

          <div className="studio-canvas">
            <div className="studio-canvas__bar">
              <span>
                <StudioIcon name="sync" />
                Autoguardado hace 12 s
              </span>
              <a href="/">/explorar/rushframe</a>
            </div>

            <AnimatePresence mode="wait">
              {mode === "builder" ? (
                <motion.div
                  key="builder"
                  className="studio-blocks"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  {blocks.map((block, index) => (
                    <BuilderBlock
                      key={block.id}
                      block={block}
                      index={index}
                      selected={block.id === selectedBlock.id}
                      instagramActive={Boolean(instagramActive)}
                      linkedinActive={Boolean(linkedinActive)}
                      onSelect={() => setSelectedId(block.id)}
                    />
                  ))}
                </motion.div>
              ) : (
                <ExplorePreview
                  key="preview"
                  blocks={blocks}
                  instagramActive={Boolean(instagramActive)}
                  linkedinActive={Boolean(linkedinActive)}
                />
              )}
            </AnimatePresence>
          </div>
        </section>

        <aside className="studio-panel studio-panel--right" aria-label="Inspector e integraciones">
          <InspectorPanel block={selectedBlock} />

          <div className="studio-integrations">
            <div className="studio-panel__head">
              <span>Integraciones</span>
              <small>2 canales</small>
            </div>
            {connections.map(connection => (
              <button
                key={connection.id}
                type="button"
                className={`studio-integration studio-tone--${connection.tone} ${
                  connection.active ? "is-active" : ""
                }`}
                onClick={() => toggleConnection(connection.id)}
              >
                <span className="studio-integration__icon">
                  <StudioIcon name={connection.id} />
                </span>
                <span>
                  <strong>{connection.label}</strong>
                  <small>{connection.handle}</small>
                </span>
                <em>{connection.active ? connection.status : "Conectar"}</em>
              </button>
            ))}
          </div>

          <div className="studio-queue">
            <div className="studio-panel__head">
              <span>Cola de Explorar</span>
              <small>Próximo refresh</small>
            </div>
            <div className="studio-queue__item">
              <strong>Demo de campaign cuts</strong>
              <span>Publica hoy · 6:30 PM</span>
            </div>
            <div className="studio-queue__item">
              <strong>Hiring motion designer</strong>
              <span>Desde LinkedIn</span>
            </div>
            <div className="studio-queue__item">
              <strong>3 nuevos reels</strong>
              <span>Desde Instagram</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function BuilderBlock({
  block,
  index,
  selected,
  instagramActive,
  linkedinActive,
  onSelect
}: {
  block: StudioBlock;
  index: number;
  selected: boolean;
  instagramActive: boolean;
  linkedinActive: boolean;
  onSelect: () => void;
}) {
  const disabled =
    (block.kind === "instagram" && !instagramActive) || (block.kind === "linkedin" && !linkedinActive);

  return (
    <motion.button
      type="button"
      className={`studio-block studio-tone--${block.tone} ${selected ? "is-selected" : ""} ${
        disabled ? "is-muted" : ""
      }`}
      onClick={onSelect}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="studio-block__rail">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <StudioIcon name="drag" />
      </span>

      <span className="studio-block__body">
        <span className="studio-block__head">
          <span>
            <small>{block.label}</small>
            <strong>{block.title}</strong>
          </span>
          <em>{disabled ? "Reconectar" : block.status}</em>
        </span>
        <BlockPreview block={block} disabled={disabled} />
      </span>
    </motion.button>
  );
}

function BlockPreview({ block, disabled }: { block: StudioBlock; disabled: boolean }) {
  if (block.kind === "hero") {
    return (
      <span className="studio-preview studio-preview--hero">
        <span>
          <b>AI video workflow</b>
          <small>{block.summary}</small>
        </span>
        <span className="studio-preview__image">
          <Image src="/assets/02.webp" alt="" fill sizes="160px" />
        </span>
      </span>
    );
  }

  if (block.kind === "gallery") {
    return (
      <span className="studio-preview studio-preview--gallery">
        {productImages.map(src => (
          <span key={src}>
            <Image src={src} alt="" fill sizes="120px" />
          </span>
        ))}
      </span>
    );
  }

  if (block.kind === "metrics") {
    return (
      <span className="studio-preview studio-preview--metrics">
        <span>
          <b>4.8x</b>
          <small>faster edits</small>
        </span>
        <span>
          <b>120K</b>
          <small>clips rendered</small>
        </span>
        <span>
          <b>31%</b>
          <small>CAC reduction</small>
        </span>
      </span>
    );
  }

  if (block.kind === "instagram") {
    return (
      <span className="studio-preview studio-preview--social">
        {["Launch cut", "Creator stack", "Before / after"].map((post, index) => (
          <span key={post} className={disabled ? "is-disabled" : ""}>
            <Image src={productImages[index]} alt="" fill sizes="120px" />
            <b>{post}</b>
          </span>
        ))}
      </span>
    );
  }

  if (block.kind === "linkedin") {
    return (
      <span className="studio-preview studio-preview--note">
        <b>Founder update</b>
        <small>
          "We crossed 120K rendered assets and opened early access for retail media teams."
        </small>
      </span>
    );
  }

  return (
    <span className="studio-preview studio-preview--note">
      <b>{block.source}</b>
      <small>{block.summary}</small>
    </span>
  );
}

function ExplorePreview({
  blocks,
  instagramActive,
  linkedinActive
}: {
  blocks: StudioBlock[];
  instagramActive: boolean;
  linkedinActive: boolean;
}) {
  return (
    <motion.div
      className="studio-explore"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="studio-explore__hero">
        <Image src="/assets/02.webp" alt="" fill sizes="(max-width: 900px) 100vw, 720px" />
        <div>
          <span>RushFrame · México</span>
          <h3>Video pipelines for teams moving at internet speed.</h3>
          <p>
            Perfil construido con {blocks.length} bloques activos, social cards y métricas listas para Explorar.
          </p>
        </div>
      </div>

      <div className="studio-explore__grid">
        <article className="studio-explore-card studio-explore-card--wide">
          <span>Métricas</span>
          <div className="studio-preview--metrics">
            <span>
              <b>4.8x</b>
              <small>faster edits</small>
            </span>
            <span>
              <b>120K</b>
              <small>clips rendered</small>
            </span>
            <span>
              <b>18</b>
              <small>brand pilots</small>
            </span>
          </div>
        </article>
        {instagramActive ? (
          <article className="studio-explore-card">
            <Image src="/assets/04.webp" alt="" fill sizes="260px" />
            <strong>Instagram launch kit</strong>
          </article>
        ) : null}
        {linkedinActive ? (
          <article className="studio-explore-card studio-explore-card--text">
            <span>LinkedIn</span>
            <p>Opening 20 seats for our retail media beta. Looking for teams shipping weekly video campaigns.</p>
          </article>
        ) : null}
        <article className="studio-explore-card">
          <Image src="/assets/06.webp" alt="" fill sizes="260px" />
          <strong>Product walkthrough</strong>
        </article>
      </div>
    </motion.div>
  );
}

function InspectorPanel({ block }: { block: StudioBlock }) {
  return (
    <div className="studio-inspector">
      <div className="studio-panel__head">
        <span>Inspector</span>
        <small>{block.label}</small>
      </div>
      <div className={`studio-inspector__hero studio-tone--${block.tone}`}>
        <StudioIcon name={block.kind} />
        <div>
          <strong>{block.title}</strong>
          <span>{block.summary}</span>
        </div>
      </div>
      <div className="studio-field">
        <span>Origen</span>
        <strong>{block.source}</strong>
      </div>
      <div className="studio-field">
        <span>Estado</span>
        <strong>{block.status}</strong>
      </div>
      <div className="studio-field">
        <span>Destino</span>
        <strong>Explorar · Perfil · AI Match</strong>
      </div>
      <div className="studio-field">
        <span>Layout</span>
        <strong>{block.kind === "hero" ? "Full bleed" : "Feed card"}</strong>
      </div>
    </div>
  );
}

function StudioIcon({ name }: { name: BlockKind | "plus" | "drag" | "check" | "sync" | "instagram" | "linkedin" }) {
  if (name === "drag") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M5 3h1M10 3h1M5 8h1M10 8h1M5 13h1M10 13h1" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 3v10M3 8h10" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="m3 8.5 3 3L13 4" />
      </svg>
    );
  }

  if (name === "sync") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M12.5 5.5A5 5 0 0 0 3 6M3.5 10.5A5 5 0 0 0 13 10M12.5 2.5v3h-3M3.5 13.5v-3h3" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="3" y="3" width="10" height="10" rx="3" />
        <circle cx="8" cy="8" r="2.3" />
        <path d="M11 5h.01" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 7v6M4 4.5v.02M7.5 13V7M7.5 9.6c.7-1.7 4.5-2 4.5 1.1V13" />
      </svg>
    );
  }

  if (name === "gallery" || name === "hero") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2.5" y="3" width="11" height="10" rx="2" />
        <path d="m4 11 2.6-3 2 2 1.3-1.4L12 11" />
        <path d="M5.5 5.5h.01" />
      </svg>
    );
  }

  if (name === "metrics") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 13V8M8 13V3M13 13V6" />
      </svg>
    );
  }

  if (name === "text" || name === "update") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 4h10M3 8h7M3 12h9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2.5v11M2.5 8h11" />
    </svg>
  );
}
