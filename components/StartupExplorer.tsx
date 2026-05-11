"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useScroll,
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
import type { Startup } from "@/lib/startups";
import { AuthControls } from "./AuthControls";
import { useAuth } from "./AuthProvider";

const MotionLink = motion.create(Link);
const quickEase = [0.22, 1, 0.36, 1] as const;
const LOOP_RESET_MARGIN = 0.42;

type StartupExplorerProps = {
  startups: Startup[];
};

export function StartupExplorer({ startups }: StartupExplorerProps) {
  const { user } = useAuth();
  const activeStartup = user?.activeStartup;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isResettingRef = useRef(false);
  const activeIndexRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const loopedStartups = useMemo(() => [...startups, ...startups, ...startups], [startups]);
  const previewStartups = useMemo(() => startups.slice(0, 3), [startups]);

  const setActiveStartupIndex = useCallback((nextIndex: number) => {
    if (activeIndexRef.current === nextIndex) return;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, []);

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    },
    []
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let lastScrollHeight = 0;
    let userInteracted = false;

    const alignToMiddleLoop = () => {
      if (userInteracted) return;
      const firstMiddleSlide = scroller.querySelector<HTMLElement>(
        '[data-loop-index="1"][data-real-index="0"]'
      );
      if (!firstMiddleSlide) return;

      const previousScrollBehavior = scroller.style.scrollBehavior;
      isResettingRef.current = true;
      scroller.style.scrollBehavior = "auto";
      scroller.scrollTop = firstMiddleSlide.offsetTop;
      activeIndexRef.current = 0;
      setActiveIndex(0);
      lastScrollHeight = scroller.scrollHeight;
      window.requestAnimationFrame(() => {
        scroller.style.scrollBehavior = previousScrollBehavior;
        isResettingRef.current = false;
      });
    };

    const markInteracted = () => {
      userInteracted = true;
    };
    scroller.addEventListener("wheel", markInteracted, { passive: true, once: true });
    scroller.addEventListener("touchstart", markInteracted, { passive: true, once: true });
    scroller.addEventListener("keydown", markInteracted, { once: true });

    // First alignment after first paint.
    const frame = window.requestAnimationFrame(alignToMiddleLoop);

    // Re-align if layout shifts (images load, fonts swap, etc.) — but only
    // until the user starts scrolling, so we don't yank them around.
    const observer = new ResizeObserver(() => {
      if (userInteracted) return;
      if (scroller.scrollHeight !== lastScrollHeight) alignToMiddleLoop();
    });
    observer.observe(scroller);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener("wheel", markInteracted);
      scroller.removeEventListener("touchstart", markInteracted);
      scroller.removeEventListener("keydown", markInteracted);
    };
  }, [startups.length]);

  const syncActiveFromScroll = useCallback((scroller: HTMLDivElement) => {
    const slides = Array.from(scroller.querySelectorAll<HTMLElement>("[data-startup-slide]"));
    const viewportCenter = scroller.scrollTop + scroller.clientHeight / 2;
    let closestIndex = activeIndexRef.current;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const slide of slides) {
      const slideCenter = slide.offsetTop + slide.offsetHeight / 2;
      const distance = Math.abs(slideCenter - viewportCenter);
      if (distance >= closestDistance) continue;
      const index = Number(slide.dataset.realIndex);
      if (Number.isNaN(index)) continue;
      closestIndex = index;
      closestDistance = distance;
    }

    setActiveStartupIndex(closestIndex);
  }, [setActiveStartupIndex]);

  const normalizeLoopScroll = useCallback((scroller: HTMLDivElement) => {
    const loopHeight = scroller.scrollHeight / 3;
    if (!Number.isFinite(loopHeight) || loopHeight <= 0) return;

    const topBoundary = loopHeight * LOOP_RESET_MARGIN;
    const bottomBoundary = loopHeight * (3 - LOOP_RESET_MARGIN);
    const scrollTop = scroller.scrollTop;
    if (scrollTop >= topBoundary && scrollTop <= bottomBoundary) return;

    const normalizedOffset = ((scrollTop % loopHeight) + loopHeight) % loopHeight;
    const targetScrollTop = loopHeight + normalizedOffset;
    if (Math.abs(targetScrollTop - scrollTop) < 1) return;

    isResettingRef.current = true;
    const previousScrollBehavior = scroller.style.scrollBehavior;
    const previousSnapType = scroller.style.scrollSnapType;
    scroller.style.scrollBehavior = "auto";
    scroller.style.scrollSnapType = "none";
    scroller.scrollTop = targetScrollTop;
    syncActiveFromScroll(scroller);

    window.requestAnimationFrame(() => {
      scroller.style.scrollBehavior = previousScrollBehavior;
      scroller.style.scrollSnapType = previousSnapType;
      isResettingRef.current = false;
    });
  }, [syncActiveFromScroll]);

  const maintainInfiniteLoop = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || isResettingRef.current) return;

    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      if (isResettingRef.current) return;
      normalizeLoopScroll(scroller);
      syncActiveFromScroll(scroller);
    });
  }, [normalizeLoopScroll, syncActiveFromScroll]);

  return (
    <main className="experience-shell is-ready">
      <header className="topbar" aria-label="Navegacion principal">
        <Link className="brand-mark" href="/" aria-label="500 explorar">
          <Image
            src="/assets/programs-logos/500.svg"
            alt="500"
            width={48}
            height={20}
            priority
          />
        </Link>

        <div className="topbar-divider" aria-hidden="true" />

        <nav className="topbar-nav">
          <Link className="nav-item is-active" href="/">
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
          <AnimatePresence initial={false}>
            {activeStartup ? (
              <MotionLink
                key="startup-tag"
                className="nav-item nav-item--startup"
                href="/studio"
                initial={{ opacity: 0, x: -8, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -8, width: 0 }}
                transition={{ duration: 0.22, ease: quickEase }}
              >
                <span>{activeStartup.name}</span>
              </MotionLink>
            ) : null}
          </AnimatePresence>
        </nav>

        <div className="topbar-end">
          <AuthControls previewStartups={previewStartups} redirectAfterLogin="/studio" />
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
        {loopedStartups.map((startup, index) => {
          const realIndex = index % startups.length;
          const loopIndex = Math.floor(index / startups.length);
          // Eager-load the first 4 cards visible at start (middle copy)
          // and their twins in the first/last copies — same URLs are deduped
          // by the browser cache anyway, this only adds preload hints once.
          const eager = loopIndex === 1 && realIndex < 4;
          return (
            <StartupSlide
              key={`${startup.id}-${index}`}
              startup={startup}
              isInitial={index === startups.length}
              scrollerRef={scrollerRef}
              loopIndex={loopIndex}
              realIndex={realIndex}
              eager={eager}
            />
          );
        })}
      </section>
    </main>
  );
}

