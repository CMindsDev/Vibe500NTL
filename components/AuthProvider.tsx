"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from "react";
import type { AuthStartup, AuthUser } from "@/lib/types";

const AUTH_STORAGE_KEY = "ntl500.auth.user";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  hasGoogleClientId: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const authChangeEvent = "ntl500-auth-change";

function getStoredAuthSnapshot() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

function subscribeToAuthChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(authChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(authChangeEvent, onStoreChange);
  };
}

function parseStoredUser(value: string | null): AuthUser | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<AuthUser>;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    const memberships = Array.isArray(parsed.memberships)
      ? parsed.memberships.filter(isStoredStartup)
      : [];

    const activeStartup = isStoredStartup(parsed.activeStartup)
      ? parsed.activeStartup
      : memberships[0];

    return {
      id: parsed.id,
      googleSub: typeof parsed.googleSub === "string" ? parsed.googleSub : undefined,
      name: parsed.name,
      email: parsed.email,
      picture: typeof parsed.picture === "string" ? parsed.picture : undefined,
      activeStartup,
      memberships,
      needsStartupOnboarding: memberships.length === 0
    };
  } catch {
    return null;
  }
}

function isStoredStartup(value: unknown): value is AuthStartup {
  if (!value || typeof value !== "object") return false;
  const startup = value as Partial<AuthStartup>;

  return (
    typeof startup.id === "string" &&
    typeof startup.name === "string" &&
    typeof startup.slug === "string" &&
    (startup.role === "OWNER" || startup.role === "GUEST")
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const hasGoogleClientId = Boolean(clientId);
  const storedAuth = useSyncExternalStore(
    subscribeToAuthChanges,
    getStoredAuthSnapshot,
    () => null
  );
  const user = useMemo(() => parseStoredUser(storedAuth), [storedAuth]);

  const login = useCallback((nextUser: AuthUser) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    window.dispatchEvent(new Event(authChangeEvent));
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event(authChangeEvent));
  }, []);

  const value = useMemo(
    () => ({ user, ready: true, hasGoogleClientId, login, logout }),
    [hasGoogleClientId, login, logout, user]
  );

  const tree = <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

  if (!hasGoogleClientId) return tree;

  return <GoogleOAuthProvider clientId={clientId!}>{tree}</GoogleOAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
