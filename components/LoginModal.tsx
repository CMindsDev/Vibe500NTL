"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import type { Startup } from "@/lib/startups";
import type { AuthUser } from "@/lib/types";

type LoginModalProps = {
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  previewStartups: Startup[];
};

const SAMPLE_STARTUP = "RushFrame";

export function LoginModal({ onClose, onSuccess, previewStartups }: LoginModalProps) {
  const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const [email, setEmail] = useState("");

  const handleEmailLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    onSuccess({
      name: email.split("@")[0].replace(/[^a-zA-Z]/g, "") || "Founder",
      email,
      startup: SAMPLE_STARTUP
    });
  };

  return (
    <motion.div
      className="auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        className="auth-card"
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 14, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button className="auth-close" type="button" onClick={onClose} aria-label="Cerrar">
          <span />
          <span />
        </button>

        <div className="auth-logo" aria-hidden="true">
          <Image src="/assets/programs-logos/500.svg" alt="" width={96} height={40} priority />
        </div>

        <div className="auth-preview" aria-hidden="true">
          {previewStartups.slice(0, 3).map((startup, index) => (
            <motion.div
              key={startup.id}
              className="auth-preview__card"
              initial={{ y: 18, opacity: 0, rotate: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                rotate: index === 0 ? -10 : index === 2 ? 10 : 0
              }}
              transition={{ duration: 0.5, delay: 0.18 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image src={startup.image} alt="" fill sizes="120px" />
            </motion.div>
          ))}
        </div>

        <h2 id="auth-title" className="auth-title">
          Te damos la <span className="auth-title__accent">bienvenida</span>
        </h2>
        <p className="auth-subtitle">Inicia sesión con tu cuenta de startups</p>

        <form className="auth-form" onSubmit={handleEmailLogin}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            aria-label="Email"
            autoComplete="email"
          />
          <button className="auth-cta" type="submit">
            INICIA SESIÓN
          </button>
        </form>

        <div className="auth-divider" aria-hidden="true">
          ó
        </div>

        <div className="auth-social">
          <button
            type="button"
            className="auth-social__btn auth-social__btn--facebook"
            aria-label="Continuar con Facebook"
            onClick={() =>
              onSuccess({
                name: "Bryan",
                email: "bryan@cminds.co",
                picture: "/assets/01.webp",
                startup: SAMPLE_STARTUP
              })
            }
          >
            <FacebookIcon />
          </button>

          {hasGoogleClientId ? (
            <GoogleOAuthButton onSuccess={onSuccess} />
          ) : (
            <button
              type="button"
              className="auth-social__btn auth-social__btn--google"
              aria-label="Continuar con Google"
              onClick={() =>
                onSuccess({
                  name: "Bryan",
                  email: "bryan@cminds.co",
                  picture: "/assets/01.webp",
                  startup: SAMPLE_STARTUP
                })
              }
            >
              <GoogleIcon />
            </button>
          )}

          <button
            type="button"
            className="auth-social__btn auth-social__btn--apple"
            aria-label="Continuar con Apple"
            onClick={() =>
              onSuccess({
                name: "Bryan",
                email: "bryan@cminds.co",
                picture: "/assets/01.webp",
                startup: SAMPLE_STARTUP
              })
            }
          >
            <AppleIcon />
          </button>
        </div>

        <p className="auth-footer">
          ¿AÚN NO TIENES UNA CUENTA?{" "}
          <a href="#empezar" className="auth-footer__link">
            EMPIEZA AHORA
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}

function GoogleOAuthButton({ onSuccess }: { onSuccess: (user: AuthUser) => void }) {
  const login = useGoogleLogin({
    onSuccess: async response => {
      try {
        const profileResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${response.access_token}` } }
        );
        const profile = await profileResponse.json();
        onSuccess({
          name: profile.given_name || profile.name || "Founder",
          email: profile.email,
          picture: profile.picture,
          startup: SAMPLE_STARTUP
        });
      } catch {
        onSuccess({
          name: "Founder",
          email: "",
          startup: SAMPLE_STARTUP
        });
      }
    },
    onError: () => undefined
  });

  return (
    <button
      type="button"
      className="auth-social__btn auth-social__btn--google"
      aria-label="Continuar con Google"
      onClick={() => login()}
    >
      <GoogleIcon />
    </button>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="#fff"
        d="M13.5 21v-7.5h2.4l.4-3h-2.8V8.7c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H8v3h2.4V21h3.1z"
      />
    </svg>
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

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="#fff"
        d="M16.7 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2-.05 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8-.05 0-2.5-1-2.7-3.8zM14.4 5.4c.6-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.3z"
      />
    </svg>
  );
}