type StartupSlideProps = {
  startup: Startup;
  isInitial: boolean;
  scrollerRef: RefObject<HTMLDivElement | null>;
  loopIndex: number;
  realIndex: number;
  eager: boolean;
};

function StartupSlide({
  startup,
  isInitial,
  scrollerRef,
  loopIndex,
  realIndex,
  eager
}: StartupSlideProps) {
  const slideRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: slideRef,
    container: scrollerRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 0.12, 0.28, 0.5, 0.72, 0.88, 1], [170, 112, 48, 0, -48, -112, -170]);
  const frameY = useTransform(scrollYProgress, [0, 0.16, 0.34, 0.66, 0.84, 1], [18, 5, 0, 0, -5, -18]);
  const frameScale = useTransform(scrollYProgress, [0, 0.16, 0.34, 0.66, 0.84, 1], [0.982, 0.996, 1, 1, 0.996, 0.982]);
  const frameOpacity = useTransform(scrollYProgress, [0, 0.14, 0.32, 0.68, 0.86, 1], [0.82, 0.94, 1, 1, 0.94, 0.82]);

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
        frameY={frameY}
        frameScale={frameScale}
        frameOpacity={frameOpacity}
        eager={eager}
      />
    </article>
  );
}

type StartupFrameProps = {
  startup: Startup;
  isInitial: boolean;
  parallaxY: MotionValue<number>;
  frameY: MotionValue<number>;
  frameScale: MotionValue<number>;
  frameOpacity: MotionValue<number>;
  eager: boolean;
};

function StartupFrame({ startup, isInitial, parallaxY, frameY, frameScale, frameOpacity, eager }: StartupFrameProps) {
  const isRemoteImage = startup.image.startsWith("http://") || startup.image.startsWith("https://");
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const imageReady = loadedImage === startup.image;

  return (
    <MotionLink
      href={`/startup/${startup.id}`}
      className={["startup-frame", imageReady ? "is-image-ready" : "is-image-loading"].join(" ")}
      aria-label={`Ver perfil de ${startup.name}`}
      style={{ y: frameY, scale: frameScale, opacity: frameOpacity }}
    >
      <div className="startup-frame__img-wrap" data-parallax-img>
        <span className="startup-frame__media-skeleton" aria-hidden="true" />
        <motion.div className="startup-frame__parallax" style={{ y: parallaxY, scale: 1.16 }}>
          <Image
            className="startup-frame__image"
            src={startup.image}
            alt={startup.name}
            fill
            sizes="(max-width: 900px) 94vw, 86vw"
            priority={isInitial || eager}
            loading={isInitial || eager ? "eager" : "lazy"}
            fetchPriority={isInitial ? "high" : eager ? "auto" : "low"}
            unoptimized={isRemoteImage}
            onLoad={() => setLoadedImage(startup.image)}
            onError={() => setLoadedImage(startup.image)}
          />
        </motion.div>
      </div>
      <div className="startup-frame__shade" />

      <div className="startup-frame__content-skeleton" aria-hidden="true">
        <div className="startup-skeleton-copy">
          <span className="startup-skeleton-pill" />
          <span className="startup-skeleton-line startup-skeleton-line--kicker" />
          <span className="startup-skeleton-title" />
          <span className="startup-skeleton-title startup-skeleton-title--short" />
          <span className="startup-skeleton-line" />
          <span className="startup-skeleton-line startup-skeleton-line--wide" />
        </div>
        <div className="startup-skeleton-stats">
          <span />
          <span />
          <span />
          <span className="startup-skeleton-button" />
        </div>
      </div>

      <div className="startup-frame__content">
        <motion.div
          className="startup-copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.5, once: true }}
          transition={{ duration: 0.42, ease: quickEase }}
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
          viewport={{ amount: 0.5, once: true }}
          transition={{ duration: 0.38, delay: 0.04, ease: quickEase }}
        >
          {startup.photoStats.map(stat => (
            <div className="photo-stat" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </div>
          ))}

          <span className="explore-button" aria-hidden="true">
            <span>EXPLORAR</span>
            <Image src="/icons/explore.svg" alt="" width={14} height={16} />
          </span>
        </motion.div>
      </div>
    </MotionLink>
  );
}


