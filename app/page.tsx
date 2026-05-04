import { StartupExplorer } from "@/components/StartupExplorer";
import { startups } from "@/lib/startups";

export default function Home() {
  return <StartupExplorer startups={startups} />;
}
