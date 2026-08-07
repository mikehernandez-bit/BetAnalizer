import { MarketEvaluation } from "@/types";
import { MarketsBrowser } from "@/components/markets/markets-browser";

export function MarketsTab({ markets }: { markets: MarketEvaluation[] }) {
  return <MarketsBrowser markets={markets} />;
}
