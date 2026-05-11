"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Horizontal-slide route transition. The previous page unmounts naturally
 * (Next.js behavior) and the new page mounts immediately wrapped in a
 * keyed div whose CSS keyframe animation slides it in from the right with
 * a subtle scale + blur lift. There is no AnimatePresence — no waiting,
 * no gap, no curtain. The first paint is skipped (no entrance) so the
 * site loads normally, and only subsequent navigations trigger the slide.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFirstRef = useRef(true);
  const [token, setToken] = useState(0);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }
    setToken(value => value + 1);
  }, [pathname]);

  return (
    <div
      key={token}
      className={`route-stage${token > 0 ? " route-stage--enter" : ""}`}
    >
      {children}
    </div>
  );
}
