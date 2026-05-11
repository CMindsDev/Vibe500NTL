import { OnboardingExperience } from "@/components/OnboardingExperience";
import { getExplorerStartups } from "@/lib/startup-data";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams?: Promise<{
    redirect?: string | string[];
    mode?: string | string[];
  }>;
};

function normalizeRedirect(value: string | string[] | undefined) {
  const redirect = Array.isArray(value) ? value[0] : value;
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) return "/studio";
  return redirect;
}

function normalizeMode(value: string | string[] | undefined) {
  const mode = Array.isArray(value) ? value[0] : value;
  return mode === "join" ? "join" : "create";
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const startups = await getExplorerStartups();

  return (
    <OnboardingExperience
      initialMode={normalizeMode(params?.mode)}
      previewStartups={startups.slice(0, 8)}
      redirectTo={normalizeRedirect(params?.redirect)}
    />
  );
}