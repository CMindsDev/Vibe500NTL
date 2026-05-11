import { StartupExplorer } from "@/components/StartupExplorer";
import { getExplorerStartups } from "@/lib/startup-data";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const startups = await getExplorerStartups();
  // Preload the first batch of cover images so they're in cache by the time
  // the looping scroller mounts. React 19 hoists these <link> tags to <head>.
  const preloadCovers = Array.from(
    new Set(startups.slice(0, 6).map(s => s.image).filter(Boolean))
  );

  return (
    <>
      {preloadCovers.map(src => (
        <link
          key={src}
          rel="preload"
          as="image"
          href={src}
          fetchPriority={src === preloadCovers[0] ? "high" : "auto"}
        />
      ))}
      <StartupExplorer startups={startups} />
    </>
  );
}
