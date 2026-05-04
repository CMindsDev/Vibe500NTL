"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { AuthUser } from "@/lib/types";

const PRIZE_LEVELS = [
  {
    id: "pionera",
    label: "NIVEL 1",
    name: "Pionera Natura500",
    amount: "$5,000",
    desc: "Soluciones en etapa temprana con prototipo funcional, piloto activo o solución en desarrollo.",
    tone: "#74ffda",
    stage: "Etapa temprana"
  },
  {
    id: "creciente",
    label: "NIVEL 2",
    name: "Creciente Natura500",
    amount: "$25,000",
    desc: "Soluciones que muestran primeras ventas o tracción. El modelo funciona y está siendo probado en el mercado.",
    tone: "#ebff57",
    stage: "Tracción inicial"
  },
  {
    id: "lider",
    label: "NIVEL 3",
    name: "Líder Natura500",
    amount: "$100,000",
    desc: "Soluciones con modelo demostrado, raíces comunitarias sólidas y potencial de impacto regional en LAC.",
    tone: "#ffb14b",
    stage: "Modelo demostrado"
  }
] as const;

const TIMELINE = [
  {
    date: "Ahora",
    title: "Pre-registro confirmado",
    desc: "Tu startup forma parte del universo Natura500.",
    state: "done"
  },
  {
    date: "22 May 2026",
    title: "Apertura de convocatoria",
    desc: "Sube tu video de presentación al Radar.",
    state: "next"
  },
  {
    date: "15 Jul 2026",
    title: "Cierre de envío de videos",
    desc: "Fecha límite para ser considerado en la Fase 2.",
    state: "upcoming"
  },
  {
    date: "Jul – Ago 2026",
    title: "Revisión de registros",
    desc: "El equipo de NTL y el Consejo CEIBA define la lista corta.",
    state: "upcoming"
  },
  {
    date: "15 – 30 Ago 2026",
    title: "Aplicación completa",
    desc: "Las invitadas envían su aplicación detallada.",
    state: "upcoming"
  },
  {
    date: "15 Sep 2026",
    title: "Notificación a ganadoras",
    desc: "Se notifica a las soluciones seleccionadas.",
    state: "upcoming"
  },
  {
    date: "Oct 2026",
    title: "Anuncio público — GET Forum del BID",
    desc: "Las ganadoras se presentan ante la comunidad global.",
    state: "upcoming"
  },
  {
    date: "Feb 2027",
    title: "Masterclasses",
    desc: "Activación de las 3 masterclasses para el Radar.",
    state: "upcoming"
  }
] as const;

const SELECTION_QUESTIONS = [
  "¿El emprendimiento restaura o regenera en lugar de solo reducir el daño?",
  "¿Las comunidades locales son propietarias, socias o beneficiarias principales?",
  "¿Existe una solución real y un equipo con un camino claro hacia adelante?",
  "¿La propuesta aprovecha o contribuye de manera significativa a la biodiversidad de LAC?",
  "¿El impacto real del emprendimiento supera su visibilidad actual?"
];

const BENEFITS = [
  {
    icon: "🌐",
    title: "Perfil público en el Radar",
    desc: "Visibilidad en 500.naturatech.org — la plataforma que portafolios e inversionistas consultan."
  },
  {
    icon: "🎓",
    title: "3 Masterclasses exclusivas",
    desc: "EUDR para exportación, due diligence en biotech, IA aplicada a bioinnovación."
  },
  {
    icon: "🌎",
    title: "Escenarios internacionales",
    desc: "Acceso a foros globales de biodiversidad y finanzas climáticas con NaturaTech LAC."
  },
  {
    icon: "🤝",
    title: "Red de sistemas asociativos",
    desc: "Conexión bioregional con productores, compradores, fondos y aceleradoras."
  },
  {
    icon: "🏆",
    title: "Acceso al Premio",
    desc: "Eres parte del universo del que se selecciona la lista corta del Premio Natura500."
  }
];

