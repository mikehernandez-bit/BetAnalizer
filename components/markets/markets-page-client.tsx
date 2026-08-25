"use client";

import * as React from "react";
import { ArrowLeftRight } from "lucide-react";
import { teams } from "@/data/teams";
import { getMarketById } from "@/data/markets";
import { defaultAnalysisConfig, generateAnalysis } from "@/services/analysis-service";
import { TeamSelector } from "@/components/shared/team-selector";
import { MarketsBrowser } from "@/components/markets/markets-browser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MarketsPageClientProps {
  initialHomeId: string;
  initialAwayId: string;
  initialMarketId?: string;
}

export function MarketsPageClient({ initialHomeId, initialAwayId, initialMarketId }: MarketsPageClientProps) {
  const [homeId, setHomeId] = React.useState(initialHomeId);
  const [awayId, setAwayId] = React.useState(initialAwayId);

  const markets = React.useMemo(() => {
    const analysis = generateAnalysis(defaultAnalysisConfig(homeId, awayId, 15));
    return analysis.markets;
  }, [homeId, awayId]);

  const initialCategory = initialMarketId ? getMarketById(initialMarketId)?.category : undefined;

  function swap() {
    setHomeId(awayId);
    setAwayId(homeId);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Equipo local</p>
            <TeamSelector teams={teams} value={homeId} onChange={setHomeId} excludeId={awayId} />
          </div>
          <Button type="button" variant="outline" size="icon" onClick={swap} className="justify-self-center" aria-label="Intercambiar equipos">
            <ArrowLeftRight className="size-4" />
          </Button>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Equipo visitante</p>
            <TeamSelector teams={teams} value={awayId} onChange={setAwayId} excludeId={homeId} />
          </div>
        </CardContent>
      </Card>

      <MarketsBrowser markets={markets} initialCategory={initialCategory} />
    </div>
  );
}
