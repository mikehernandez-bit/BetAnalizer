import { matches, isMatchExpired } from "@/data/matches";
import { MatchesExplorer } from "@/components/matches/matches-explorer";

export default async function PartidosPage(props: PageProps<"/partidos">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";

  const activeMatches = matches.filter((m) => !isMatchExpired(m));
  const sorted = [...activeMatches].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));

  return (
    <div className="space-y-6">
      <MatchesExplorer matches={sorted} initialSearch={q} />
    </div>
  );
}
