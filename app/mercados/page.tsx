import { getFeaturedMatches } from "@/services/match-service";
import { teams } from "@/data/teams";
import { MarketsPageClient } from "@/components/markets/markets-page-client";

export default async function MercadosPage(props: PageProps<"/mercados">) {
  const searchParams = await props.searchParams;
  const marketId = typeof searchParams.market === "string" ? searchParams.market : undefined;

  const featured = getFeaturedMatches(1)[0];
  const homeId = featured?.homeTeamId ?? teams[0].id;
  const awayId = featured?.awayTeamId ?? teams[1].id;

  return <MarketsPageClient initialHomeId={homeId} initialAwayId={awayId} initialMarketId={marketId} />;
}
