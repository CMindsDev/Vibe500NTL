"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { Startup } from "@/lib/startups";
import type { AuthUser } from "@/lib/types";
import { useAuth } from "./AuthProvider";

type LoginModalProps = {
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  previewStartups: Startup[];
  redirectAfterLogin?: string;
  initialUser?: AuthUser | null;
};

const fallbackPreviewImages = ["/assets/01.webp", "/assets/04.webp", "/assets/06.webp"];

type GoogleProfile = {
  sub?: string;
  name?: string;
  given_name?: string;
  email?: string;
  picture?: string;
};

type GoogleProfilePayload = {
  googleSub?: string;
  name: string;
  email: string;
  picture?: string;
};

type StartupMode = "create" | "join";
type AuthStage = "idle" | "google" | "profile" | "session" | "ready";

const authStageCopy: Record<Exclude<AuthStage, "idle">, { title: string; detail: string }> = {
  google: {
    title: "Abriendo Google",
    detail: "Confirma tu cuenta en la ventana segura."
  },
  profile: {
    title: "Leyendo perfil",
    detail: "Validando nombre, correo y foto."
  },
  session: {
    title: "Activando sesión",
    detail: "Sincronizando tu cuenta con 500."
  },
  ready: {
    title: "Cuenta lista",
    detail: "Todo quedó conectado correctamente."
  }
};

