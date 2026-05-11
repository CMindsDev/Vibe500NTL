"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCountryCode, getFlagUrl } from "@/lib/countries";
import { parseTracks } from "@/lib/tracks";
import { useAuth } from "./AuthProvider";

export type StartupProfileData = {
  id?: number | string;
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
};

export type StartupProfileNext = {
  id: number | string;
  name: string;
  category: string | null;
  image: string | null;
};

type LenisRuntime = {
  destroy: () => void;
  raf: (time: number) => void;
  on: (event: "scroll", callback: () => void) => void;
  off?: (event: "scroll", callback: () => void) => void;
  scrollTo?: (
    target: number,
    options?: { duration?: number; force?: boolean; immediate?: boolean }
  ) => void;
  start?: () => void;
  stop?: () => void;
};

type LenisConstructor = new (options: Record<string, unknown>) => LenisRuntime;

type AnimePlayback = {
  cancel?: () => void;
  pause?: () => void;
};

function pick(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function splitDataText(text: string): { title: string; body: string } {
  const colonIdx = text.indexOf(":");
  const newlineIdx = text.indexOf("\n");
  if (colonIdx > 0 && colonIdx < 80) {
    return { title: text.slice(0, colonIdx).trim(), body: text.slice(colonIdx + 1).trim() };
  }
  if (newlineIdx > 0 && newlineIdx < 120) {
    return { title: text.slice(0, newlineIdx).trim(), body: text.slice(newlineIdx + 1).trim() };
  }
  const words = text.split(" ");
  if (words.length > 6) {
    return { title: words.slice(0, 6).join(" "), body: words.slice(6).join(" ") };
  }
  return { title: text, body: "" };
}

function splitQuoteName(raw: string): { name: string; role: string } {
  const separators = ["\n", " — ", " - ", "_ ", "_"];
  for (const sep of separators) {
    const idx = raw.indexOf(sep);
    if (idx > 0) {
      return { name: raw.slice(0, idx).trim(), role: raw.slice(idx + sep.length).trim() };
    }
  }
  return { name: raw, role: "" };
}

function uniqueGalleryImages(images: Array<{ src: string; label: string; field: string }>) {
  const seen = new Set<string>();
  return images.filter(image => {
    if (!image.src || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}

function ensureUrl(value: string) {
  return value.startsWith("http") ? value : `https://${value}`;
}

function getVideoRender(value: string): { type: "file" | "embed" | "link"; url: string } | null {
  if (!value.trim()) return null;

  try {
    const url = new URL(ensureUrl(value.trim()));
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname;

    if (/\.(mp4|webm|ogg)$/i.test(path)) return { type: "file", url: url.toString() };

    if (host === "youtu.be") {
      const id = path.split("/").filter(Boolean)[0];
      return id ? { type: "embed", url: `https://www.youtube.com/embed/${id}` } : null;
    }

    if (host.endsWith("youtube.com")) {
      const id = url.searchParams.get("v") ?? path.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return id ? { type: "embed", url: `https://www.youtube.com/embed/${id}` } : { type: "link", url: url.toString() };
    }

    if (host.endsWith("vimeo.com")) {
      const id = path.split("/").filter(Boolean).find(part => /^\d+$/.test(part));
      return id ? { type: "embed", url: `https://player.vimeo.com/video/${id}` } : { type: "link", url: url.toString() };
    }

    return { type: "link", url: url.toString() };
  } catch {
    return null;
  }
}

const SECTION_LABELS: Record<string, string> = {
  identidad: "Identidad",
  territorio: "Territorio",
  narrativa: "Narrativa",
  traccion: "Tracción",
  voz: "Voz",
  media: "Media"
};

type Props = {
  data: StartupProfileData;
  cinematic?: boolean;
  previousStartup?: StartupProfileNext | null;
  nextStartup?: StartupProfileNext | null;
  /** Studio-only: which form section is being edited; matching blocks glow. */
  highlightSection?: string;
  /** Studio-only: readable label for the active preview section. */
  activeSectionLabel?: string;
  /** Studio-only: readable label for the active field inside the section. */
  activeFieldLabel?: string;
  /** Studio-only: exact field currently being edited. */
  activeFieldId?: string;
  /** Studio-only: clicking a section badge in the preview switches to it. */
  onSectionClick?: (sectionId: string, fieldId?: string) => void;
};

export function StartupProfileView({
  data,
  cinematic = false,
  previousStartup = null,
  nextStartup = null,
  highlightSection,
  activeSectionLabel,
  activeFieldLabel,
  activeFieldId,
  onSectionClick
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [reelHintActive, setReelHintActive] = useState(false);
  const [reelHintProgress, setReelHintProgress] = useState(0);
  const [reelHintDirection, setReelHintDirection] = useState<"previous" | "next">("next");
  const [transitionStartup, setTransitionStartup] = useState<StartupProfileNext | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<"previous" | "next">("next");
  const advancingRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);
  const lenisRef = useRef<LenisRuntime | null>(null);
  const transitionActive = isAdvancing && transitionStartup !== null && transitionStartup.id !== data.id;

  // Disable the reel when the viewer is the owner of this very startup —
  // their /startup/{id} is "their profile", not part of the explore reel.
  const isOwnProfile = useMemo(() => {
    if (!user || data.id == null) return false;
    return user.memberships.some(
      m => m.id === String(data.id) && m.role === "OWNER"
    );
  }, [user, data.id]);

  const reelEnabled = cinematic && (!!previousStartup || !!nextStartup) && !isOwnProfile;

  const isEditable = !!onSectionClick;
  const sectionProps = useCallback(
    (id: string, fieldId?: string) => {
      if (!onSectionClick) return {} as Record<string, unknown>;
      const isCurrentSection = highlightSection === id;
      const isExactField = Boolean(activeFieldId && fieldId && activeFieldId === fieldId);
      const isActive = activeFieldId ? isExactField : isCurrentSection;
      return {
        "data-section": id,
        "data-preview-field": fieldId,
        "data-section-label": SECTION_LABELS[id] ?? id,
        "data-current-section": isCurrentSection ? "true" : undefined,
        "data-active": isActive ? "true" : undefined,
        role: "button",
        tabIndex: 0,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          // Don't intercept clicks on inner anchors / buttons.
          if ((event.target as HTMLElement).closest("a, button")) return;
          event.preventDefault();
          event.stopPropagation();
          onSectionClick(id, fieldId);
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSectionClick(id, fieldId);
          }
        }
      } as Record<string, unknown>;
    },
    [activeFieldId, onSectionClick, highlightSection]
  );

  useEffect(() => {
    if (!isEditable || cinematic || !highlightSection) return;
    const target =
      (activeFieldId ? rootRef.current?.querySelector<HTMLElement>(`[data-preview-field="${activeFieldId}"]`) : null) ??
      rootRef.current?.querySelector<HTMLElement>(`[data-section="${highlightSection}"]`);
    if (!target) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest"
    });
  }, [activeFieldId, cinematic, highlightSection, isEditable]);

  const view = useMemo(() => {
    const name = pick(data.name) || "Sin nombre";
    const website = pick(data.website);
    const header = pick(data.header);
    const description = pick(data.description);
    const operatingCountry = pick(data.operatingCountry);
    const category = pick(data.category);
    const image1 = pick(data.image1);
    const image2 = pick(data.image2);
    const image3 = pick(data.image3);
    const image4 = pick(data.image4);
    const quotePhoto = pick(data.quotePhoto);
    const dataImage1 = pick(data.dataImage1);
    const dataImage2 = pick(data.dataImage2);
    const dataImage3 = pick(data.dataImage3);
    const video = pick(data.video);
    const impacto = pick(data.impacto);
    const quote = pick(data.quote);
    const quoteNameRaw = pick(data.quoteName);
    const tracks = parseTracks(data.tracks);
    const quoteInfo = quoteNameRaw ? splitQuoteName(quoteNameRaw) : null;
    const dataCards = [
      { text: pick(data.data1), image: dataImage1, index: 0 },
      { text: pick(data.data2), image: dataImage2, index: 1 },
      { text: pick(data.data3), image: dataImage3, index: 2 }
    ]
      .filter(item => item.text || item.image)
      .map(item => {
        const parsed = item.text ? splitDataText(item.text) : { title: `Dato ${String(item.index + 1).padStart(2, "0")}`, body: "" };
        return { ...parsed, image: item.image, index: item.index };
      });
    const galleryImages = uniqueGalleryImages([
      { src: image1, label: "Cover", field: "image1" },
      { src: image2, label: "Galería 01", field: "image2" },
      { src: image3, label: "Galería 02", field: "image3" },
      { src: image4, label: "Galería 03", field: "image4" },
      { src: dataImage1, label: "Dato 01", field: "dataImage1" },
      { src: dataImage2, label: "Dato 02", field: "dataImage2" },
      { src: dataImage3, label: "Dato 03", field: "dataImage3" },
      { src: quotePhoto, label: "Quote", field: "quotePhoto" }
    ]);

    return {
      name,
      website,
      header,
      description,
      operatingCountry,
      category,
      image1,
      image2,
      image3,
      image4,
      video,
      quotePhoto,
      impacto,
      quote,
      quoteInfo,
      tracks,
      dataCards,
      galleryImages
    };
  }, [data]);

  const triggerStartup = useCallback((startup: StartupProfileNext | null, direction: "previous" | "next") => {
    if (!startup || advancingRef.current) return;
    advancingRef.current = true;
    lenisRef.current?.stop?.();
    setTransitionStartup(startup);
    setTransitionDirection(direction);
    setIsAdvancing(true);
    window.navigator.vibrate?.(12);
    advanceTimerRef.current = window.setTimeout(() => {
      router.push(`/startup/${startup.id}`);
    }, 620);
  }, [router]);

  useLayoutEffect(() => {
    if (!cinematic) return;
    const activeLenis = lenisRef.current;
    activeLenis?.stop?.();
    activeLenis?.scrollTo?.(0, { force: true, immediate: true });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    advancingRef.current = false;
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    const resetFrame = window.requestAnimationFrame(() => {
      setIsAdvancing(false);
      setTransitionStartup(null);
      setReelHintActive(false);
      setReelHintProgress(0);
    });
    return () => window.cancelAnimationFrame(resetFrame);
  }, [cinematic, data.id]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!cinematic) return;
    const previousRestoration = window.history.scrollRestoration;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehaviorY;
    const previousBodyOverscroll = document.body.style.overscrollBehaviorY;

    window.history.scrollRestoration = "manual";
    document.documentElement.style.overscrollBehaviorY = "contain";
    document.body.style.overscrollBehaviorY = "contain";

    return () => {
      window.history.scrollRestoration = previousRestoration;
      document.documentElement.style.overscrollBehaviorY = previousHtmlOverscroll;
      document.body.style.overscrollBehaviorY = previousBodyOverscroll;
    };
  }, [cinematic]);

  useEffect(() => {
    if (!reelEnabled) return;

    // Require a deliberate push past either edge before changing startup.
    // Small trackpad inertia at the top/bottom should stay in the deadzone.
    const WHEEL_THRESHOLD = 760;
    const WHEEL_EVENT_CAP = 110;
    const TOUCH_THRESHOLD = 230;
    const PREVIOUS_HINT_WHEEL_MIN = 90;
    const PREVIOUS_HINT_TOUCH_MIN = 34;
    const RESET_PAUSE_MS = 280;
    const EDGE_LOCK_DISTANCE = 3;
    const HINT_VISIBLE_DISTANCE = 86;

    let touchStartY = 0;
    let touchDelta = 0;
    let wheelAccum = 0;
    let activeDirection: "previous" | "next" | null = null;
    let resetTimer = 0;
    let hintFrame = 0;

    const getScrollMetrics = () => {
      const scrollElement = document.scrollingElement ?? document.documentElement;
      const scrollTop = scrollElement.scrollTop;
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const maxScroll = Math.max(0, documentHeight - window.innerHeight);
      return {
        maxScroll,
        distanceToStart: scrollTop,
        distanceToEnd: maxScroll - scrollTop
      };
    };

    const isAtEdge = (direction: "previous" | "next") => {
      const { distanceToStart, distanceToEnd, maxScroll } = getScrollMetrics();
      if (maxScroll <= 320) return false;
      return direction === "previous"
        ? distanceToStart <= EDGE_LOCK_DISTANCE
        : distanceToEnd <= EDGE_LOCK_DISTANCE;
    };

    const decayAccum = () => {
      const previousDirection = activeDirection;
      wheelAccum = 0;
      touchDelta = 0;
      activeDirection = null;
      if (previousDirection === "previous") setReelHintActive(false);
      setReelHintProgress(0);
    };

    const scheduleDecay = () => {
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(decayAccum, RESET_PAUSE_MS);
    };

    const updateHintVisibility = () => {
      if (hintFrame) return;
      hintFrame = window.requestAnimationFrame(() => {
        hintFrame = 0;
        const { distanceToEnd, maxScroll } = getScrollMetrics();
        const nextVisible = Boolean(nextStartup) && distanceToEnd <= HINT_VISIBLE_DISTANCE;
        const visible = maxScroll > 320 && nextVisible;
        if (nextVisible) setReelHintDirection("next");
        setReelHintActive(visible);
      });
    };

    const fire = (direction: "previous" | "next") => {
      decayAccum();
      triggerStartup(direction === "previous" ? previousStartup : nextStartup, direction);
    };

    const onWheel = (event: WheelEvent) => {
      if (advancingRef.current) return;

      const direction = event.deltaY < 0 ? "previous" : event.deltaY > 0 ? "next" : null;
      const target = direction === "previous" ? previousStartup : direction === "next" ? nextStartup : null;

      if (!direction || !target || !isAtEdge(direction)) {
        if (Math.abs(event.deltaY) > 4) decayAccum();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      if (activeDirection !== direction) {
        wheelAccum = 0;
        activeDirection = direction;
        setReelHintDirection(direction);
      }
      wheelAccum += Math.min(Math.abs(event.deltaY), WHEEL_EVENT_CAP);
      setReelHintActive(direction === "next" || wheelAccum >= PREVIOUS_HINT_WHEEL_MIN);
      setReelHintProgress(Math.min(1, wheelAccum / WHEEL_THRESHOLD));
      scheduleDecay();
      if (wheelAccum >= WHEEL_THRESHOLD) fire(direction);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
      touchDelta = 0;
      activeDirection = null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (advancingRef.current) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      const dragDistance = Math.abs(currentY - touchStartY);
      const direction = currentY > touchStartY ? "previous" : currentY < touchStartY ? "next" : null;
      const target = direction === "previous" ? previousStartup : direction === "next" ? nextStartup : null;

      if (!direction || !target || !isAtEdge(direction)) {
        if (dragDistance > 8) decayAccum();
        return;
      }

      activeDirection = direction;
      setReelHintDirection(direction);
      touchDelta = dragDistance;
      setReelHintActive(direction === "next" || touchDelta >= PREVIOUS_HINT_TOUCH_MIN);
      setReelHintProgress(Math.min(1, touchDelta / TOUCH_THRESHOLD));
      if (touchDelta >= TOUCH_THRESHOLD) fire(direction);
    };

    const onTouchEnd = () => {
      scheduleDecay();
    };

    window.addEventListener("scroll", updateHintVisibility, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    updateHintVisibility();

    return () => {
      if (resetTimer) window.clearTimeout(resetTimer);
      if (hintFrame) window.cancelAnimationFrame(hintFrame);
      window.removeEventListener("scroll", updateHintVisibility);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      setReelHintActive(false);
      setReelHintProgress(0);
    };
  }, [nextStartup, previousStartup, reelEnabled, triggerStartup]);

  useEffect(() => {
    if (!cinematic) return;
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("animejs"),
      import("lenis")
    ])
      .then(mods => {
        if (cancelled) return;
        const [gsapMod, stMod, animeMod, lenisMod] = mods;
        const gsap = gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger;
        const { animate, stagger } = animeMod;
        const Lenis = lenisMod.default as LenisConstructor;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const animeAnimations: AnimePlayback[] = [];
        const imageRefreshHandlers: Array<{ image: HTMLImageElement; handler: () => void }> = [];

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });

        const lenis = new Lenis({
          duration: prefersReducedMotion ? 0 : 0.9,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
          smoothWheel: !prefersReducedMotion,
          smoothTouch: false,
          syncTouch: true,
          touchMultiplier: 0.9,
          wheelMultiplier: 0.82
        });
        lenisRef.current = lenis;
        lenis.scrollTo?.(0, { force: true, immediate: true });

        const updateScrollTrigger = () => ScrollTrigger.update();
        const tick = (time: number) => {
          lenis.raf(time * 1000);
        };
        lenis.on("scroll", updateScrollTrigger);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const ctx = gsap.context(() => {
          const cover = root.querySelector<HTMLElement>("[data-anim='cover']");
          if (cover) {
            gsap.set(cover, { force3D: true, willChange: "transform, opacity" });
            gsap.fromTo(
              cover,
              { autoAlpha: 0.92, scale: 1.09 },
              {
                autoAlpha: 1,
                scale: 1,
                duration: prefersReducedMotion ? 0.01 : 1.15,
                ease: "power3.out",
                clearProps: "willChange"
              }
            );
          }

          const stackChildren = root.querySelectorAll<HTMLElement>("[data-anim='hero-stack'] > *");
          if (stackChildren.length) {
            gsap.set(stackChildren, { force3D: true, willChange: "transform, opacity" });
            gsap.from(stackChildren, {
              y: 24,
              autoAlpha: 0,
              duration: prefersReducedMotion ? 0.01 : 0.68,
              ease: "power3.out",
              stagger: 0.055,
              delay: prefersReducedMotion ? 0 : 0.12,
              clearProps: "willChange"
            });
          }

          const flag = root.querySelector<HTMLElement>("[data-anim='flag']");
          if (flag) {
            gsap.set(flag, { force3D: true, willChange: "transform, opacity" });
            gsap.from(flag, {
              x: -18,
              autoAlpha: 0,
              duration: prefersReducedMotion ? 0.01 : 0.52,
              ease: "power3.out",
              delay: prefersReducedMotion ? 0 : 0.24,
              clearProps: "willChange"
            });
          }

          gsap.utils.toArray<HTMLElement>("[data-reveal]:not([data-proof-card]):not([data-gallery-card])").forEach(el => {
            gsap.set(el, { force3D: true, willChange: "transform, opacity" });
            gsap.from(el, {
              y: 28,
              autoAlpha: 0,
              duration: prefersReducedMotion ? 0.01 : 0.64,
              ease: "power2.out",
              clearProps: "willChange",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                once: true
              }
            });
          });

          const proofCards = root.querySelectorAll<HTMLElement>("[data-proof-card]");
          if (proofCards.length) {
            const proofSection = proofCards[0].closest<HTMLElement>(".sp-proof-section") ?? proofCards[0];
            gsap.set(proofCards, {
              y: 38,
              autoAlpha: 0,
              scale: 0.986,
              force3D: true,
              transformOrigin: "50% 50%",
              willChange: "transform, opacity"
            });
            gsap.to(proofCards, {
              y: 0,
              autoAlpha: 1,
              scale: 1,
              duration: prefersReducedMotion ? 0.01 : 0.72,
              ease: "power3.out",
              stagger: prefersReducedMotion ? 0 : 0.055,
              clearProps: "willChange",
              scrollTrigger: {
                trigger: proofSection,
                start: "top 84%",
                once: true,
                invalidateOnRefresh: true
              }
            });

            const proofMedia = root.querySelectorAll<HTMLElement>("[data-proof-media]");
            if (proofMedia.length && !prefersReducedMotion) {
              gsap.fromTo(
                proofMedia,
                { yPercent: -4.5, scale: 1.08, force3D: true, transformOrigin: "50% 50%" },
                {
                  yPercent: 4.5,
                  scale: 1.08,
                  ease: "none",
                  scrollTrigger: {
                    trigger: proofSection,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.45,
                    invalidateOnRefresh: true
                  }
                }
              );
            }
          }

          const galleryItems = root.querySelectorAll<HTMLElement>("[data-gallery-card]");
          if (galleryItems.length) {
            const gallerySection = galleryItems[0].closest<HTMLElement>(".sp-gallery-strip") ?? galleryItems[0];
            gsap.set(galleryItems, {
              y: 34,
              autoAlpha: 0,
              scale: 0.988,
              force3D: true,
              transformOrigin: "50% 50%",
              willChange: "transform, opacity"
            });
            gsap.to(galleryItems, {
              y: 0,
              autoAlpha: 1,
              scale: 1,
              duration: prefersReducedMotion ? 0.01 : 0.68,
              ease: "power3.out",
              stagger: prefersReducedMotion ? 0 : 0.04,
              clearProps: "willChange",
              scrollTrigger: {
                trigger: gallerySection,
                start: "top 88%",
                once: true,
                invalidateOnRefresh: true
              }
            });

            const galleryMedia = root.querySelectorAll<HTMLElement>("[data-gallery-media]");
            if (galleryMedia.length && !prefersReducedMotion) {
              gsap.fromTo(
                galleryMedia,
                { yPercent: -5, scale: 1.08, force3D: true, transformOrigin: "50% 50%" },
                {
                  yPercent: 5,
                  scale: 1.08,
                  ease: "none",
                  scrollTrigger: {
                    trigger: gallerySection,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.45,
                    invalidateOnRefresh: true
                  }
                }
              );
            }
          }

          const fan = root.querySelector<HTMLElement>("[data-anim='fan']");
          if (fan) {
            const slots = fan.querySelectorAll<HTMLElement>(".sp-fan__slot");
            const cards = fan.querySelectorAll<HTMLElement>(".sp-fan__card");
            if (cards.length === 3) {
              gsap.set(slots, { opacity: 0 });
              gsap.set(cards, { force3D: true, willChange: "transform", y: 54 });
              ScrollTrigger.create({
                trigger: fan,
                start: "top 78%",
                once: true,
                onEnter: () => {
                  animeAnimations.push(animate(slots, {
                    opacity: [0, (_el: HTMLElement, i: number) => (i === 1 ? 1 : 0.32)],
                    duration: prefersReducedMotion ? 1 : 620,
                    delay: prefersReducedMotion ? 0 : stagger(80, { from: "center" }),
                    ease: "outCubic"
                  }) as AnimePlayback);
                  animeAnimations.push(animate(cards, {
                    y: [54, 0],
                    duration: prefersReducedMotion ? 1 : 760,
                    delay: prefersReducedMotion ? 0 : stagger(80, { from: "center" }),
                    onComplete: () => gsap.set(cards, { clearProps: "willChange" }),
                    ease: "outExpo"
                  }) as AnimePlayback);
                }
              });
            }
          }
        }, root);

        const refreshScrollTrigger = () => ScrollTrigger.refresh();
        const refreshTimer = window.setTimeout(refreshScrollTrigger, 180);
        root.querySelectorAll<HTMLImageElement>("img").forEach(image => {
          if (image.complete) return;
          const handler = () => refreshScrollTrigger();
          image.addEventListener("load", handler, { once: true });
          imageRefreshHandlers.push({ image, handler });
        });

        cleanup = () => {
          imageRefreshHandlers.forEach(({ image, handler }) => {
            image.removeEventListener("load", handler);
          });
          window.clearTimeout(refreshTimer);
          animeAnimations.forEach(animation => {
            animation.cancel?.();
            animation.pause?.();
          });
          ctx.revert();
          lenis.off?.("scroll", updateScrollTrigger);
          gsap.ticker.remove(tick);
          gsap.ticker.lagSmoothing(500, 33);
          if (lenisRef.current === lenis) lenisRef.current = null;
          lenis.destroy();
        };
      })
      .catch(error => {
        console.error("StartupProfileView animation init failed", error);
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [cinematic, data.id]);

  const videoRender = view.video ? getVideoRender(view.video) : null;
  const hasNarrativeSection = Boolean(view.description || view.header || view.impacto || view.image2 || view.image3 || view.image4 || view.image1);
  const showTerritoryPlaceholder = isEditable && highlightSection === "territorio" && !view.operatingCountry && view.tracks.length === 0 && !view.website;
  const showNarrativePlaceholder = isEditable && highlightSection === "narrativa" && !hasNarrativeSection;
  const showTractionPlaceholder = isEditable && highlightSection === "traccion" && view.dataCards.length === 0;
  const showVoicePlaceholder = isEditable && highlightSection === "voz" && !view.quote && !view.quoteInfo;
  const proofCards = isEditable && highlightSection === "traccion"
    ? [0, 1, 2].map(index => {
      const existing = view.dataCards.find(card => card.index === index);
      return existing ?? {
        index,
        title: `Dato ${String(index + 1).padStart(2, "0")}`,
        body: "Pendiente",
        image: ""
      };
    })
    : view.dataCards;

  return (
    <div
      ref={rootRef}
      className={[
        "sp-root",
        cinematic ? "sp-root--cinematic" : "",
        isEditable ? "sp-root--editable" : "",
        transitionActive ? "is-advancing" : "",
        transitionActive ? `is-advancing--${transitionDirection}` : ""
      ].filter(Boolean).join(" ")}
    >
      {isEditable && highlightSection ? (
        <div className="sp-edit-focus-badge" aria-live="polite">
          <span>Ahora editas</span>
          <strong>{activeSectionLabel ?? SECTION_LABELS[highlightSection] ?? highlightSection}</strong>
          {activeFieldLabel ? <small>{activeFieldLabel}</small> : null}
        </div>
      ) : null}

      <header className="sp-hero">
        <div className="sp-hero__media" {...sectionProps("media", "image1")}>
          {view.image1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              data-anim="cover"
              className="sp-hero__cover"
              src={view.image1}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          ) : (
            <span className="sp-hero__cover sp-hero__cover--empty">Sin cover</span>
          )}
          <div className="sp-hero__veil" aria-hidden="true" />
          <div className="sp-hero__grid" aria-hidden="true" />
        </div>

        <div className="sp-hero__inner">
          <div className="sp-hero__stack" data-anim="hero-stack" {...sectionProps("identidad", "name")}>
            {(view.tracks.length > 0 || view.category) ? (
              <div className="sp-hero__signals" aria-label="Tracks principales">
                {view.tracks.slice(0, 3).map(track => (
                  <span key={track.name} style={{ background: track.color }}>
                    {track.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={track.icon} alt="" loading="lazy" decoding="async" />
                    ) : null}
                  </span>
                ))}
                {view.category ? <small>{view.category}</small> : null}
              </div>
            ) : null}
            <h1 className="sp-hero__name">{view.name}</h1>
            {view.header ? <p className="sp-hero__headline">{view.header}</p> : null}
            <div className="sp-hero__actions">
              {view.website ? (
                <a
                  className="sp-hero__cta"
                  href={ensureUrl(view.website)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Ir al sitio web</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              <span className="sp-hero__down" aria-hidden="true">↓</span>
            </div>
            {view.galleryImages.length > 1 ? (
              <div className="sp-hero__steps" aria-hidden="true">
                {view.galleryImages.slice(0, 5).map((image, index) => (
                  <span key={`${image.src}-${index}`} className={index === 0 ? "is-active" : ""} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {hasNarrativeSection && (
        <section className="sp-block sp-profile-intro" data-reveal {...sectionProps("narrativa")}>
          {view.operatingCountry ? (
            <div className="sp-country-pill" data-anim="flag" {...sectionProps("territorio", "operatingCountry")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getFlagUrl(view.operatingCountry, 40)}
                alt={getCountryCode(view.operatingCountry)}
                loading="lazy"
                decoding="async"
              />
              <span>{view.operatingCountry}</span>
            </div>
          ) : null}
          <h2 className="sp-profile-intro__title">
            <strong>{view.name}</strong>
            {view.category ? <span>{view.category}</span> : null}
          </h2>
          {view.description || view.header ? (
            <p className="sp-profile-intro__body">{view.description || view.header}</p>
          ) : null}
          {view.tracks.length > 0 ? (
            <div className="sp-pills" {...sectionProps("territorio", "tracks")}>
              {view.tracks.map(t => (
                <span
                  key={t.name}
                  className="sp-pill"
                  style={{ borderColor: t.color, color: t.color, background: `${t.color}12` }}
                >
                  {t.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.icon} alt="" loading="lazy" decoding="async" />
                  ) : null}
                  {t.name}
                </span>
              ))}
            </div>
          ) : null}
          {view.image2 || view.image1 ? (
            <figure className="sp-profile-intro__media" {...sectionProps("media", "image2")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.image2 || view.image1} alt="" loading="lazy" decoding="async" />
            </figure>
          ) : null}
          {view.impacto ? (
            <div className="sp-impact-statement" {...sectionProps("narrativa", "impacto")}>
              <span className="sp-impact-statement__icon" aria-hidden="true" />
              <p>{view.impacto}</p>
            </div>
          ) : null}
        </section>
      )}

      {showTerritoryPlaceholder ? (
        <section className="sp-block sp-edit-empty-section" {...sectionProps("territorio")}>
          <span>Territorio</span>
          <h3>{activeFieldLabel ?? "Ubicación y tracks"}</h3>
          <p>Este bloque aparecerá cuando agregues país, sitio web o tracks.</p>
        </section>
      ) : null}

      {showNarrativePlaceholder ? (
        <section className="sp-block sp-edit-empty-section" {...sectionProps("narrativa")}>
          <span>Narrativa</span>
          <h3>{activeFieldLabel ?? "Historia e impacto"}</h3>
          <p>Este bloque aparecerá cuando agregues descripción, impacto o media de apoyo.</p>
        </section>
      ) : null}

      {proofCards.length > 0 ? (
        <section className="sp-block sp-proof-section" {...sectionProps("traccion")}>
          <h3 className="sp-section-title" data-reveal>
            INFO ADICIONAL
          </h3>
          <div className="sp-proof-grid">
            {proofCards.map(card => {
              const dataField = `data${card.index + 1}`;
              const imageField = `dataImage${card.index + 1}`;
              const cardField = activeFieldId === imageField ? imageField : dataField;
              return (
                <article
                  className={`sp-proof-card ${card.image ? "has-image" : ""} ${card.body === "Pendiente" ? "is-empty" : ""}`}
                  key={`${card.title}-${card.index}`}
                  data-proof-card
                  {...sectionProps("traccion", cardField)}
                >
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.image} alt="" loading="lazy" decoding="async" data-proof-media {...sectionProps("traccion", imageField)} />
                  ) : null}
                  <div className="sp-proof-card__copy">
                    <span>{String(card.index + 1).padStart(2, "0")}</span>
                    <h4>{card.title}</h4>
                    {card.body ? <p>{card.body}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : showTractionPlaceholder ? (
        <section className="sp-block sp-edit-empty-section" {...sectionProps("traccion")}>
          <span>Tracción</span>
          <h3>{activeFieldLabel ?? "Datos de impacto"}</h3>
          <p>Este bloque aparecerá cuando agregues datos o imágenes de evidencia.</p>
        </section>
      ) : null}

      {view.galleryImages.length > 0 ? (
        <section className="sp-gallery-strip" data-reveal {...sectionProps("media", activeFieldId && activeFieldId.startsWith("image") ? activeFieldId : "image2")}>
          {view.galleryImages.map((image, index) => (
            <figure
              className={`sp-gallery-strip__item sp-gallery-strip__item--${(index % 6) + 1}`}
              key={`${image.src}-${index}`}
              data-gallery-card
              {...sectionProps("media", image.field)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt="" loading="lazy" decoding="async" data-gallery-media />
              <figcaption>{image.label}</figcaption>
            </figure>
          ))}
        </section>
      ) : null}

      {videoRender ? (
        <section className="sp-block sp-video" data-reveal {...sectionProps("media", "video")}>
          <h3 className="sp-section-title">VIDEO</h3>
          {videoRender.type === "file" ? (
            <video className="sp-video__player" src={videoRender.url} controls playsInline preload="metadata" />
          ) : null}
          {videoRender.type === "embed" ? (
            <iframe
              className="sp-video__frame"
              src={videoRender.url}
              title={`Video de ${view.name}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : null}
          {videoRender.type === "link" ? (
            <a className="sp-video__link" href={videoRender.url} target="_blank" rel="noreferrer">
              Abrir video
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </section>
      ) : null}

      {(view.quote || view.quoteInfo) ? (
        <section className="sp-block sp-quote" data-reveal {...sectionProps("voz")}>
          {view.quote ? <p className="sp-quote__text">&ldquo;{view.quote}&rdquo;</p> : null}
          {view.quoteInfo ? (
            <div className="sp-quote__name">
              <p>{view.quoteInfo.name}</p>
              {view.quoteInfo.role ? <small>{view.quoteInfo.role}</small> : null}
            </div>
          ) : null}
          {view.quotePhoto ? (
            <div className="sp-quote__photo" {...sectionProps("media", "quotePhoto")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.quotePhoto} alt="" loading="lazy" decoding="async" />
            </div>
          ) : null}
        </section>
      ) : showVoicePlaceholder ? (
        <section className="sp-block sp-edit-empty-section" {...sectionProps("voz")}>
          <span>Voz</span>
          <h3>{activeFieldLabel ?? "Quote del equipo"}</h3>
          <p>Este bloque aparecerá cuando agregues una frase, firma o foto del equipo.</p>
        </section>
      ) : null}

      {view.website ? (
        <section className="sp-block sp-visit" data-reveal {...sectionProps("territorio", "website")}>
          <h3 className="sp-section-title">VISÍTANOS</h3>
          <a
            className="sp-visit__cta"
            href={ensureUrl(view.website)}
            target="_blank"
            rel="noreferrer"
          >
            <span>Ir al sitio web</span>
            <span aria-hidden="true">↗</span>
          </a>
        </section>
      ) : null}

      {reelEnabled && (reelHintDirection === "previous" ? previousStartup : nextStartup) ? (
        <div
          className={[
            "sp-reel-hint",
            `sp-reel-hint--${reelHintDirection}`,
            reelHintActive ? "is-visible" : ""
          ].join(" ")}
          aria-hidden={!reelHintActive}
        >
          <span className="sp-reel-hint__label">
            {reelHintDirection === "previous" ? "Empuja hacia arriba" : "Empuja hacia abajo"}
          </span>
          <span className="sp-reel-hint__bar" aria-hidden="true">
            <span
              className="sp-reel-hint__fill"
              style={{ transform: `scaleX(${reelHintProgress})` }}
            />
          </span>
          <span className="sp-reel-hint__name">
            <span className="sp-reel-hint__arrow" aria-hidden="true">
              {reelHintDirection === "previous" ? "↑" : "↓"}
            </span>
            {(reelHintDirection === "previous" ? previousStartup : nextStartup)?.name}
          </span>
        </div>
      ) : null}

      {transitionActive && reelEnabled && transitionStartup ? (
        <div
          className={`sp-reel-transition sp-reel-transition--${transitionDirection}`}
          aria-live="polite"
          aria-label={`Abriendo ${transitionStartup.name}`}
        >
          {transitionStartup.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="sp-reel-transition__media" src={transitionStartup.image} alt="" />
          ) : null}
          <div className="sp-reel-transition__veil" aria-hidden="true" />
          <div className="sp-reel-transition__copy">
            <span>{transitionDirection === "previous" ? "Startup anterior" : "Siguiente startup"}</span>
            <strong>{transitionStartup.name}</strong>
          </div>
        </div>
      ) : null}
    </div>
  );
}
