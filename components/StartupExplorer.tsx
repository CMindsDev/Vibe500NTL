"use client";

import Image from "next/image";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useRouter } from "next/navigation";
import type { Startup } from "@/lib/startups";
import type { AuthUser } from "@/lib/types";
import { LoginModal } from "./LoginModal";

type StartupExplorerProps = {
  startups: Startup[];
};

export function StartupExplorer({ startups }: StartupExplorerProps) {
  const router = useRouter();
  const [introDone, setIntroDone] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isResettingRef = useRef(false);
  const loopedStartups = useMemo(() => [...startups, ...startups, ...startups], [startups]);
  const previewStartups = useMemo(() => startups.slice(0, 3), [startups]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 1900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const alignToMiddleLoop = () => {
      const firstMiddleSlide = scroller.querySelector<HTMLElement>(
        '[data-loop-index="1"][data-real-index="0"]'
      );

      const previousScrollBehavior = scroller.style.scrollBehavior;
      isResettingRef.current = true;
      scroller.style.scrollBehavior = "auto";
      scroller.scrollTop = firstMiddleSlide?.offsetTop ?? scroller.scrollHeight / 3;
      setActiveIndex(0);
      window.requestAnimationFrame(() => {
        scroller.style.scrollBehavior = previousScrollBehavior;
        isResettingRef.current = false;
      });
    };

    const frame = window.requestAnimationFrame(alignToMiddleLoop);
    const settleTimer = window.setTimeout(alignToMiddleLoop, 420);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, [startups.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const slides = Array.from(scroller.querySelectorAll<HTMLElement>("[data-startup-slide]"));
    const observer = new IntersectionObserver(
      entries => {
        const centered = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!centered) return;
        const index = Number(centered.target.getAttribute("data-real-index"));
        if (!Number.isNaN(index)) setActiveIndex(index);
      },
      {
        root: scroller,
        threshold: [0.42, 0.58, 0.74]
      }
    );

    slides.forEach(slide => observer.observe(slide));
    return () => observer.disconnect();
  }, [loopedStartups.length]);

  const maintainInfiniteLoop = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || isResettingRef.current) return;

    const loopHeight = scroller.scrollHeight / 3;
    const topBoundary = loopHeight * 0.45;
    const bottomBoundary = loopHeight * 1.65;

    if (scroller.scrollTop < topBoundary || scroller.scrollTop > bottomBoundary) {
      isResettingRef.current = true;
      const direction = scroller.scrollTop < topBoundary ? 1 : -1;
      scroller.scrollTop += loopHeight * direction;
      window.requestAnimationFrame(() => {
        isResettingRef.current = false;
      });
    }
  }, []);

  const openDetails = (startup: Startup) => {
    setSelectedStartup(startup);
  };

  const closeDetails = () => setSelectedStartup(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedStartup(null);
        setLoginOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main
      className={[
        "experience-shell",
        introDone ? "is-ready" : "",
        selectedStartup ? "is-modal" : ""
      ].join(" ")}
    >
      <AnimatePresence>
        {!introDone ? <IntroCurtain key="curtain" /> : null}
      </AnimatePresence>

      <header className="topbar" aria-label="Navegacion principal">
        <a className="brand-mark" href="/" aria-label="500 explorar">
          <Image
            src="/assets/programs-logos/500.svg"
            alt="500"
            width={88}
            height={36}
            priority
          />
        </a>

        <div className="topbar-divider" aria-hidden="true" />

        <nav className="topbar-nav">
          <a className="nav-item is-active" href="/">
            <Image src="/icons/explore.svg" alt="" width={14} height={16} />
            <span>Explorar</span>
          </a>
          <a className="nav-item" href="/conexiones">
            <span>Conexiones</span>
          </a>
          <a className="nav-item" href="/premio">
            <span>Premio</span>
          </a>
          <AnimatePresence initial={false}>
            {user ? (
              <motion.a
                key="startup-tag"
                className="nav-item nav-item--startup"
                href="/studio"
                initial={{ opacity: 0, x: -8, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -8, width: 0 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              >
                <span>{user.startup}</span>
              </motion.a>
            ) : null}
          </AnimatePresence>
        </nav>

        <div className="topbar-end">
          <AnimatePresence mode="wait" initial={false}>
            {user ? (
              <UserBadge key="badge" user={user} onLogout={() => setUser(null)} />
            ) : (
              <motion.button
                key="login"
                type="button"
                className="login-button"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setLoginOpen(true)}
              >
                Iniciar Sesión
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="active-index" aria-hidden="true">
        <span>{String(activeIndex + 1).padStart(2, "0")}</span>
        <div>
          {startups.map((startup, index) => (
            <i key={startup.id} className={index === activeIndex ? "is-active" : ""} />
          ))}
        </div>
        <span>{String(startups.length).padStart(2, "0")}</span>
      </div>

      <section
        className="experience-scroll"
        ref={scrollerRef}
        onScroll={maintainInfiniteLoop}
        aria-label="Explorar startups"
      >
        {loopedStartups.map((startup, index) => (
          <StartupSlide
            key={`${startup.id}-${index}`}
            startup={startup}
            isInitial={index === startups.length}
            scrollerRef={scrollerRef}
            loopIndex={Math.floor(index / startups.length)}
            realIndex={index % startups.length}
            onExplore={() => openDetails(startup)}
          />
        ))}
      </section>

      <AnimatePresence>
        {selectedStartup ? (
          <StartupDetails key="detail" startup={selectedStartup} onClose={closeDetails} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {loginOpen ? (
          <LoginModal
            key="login-modal"
            previewStartups={previewStartups}
            onClose={() => setLoginOpen(false)}
            onSuccess={authUser => {
              setUser(authUser);
              setLoginOpen(false);
              window.setTimeout(() => router.push("/studio"), 180);
            }}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function IntroCurtain() {
  return (
    <motion.div
      className="intro-curtain"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
      aria-hidden="true"
    >
      <div className="intro-mark">
        <Image src="/assets/programs-logos/500.svg" alt="" width={186} height={76} priority />
      </div>
      <p className="intro-tagline">EXPLORAR STARTUPS</p>
    </motion.div>
  );
}

type StartupSlideProps = {
  startup: Startup;
  isInitial: boolean;
  scrollerRef: RefObject<HTMLDivElement | null>;
  loopIndex: number;
  realIndex: number;
  onExplore: () => void;
};

function StartupSlide({
  startup,
  isInitial,
  scrollerRef,
  loopIndex,
  realIndex,
  onExplore
}: StartupSlideProps) {
  const slideRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: slideRef,
    container: scrollerRef,
    offset: ["start end", "end start"]
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const parallaxY = useSpring(rawY, { stiffness: 60, damping: 20, mass: 1 });

  return (
    <article
      ref={slideRef}
      className="startup-slide"
      data-startup-slide
      data-loop-index={loopIndex}
      data-real-index={realIndex}
    >
      <StartupFrame
        startup={startup}
        isInitial={isInitial}
        parallaxY={parallaxY}
        onExplore={onExplore}
      />
    </article>
  );
}

type StartupFrameProps = {
  startup: Startup;
  isInitial: boolean;
  parallaxY: MotionValue<number>;
  onExplore: () => void;
};

function StartupFrame({ startup, isInitial, parallaxY, onExplore }: StartupFrameProps) {
  return (
    <div className="startup-frame">
      <motion.div
        className="startup-frame__img-wrap"
        data-parallax-img
        style={{ y: parallaxY, scale: 1.35 }}
      >
        <Image
          className="startup-frame__image"
          src={startup.image}
          alt={startup.name}
          fill
          sizes="(max-width: 900px) 94vw, 86vw"
          priority={isInitial}
          loading={isInitial ? "eager" : "lazy"}
        />
      </motion.div>
      <div className="startup-frame__shade" />

      <div className="startup-frame__content">
        <motion.div
          className="startup-copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ root: undefined, amount: 0.5, once: false }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="country-chip">{startup.country}</span>
          <p className="startup-kicker">{startup.category}</p>
          <h1>{startup.name}</h1>
          <p>{startup.headline}</p>
        </motion.div>

        <motion.div
          className="startup-stats"
          aria-label={`Datos destacados de ${startup.name}`}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.5, once: false }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {startup.photoStats.map(stat => (
            <div className="photo-stat" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </div>
          ))}

          <button className="explore-button" type="button" onClick={onExplore}>
            <span>EXPLORAR</span>
            <Image src="/icons/explore.svg" alt="" width={14} height={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function StartupDetails({
  startup,
  onClose
}: {
  startup: Startup;
  onClose: () => void;
}) {
  return (
    <motion.section
      className="detail-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="startup-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32 }}
    >
      <button className="detail-play" type="button" aria-label="Cerrar detalle" onClick={onClose}>
        <span />
      </button>

      <motion.article
        className="detail-card"
        initial={{ opacity: 0, x: 28, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 24, scale: 0.98 }}
        transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="close-button" type="button" aria-label="Cerrar" onClick={onClose}>
          <span />
          <span />
        </button>

        <div className="detail-image">
          <Image src={startup.image} alt="" fill sizes="(max-width: 900px) 88vw, 42vw" />
        </div>

        <div className="detail-body">
          <p className="detail-kicker">
            {startup.region} · {startup.category}
          </p>
          <h2 id="startup-title">{startup.name}</h2>
          <p className="detail-description">{startup.description}</p>

          <div className="tech-stack" aria-label="Tecnologias">
            {startup.technologies.map(technology => (
              <span key={technology}>{technology}</span>
            ))}
          </div>

          <div className="impact-grid">
            {startup.metrics.map(metric => (
              <div className="impact-item" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.detail}</small>
              </div>
            ))}
          </div>

          <a className="connect-button" href={`mailto:${startup.contact}`}>
            CONECTAR
          </a>
        </div>
      </motion.article>
    </motion.section>
  );
}

function UserBadge({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const initial = user.name.charAt(0).toUpperCase() || "·";

  return (
    <motion.div
      className="user-badge"
      initial={{ opacity: 0, scale: 0.92, x: 8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.92, x: 8 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="user-badge__inner"
        onClick={onLogout}
        title="Cerrar sesión"
        aria-label={`Sesión iniciada como ${user.name}. Click para cerrar sesión.`}
      >
        <span className="user-badge__avatar">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.picture} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="user-badge__initial">{initial}</span>
          )}
        </span>
        <span className="user-badge__name">{user.name}</span>
      </button>
    </motion.div>
  );
}
