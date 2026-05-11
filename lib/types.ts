export type AuthUser = {
  id: string;
  googleSub?: string;
  name: string;
  email: string;
  picture?: string;
  activeStartup?: AuthStartup;
  memberships: AuthStartup[];
  needsStartupOnboarding: boolean;
};

export type StartupRole = "OWNER" | "GUEST";

export type AuthStartup = {
  id: string;
  name: string;
  role: StartupRole;
  slug: string;
  category?: string;
  country?: string;
  image?: string;
};