const EVALUATION_CRITERIA = [
  { name: "Impacto", weight: 20, desc: "Mejoras en conservación, regeneración y bienestar comunitario." },
  { name: "Integración ética de tecnologías", weight: 15, desc: "Aplicación ética con conocimiento ecológico tradicional (TEK)." },
  { name: "Inclusividad", weight: 15, desc: "Perspectivas indígenas, afrodescendientes, comunitarias y de género." },
  { name: "Escalabilidad", weight: 15, desc: "Capacidad de expandir alcance o ser replicada en LAC." },
  { name: "Identificación del desafío", weight: 10, desc: "Comprensión profunda con contexto territorial específico." },
  { name: "Capacidad del equipo", weight: 10, desc: "Implementación con habilidades, experiencia y recursos." },
  { name: "Viabilidad", weight: 10, desc: "Factibilidad y practicidad con análisis de riesgos." },
  { name: "Sostenibilidad financiera", weight: 5, desc: "Plan post-financiamiento y mecanismos regenerativos." }
];

const ELIGIBLE_COUNTRIES = [
  "Argentina", "Bahamas", "Barbados", "Belice", "Bolivia", "Brasil", "Chile", "Colombia",
  "Costa Rica", "Rep. Dominicana", "Ecuador", "El Salvador", "Guatemala", "Guyana",
  "Haití", "Honduras", "Jamaica", "México", "Nicaragua", "Panamá", "Paraguay", "Perú",
  "Surinam", "Trinidad y Tobago", "Uruguay", "Venezuela"
];

const ELIGIBLE_TYPES = [
  { icon: "🚀", title: "Startups Nature-Tech", desc: "Climate-tech, biotech y bioinnovación listas para escalar." },
  { icon: "🏢", title: "PyMEs con propósito", desc: "Modelos de negocio alineados con regeneración." },
  { icon: "💚", title: "Empresas sociales", desc: "B-Corps y modelos con impacto socioambiental." },
  { icon: "🌾", title: "Cooperativas", desc: "Organizaciones de productores y productoras." },
  { icon: "🌳", title: "Comunitarias", desc: "Indígenas, afrodescendientes y consejos comunitarios." }
];

const smoothEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: smoothEase }
};

