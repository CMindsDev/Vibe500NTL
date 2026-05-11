"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Startup } from "@/lib/startups";
import type { AuthUser } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import { LoginModal } from "./LoginModal";

type AuthControlsProps = {
  previewStartups?: Startup[];
  redirectAfterLogin?: string;
};

type StartupNavItemProps = {
  active?: boolean;
};

type SessionNotice = {
  id: number;
  tone: "loading" | "success" | "exit";
  title: string;
  detail: string;
};

export function StartupNavItem({ active = false }: StartupNavItemProps) {
  const { user } = useAuth();
  const activeStartup = user?.activeStartup;

  if (!activeStartup) return null;

  return (
    <Link
      className={["nav-item", "nav-item--startup", active ? "is-active" : ""].join(" ")}
      href={`/startup/${activeStartup.id}`}
    >
      <span>{activeStartup.name}</span>
    </Link>
  );
}

export function AuthControls({ previewStartups = [], redirectAfterLogin }: AuthControlsProps) {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [authBusy, setAuthBusy] = useState<"login" | "logout" | null>(null);
  const [sessionNotice, setSessionNotice] = useState<SessionNotice | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const actionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      if (actionTimerRef.current) window.clearTimeout(actionTimerRef.current);
    };
  }, []);

  function showSessionNotice(nextNotice: Omit<SessionNotice, "id">, duration = 1700) {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    setSessionNotice({ ...nextNotice, id: Date.now() });
    noticeTimerRef.current = window.setTimeout(() => setSessionNotice(null), duration);
  }

  function handleAuthAction() {
    setLoginOpen(true);
  }

  function handleSuccess(authUser: AuthUser) {
    setAuthBusy("login");
    showSessionNotice(
      {
        tone: "loading",
        title: "Activando sesión",
        detail: "Sincronizando cuenta y startup."
      },
      2400
    );

    actionTimerRef.current = window.setTimeout(() => {
      login(authUser);
      setLoginOpen(false);
      setAuthBusy(null);
      showSessionNotice(
        {
          tone: "success",
          title: "Sesión iniciada",
          detail: `Hola, ${authUser.name.split(" ")[0] || "bienvenido"}.`
        },
        1900
      );

      // Stay where you are after login — no redirect.
    }, 320);
  }

  function handleLogout() {
    if (authBusy) return;

    setAuthBusy("logout");
    showSessionNotice(
      {
        tone: "loading",
        title: "Cerrando sesión",
        detail: "Guardando el cambio de cuenta."
      },
      2400
    );

    actionTimerRef.current = window.setTimeout(() => {
      logout();
      router.push("/");
      setAuthBusy(null);
      showSessionNotice(
        {
          tone: "exit",
          title: "Sesión cerrada",
          detail: "Volviste al modo exploración."
        },
        1900
      );
    }, 560);
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {user ? (
          <UserBadge
            key="badge"
            user={user}
            setupHref={`/onboarding?mode=create&redirect=${encodeURIComponent(redirectAfterLogin ?? "/studio")}`}
            busy={authBusy === "logout"}
            onLogout={handleLogout}
          />
        ) : (
          <motion.button
            key="login"
            type="button"
            className={["login-button", authBusy === "login" ? "is-busy" : ""].join(" ")}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleAuthAction}
            disabled={authBusy === "login"}
          >
            {authBusy === "login" ? <span className="login-button__spinner" aria-hidden="true" /> : null}
            {authBusy === "login" ? "Entrando..." : "Iniciar Sesión"}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loginOpen ? (
          <LoginModal
            key="login-modal"
            previewStartups={previewStartups}
            redirectAfterLogin={redirectAfterLogin}
            initialUser={user && !user.activeStartup ? user : null}
            onClose={() => setLoginOpen(false)}
            onSuccess={handleSuccess}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {sessionNotice ? <SessionFeedback key={sessionNotice.id} notice={sessionNotice} /> : null}
      </AnimatePresence>
    </>
  );
}

function UserBadge({
  user,
  setupHref,
  busy,
  onLogout
}: {
  user: AuthUser;
  setupHref: string;
  busy: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const label = user.name || user.email;
  const initial = label.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <motion.div
      className="user-badge"
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.92, x: 8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.92, x: 8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className={["user-badge__inner", busy ? "is-busy" : ""].join(" ")}
        onClick={() => setOpen(current => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-busy={busy}
        aria-label={`Cuenta personal de ${user.email}`}
        disabled={busy}
      >
        <span className="user-badge__avatar">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.picture} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="user-badge__initial">{initial}</span>
          )}
        </span>
        <span className="user-badge__name">{label}</span>
        <span className="user-badge__chevron" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="account-menu"
            className="user-menu"
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="user-menu__identity">
              <span className="user-menu__avatar" aria-hidden="true">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.picture} alt="" referrerPolicy="no-referrer" />
                ) : (
                  initial
                )}
              </span>
              <span>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </span>
            </div>
            <Link className="user-menu__item" href="/perfil" role="menuitem" onClick={() => setOpen(false)}>
              Ver perfil personal
            </Link>
            {!user.activeStartup ? (
              <Link className="user-menu__item" href={setupHref} role="menuitem" onClick={() => setOpen(false)}>
                Configurar startup
              </Link>
            ) : null}
            <button
              type="button"
              className="user-menu__item user-menu__item--danger"
              role="menuitem"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <span>{busy ? "Cerrando..." : "Cerrar sesión"}</span>
              {busy ? <span className="user-menu__spinner" aria-hidden="true" /> : null}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function SessionFeedback({ notice }: { notice: SessionNotice }) {
  return (
    <motion.div
      className={["session-feedback", `session-feedback--${notice.tone}`].join(" ")}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, x: "-50%", y: -12, scale: 0.96 }}
      animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
      exit={{ opacity: 0, x: "-50%", y: -10, scale: 0.97 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="session-feedback__mark" aria-hidden="true">
        <span />
      </span>
      <span>
        <strong>{notice.title}</strong>
        <small>{notice.detail}</small>
      </span>
    </motion.div>
  );
}
