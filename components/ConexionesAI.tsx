"use client";

import Image from "next/image";
import {
  AnimatePresence,
  type MotionStyle,
  motion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { AuthUser } from "@/lib/types";

type ConnectionId = "diagnostico" | "matchmaker" | "premio-regenera" | "alertas";

type Connection = {
  id: ConnectionId;
  kicker: string;
  title: string;
  description: string;
  accent: string;
  image: string;
  metric: string;
  metricLabel: string;
  status: string;
  cta: string;
  outputs: string[];
  route: string;
};

const smoothEase = [0.22, 1, 0.36, 1] as const;

const user: AuthUser = {
  name: "Bryan",
  email: "bryan@cminds.co",
  picture: "/assets/01.webp",
  startup: "RushFrame"
};

const connections: Connection[] = [
  {
    id: "diagnostico",
    kicker: "01 / Perfil",
    title: "Diagnóstico",
    description:
      "Una lectura profunda del perfil público, tracción, narrativa, visuales y señales que influyen en inversionistas, premios y aliados.",
    accent: "#74ffda",
    image: "/assets/02.webp",
    metric: "92%",
    metricLabel: "perfil listo",
    status: "Disponible ahora",
    cta: "Entrar al diagnóstico",
    outputs: ["score de perfil", "brechas de contenido", "prioridades de mejora"],
    route: "/studio"
  },
  {
    id: "matchmaker",
    kicker: "02 / Capital",
    title: "Matchmaker",
    description:
      "Cruza etapa, vertical, geografía y señales del builder para sugerir fondos, aliados y programas que encajan con RushFrame.",
    accent: "#ebff57",
    image: "/assets/05.webp",
    metric: "18",
    metricLabel: "matches activos",
    status: "Actualizado hoy",
    cta: "Ver matches",
    outputs: ["fondos compatibles", "razón de match", "siguiente acción"],
    route: "/conexiones#matchmaker"
  },
  {
    id: "premio-regenera",
    kicker: "03 / Convocatoria",
    title: "Premio Regenera",
    description:
      "Conecta el perfil de la startup con la ruta del premio, requisitos, evidencias necesarias y ventana de aplicación.",
    accent: "#ffb14b",
    image: "/assets/04.webp",
    metric: "18",
    metricLabel: "días para abrir",
    status: "Pre-registro listo",
    cta: "Revisar premio",
    outputs: ["checklist de elegibilidad", "timeline", "evidencias pendientes"],
    route: "/premio"
  },
  {
    id: "alertas",
    kicker: "04 / Radar",
    title: "Alertas",
    description:
      "Un monitor vivo de oportunidades: fondos, grants, eventos, mentors y señales que cambian según el avance de RushFrame.",
    accent: "#c7a6ff",
    image: "/assets/06.webp",
    metric: "9",
    metricLabel: "señales nuevas",
    status: "Monitoreando",
    cta: "Configurar alertas",
    outputs: ["oportunidades nuevas", "notificaciones", "filtros por etapa"],
    route: "/conexiones#alertas"
  }
];

export function ConexionesAI() {
  const [activeId, setActiveId] = useState<ConnectionId>(connections[0].id);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const activeConnection = useMemo(
    () => connections.find(connection => connection.id === activeId) ?? connections[0],
    [activeId]
  );

  useEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;

    const cards = Array.from(flow.querySelectorAll<HTMLElement>("[data-connection-card]"));
    const observer = new IntersectionObserver(
      entries => {
        const centered = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const nextId = centered?.target.getAttribute("data-connection-id") as ConnectionId | null;
        if (nextId) setActiveId(nextId);
      },
      {
        root: flow,
        threshold: [0.42, 0.58, 0.74]
      }
    );

    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedConnection(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="cx-shell cx-shell--ready">
      <motion.div
        className="cx-ambient-glow"
        animate={{ background: `radial-gradient(ellipse 70% 60% at 60% -10%, color-mix(in srgb, ${activeConnection.accent} 15%, transparent), transparent)` }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
        aria-hidden="true"
      />

      <header className="topbar cx-topbar" aria-label="Navegacion principal">
        <a className="brand-mark" href="/" aria-label="500 explorar">
          <Image src="/assets/programs-logos/500.svg" alt="500" width={88} height={36} priority />
        </a>
        <div className="topbar-divider" aria-hidden="true" />
        <nav className="topbar-nav">
          <a className="nav-item" href="/">
            <Image src="/icons/explore.svg" alt="" width={14} height={16} />
            <span>Explorar</span>
          </a>
          <a className="nav-item is-active" href="/conexiones">
            <span>Conexiones</span>
          </a>
          <a className="nav-item" href="/premio">
            <span>Premio</span>
          </a>
          <a className="nav-item nav-item--startup" href="/studio">
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

      <div className="cx-terrain" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <section className="cx-playground" aria-label="Conexiones disponibles para RushFrame">
        <aside className="cx-context">
          <motion.div
            key={activeConnection.id}
            className="cx-active"
            style={{ "--connection-accent": activeConnection.accent } as CSSProperties}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: smoothEase }}
          >
            <span>{activeConnection.kicker}</span>
            <strong>{activeConnection.title}</strong>
            <p>{activeConnection.status}</p>
            <div>
              <b>{activeConnection.metric}</b>
              <small>{activeConnection.metricLabel}</small>
            </div>
          </motion.div>

          <nav className="cx-index" aria-label="Indice de conexiones">
            {connections.map(connection => (
              <button
                key={connection.id}
                type="button"
                className={connection.id === activeId ? "is-active" : ""}
                style={{ "--connection-accent": connection.accent } as CSSProperties}
                onClick={() => {
                  const card = flowRef.current?.querySelector<HTMLElement>(
                    `[data-connection-id="${connection.id}"]`
                  );
                  card?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                <div className="cx-index-indicator">
                  {connection.id === activeId && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="cx-index-indicator-fill"
                    />
                  )}
                </div>
                {connection.title}
              </button>
            ))}
          </nav>
        </aside>

        <div className="cx-flow" ref={flowRef}>
          {connections.map((connection, index) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              index={index}
              flowRef={flowRef}
              onOpen={() => setSelectedConnection(connection)}
            />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedConnection ? (
          <ConnectionDetail
            connection={selectedConnection}
            onClose={() => setSelectedConnection(null)}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}



function ConnectionCard({
  connection,
  index,
  flowRef,
  onOpen
}: {
  connection: Connection;
  index: number;
  flowRef: RefObject<HTMLDivElement | null>;
  onOpen: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    container: flowRef,
    offset: ["start end", "end start"]
  });
  const rawY = useTransform(scrollYProgress, [0, 0.5, 1], [220, 0, -220]);
  const rawScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.75, 1, 0.75]);
  const rawRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [18, 0, -18]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.15, 1, 1, 0.15]);
  const y = useSpring(rawY, { stiffness: 50, damping: 18, mass: 0.8 });
  const scale = useSpring(rawScale, { stiffness: 50, damping: 18, mass: 0.8 });
  const rotateX = useSpring(rawRotateX, { stiffness: 50, damping: 18, mass: 0.8 });
  const opacity = useSpring(rawOpacity, { stiffness: 80, damping: 22, mass: 0.5 });

  return (
    <article
      ref={cardRef}
      className="cx-card-frame"
      data-connection-card
      data-connection-id={connection.id}
    >
      <motion.div
        className="cx-card"
        style={
          {
            "--connection-accent": connection.accent,
            y,
            scale,
            rotateX,
            opacity,
            transformPerspective: 1200
          } as unknown as MotionStyle & CSSProperties
        }
      >
        <div className="cx-card__media">
          <Image
            src={connection.image}
            alt=""
            fill
            sizes="(max-width: 900px) 92vw, 680px"
            priority={index === 0}
          />
          <div className="cx-card__topology" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="cx-card__body">
          <div className="cx-card__head">
            <span>{connection.kicker}</span>
            <small>{connection.status}</small>
          </div>
          <h2>{connection.title}</h2>
          <p>{connection.description}</p>

          <div className="cx-card__outputs" aria-label={`Resultados de ${connection.title}`}>
            {connection.outputs.map(output => (
              <span key={output}>{output}</span>
            ))}
          </div>

          <div className="cx-card__footer">
            <div>
              <strong>{connection.metric}</strong>
              <small>{connection.metricLabel}</small>
            </div>
            <button type="button" onClick={onOpen}>
              {connection.cta}
              <ConnectionIcon name="arrow" />
            </button>
          </div>
        </div>
      </motion.div>
    </article>
  );
}

function ConnectionDetail({
  connection,
  onClose
}: {
  connection: Connection;
  onClose: () => void;
}) {
  return (
    <motion.section
      className="cx-detail"
      style={{ "--connection-accent": connection.accent } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cx-detail-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onClick={onClose}
    >
      <motion.article
        className="cx-detail__panel"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.42, ease: smoothEase }}
        onClick={event => event.stopPropagation()}
      >
        <button type="button" className="cx-detail__close" onClick={onClose} aria-label="Cerrar">
          <span />
          <span />
        </button>

        <div className="cx-detail__media">
          <Image src={connection.image} alt="" fill sizes="420px" />
        </div>

        <div className="cx-detail__body">
          <span>{connection.kicker}</span>
          <h2 id="cx-detail-title">{connection.title}</h2>
          <p>{connection.description}</p>

          <div className="cx-detail__grid">
            {connection.outputs.map(output => (
              <div key={output}>
                <ConnectionIcon name="check" />
                <strong>{output}</strong>
              </div>
            ))}
          </div>

          <a className="cx-detail__cta" href={connection.route}>
            Entrar
            <ConnectionIcon name="arrow" />
          </a>
        </div>
      </motion.article>
    </motion.section>
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