export function PremioPage() {
  const user: AuthUser | null = {
    name: "Bryan",
    email: "bryan@cminds.co",
    picture: "/assets/01.webp",
    startup: "RushFrame"
  };

  const today = new Date(2026, 3, 30);
  const opening = new Date(2026, 4, 22);
  const daysToOpen = Math.max(
    0,
    Math.ceil((opening.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <main className="px-shell">
      {/* ── Topbar ── */}
      <header className="topbar px-topbar" aria-label="Navegación principal">
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
          <a className="nav-item is-active" href="/premio">
            <span>Premio</span>
          </a>
          {user ? (
            <a className="nav-item nav-item--startup" href="/studio">
              <span>{user.startup}</span>
            </a>
          ) : null}
        </nav>
        <div className="topbar-end">
          {user ? (
            <div className="user-badge">
              <div className="user-badge__inner">
                <span className="user-badge__avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.picture} alt="" referrerPolicy="no-referrer" />
                </span>
                <span className="user-badge__name">{user.name}</span>
              </div>
            </div>
          ) : (
            <a className="login-button" href="/">Iniciar Sesión</a>
          )}
        </div>
      </header>

      {/* ── Page background flora ── */}
      <div className="px-bg" aria-hidden="true">
        <div className="px-bg__glow" />
        <div className="px-bg__grid" />
      </div>

      <div className="px-body">
        {/* ── Page header ── */}
        <motion.div
          className="px-pagehead"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="px-eyebrow">PREMIO · 2026</span>
          <h1 className="px-h1">
            Premio <span className="px-h1__accent">Natura500</span>
          </h1>
          <p className="px-lede">
            Reconocimiento monetario por niveles para iniciativas regenerativas con mayor potencial de impacto en América Latina y el Caribe.
          </p>
        </motion.div>

        {/* ── Participación / status hero ── */}
        {user ? (
          <motion.section
            className="px-status"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            aria-labelledby="px-status-title"
          >
            <div className="px-status__decor" aria-hidden="true">
              <span className="px-status__orb" />
              <span className="px-status__ring" />
            </div>

            <div className="px-status__head">
              <span className="px-status__pill">
                <span className="px-status__dot" /> Pre-registrado
              </span>
              <span className="px-status__count">
                <strong>{daysToOpen}</strong> días para que abra la convocatoria
              </span>
            </div>

            <div className="px-status__main">
              <span className="px-status__avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.picture} alt="" referrerPolicy="no-referrer" />
                <span className="px-status__check" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="14" height="14">
                    <path
                      d="M3 8.5l3 3 7-7"
                      fill="none"
                      stroke="#07100a"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>

              <div className="px-status__text">
                <p className="px-status__kicker">
                  HOLA, <strong>{user.startup.toUpperCase()}</strong>
                </p>
                <h2 id="px-status-title" className="px-status__title">
                  Ya estás <span className="px-status__title-accent">participando</span>
                </h2>
                <p className="px-status__copy">
                  Tu startup forma parte del universo del que se selecciona la lista corta del Premio Natura500 2026. Cuando abra la convocatoria, te avisaremos para subir tu video de presentación.
                </p>
              </div>
            </div>

            <div className="px-status__steps">
              <div className="px-status__step is-done">
                <span className="px-status__step-num">1</span>
                <div>
                  <strong>Cuenta registrada</strong>
                  <p>Listo. Tu perfil ya existe en el ecosistema.</p>
                </div>
              </div>
              <div className="px-status__step is-current">
                <span className="px-status__step-num">2</span>
                <div>
                  <strong>Mejora tu perfil</strong>
                  <p>Sube fotos, métricas y completa secciones clave.</p>
                </div>
              </div>
              <div className="px-status__step">
                <span className="px-status__step-num">3</span>
                <div>
                  <strong>Sube tu video</strong>
                  <p>Del 22 de mayo al 15 de julio para ser considerado.</p>
                </div>
              </div>
            </div>

            <div className="px-status__ctas">
              <a className="px-cta px-cta--primary" href="/conexiones">
                Mejorar mi perfil con IA
                <span aria-hidden="true">→</span>
              </a>
              <a className="px-cta px-cta--ghost" href="#cronograma">
                Ver cronograma completo
              </a>
            </div>
          </motion.section>
        ) : (
          <motion.section className="px-status px-status--guest" {...fadeUp}>
            <h2 className="px-status__title">Registra tu startup para participar</h2>
            <p className="px-status__copy">
              Inicia sesión y entra automáticamente al universo Natura500.
            </p>
            <a className="px-cta px-cta--primary" href="/">
              Iniciar Sesión
              <span aria-hidden="true">→</span>
            </a>
          </motion.section>
        )}

        {/* ── Niveles del premio ── */}
        <motion.section className="px-section" {...fadeUp}>
          <header className="px-section__head">
            <span className="px-section__eyebrow">RECONOCIMIENTO</span>
            <h2 className="px-section__title">Tres niveles, un mismo ecosistema</h2>
            <p className="px-section__lede">
              Diseñados para que una cooperativa comunitaria temprana compita en igualdad de condiciones con una empresa con tracción.
            </p>
          </header>

          <div className="px-prizes">
            {PRIZE_LEVELS.map((level, i) => (
              <motion.article
                key={level.id}
                className="px-prize"
                style={{ "--prize-tone": level.tone } as React.CSSProperties}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.55,
                  delay: 0.08 * i,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <div className="px-prize__head">
                  <span className="px-prize__label">{level.label}</span>
                  <span className="px-prize__stage">{level.stage}</span>
                </div>
                <strong className="px-prize__amount">USD {level.amount}</strong>
                <p className="px-prize__name">{level.name}</p>
                <p className="px-prize__desc">{level.desc}</p>
                <div className="px-prize__glow" aria-hidden="true" />
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ── Cronograma ── */}
        <motion.section className="px-section" id="cronograma" {...fadeUp}>
          <header className="px-section__head">
            <span className="px-section__eyebrow">PROCESO</span>
            <h2 className="px-section__title">Cronograma 2026 – 2027</h2>
            <p className="px-section__lede">
              Las ganadoras se anuncian en el GET Forum del BID — uno de los principales escenarios globales de finanzas para el desarrollo.
            </p>
          </header>

          <ol className="px-timeline">
            {TIMELINE.map((step, i) => (
              <motion.li
                key={step.title}
                className={`px-timeline__item is-${step.state}`}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: 0.05 * i,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <span className="px-timeline__dot" aria-hidden="true" />
                <div className="px-timeline__content">
                  <span className="px-timeline__date">{step.date}</span>
                  <strong className="px-timeline__title">{step.title}</strong>
                  <p className="px-timeline__desc">{step.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </motion.section>

        {/* ── Criterios de selección (5 preguntas) ── */}
        <motion.section className="px-section" {...fadeUp}>
          <header className="px-section__head">
            <span className="px-section__eyebrow">FILTRO</span>
            <h2 className="px-section__title">5 preguntas que definen la selección</h2>
            <p className="px-section__lede">
              La selección busca diversidad territorial, de etapa y de tipo de organización en la región.
            </p>
          </header>

          <div className="px-questions">
            {SELECTION_QUESTIONS.map((q, i) => (
              <motion.div
                key={i}
                className="px-question"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: 0.06 * i,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <span className="px-question__num">0{i + 1}</span>
                <p className="px-question__text">{q}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Beneficios ── */}
        <motion.section className="px-section" {...fadeUp}>
          <header className="px-section__head">
            <span className="px-section__eyebrow">QUE INCLUYE</span>
            <h2 className="px-section__title">Beneficios al estar registrado</h2>
            <p className="px-section__lede">
              Independientemente de si avanzas al Premio, recibes acceso al ecosistema completo de NaturaTech LAC.
            </p>
          </header>

          <div className="px-benefits">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                className="px-benefit"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="px-benefit__icon">{b.icon}</span>
                <strong className="px-benefit__title">{b.title}</strong>
                <p className="px-benefit__desc">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Criterios de evaluación ponderados ── */}
        <motion.section className="px-section" {...fadeUp}>
          <header className="px-section__head">
            <span className="px-section__eyebrow">EVALUACIÓN</span>
            <h2 className="px-section__title">Cómo se evalúan las propuestas</h2>
            <p className="px-section__lede">
              Ocho criterios ponderados que privilegian impacto, ética e inclusividad.
            </p>
          </header>

          <div className="px-criteria">
            {EVALUATION_CRITERIA.map((c, i) => (
              <motion.div
                key={c.name}
                className="px-criterion"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="px-criterion__top">
                  <strong className="px-criterion__name">{c.name}</strong>
                  <span className="px-criterion__weight">{c.weight}%</span>
                </div>
                <div className="px-criterion__bar" aria-hidden="true">
                  <motion.span
                    className="px-criterion__fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.weight * 5}%` }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, delay: 0.1 + 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="px-criterion__desc">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Elegibilidad ── */}
        <motion.section className="px-section" {...fadeUp}>
          <header className="px-section__head">
            <span className="px-section__eyebrow">ELEGIBILIDAD</span>
            <h2 className="px-section__title">¿Tu organización aplica?</h2>
            <p className="px-section__lede">
              Registradas y operando en uno de los 26 países prestatarios del BID, con composición mayoritariamente LAC.
            </p>
          </header>

          <div className="px-elig">
            <div className="px-elig__col">
              <h3 className="px-elig__h3">Tipos de organización</h3>
              <div className="px-types">
                {ELIGIBLE_TYPES.map(t => (
                  <div key={t.title} className="px-type">
                    <span className="px-type__icon">{t.icon}</span>
                    <div>
                      <strong>{t.title}</strong>
                      <p>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-elig__col">
              <h3 className="px-elig__h3">26 países LAC elegibles</h3>
              <div className="px-countries">
                {ELIGIBLE_COUNTRIES.map(c => (
                  <span key={c} className="px-country">{c}</span>
                ))}
              </div>
              <div className="px-elig__notes">
                <p>
                  <strong>50%+</strong> de fundadores nacionales LAC.
                </p>
                <p>
                  <strong>70%+</strong> del equipo directivo y operativo LAC.
                </p>
                <p>Equidad de género activamente promovida.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Footer / partners ── */}
        <motion.section className="px-foot" {...fadeUp}>
          <p className="px-foot__line">
            <strong>Natura500</strong> es una línea de acción de NaturaTech LAC, la iniciativa que escala la infraestructura para el ecosistema regenerativo de LAC.
          </p>
          <div className="px-foot__partners">
            <span>BID Lab</span>
            <span>·</span>
            <span>C Minds</span>
            <span>·</span>
            <span>Asdi (Suecia)</span>
            <span>·</span>
            <span>Climate Collective</span>
            <span>·</span>
            <span>Amazonía Siempre</span>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
