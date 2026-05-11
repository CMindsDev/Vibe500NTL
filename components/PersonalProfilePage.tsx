"use client";

import { type ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AuthUser } from "@/lib/types";
import { AuthControls, StartupNavItem } from "./AuthControls";
import { useAuth } from "./AuthProvider";

function getInitial(value?: string) {
  return value?.trim().charAt(0).toUpperCase() || "U";
}

export function PersonalProfilePage() {
  const { login, user } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = getInitial(user?.name ?? user?.email);
  const memberships = user?.memberships ?? [];

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Sube una imagen válida.");
      return;
    }

    setUploadingPhoto(true);
    setPhotoError("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("scope", "profiles");
      form.append("owner", user.id);

      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: form
      });
      const uploadData = (await uploadResponse.json()) as { url?: string; error?: string };
      if (!uploadResponse.ok || !uploadData.url) {
        throw new Error(uploadData.error ?? "No se pudo subir la imagen");
      }

      const profileResponse = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, picture: uploadData.url })
      });
      const profileData = (await profileResponse.json()) as { user?: AuthUser; error?: string };
      if (!profileResponse.ok || !profileData.user) {
        throw new Error(profileData.error ?? "No se pudo actualizar el perfil");
      }

      login(profileData.user);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "No se pudo actualizar la foto");
    } finally {
      setUploadingPhoto(false);
    }
  }

  return (
    <main className="personal-shell">
      <header className="topbar personal-topbar" aria-label="Navegación principal">
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
          <Link className="nav-item" href="/premio">
            <span>Premio</span>
          </Link>
          <StartupNavItem />
        </nav>
        <div className="topbar-end">
          <AuthControls redirectAfterLogin="/perfil" />
        </div>
      </header>

      <section className="personal-card" aria-label="Perfil personal">
        {user ? (
          <>
            <div className="personal-card__head">
              <div className="personal-photo">
                <span className="personal-avatar" aria-hidden="true">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.picture} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    initial
                  )}
                </span>
                <button
                  type="button"
                  className="personal-photo__button"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingPhoto ? "Subiendo..." : "Cambiar foto"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  hidden
                  onChange={handlePhotoChange}
                />
              </div>
              <div>
                <p className="personal-eyebrow">Perfil personal</p>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
                {photoError ? <p className="personal-photo__error">{photoError}</p> : null}
              </div>
            </div>

            <div className="personal-grid">
              <div>
                <span>Cuenta</span>
                <strong>{user.googleSub ? "Google conectado" : "Sesión local"}</strong>
              </div>
              <div>
                <span>Startups vinculadas</span>
                <strong>{memberships.length}</strong>
              </div>
              <div>
                <span>Startup activa</span>
                <strong>{user.activeStartup?.name ?? "Sin startup activa"}</strong>
              </div>
            </div>

            <div className="personal-list">
              <p className="personal-eyebrow">Accesos de startup</p>
              {memberships.length > 0 ? (
                memberships.map(startup => (
                  <Link className="personal-startup" href="/studio" key={startup.id}>
                    <span>{getInitial(startup.name)}</span>
                    <strong>{startup.name}</strong>
                    <small>{startup.role}</small>
                  </Link>
                ))
              ) : (
                <Link className="personal-startup personal-startup--empty" href="/onboarding?mode=create&redirect=/studio">
                  <span>+</span>
                  <strong>Configurar startup</strong>
                  <small>Onboarding</small>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="personal-empty">
            <p className="personal-eyebrow">Perfil personal</p>
            <h1>Inicia sesión para ver tu cuenta</h1>
            <p>Tu perfil personal vive separado del perfil público de la startup.</p>
            <Link className="personal-cta" href="/">
              Volver a explorar
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