export function LoginModal({ onClose, onSuccess, previewStartups, redirectAfterLogin, initialUser = null }: LoginModalProps) {
  const router = useRouter();
  const { hasGoogleClientId, login } = useAuth();
  const [error, setError] = useState("");
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(initialUser);
  const [authStage, setAuthStage] = useState<AuthStage>("idle");
  const authIsWorking = authStage === "google" || authStage === "profile" || authStage === "session";
  const previewCards =
    previewStartups.length > 0
      ? previewStartups.slice(0, 3).map(startup => ({
          id: startup.id,
          image: startup.image,
          alt: startup.name
        }))
      : fallbackPreviewImages.map((image, index) => ({
          id: `fallback-${index}`,
          image,
          alt: ""
        }));

  async function handleGoogleProfile(profile: GoogleProfilePayload) {
    setError("");
    setAuthStage("session");

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = (await response.json()) as { user?: AuthUser; error?: string };

      if (!response.ok || !data.user) throw new Error(data.error ?? "No se pudo iniciar sesión");

      if (data.user.needsStartupOnboarding || !data.user.activeStartup) {
        login(data.user);
        setPendingUser(data.user);
        setAuthStage("ready");
        return;
      }

      setAuthStage("ready");
      await new Promise(resolve => window.setTimeout(resolve, 260));
      onSuccess(data.user);
    } catch (profileError) {
      setAuthStage("idle");
      setError(profileError instanceof Error ? profileError.message : "No se pudo iniciar sesión");
    }
  }

  function openStartupOnboarding(mode: StartupMode) {
    if (!pendingUser) return;
    login(pendingUser);
    const redirectTarget = redirectAfterLogin ?? "/studio";
    router.push(`/onboarding?mode=${mode}&redirect=${encodeURIComponent(redirectTarget)}`);
    onClose();
  }

  function continueExploring() {
    // Stay on whatever page the modal was opened from.
    onClose();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      className="auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => {
        if (!authIsWorking) onClose();
      }}
      role="presentation"
    >
      <motion.div
        className={["auth-card", pendingUser ? "auth-card--wide" : "", authIsWorking ? "is-auth-working" : ""].join(" ")}
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 14, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button className="auth-close" type="button" onClick={onClose} aria-label="Cerrar" disabled={authIsWorking}>
          <span />
          <span />
        </button>

        <div className="auth-logo" aria-hidden="true">
          <Image src="/assets/programs-logos/500.svg" alt="" width={96} height={40} priority />
        </div>

        {pendingUser ? (
          <>
            <div className="auth-ready-strip" role="status">
              <span className="auth-ready-strip__mark" aria-hidden="true" />
              Sesión iniciada
            </div>
            <h2 id="auth-title" className="auth-title">
              Cuenta <span className="auth-title__accent">lista</span>
            </h2>
            <p className="auth-subtitle auth-subtitle--wide">
              Todavía no hay una startup asociada. Puedes explorar la plataforma o configurar el perfil de una startup.
            </p>

            <div className="auth-gateway" aria-label="Siguientes pasos">
              <button type="button" className="auth-gateway__option auth-gateway__option--primary" onClick={() => openStartupOnboarding("create")}>
                <span>Crear startup</span>
                <small>Construir un perfil nuevo desde cero.</small>
              </button>
              <button type="button" className="auth-gateway__option" onClick={() => openStartupOnboarding("join")}>
                <span>Vincular una existente</span>
                <small>Buscar una startup ya registrada y asociarte.</small>
              </button>
              <button type="button" className="auth-gateway__ghost" onClick={continueExploring}>
                Ir a explorar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="auth-preview" aria-hidden="true">
              {previewCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className="auth-preview__card"
                  initial={{ y: 18, opacity: 0, rotate: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    rotate: index === 0 ? -10 : index === 2 ? 10 : 0
                  }}
                  transition={{ duration: 0.5, delay: 0.18 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={card.image} alt={card.alt} fill sizes="120px" />
                </motion.div>
              ))}
            </div>

            <h2 id="auth-title" className="auth-title">
              Te damos la <span className="auth-title__accent">bienvenida</span>
            </h2>
            <p className="auth-subtitle">Inicia sesión con Google para asociarte a una startup.</p>

            <AnimatePresence>
              {authStage !== "idle" ? (
                <motion.div
                  key={authStage}
                  className={["auth-progress", `auth-progress--${authStage}`].join(" ")}
                  role="status"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="auth-progress__mark" aria-hidden="true">
                    <span />
                  </span>
                  <span>
                    <strong>{authStageCopy[authStage].title}</strong>
                    <small>{authStageCopy[authStage].detail}</small>
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="auth-social">
              {hasGoogleClientId ? (
                <GoogleOAuthButton
                  stage={authStage}
                  onStageChange={setAuthStage}
                  onProfile={handleGoogleProfile}
                  onError={message => {
                    setAuthStage("idle");
                    setError(message);
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="auth-social__btn auth-social__btn--google"
                  aria-label="Continuar con Google"
                  disabled
                >
                  <GoogleIcon />
                </button>
              )}
            </div>

            {!hasGoogleClientId ? (
              <p className="auth-footer auth-footer__error">Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID.</p>
            ) : null}
          </>
        )}

        {error ? <p className="auth-footer auth-footer__error">{error}</p> : null}
        {!pendingUser ? (
          <p className="auth-footer">
            Tu usuario queda separado del perfil público de la startup.
          </p>
        ) : null}
      </motion.div>
    </motion.div>,
    document.body
  );
}

function GoogleOAuthButton({
  stage,
  onStageChange,
  onProfile,
  onError
}: {
  stage: AuthStage;
  onStageChange: (stage: AuthStage) => void;
  onProfile: (profile: GoogleProfilePayload) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const login = useGoogleLogin({
    onSuccess: async response => {
      try {
        if (!response.access_token) throw new Error("Missing access token");
        onStageChange("profile");

        const profileResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${response.access_token}` } }
        );

        if (!profileResponse.ok) throw new Error("Profile request failed");

        const profile = (await profileResponse.json()) as GoogleProfile;
        if (!profile.email) throw new Error("Missing profile email");

        await onProfile({
          googleSub: profile.sub,
          name: profile.name || profile.given_name || profile.email.split("@")[0],
          email: profile.email,
          picture: profile.picture
        });
      } catch {
        onError("No se pudo leer tu perfil de Google. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
      onStageChange("idle");
      onError("No se pudo iniciar sesión con Google.");
    },
    scope: "openid email profile"
  });

  return (
    <button
      type="button"
      className={["auth-social__btn", "auth-social__btn--google", loading ? "is-loading" : ""].join(" ")}
      aria-label="Continuar con Google"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        onStageChange("google");
        onError("");
        login();
      }}
    >
      <span className="auth-social__icon">
        <GoogleIcon />
      </span>
      <span className="auth-social__label">
        {loading ? authStageCopy[stage === "idle" ? "google" : stage].title : "Continuar con Google"}
      </span>
      {loading ? <span className="auth-social__spinner" aria-hidden="true" /> : null}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.96h5.52c-.24 1.44-1.68 4.2-5.52 4.2-3.36 0-6.12-2.76-6.12-6.24 0-3.48 2.76-6.24 6.12-6.24 1.92 0 3.24.84 3.96 1.56l2.7-2.64C16.92 3.24 14.64 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.64 0 9.36-3.96 9.36-9.6 0-.6-.06-1.2-.16-1.8H12z"
      />
    </svg>
  );
}
