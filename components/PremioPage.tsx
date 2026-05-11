"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef } from "react";
import { AuthControls, StartupNavItem } from "./AuthControls";
import { useAuth } from "./AuthProvider";

const PRIZE_LEVELS = [
  {
    id: "pionera",
    label: "NIVEL 1",
    name: "Pionera Natura500",
    amount: "$5,000",
    desc: "Para quienes apenas empiezan: prototipo funcional, piloto activo o solución en desarrollo.",
    tone: "#74ffda",
    stage: "Idea probada"
  },
  {
    id: "creciente",
    label: "NIVEL 2",
    name: "Creciente Natura500",
    amount: "$25,000",
    desc: "Primeras ventas o tracción real. El modelo ya funciona y está vivo en el mercado.",
    tone: "#ebff57",
    stage: "Tracción en marcha"
  },
  {
    id: "lider",
    label: "NIVEL 3",
    name: "Líder Natura500",
    amount: "$100,000",
    desc: "Modelo demostrado, raíces comunitarias sólidas y capacidad de mover la aguja a escala regional.",
    tone: "#ffb14b",
    stage: "Listas para escalar"
  }
] as const;

const TIMELINE = [
  {
    date: "Hoy",
    title: "Tu pre-registro está activo",
    desc: "Lo que armes ahora se vuelve la primera lectura que hace el jurado.",
    state: "done"
  },
  {
    date: "22 may 2026",
    title: "Abre la convocatoria",
    desc: "El video corto entra al Radar y dispara la siguiente fase.",
    state: "next"
  },
  {
    date: "15 jul 2026",
    title: "Cierre de videos",
    desc: "Después de esta fecha el jurado solo evalúa lo que ya entregaste.",
    state: "upcoming"
  },
  {
    date: "jul - ago 2026",
    title: "Revisión del Consejo CEIBA",
    desc: "NTL y CEIBA arman la lista corta con base en evidencia y ajuste regenerativo.",
    state: "upcoming"
  },
  {
    date: "15 - 30 ago 2026",
    title: "Aplicación final",
    desc: "La lista corta entrega métricas, equipo y plan de uso de capital.",
    state: "upcoming"
  },
  {
    date: "15 sep 2026",
    title: "Resultados",
    desc: "Las seleccionadas reciben la notificación oficial.",
    state: "upcoming"
  },
  {
    date: "oct 2026",
    title: "Anuncio en GET Forum del BID",
    desc: "El reconocimiento se entrega frente a la comunidad global.",
    state: "upcoming"
  },
  {
    date: "feb 2027",
    title: "Masterclasses Natura500",
    desc: "Tres sesiones para escalar capacidades técnicas y de mercado.",
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
    label: "Radar",
    title: "Perfil público en el Radar",
    desc: "Visibilidad en 500.naturatech.org, la plataforma que portafolios e inversionistas consultan."
  },
  {
    label: "Clases",
    title: "3 Masterclasses exclusivas",
    desc: "EUDR para exportación, due diligence en biotech, IA aplicada a bioinnovación."
  },
  {
    label: "Foros",
    title: "Escenarios internacionales",
    desc: "Acceso a foros globales de biodiversidad y finanzas climáticas con NaturaTech LAC."
  },
  {
    label: "Red",
    title: "Red de sistemas asociativos",
    desc: "Conexión bioregional con productores, compradores, fondos y aceleradoras."
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
  { label: "001", title: "Startups Nature-Tech", desc: "Climate-tech, biotech y bioinnovación listas para escalar." },
  { label: "002", title: "PyMEs con propósito", desc: "Modelos de negocio alineados con regeneración." },
  { label: "003", title: "Empresas sociales", desc: "B-Corps y modelos con impacto socioambiental." },
  { label: "004", title: "Cooperativas", desc: "Organizaciones de productores y productoras." },
  { label: "005", title: "Comunitarias", desc: "Indígenas, afrodescendientes y consejos comunitarios." }
];

const ROUTE_CARDS = [
  {
    num: "01",
    title: "Perfil en Radar",
    date: "Ahora",
    desc: "Completa narrativa, territorio, tracks, imágenes y evidencia básica.",
    accent: "#74ffda",
    image: "/assets/01.webp"
  },
  {
    num: "02",
    title: "Video corto",
    date: "22 mayo - 15 julio",
    desc: "Al abrir convocatoria, sube una presentación clara de problema, solución e impacto.",
    accent: "#ebff57",
    image: "/assets/05.webp"
  },
  {
    num: "03",
    title: "Revisión CEIBA",
    date: "jul - ago 2026",
    desc: "NTL y el Consejo CEIBA revisan elegibilidad, evidencia y ajuste regenerativo.",
    accent: "#ffb14b",
    image: "/assets/04.webp"
  },
  {
    num: "04",
    title: "Aplicación final",
    date: "15 - 30 ago",
    desc: "La lista corta envía detalles operativos, métricas, equipo y uso de recursos.",
    accent: "#74ffda",
    image: "/assets/02.webp"
  },
  {
    num: "05",
    title: "Ganadoras",
    date: "sep 2026 - feb 2027",
    desc: "Notificación, anuncio público en GET Forum y activación de masterclasses.",
    accent: "#ebff57",
    image: "/assets/06.webp"
  }
];

const HERO_FACTS = [
  { label: "Abre la convocatoria", value: "22 may · 2026" },
  { label: "Reconocimiento", value: "$5K → $100K" },
  { label: "Territorio elegible", value: "26 países LAC" }
];

const COLLAGE_IMAGES = ["/assets/01.webp", "/assets/03.webp", "/assets/04.webp"];
const HERO_MEDIA = [
  { src: "/assets/03.webp", label: "Biodiversidad" },
  { src: "/assets/05.webp", label: "Evidencia" },
  { src: "/assets/02.webp", label: "Territorio" }
] as const;
const MARQUEE_ITEMS = ["Premio Natura500", "Biodiversidad", "Capital", "Radar", "LAC"];
const PRIMARY_CRITERIA = EVALUATION_CRITERIA.slice(0, 4);
const SECONDARY_CRITERIA = EVALUATION_CRITERIA.slice(4);

type CssVars = CSSProperties & Record<`--${string}`, string | number>;

export function PremioPage() {
  const rootRef = useRef<HTMLElement>(null);
  const { user } = useAuth();
  const activeStartup = user?.activeStartup;
  const startupInitial = activeStartup?.name.charAt(0).toUpperCase() || "S";
  const opening = new Date(2026, 4, 22);
  const daysToOpen = Math.max(
    0,
    Math.ceil((opening.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup = () => undefined;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, scrollTriggerModule]) => {
      if (cancelled || !rootRef.current) return;
      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });

      let detachRailWheel: (() => void) | undefined;
      const ctx = gsap.context(() => {
        gsap.set(
          [
            ".award-bg__glow",
            ".award-orbit",
            ".award-orbit__ring",
            ".award-orbit__logo",
            ".award-hero-panel",
            ".award-hero-panel__prize",
            ".award-hero-panel__status",
            ".award-photo-card",
            ".award-route-card",
            ".award-level",
            ".award-collage__item",
            ".award-facts article",
            "[data-award-title-word]"
          ],
          {
            force3D: true,
            transformOrigin: "50% 50%",
            willChange: "transform, opacity"
          }
        );

        gsap.from("[data-award-hero]", {
          autoAlpha: 0,
          y: 22,
          scale: 0.985,
          duration: 0.82,
          stagger: 0.075,
          ease: "power3.out",
          clearProps: "willChange"
        });

        gsap.from("[data-award-title-word]", {
          autoAlpha: 0,
          yPercent: 115,
          rotate: 3,
          duration: 0.95,
          stagger: 0.085,
          ease: "power4.out",
          clearProps: "transform,opacity,visibility"
        });

        gsap.from(".award-photo-card", {
          clipPath: "inset(100% 0% 0% 0%)",
          y: 56,
          scale: 0.96,
          duration: 1.05,
          stagger: 0.12,
          ease: "power4.out",
          clearProps: "clipPath,transform"
        });

        gsap.to(".award-photo-card img", {
          yPercent: -8,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: ".award-hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.7
          }
        });

        gsap.to(".award-marquee__track", {
          xPercent: -50,
          duration: 26,
          repeat: -1,
          ease: "none"
        });

        gsap.utils.toArray<HTMLElement>("[data-award-reveal]").forEach(element => {
          gsap.from(element, {
            autoAlpha: 0,
            y: 28,
            scale: 0.992,
            duration: 0.82,
            ease: "power3.out",
            clearProps: "willChange",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
              toggleActions: "play none none reverse"
            }
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-award-stagger]").forEach(group => {
          const items = gsap.utils.toArray<HTMLElement>("[data-award-item]", group);
          if (!items.length) return;
          gsap.from(items, {
            autoAlpha: 0,
            y: 20,
            duration: 0.62,
            stagger: 0.055,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
            scrollTrigger: {
              trigger: group,
              start: "top 82%"
            }
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-award-bar]").forEach(bar => {
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: bar,
                start: "top 88%"
              }
            }
          );
        });

        const levelsSection = root.querySelector<HTMLElement>("[data-award-levels]");
        if (levelsSection) {
          const levelTitle = levelsSection.querySelector<HTMLElement>("[data-award-level-title]");
          const levelCards = gsap.utils.toArray<HTMLElement>("[data-award-level-card]", levelsSection);

          if (levelTitle) {
            gsap.fromTo(
              levelTitle,
              { autoAlpha: 0, y: 42, scale: 0.96 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                ease: "power4.out",
                scrollTrigger: {
                  trigger: levelsSection,
                  start: "top 78%"
                }
              }
            );

            gsap.to(levelTitle, {
              yPercent: -10,
              ease: "none",
              scrollTrigger: {
                trigger: levelsSection,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.75
              }
            });
          }

          if (levelCards.length) {
            gsap.fromTo(
              levelCards,
              { autoAlpha: 0, y: 54, scale: 0.965 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.86,
                stagger: 0.1,
                ease: "power4.out",
                scrollTrigger: {
                  trigger: levelsSection,
                  start: "top 72%"
                }
              }
            );

            gsap.to(levelCards, {
              y: (index: number) => (index - 1) * -18,
              ease: "none",
              scrollTrigger: {
                trigger: levelsSection,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.9
              }
            });
          }
        }

        const rail = root.querySelector<HTMLElement>("[data-award-rail]");

        const routeSection = root.querySelector<HTMLElement>("[data-award-route]");
        const routeCards = gsap.utils.toArray<HTMLElement>(".award-route-card");
        const routeDots = gsap.utils.toArray<HTMLElement>("[data-award-route-dot]");
        const setActiveRouteCard = (index: number) => {
          routeCards.forEach((card, cardIndex) => card.classList.toggle("is-active", cardIndex === index));
          routeDots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
          routeSection?.style.setProperty("--award-route-progress", `${routeCards.length > 1 ? index / (routeCards.length - 1) : 0}`);
        };
        setActiveRouteCard(0);

        if (rail && routeCards.length) {
          const isPinnedRoute = window.matchMedia("(min-width: 961px)").matches;
          const updateActiveFromNativeScroll = () => {
            const maxScroll = Math.max(1, rail.scrollWidth - rail.clientWidth);
            const progress = rail.scrollLeft / maxScroll;
            const activeIndex = Math.min(
              routeCards.length - 1,
              Math.max(0, Math.round(progress * (routeCards.length - 1)))
            );
            setActiveRouteCard(activeIndex);
            routeSection?.style.setProperty("--award-route-progress", `${progress}`);
          };
          const getRouteScrollDistance = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
          if (routeSection && isPinnedRoute) {
            ScrollTrigger.create({
              trigger: routeSection,
              start: "top 84px",
              end: () => `+=${Math.max(1, getRouteScrollDistance())}`,
              pin: true,
              scrub: 1.05,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onEnter: () => {
                rail.scrollLeft = 0;
                updateActiveFromNativeScroll();
              },
              onUpdate: self => {
                rail.scrollLeft = getRouteScrollDistance() * self.progress;
                updateActiveFromNativeScroll();
              },
              onRefresh: updateActiveFromNativeScroll
            });
          }
          const handleRailWheel = (event: WheelEvent) => {
            if (isPinnedRoute) return;
            if (event.ctrlKey || event.metaKey || rail.scrollWidth <= rail.clientWidth) return;

            const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            const maxScroll = rail.scrollWidth - rail.clientWidth;
            const nextScrollLeft = Math.max(0, Math.min(maxScroll, rail.scrollLeft + dominantDelta));
            const canMove = Math.abs(nextScrollLeft - rail.scrollLeft) > 0.5;

            if (!canMove) return;
            event.preventDefault();
            rail.scrollLeft = nextScrollLeft;
          };
          let isDraggingRail = false;
          let dragStartX = 0;
          let dragStartScrollLeft = 0;
          const stopRailDrag = (event?: PointerEvent) => {
            if (!isDraggingRail) return;
            isDraggingRail = false;
            rail.classList.remove("is-dragging");
            if (event && rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
          };
          const handleRailPointerDown = (event: PointerEvent) => {
            if (event.button !== 0 || rail.scrollWidth <= rail.clientWidth) return;
            isDraggingRail = true;
            dragStartX = event.clientX;
            dragStartScrollLeft = rail.scrollLeft;
            rail.classList.add("is-dragging");
            rail.setPointerCapture(event.pointerId);
          };
          const handleRailPointerMove = (event: PointerEvent) => {
            if (!isDraggingRail) return;
            event.preventDefault();
            rail.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
          };
          const handleRailKeyDown = (event: KeyboardEvent) => {
            const firstCard = routeCards[0];
            const step = firstCard ? firstCard.offsetWidth + 18 : rail.clientWidth * 0.72;
            if (event.key === "ArrowRight") {
              event.preventDefault();
              rail.scrollBy({ left: step, behavior: "smooth" });
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              rail.scrollBy({ left: -step, behavior: "smooth" });
            } else if (event.key === "Home") {
              event.preventDefault();
              rail.scrollTo({ left: 0, behavior: "smooth" });
            } else if (event.key === "End") {
              event.preventDefault();
              rail.scrollTo({ left: rail.scrollWidth, behavior: "smooth" });
            }
          };
          rail.addEventListener("scroll", updateActiveFromNativeScroll, { passive: true });
          rail.addEventListener("wheel", handleRailWheel, { passive: false });
          rail.addEventListener("pointerdown", handleRailPointerDown);
          rail.addEventListener("pointermove", handleRailPointerMove);
          rail.addEventListener("pointerup", stopRailDrag);
          rail.addEventListener("pointercancel", stopRailDrag);
          rail.addEventListener("lostpointercapture", stopRailDrag);
          rail.addEventListener("keydown", handleRailKeyDown);
          const previousDetach = detachRailWheel;
          detachRailWheel = () => {
            previousDetach?.();
            rail.removeEventListener("scroll", updateActiveFromNativeScroll);
            rail.removeEventListener("wheel", handleRailWheel);
            rail.removeEventListener("pointerdown", handleRailPointerDown);
            rail.removeEventListener("pointermove", handleRailPointerMove);
            rail.removeEventListener("pointerup", stopRailDrag);
            rail.removeEventListener("pointercancel", stopRailDrag);
            rail.removeEventListener("lostpointercapture", stopRailDrag);
            rail.removeEventListener("keydown", handleRailKeyDown);
          };
        }

        gsap.to(".award-bg__glow--lime", {
          x: "4vw",
          y: "3vh",
          scale: 1.08,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        gsap.to(".award-bg__glow--cyan", {
          x: "-3vw",
          y: "-2vh",
          scale: 0.92,
          duration: 11,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        gsap.to(".award-orbit__ring--outer", { rotate: 360, duration: 64, repeat: -1, ease: "none" });
        gsap.to(".award-orbit__ring--inner", { rotate: -360, duration: 50, repeat: -1, ease: "none" });
        gsap.to(".award-orbit__logo", {
          y: -7,
          scale: 1.025,
          duration: 2.7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        gsap.to(".award-hero-panel__prize", {
          y: -4,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        gsap.to(".award-status__avatar", {
          y: -5,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        gsap.to(".award-facts article", {
          y: -4,
          duration: 3.1,
          repeat: -1,
          yoyo: true,
          stagger: 0.22,
          ease: "sine.inOut"
        });
        gsap.to(".award-collage__item", {
          y: (index: number) => (index % 2 === 0 ? -9 : 7),
          rotate: (index: number) => (index % 2 === 0 ? "-=0.8" : "+=0.8"),
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          stagger: 0.18,
          ease: "sine.inOut"
        });
        gsap.to(".award-status__pill span, .award-timeline__list li.is-next .award-timeline__dot", {
          scale: 1.55,
          opacity: 0.55,
          duration: 1.25,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });

        const orbit = root.querySelector<HTMLElement>(".award-orbit");
        if (orbit) {
          const moveX = gsap.quickTo(orbit, "x", { duration: 0.45, ease: "power3.out" });
          const moveY = gsap.quickTo(orbit, "y", { duration: 0.45, ease: "power3.out" });
          const handlePointerMove = (event: PointerEvent) => {
            moveX((event.clientX / window.innerWidth - 0.5) * 18);
            moveY((event.clientY / window.innerHeight - 0.5) * 14);
          };
          window.addEventListener("pointermove", handlePointerMove, { passive: true });
          const previousDetach = detachRailWheel;
          detachRailWheel = () => {
            previousDetach?.();
            window.removeEventListener("pointermove", handlePointerMove);
          };
        }

        gsap.utils.toArray<HTMLElement>("[data-award-parallax]").forEach(element => {
          const speed = Number(element.dataset.speed ?? 0.08);
          gsap.to(element, {
            y: () => window.innerHeight * speed,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.8
            }
          });
        });

        const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 180);
        cleanup = () => {
          window.clearTimeout(refresh);
          detachRailWheel?.();
          ctx.revert();
        };
      }, root);
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <main ref={rootRef} className="award-shell award-shell--editorial">
      <header className="topbar px-topbar" aria-label="Navegación principal">
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
          <Link className="nav-item is-active" href="/premio">
            <span>Premio</span>
          </Link>
          <StartupNavItem />
        </nav>
        <div className="topbar-end">
          <AuthControls />
        </div>
      </header>

      <div className="award-bg" aria-hidden="true">
        <span className="award-bg__glow award-bg__glow--lime" />
        <span className="award-bg__glow award-bg__glow--cyan" />
        <span className="award-bg__grid" />
      </div>

      <section id="natura500" className="award-hero" aria-labelledby="award-title">
        <div className="award-hero__copy" data-award-hero>
          <span className="award-kicker">Premio Natura500 · 2026</span>
          <h1 id="award-title" className="award-editorial-title">
            <span><span data-award-title-word>Capital</span></span>
            <span><span data-award-title-word>para soluciones</span></span>
            <span><span data-award-title-word>regenerativas.</span></span>
          </h1>
          <p>
            Tres niveles de reconocimiento para quienes ya están construyendo impacto real en biodiversidad, clima y comunidades de LAC. Nada de promesas — evidencia.
          </p>
          <div className="award-actions">
            <Link className="award-button award-button--primary" href={activeStartup ? "/studio" : "/onboarding?mode=create&redirect=%2Fstudio"}>
              {activeStartup ? "Preparar perfil" : "Registrar startup"}
            </Link>
            <a className="award-button award-button--secondary" href="#ruta">
              Ver proceso
            </a>
          </div>
        </div>

        <div className="award-hero__visual" data-award-hero data-award-parallax data-speed="0.035">
          <div className="award-editorial-photos" aria-hidden="true">
            {HERO_MEDIA.map((image, index) => (
              <figure key={image.src} className={`award-photo-card award-photo-card--${index + 1}`}>
                <Image src={image.src} alt="" fill sizes="(max-width: 900px) 70vw, 28vw" priority={index === 0} />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="award-orbit award-orbit--editorial" aria-hidden="true">
            <span className="award-orbit__ring award-orbit__ring--outer" />
            <span className="award-orbit__ring award-orbit__ring--inner" />
            <div className="award-orbit__logo">
              <Image src="/500svg.svg" alt="" width={188} height={86} priority />
            </div>
          </div>
        </div>

        <aside className="award-hero-panel" data-award-hero aria-label="Estado de preparación para el premio">
          <div className="award-hero-panel__prize">
            <span>Hasta</span>
            <strong>USD $100,000</strong>
            <p>Reservado para Líder Natura500. Tres niveles antes de eso.</p>
          </div>

          <div className="award-hero-panel__status">
            <span className="award-status__pill">
              <span /> {activeStartup ? "Listo en el Radar" : "Empieza por el perfil"}
            </span>
            <div className="award-status__startup">
              <span className="award-status__avatar">{startupInitial}</span>
              <div>
                <small>{activeStartup ? "Tu startup" : "Tu siguiente paso"}</small>
                <strong>{activeStartup?.name ?? "Crea tu perfil público"}</strong>
              </div>
            </div>
            <p>
              {activeStartup
                ? `${daysToOpen} días para afilar narrativa y evidencia antes de que abra la convocatoria.`
                : "Tu perfil en el Radar es la primera lectura que hace el jurado. Empieza por ahí."}
            </p>
          </div>

          <div className="award-status__steps">
            <span className="is-ready">Perfil</span>
            <span>Video</span>
            <span>Aplicación</span>
          </div>
        </aside>

        <div className="award-facts" data-award-hero data-award-stagger>
          {HERO_FACTS.map(fact => (
            <article key={fact.label} data-award-item>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="award-marquee" aria-hidden="true">
        <div className="award-marquee__track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </section>

      <section id="ruta" className="award-section award-section--route" data-award-route data-award-reveal>
        <div className="award-section__head">
          <span className="award-kicker">La ruta</span>
          <h2>Del perfil al premio.</h2>
          <p>Cinco hitos. Cada uno con una entrega concreta y una fecha que no se mueve.</p>
          <div className="award-route-progress" aria-hidden="true">
            <span />
            <div>
              {ROUTE_CARDS.map(card => (
                <i key={card.num} data-award-route-dot />
              ))}
            </div>
          </div>
        </div>
        <div className="award-rail" data-award-rail data-award-stagger aria-label="Etapas del Premio Natura500" tabIndex={0}>
          {ROUTE_CARDS.map(card => (
            <article key={card.num} className="award-route-card" style={{ "--route-accent": card.accent } as CssVars} data-award-item>
              <div className="award-route-card__image">
                <Image src={card.image} alt="" fill sizes="(max-width: 900px) 86vw, 34vw" />
              </div>
              <div className="award-route-card__meta">
                <span className="award-route-card__num">{card.num}</span>
                <small>{card.date}</small>
              </div>
              <strong>{card.title}</strong>
              <p>{card.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="award-levels" data-award-levels>
        <div className="award-levels__intro">
          <span className="award-kicker">El premio</span>
          <h2 data-award-level-title>Participas desde tu etapa, no desde tu tamaño.</h2>
        </div>
        <div className="award-levels__grid">
          {PRIZE_LEVELS.map((level, index) => (
            <article key={level.id} className="award-level" style={{ "--level-tone": level.tone } as CssVars} data-award-level-card>
              <span>00{index + 1} · {level.label}</span>
              <strong>{level.amount}</strong>
              <h3>{level.name}</h3>
              <p>{level.desc}</p>
              <small>{level.stage}</small>
            </article>
          ))}
        </div>
      </section>

      <section id="cronograma" className="award-timeline" data-award-reveal>
        <div className="award-timeline__intro">
          <span className="award-kicker">Calendario</span>
          <h2>Fechas firmes, siguiente paso claro.</h2>
          <p>Ocho momentos del proceso. Cada uno con una entrega que ya puedes empezar a preparar.</p>
          <div className="award-calendar-visual" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img">
              <rect x="9" y="12" width="46" height="42" rx="8" />
              <path d="M9 24h46" />
              <path d="M22 8v10M42 8v10" />
              <circle cx="22" cy="34" r="3" />
              <circle cx="32" cy="34" r="3" />
              <circle cx="42" cy="34" r="3" />
              <circle cx="22" cy="44" r="3" />
              <circle cx="32" cy="44" r="3" />
            </svg>
            <div>
              <span>22</span>
              <strong>MAY 2026</strong>
              <small>Apertura de convocatoria</small>
            </div>
          </div>
        </div>
        <ol className="award-timeline__list" data-award-stagger>
          {TIMELINE.map((step, index) => (
            <li key={step.title} className={`is-${step.state}`} data-award-item>
              <span className="award-timeline__dot" />
              <small>{String(index + 1).padStart(2, "0")} · {step.date}</small>
              <strong>{step.title}</strong>
              <p>{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="award-selection" data-award-reveal>
        <div className="award-selection__copy">
          <span className="award-kicker">Lente del jurado</span>
          <h2>Qué busca una candidatura fuerte.</h2>
          <p>Cinco preguntas que orientan al jurado y a las candidatas. Si las respondes con evidencia, ya estás cerca.</p>
          <div className="award-questions" data-award-stagger>
            {SELECTION_QUESTIONS.map((question, index) => (
              <article key={question} data-award-item>
                <span>0{index + 1}</span>
                <p>{question}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="award-collage" aria-hidden="true" data-award-parallax data-speed="-0.035">
          {COLLAGE_IMAGES.map((src, index) => (
            <span key={src} className={`award-collage__item award-collage__item--${index + 1}`}>
              <Image src={src} alt="" fill sizes="(max-width: 900px) 48vw, 260px" />
            </span>
          ))}
        </div>
      </section>

      <section className="award-evaluation" data-award-reveal>
        <div className="award-evaluation__main">
          <span className="award-kicker">Cómo se mide</span>
          <h2>Criterios clave.</h2>
          <div className="award-criteria" data-award-stagger>
            {PRIMARY_CRITERIA.map(criterion => (
              <article key={criterion.name} style={{ "--criterion-width": `${criterion.weight * 5}%` } as CssVars} data-award-item>
                <div>
                  <strong>{criterion.name}</strong>
                  <span>{criterion.weight}%</span>
                </div>
                <em aria-hidden="true"><b data-award-bar /></em>
                <p>{criterion.desc}</p>
              </article>
            ))}
          </div>
          <details className="award-more-criteria">
            <summary>Ver criterios complementarios</summary>
            <div>
              {SECONDARY_CRITERIA.map(criterion => (
                <article key={criterion.name}>
                  <strong>{criterion.name}</strong>
                  <span>{criterion.weight}%</span>
                </article>
              ))}
            </div>
          </details>
        </div>
        <aside className="award-benefits" data-award-stagger>
          <span className="award-kicker">Lo que te llevas</span>
          <h2>Más que capital.</h2>
          {BENEFITS.map(benefit => (
            <article key={benefit.title} data-award-item>
              <span>{benefit.label}</span>
              <div>
                <strong>{benefit.title}</strong>
                <p>{benefit.desc}</p>
              </div>
            </article>
          ))}
        </aside>
      </section>

      <section className="award-eligibility" data-award-reveal>
        <div>
          <span className="award-kicker">Quién entra</span>
          <h2>Diseñado para LAC.</h2>
          <p>Organizaciones registradas y operando en alguno de los 26 países prestatarios del BID, con base humana y operativa principalmente en la región.</p>
          <div className="award-notes">
            <span><strong>50%+</strong> fundación LAC</span>
            <span><strong>70%+</strong> equipo directivo en LAC</span>
            <span>Equidad de género como criterio activo</span>
          </div>
        </div>
        <div className="award-types" data-award-stagger>
          {ELIGIBLE_TYPES.map(type => (
            <article key={type.title} data-award-item>
              <span>{type.label}</span>
              <div>
                <strong>{type.title}</strong>
                <p>{type.desc}</p>
              </div>
            </article>
          ))}
        </div>
        <details className="award-countries-panel">
          <summary>26 países elegibles</summary>
          <div className="award-countries" aria-label="Países elegibles">
            {ELIGIBLE_COUNTRIES.map(country => (
              <span key={country}>{country}</span>
            ))}
          </div>
        </details>
      </section>

      <footer className="award-footer" data-award-reveal>
        <p><strong>Natura500</strong> es una línea de acción de NaturaTech LAC para escalar la infraestructura del ecosistema regenerativo de LAC.</p>
        <div>
          <span>BID Lab</span>
          <span>C Minds</span>
          <span>Asdi</span>
          <span>Climate Collective</span>
          <span>Amazonía Siempre</span>
        </div>
      </footer>
    </main>
  );
}
