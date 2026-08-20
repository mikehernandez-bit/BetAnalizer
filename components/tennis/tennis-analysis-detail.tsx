import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Clock,
  Database,
  Gauge,
  LayoutGrid,
  Medal,
  ShieldAlert,
  Star,
  Swords,
  Target,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { TennisAnalysis, TennisCommonOpponentComparison, TennisHistoryMatch, TennisMarketPrediction, TennisPlayerProfile, TennisSetScore, TennisStoredEvent } from "@/types/tennis";
import { surfaceLabel } from "@/services/tennis-analysis-service";
import { auditTennisMarkets } from "@/lib/tennis-outcomes";
import { AnalysisTabs, type AnalysisTabDef } from "@/components/analysis/analysis-tabs";
import { ComparisonStatCard } from "@/components/shared/comparison-stat-card";
import { ChartContainer } from "@/components/shared/chart-container";
import { RadarComparisonChart } from "@/components/charts/radar-comparison-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TennisDayFilter } from "@/lib/tennis-event-groups";

function initials(name: string): string {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function wonMatch(match: TennisHistoryMatch): boolean {
  if (match.winner) return match.winner === "player";
  return match.sets.filter((set) => set.playerGames > set.opponentGames).length > match.sets.length / 2;
}

function setLabel(set: TennisSetScore): string {
  const pTb = set.playerTiebreakPoints === undefined ? "" : `(${set.playerTiebreakPoints})`;
  const oTb = set.opponentTiebreakPoints === undefined ? "" : `(${set.opponentTiebreakPoints})`;
  return `${set.playerGames}${pTb}-${set.opponentGames}${oTb}`;
}

function PlayerMark({ name, color = "green" }: { name: string; color?: "green" | "blue" }) {
  return (
    <span className={cn(
      "flex size-16 items-center justify-center rounded-full border text-xl font-bold shadow-inner sm:size-20 sm:text-2xl",
      color === "green" ? "border-brand-green/40 bg-brand-green/15 text-brand-green-bright" : "border-brand-blue/40 bg-brand-blue/15 text-brand-blue"
    )}>
      {initials(name)}
    </span>
  );
}

function FormRow({ matches }: { matches: TennisHistoryMatch[] }) {
  return (
    <div className="flex justify-center gap-1">
      {matches.slice(0, 5).map((match) => {
        const won = wonMatch(match);
        return <span key={`${match.date}-${match.opponent}`} className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold", won ? "bg-brand-green/20 text-brand-green-bright" : "bg-brand-red/20 text-brand-red")}>{won ? "G" : "P"}</span>;
      })}
    </div>
  );
}

function actualScore(event: TennisStoredEvent): string {
  if (!event.actualResult) return "—";
  const winnerIsP1 = event.actualResult.winner === event.input.player1.name;
  return event.actualResult.sets.map((set) => winnerIsP1 ? `${set.playerGames}-${set.opponentGames}` : `${set.opponentGames}-${set.playerGames}`).join("  ");
}

function DetailHeader({ event, analysis, returnDay }: { event: TennisStoredEvent; analysis: TennisAnalysis; returnDay: TennisDayFilter }) {
  const p1Probability = analysis.projectedWinner === event.input.player1.name ? analysis.projectedWinnerProbability : 100 - analysis.projectedWinnerProbability;
  const p2Probability = 100 - p1Probability;
  const hit = event.actualResult?.winner === analysis.projectedWinner;
  return (
    <div className="space-y-4">
      <Button asChild variant="ghost"><Link href={`/tenis?day=${returnDay}`}><ArrowLeft /> Volver a encuentros de tenis</Link></Button>
      <Card className="overflow-hidden">
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <span className="flex items-center gap-1.5"><Trophy className="size-4" /> {event.input.tournament}</span>
              <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {event.input.date} · {event.input.time}</span>
              <span className="flex items-center gap-1.5"><CircleDot className="size-4" /> {surfaceLabel(event.input.surface)} · {event.input.round}</span>
            </div>
            <Badge variant={event.status === "completed" ? "secondary" : "outline"}>{event.status === "completed" ? "Finalizado" : "Programado"}</Badge>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <PlayerMark name={event.input.player1.name} />
              <p className="font-semibold">{event.input.player1.name}</p>
              <p className="text-xs text-muted-foreground">Ranking ATP {event.input.player1.ranking ?? "—"}</p>
              <FormRow matches={event.input.player1.matches} />
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Resultado</p>
              <p className="mt-1 text-xl font-bold sm:text-3xl">{actualScore(event)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Mejor de {event.input.bestOf} sets</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <PlayerMark name={event.input.player2.name} color="blue" />
              <p className="font-semibold">{event.input.player2.name}</p>
              <p className="text-xs text-muted-foreground">Ranking ATP {event.input.player2.ranking ?? "—"}</p>
              <FormRow matches={event.input.player2.matches} />
            </div>
          </div>

          <div className="grid gap-3 rounded-xl bg-muted/40 p-4 sm:grid-cols-4">
            <div className="text-center"><p className="text-[11px] text-muted-foreground">Pronóstico prepartido</p><p className="mt-1 text-sm font-semibold text-brand-green-bright">{analysis.projectedWinner}</p></div>
            <div className="text-center"><p className="text-[11px] text-muted-foreground">Probabilidad</p><p className="mt-1 text-sm font-semibold">{analysis.projectedWinnerProbability}%</p></div>
            <div className="text-center"><p className="text-[11px] text-muted-foreground">Muestra procesada</p><p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold"><Database className="size-3.5" /> 40 partidos</p></div>
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Estado / Auditoría</p>
              {event.actualResult ? (
                <p className={cn("mt-1 flex items-center justify-center gap-1 text-sm font-semibold", hit ? "text-brand-green-bright" : "text-brand-red")}>
                  {hit ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                  {hit ? "Ganador acertado" : "Ganador fallado"}
                </p>
              ) : (
                <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-muted-foreground">
                  <Clock className="size-4 text-brand-yellow" /> Por disputar
                </p>
              )}
            </div>
          </div>

          <Card className="border-brand-green/25 bg-brand-green/5">
            <CardContent>
              <div className="flex items-center justify-between gap-4 text-xs font-semibold"><span>{event.input.player1.name} {p1Probability}%</span><span>{event.input.player2.name} {p2Probability}%</span></div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted"><div className="bg-brand-green" style={{ width: `${p1Probability}%` }} /><div className="bg-brand-blue" style={{ width: `${p2Probability}%` }} /></div>
              <p className="mt-2 text-center text-xs text-muted-foreground">La foto prepartido se calculó sin utilizar el resultado final.</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

function Overview({ event, analysis }: { event: TennisStoredEvent; analysis: TennisAnalysis }) {
  const p1 = analysis.profiles.player1;
  const p2 = analysis.profiles.player2;
  const radarData = [
    { metric: "Victorias", teamA: p1.winRate, teamB: p2.winRate },
    { metric: "Superficie", teamA: p1.surfaceWinRate, teamB: p2.surfaceWinRate },
    { metric: "Forma 20", teamA: p1.weightedWinRate, teamB: p2.weightedWinRate },
    { metric: "Sets", teamA: p1.setWinRate, teamB: p2.setWinRate },
    { metric: "Set 1", teamA: p1.firstSetWinRate, teamB: p2.firstSetWinRate },
    { metric: "Set 2", teamA: p1.secondSetWinRate, teamB: p2.secondSetWinRate },
  ];
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <ComparisonStatCard label="Victorias" valueA={p1.winRate} valueB={p2.winRate} teamAName={event.input.player1.name} teamBName={event.input.player2.name} suffix="%" decimals={0} />
      <ComparisonStatCard label={`Victorias en ${surfaceLabel(event.input.surface)}`} valueA={p1.surfaceWinRate} valueB={p2.surfaceWinRate} teamAName={event.input.player1.name} teamBName={event.input.player2.name} suffix="%" decimals={0} />
      <ComparisonStatCard label="Forma ponderada de 20 partidos" valueA={p1.weightedWinRate} valueB={p2.weightedWinRate} teamAName={event.input.player1.name} teamBName={event.input.player2.name} suffix="%" decimals={0} />
      <ComparisonStatCard label="Sets ganados" valueA={p1.setWinRate} valueB={p2.setWinRate} teamAName={event.input.player1.name} teamBName={event.input.player2.name} suffix="%" decimals={0} />
      <ComparisonStatCard label="Primer set ganado" valueA={p1.firstSetWinRate} valueB={p2.firstSetWinRate} teamAName={event.input.player1.name} teamBName={event.input.player2.name} suffix="%" decimals={0} />
      <ComparisonStatCard label="Promedio de juegos" valueA={p1.averageTotalGames} valueB={p2.averageTotalGames} teamAName={event.input.player1.name} teamBName={event.input.player2.name} decimals={1} />
    </div>
    <ChartContainer title="Comparativa de rendimiento" description="Perfil normalizado de los 20 partidos anteriores" height={340}><RadarComparisonChart data={radarData} teamAName={event.input.player1.name} teamBName={event.input.player2.name} /></ChartContainer>
    <Alert><BarChart3 className="text-brand-green" /><AlertTitle>Lectura rápida</AlertTitle><AlertDescription>El pronóstico usa los 20 partidos completos de cada jugador, ponderados del más reciente al más antiguo, y después incorpora la comparación con rivales en común, el H2H prepartido, la superficie y el ranking. El resultado final no participa en el cálculo.</AlertDescription></Alert>
  </div>;
}

function ProfileSummary({ name, profile }: { name: string; profile: TennisPlayerProfile }) {
  const stats = [["Partidos usados", profile.matchesUsed], ["Misma superficie", profile.surfaceMatches], ["Victorias", `${profile.winRate}%`], ["Sets ganados", `${profile.setWinRate}%`], ["Juegos a favor", profile.averageGamesWon], ["Juegos en contra", profile.averageGamesLost]];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{stats.map(([label, value]) => <Card key={label}><CardContent><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p><p className="text-[11px] text-muted-foreground">{name}</p></CardContent></Card>)}</div>;
}

function formatDateShort(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y ? y.slice(2) : ""}`;
}

function HistoryTable({ name, matches, profile }: { name: string; matches: TennisHistoryMatch[]; profile: TennisPlayerProfile }) {
  return (
    <div className="space-y-4">
      <ProfileSummary name={name} profile={profile} />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Últimos 20 juegos: {name}</CardTitle>
              <CardDescription>Visualización idéntica a Flashscore / Scores24 con desglose de sets y tiebreaks.</CardDescription>
            </div>
            <Badge variant="outline">Todas las ligas</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="w-24 px-4 py-2.5 text-left font-medium">Fecha / Torneo</th>
                  <th className="px-4 py-2.5 text-left font-medium">Jugadores</th>
                  <th className="w-12 px-2 py-2.5 text-center font-medium">FT</th>
                  <th className="w-12 px-2 py-2.5 text-center font-medium">1T</th>
                  <th className="w-12 px-2 py-2.5 text-center font-medium">2T</th>
                  <th className="w-12 px-2 py-2.5 text-center font-medium">3T</th>
                  <th className="w-12 px-2 py-2.5 text-center font-medium">4T</th>
                  <th className="w-12 px-2 py-2.5 text-center font-medium">5T</th>
                  <th className="w-14 px-4 py-2.5 text-center font-medium">Res.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {matches.map((item, idx) => {
                  const isHome = item.playerIsHome !== false;
                  const won = wonMatch(item);
                  const playerSetsWon = item.sets.filter((s) => s.playerGames > s.opponentGames).length;
                  const opponentSetsWon = item.sets.filter((s) => s.opponentGames > s.playerGames).length;
                  const topName = isHome ? name : item.opponent;
                  const bottomName = isHome ? item.opponent : name;
                  const topSetsWon = isHome ? playerSetsWon : opponentSetsWon;
                  const bottomSetsWon = isHome ? opponentSetsWon : playerSetsWon;
                  const topWonMatch = isHome ? won : !won;
                  const bottomWonMatch = isHome ? !won : won;

                  return (
                    <tr key={`${item.date}-${item.opponent}-${idx}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 align-middle text-xs">
                        <div className="font-mono font-medium text-foreground">{formatDateShort(item.date)}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{item.tournament ?? surfaceLabel(item.surface)}</div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className={cn("font-medium", topWonMatch ? "text-foreground font-semibold" : "text-muted-foreground")}>
                          {topName}
                        </div>
                        <div className={cn("text-xs", bottomWonMatch ? "text-foreground font-semibold" : "text-muted-foreground")}>
                          {bottomName}
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center align-middle font-mono font-bold">
                        <div className={topWonMatch ? "text-brand-green-bright" : "text-muted-foreground"}>{topSetsWon}</div>
                        <div className={bottomWonMatch ? "text-brand-green-bright" : "text-muted-foreground"}>{bottomSetsWon}</div>
                      </td>
                      {[0, 1, 2, 3, 4].map((setIdx) => {
                        const set = item.sets[setIdx];
                        if (!set) {
                          return (
                            <td key={setIdx} className="px-2 py-3 text-center align-middle font-mono text-xs text-muted-foreground/30">
                              <div>-</div>
                              <div>-</div>
                            </td>
                          );
                        }
                        const topGames = isHome ? set.playerGames : set.opponentGames;
                        const bottomGames = isHome ? set.opponentGames : set.playerGames;
                        const topTb = isHome ? set.playerTiebreakPoints : set.opponentTiebreakPoints;
                        const bottomTb = isHome ? set.opponentTiebreakPoints : set.playerTiebreakPoints;
                        const topWonSet = topGames > bottomGames;

                        return (
                          <td key={setIdx} className="px-2 py-3 text-center align-middle font-mono text-xs">
                            <div className={cn(topWonSet && "font-bold text-foreground")}>
                              {topGames}
                              {topTb !== undefined && (
                                <sup className="ml-0.5 text-[9px] text-muted-foreground">{topTb}</sup>
                              )}
                            </div>
                            <div className={cn(!topWonSet && "font-bold text-foreground")}>
                              {bottomGames}
                              {bottomTb !== undefined && (
                                <sup className="ml-0.5 text-[9px] text-muted-foreground">{bottomTb}</sup>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center align-middle">
                        {item.status === "walkover" ? (
                          <Badge variant="outline" className="text-[10px]">WO</Badge>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm",
                              won ? "bg-emerald-600" : "bg-red-600"
                            )}
                          >
                            {won ? "G" : "D"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MarketGrid({ markets }: { markets: TennisMarketPrediction[] }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[...markets].sort((a,b) => b.probability-a.probability).map((item) => <Card key={item.id} className={cn(item.recommendation === "fuerte" && "ring-brand-green/50")}><CardHeader><div className="flex items-start justify-between gap-2"><div><CardDescription>{item.market}</CardDescription><CardTitle className="mt-1">{item.selection}</CardTitle></div><Badge variant={item.recommendation === "evitar" ? "outline" : "secondary"}>{item.recommendation}</Badge></div></CardHeader><CardContent><div className="grid grid-cols-2 gap-2"><div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Probabilidad</p><p className="text-xl font-bold">{item.probability}%</p></div><div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Confianza</p><p className="text-xl font-bold">{item.confidence}%</p></div></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", item.recommendation === "fuerte" ? "bg-brand-green" : item.recommendation === "moderada" ? "bg-brand-yellow" : "bg-border")} style={{width:`${item.probability}%`}} /></div><ul className="mt-3 space-y-1 text-xs text-muted-foreground">{item.evidence.map((e) => <li key={e}>• {e}</li>)}</ul></CardContent></Card>)}</div>;
}

function MarketAuditGrid({ event, analysis }: { event: TennisStoredEvent; analysis: TennisAnalysis }) {
  if (!event.actualResult) return <Alert><ClipboardCheck /><AlertTitle>Resultado pendiente</AlertTitle><AlertDescription>Registra el resultado final para evaluar las 17 selecciones.</AlertDescription></Alert>;
  const winnerIsPlayer1 = event.actualResult.winner === event.input.player1.name;
  const audits = auditTennisMarkets(analysis, {
    id: event.id,
    winner: event.actualResult.winner,
    score: event.actualResult.sets.map((set) => winnerIsPlayer1 ? `${set.playerGames}-${set.opponentGames}` : `${set.opponentGames}-${set.playerGames}`).join(" "),
    recordedAt: event.input.date,
  });
  const hits = audits.filter((item) => item.status === "hit").length;
  const misses = audits.filter((item) => item.status === "miss").length;
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Card className="border-brand-green/30"><CardContent><p className="text-xs text-muted-foreground">Aciertos</p><p className="mt-1 text-2xl font-bold text-brand-green-bright">{hits}</p></CardContent></Card><Card className="border-brand-red/30"><CardContent><p className="text-xs text-muted-foreground">Fallos</p><p className="mt-1 text-2xl font-bold text-brand-red">{misses}</p></CardContent></Card><Card><CardContent><p className="text-xs text-muted-foreground">Efectividad</p><p className="mt-1 text-2xl font-bold">{Math.round(hits / Math.max(1, hits + misses) * 100)}%</p></CardContent></Card></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{audits.map((item) => <Card key={item.marketId} className={cn(item.status === "hit" ? "border-brand-green/30" : "border-brand-red/30")}><CardContent><div className="flex items-start justify-between gap-2"><p className="text-xs text-muted-foreground">{item.market}</p><Badge className={item.status === "hit" ? "bg-brand-green text-black" : "bg-brand-red text-white"}>{item.status === "hit" ? "Acierto" : "Fallo"}</Badge></div><p className="mt-2 font-semibold">{item.selection}</p><p className="mt-1 text-xs text-muted-foreground">Resultado: {item.actual}</p></CardContent></Card>)}</div></div>;
}

function signed(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

function CommonOpponents({ event, comparisons, advantage }: { event: TennisStoredEvent; comparisons: TennisCommonOpponentComparison[]; advantage: number }) {
  if (!comparisons.length) return <Alert><UsersRound /><AlertTitle>Sin rivales en común</AlertTitle><AlertDescription>No se encontraron coincidencias dentro de los 20 partidos prepartido de cada jugador.</AlertDescription></Alert>;
  const favored = advantage > 0 ? event.input.player1.name : advantage < 0 ? event.input.player2.name : "Empate";
  return <div className="space-y-4"><Alert><UsersRound className="text-brand-blue" /><AlertTitle>{comparisons.length} rival(es) en común detectado(s)</AlertTitle><AlertDescription>Ventaja agregada: {favored}{advantage !== 0 ? ` (${Math.abs(advantage)} puntos)` : ""}. Se comparan victorias, sets y diferencial de juegos con el mismo rival.</AlertDescription></Alert><Card><CardHeader><CardTitle>Comparación directa de rendimiento</CardTitle><CardDescription>Únicamente encuentros anteriores al partido analizado.</CardDescription></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="border-y bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-4 py-3 text-left">Rival común</th><th className="px-4 py-3 text-center" colSpan={3}>{event.input.player1.name}</th><th className="px-4 py-3 text-center" colSpan={3}>{event.input.player2.name}</th><th className="px-4 py-3 text-center">Ventaja</th></tr><tr><th /><th className="px-2 py-2">Partidos</th><th className="px-2 py-2">Victorias</th><th className="px-2 py-2">Dif. juegos</th><th className="px-2 py-2">Partidos</th><th className="px-2 py-2">Victorias</th><th className="px-2 py-2">Dif. juegos</th><th /></tr></thead><tbody className="divide-y divide-border">{comparisons.map((item) => <tr key={item.opponent}><td className="px-4 py-3 font-medium">{item.opponent}</td><td className="px-2 py-3 text-center">{item.player1Matches}</td><td className="px-2 py-3 text-center">{item.player1WinRate}% <span className="text-xs text-muted-foreground">({item.player1SetWinRate}% sets)</span></td><td className="px-2 py-3 text-center tabular-nums">{signed(item.player1GameDifferential)}</td><td className="px-2 py-3 text-center">{item.player2Matches}</td><td className="px-2 py-3 text-center">{item.player2WinRate}% <span className="text-xs text-muted-foreground">({item.player2SetWinRate}% sets)</span></td><td className="px-2 py-3 text-center tabular-nums">{signed(item.player2GameDifferential)}</td><td className={cn("px-4 py-3 text-center font-semibold", item.advantage > 0 ? "text-brand-green-bright" : item.advantage < 0 ? "text-brand-blue" : "")}>{item.advantage > 0 ? event.input.player1.name : item.advantage < 0 ? event.input.player2.name : "Empate"}<span className="block text-xs">{Math.abs(item.advantage)} pts</span></td></tr>)}</tbody></table></div></CardContent></Card></div>;
}

function H2H({ event, analysis }: { event: TennisStoredEvent; analysis: TennisAnalysis }) {
  const h2h = analysis.headToHead;
  return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><Card><CardContent><p className="text-xs text-muted-foreground">H2H prepartido</p><p className="mt-1 text-2xl font-bold">{h2h.matches}</p></CardContent></Card><Card><CardContent><p className="text-xs text-muted-foreground">Victorias {event.input.player1.name}</p><p className="mt-1 text-2xl font-bold">{h2h.player1Wins}</p></CardContent></Card><Card><CardContent><p className="text-xs text-muted-foreground">Victorias {event.input.player2.name}</p><p className="mt-1 text-2xl font-bold">{h2h.player2Wins}</p></CardContent></Card></div><div className="grid gap-4 md:grid-cols-2">{h2h.records.map((record) => <Card key={`${record.date}-${record.tournament}`}><CardHeader><Badge variant="outline" className="mb-2">Prepartido · {surfaceLabel(record.surface)}</Badge><CardTitle>{record.tournament ?? "Torneo"} · {record.date}</CardTitle></CardHeader><CardContent><p className="text-lg font-semibold">Ganó {record.winner}</p><p className="mt-2 font-mono">{record.setsFromPlayer1.map(setLabel).join(" · ")}</p></CardContent></Card>)}{event.actualResult && <Card className="ring-brand-green/30"><CardHeader><Badge className="mb-2 bg-brand-green text-black">Resultado posterior</Badge><CardTitle>{event.input.tournament} · {event.input.date}</CardTitle></CardHeader><CardContent><p className="text-lg font-semibold">Ganó {event.actualResult.winner}</p><p className="mt-2 font-mono">{actualScore(event)}</p></CardContent></Card>}</div><Alert><Swords /><AlertTitle>Separación temporal correcta</AlertTitle><AlertDescription>El modelo utiliza únicamente los {h2h.matches} enfrentamiento(s) anterior(es). El resultado actual aparece como auditoría y no modifica el pronóstico guardado.</AlertDescription></Alert></div>;
}

function Risks({ analysis }: { analysis: TennisAnalysis }) {
  return <div className="space-y-4">{analysis.warnings.map((warning) => <Alert key={warning}><AlertTriangle className="text-brand-yellow" /><AlertTitle>Riesgo detectado</AlertTitle><AlertDescription>{warning}</AlertDescription></Alert>)}<Card><CardHeader><CardTitle>Controles del modelo</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>• Los marcadores exactos nunca se consideran selección fuerte por su alta varianza.</p><p>• Los retiros y walkovers quedan excluidos de probabilidades.</p><p>• El resultado final se almacena fuera de la entrada prepartido.</p><p>• Una probabilidad estadística no garantiza el resultado de un evento deportivo.</p></CardContent></Card></div>;
}

export function TennisAnalysisDetail({ event, analysis, returnDay }: { event: TennisStoredEvent; analysis: TennisAnalysis; returnDay: TennisDayFilter }) {
  const strong = analysis.markets.filter((market) => market.recommendation === "fuerte");
  const icon = "size-3.5";
  const tabs: AnalysisTabDef[] = [
    { value: "resumen", label: "Resumen", icon: <LayoutGrid className={icon} />, content: <Overview event={event} analysis={analysis} /> },
    { value: "player1", label: event.input.player1.name, icon: <UserRound className={icon} />, content: <HistoryTable name={event.input.player1.name} matches={event.input.player1.matches} profile={analysis.profiles.player1} /> },
    { value: "player2", label: event.input.player2.name, icon: <UserRound className={icon} />, content: <HistoryTable name={event.input.player2.name} matches={event.input.player2.matches} profile={analysis.profiles.player2} /> },
    { value: "common", label: `Rivales en común (${analysis.commonOpponents.length})`, icon: <UsersRound className={icon} />, content: <CommonOpponents event={event} comparisons={analysis.commonOpponents} advantage={analysis.commonOpponentAdvantage} /> },
    { value: "h2h", label: `Enfrentamientos directos (${analysis.headToHead.matches})`, icon: <Swords className={icon} />, content: <H2H event={event} analysis={analysis} /> },
    { value: "markets", label: `Mercados (${analysis.markets.length})`, icon: <Target className={icon} />, content: <MarketGrid markets={analysis.markets} /> },
    ...(event.actualResult ? [{ value: "audit", label: `Auditoría (${analysis.markets.length})`, icon: <ClipboardCheck className={icon} />, content: <MarketAuditGrid event={event} analysis={analysis} /> }] : []),
    { value: "best", label: `Mejores mercados (${strong.length})`, icon: <Star className={icon} />, content: strong.length ? <MarketGrid markets={strong} /> : <Alert><Gauge /><AlertTitle>Sin mercados fuertes</AlertTitle><AlertDescription>Ninguna selección alcanzó simultáneamente 70% de probabilidad y 70% de confianza.</AlertDescription></Alert> },
    { value: "risks", label: "Riesgos", icon: <ShieldAlert className={icon} />, content: <Risks analysis={analysis} /> },
  ];
  return <div className="space-y-6"><DetailHeader event={event} analysis={analysis} returnDay={returnDay} /><div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="flex items-center gap-3"><Medal className="size-8 text-brand-green" /><div><p className="text-xs text-muted-foreground">Ganador proyectado</p><p className="font-semibold">{analysis.projectedWinner}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3"><Target className="size-8 text-brand-blue" /><div><p className="text-xs text-muted-foreground">Mercados evaluados</p><p className="font-semibold">{analysis.markets.length}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3"><Star className="size-8 text-brand-yellow" /><div><p className="text-xs text-muted-foreground">Mercados fuertes</p><p className="font-semibold">{strong.length}</p></div></CardContent></Card></div><AnalysisTabs tabs={tabs} defaultValue="resumen" /></div>;
}
