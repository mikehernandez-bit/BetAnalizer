import { MarketEvaluation } from "@/types";
import { MarketsBrowser } from "@/components/markets/markets-browser";

export function MarketsTab({ markets, matchLabel }: { markets: MarketEvaluation[]; matchLabel?: string }) {
  return <MarketsBrowser markets={markets} matchLabel={matchLabel} />;
}
