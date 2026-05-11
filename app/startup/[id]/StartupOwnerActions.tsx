"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function StartupOwnerActions({ startupId }: { startupId: number }) {
  const { user } = useAuth();
  const membership = user?.memberships.find(m => m.id === String(startupId));
  const isOwner = membership?.role === "OWNER";

  return (
    <div
      className={["startup-public-toolbar", isOwner ? "is-owner" : ""].join(" ")}
      aria-label={isOwner ? "Acciones de tu startup" : "Navegación de startup"}
    >
      <Link href="/" className="startup-public-toolbar__back">
        ← Explorar
      </Link>
      {isOwner ? (
        <Link href="/studio" className="startup-public-toolbar__edit">
          <span className="startup-public-toolbar__icon" aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path d="M3.5 11.8 4 8.6 10.9 1.7a1.6 1.6 0 0 1 2.3 0l1.1 1.1a1.6 1.6 0 0 1 0 2.3L7.4 12l-3.2.5a.6.6 0 0 1-.7-.7Z" />
              <path d="M10 2.8 13.2 6" />
            </svg>
          </span>
          <span className="startup-public-toolbar__copy">
            <strong>Editar perfil</strong>
            <small>Media, tracción y narrativa</small>
          </span>
          <span className="startup-public-toolbar__arrow" aria-hidden="true">↗</span>
        </Link>
      ) : null}
    </div>
  );
}
