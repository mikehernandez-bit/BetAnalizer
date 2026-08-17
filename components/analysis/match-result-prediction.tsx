import { ShieldCheck, Target, Trophy } from "lucide-react";
import { MarketEvaluation, Team } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultOption {
  code: string;
  label: string;
  probability: number;
}

function ResultOptionCard({ option, leading, tone }: { option: ResultOption; leading: boolean; tone: "winner" | "doubleChance" }) {
  const leadingClass = tone === "winner"
    ? "border-brand-green/50 bg-brand-green/10 text-brand-green-bright"
    : "border-brand-blue/50 bg-brand-blue/10 text-brand-blue";

  return (
    <div className={cn("rounded-lg border bg-background/50 px-3 py-2.5", leading ? leadingClass : "border-border")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{option.code}</p>
          <p className="truncate text-xs font-semibold text-foreground" title={option.label}>{option.label}</p>
        </div>
        {leading && <Trophy className={cn("mt-0.5 size-3.5 shrink-0", tone === "winner" ? "text-brand-green-bright" : "text-brand-blue")} />}
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums">{option.probability}%</p>
    </div>
  );
}

/** Resultado 1X2 y doble oportunidad del mismo conjunto de mercados del análisis. */
export function MatchResultPrediction({ markets, home, away }: { markets: MarketEvaluation[]; home: Team; away: Team }) {
  const byId = new Map(markets.map((market) => [market.market.id, market]));
  const homeWin = byId.get("result_home_win");
  const draw = byId.get("result_draw");
  const awayWin = byId.get("result_away_win");
  const doubleChanceHome = byId.get("result_dc_home");
  const doubleChanceAway = byId.get("result_dc_away");

  if (!homeWin || !draw || !awayWin || !doubleChanceHome || !doubleChanceAway) return null;

  const winners: ResultOption[] = [
    { code: "1", label: home.shortName, probability: homeWin.statisticalEstimate },
    { code: "X", label: "Empate", probability: draw.statisticalEstimate },
    { code: "2", label: away.shortName, probability: awayWin.statisticalEstimate },
  ];
  const doubleChances: ResultOption[] = [
    { code: "1X", label: `${home.shortName} o empate`, probability: doubleChanceHome.statisticalEstimate },
    { code: "X2", label: `${away.shortName} o empate`, probability: doubleChanceAway.statisticalEstimate },
  ];
  const winnerLeader = Math.max(...winners.map((option) => option.probability));
  const doubleChanceLeader = Math.max(...doubleChances.map((option) => option.probability));
  const evidenceLabels = homeWin.probabilitySignals?.map((signal) => signal.label) ?? [];

  return (
    <Card className="overflow-hidden border border-brand-green/30 bg-gradient-to-br from-brand-green/10 via-card to-card">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-brand-green-bright">
              <Target className="size-4" />
              <h2 className="text-base font-bold">Resultado previsto</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Probabilidades del análisis estadístico para el resultado final.</p>
          </div>
          <Badge variant="outline" className="border-brand-green/35 bg-brand-green/10 text-[10px] font-semibold text-brand-green-bright">
            {evidenceLabels.length} fuentes revisadas
          </Badge>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.45fr_1fr]">
          <section className="rounded-xl border border-border bg-card/55 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="size-3.5 text-brand-green-bright" />
              <h3 className="text-sm font-semibold">1. Ganador (1X2)</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {winners.map((option) => (
                <ResultOptionCard key={option.code} option={option} leading={option.probability === winnerLeader} tone="winner" />
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card/55 p-3">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-brand-blue" />
              <h3 className="text-sm font-semibold">2. Doble oportunidad</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {doubleChances.map((option) => (
                <ResultOptionCard key={option.code} option={option} leading={option.probability === doubleChanceLeader} tone="doubleChance" />
              ))}
            </div>
          </section>
        </div>

        {evidenceLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {evidenceLabels.map((label) => (
              <span key={label} className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">{label}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
