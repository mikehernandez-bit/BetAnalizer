"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BarChart3, CalendarDays, CheckCircle2, ClipboardCheck, Database, History, PencilLine, Save, Target, Trash2, Trophy, XCircle } from "lucide-react";
import { analyzeTennisMatch, formatTennisHistoryText, parseTennisHistoryText, surfaceLabel, validateTennisInput } from "@/services/tennis-analysis-service";
import type { TennisAnalysis, TennisMarketAuditResult, TennisMatchInput, TennisPlayerProfile, TennisRecordedOutcome, TennisStoredEvent, TennisSurface } from "@/types/tennis";
import { tennisEvents } from "@/data/tennis-events";
import { auditTennisMarkets, summarizeTennisMarketAudits } from "@/lib/tennis-outcomes";
import { compareTennisModels } from "@/lib/tennis-model-evaluation";
import { formatTennisEventDate, groupTennisEventsByDay, type TennisDayFilter } from "@/lib/tennis-event-groups";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "betanalyzer.tennis-analyses.v1";
const OUTCOMES_STORAGE_KEY = "betanalyzer.tennis-outcomes.v1";

const MARKET_LABELS: Record<string, string> = {
  match_winner: "Ganador",
  set_winner: "Ganador del set",
  match_total_games: "Total de juegos",
  total_games_handicap: "Hándicap de juegos",
  match_set_handicap: "Hándicap del partido",
  set_games_handicap: "Hándicap por set",
  set_total_games: "Total por set",
  set_score: "Puntuación del set",
  match_total_sets: "Cantidad de sets",
  both_win_set: "Ambos ganan set",
  correct_set_score: "Marcador correcto",
  player_wins_set: "Jugador gana set",
};

function readSavedAnalyses(): TennisAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeSavedAnalyses(analyses: TennisAnalysis[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses.slice(0, 50)));
}

function readRecordedOutcomes(): Record<string, TennisRecordedOutcome> {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(OUTCOMES_STORAGE_KEY) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeRecordedOutcomes(outcomes: Record<string, TennisRecordedOutcome>) {
  window.localStorage.setItem(OUTCOMES_STORAGE_KEY, JSON.stringify(outcomes));
}

async function readServerOutcomes(): Promise<Record<string, TennisRecordedOutcome>> {
  const response = await fetch("/api/tennis-outcomes", { cache: "no-store" });
  const payload = await response.json() as { success?: boolean; outcomes?: Record<string, TennisRecordedOutcome>; message?: string };
  if (!response.ok || !payload.success || !payload.outcomes) {
    throw new Error(payload.message ?? "No se pudieron cargar los resultados persistidos.");
  }
  return payload.outcomes;
}

async function persistServerOutcomes(outcomes: Record<string, TennisRecordedOutcome>): Promise<void> {
  const response = await fetch("/api/tennis-outcomes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcomes }),
  });
  const payload = await response.json() as { success?: boolean; message?: string };
  if (!response.ok || !payload.success) throw new Error(payload.message ?? "No se pudieron persistir los resultados.");
}

function officialOutcome(event: TennisStoredEvent): TennisRecordedOutcome | undefined {
  if (!event.actualResult) return undefined;
  const winnerIsPlayer1 = event.actualResult.winner === event.input.player1.name;
  return {
    id: event.id,
    winner: event.actualResult.winner,
    score: event.actualResult.sets.map((set) => winnerIsPlayer1
      ? `${set.playerGames}-${set.opponentGames}`
      : `${set.opponentGames}-${set.playerGames}`
    ).join(" "),
    recordedAt: `${event.input.date}T${event.input.time ?? "00:00"}:00`,
  };
}

function PlayerHistoryInput({
  number,
  name,
  setName,
  ranking,
  setRanking,
  history,
  setHistory,
}: {
  number: 1 | 2;
  name: string;
  setName: (value: string) => void;
  ranking: string;
  setRanking: (value: string) => void;
  history: string;
  setHistory: (value: string) => void;
}) {
  const parsed = React.useMemo(() => parseTennisHistoryText(history), [history]);
  const complete = parsed.matches.length === 20 && parsed.errors.length === 0;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Jugador {number}</CardTitle>
            <CardDescription>20 partidos oficiales, del más reciente al más antiguo.</CardDescription>
          </div>
          <Badge variant={complete ? "default" : "outline"} className={complete ? "bg-brand-green text-black" : undefined}>
            {parsed.matches.length}/20 válidos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <div className="space-y-1.5">
            <Label htmlFor={`tennis-player-${number}`}>Nombre del jugador</Label>
            <Input id={`tennis-player-${number}`} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Carlos Alcaraz" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`tennis-ranking-${number}`}>Ranking ATP/WTA</Label>
            <Input id={`tennis-ranking-${number}`} type="number" min="1" value={ranking} onChange={(event) => setRanking(event.target.value)} placeholder="Opcional" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`tennis-history-${number}`}>Historial del jugador {number}</Label>
          <Textarea
            id={`tennis-history-${number}`}
            rows={14}
            value={history}
            onChange={(event) => setHistory(event.target.value)}
            className="scrollbar-thin min-h-72 font-mono text-xs leading-5"
            placeholder={
              "2026-08-10 | Dura | Cincinnati | Rival A | 6-4 3-6 6-2\n" +
              "2026-08-04 | Arcilla | Rival B | 4-6 7-5 6-3\n" +
              "2026-07-29 | Césped | Wimbledon | Rival C | 6(5)-7(7) 6-3 2-1 | RET"
            }
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground">
            Formato: <code>fecha | superficie | torneo opcional | rival | sets | estado opcional</code>. Estados admitidos: RET y WO.
          </p>
        </div>

        {parsed.errors.length > 0 && (
          <div className="max-h-28 overflow-y-auto rounded-lg border border-brand-red/30 bg-brand-red/5 p-3 text-xs text-brand-red">
            {parsed.errors.slice(0, 5).map((error) => <p key={error}>{error}</p>)}
            {parsed.errors.length > 5 && <p>…y {parsed.errors.length - 5} error(es) más.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProfileCard({ name, profile }: { name: string; profile: TennisPlayerProfile }) {
  const stats = [
    ["Victorias", `${profile.winRate}%`],
    ["Misma superficie", `${profile.surfaceWinRate}%`],
    ["Forma ponderada 20", `${profile.weightedWinRate}%`],
    ["Sets ganados", `${profile.setWinRate}%`],
    ["Primer set", `${profile.firstSetWinRate}%`],
    ["Juegos/partido", profile.averageTotalGames.toFixed(1)],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{profile.matchesUsed} partidos finalizados · {profile.surfaceMatches} en la superficie</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AnalysisResult({ analysis }: { analysis: TennisAnalysis }) {
  const orderedMarkets = [...analysis.markets].sort((a, b) => {
    const order = { fuerte: 0, moderada: 1, evitar: 2 };
    return order[a.recommendation] - order[b.recommendation] || b.probability - a.probability;
  });

  return (
    <div className="space-y-5">
      <Card className="border-brand-green/30 bg-gradient-to-br from-brand-green/10 via-card to-card">
        <CardContent className="grid gap-5 pt-1 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Badge className="mb-3 bg-brand-green text-black">Pronóstico principal</Badge>
            <h2 className="text-2xl font-bold">{analysis.projectedWinner}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {analysis.input.player1.name} vs {analysis.input.player2.name} · {analysis.input.tournament} · {surfaceLabel(analysis.input.surface)}
            </p>
          </div>
          <div className="rounded-xl border border-brand-green/30 bg-background/40 px-6 py-4 text-center">
            <p className="text-4xl font-bold text-brand-green-bright">{analysis.projectedWinnerProbability}%</p>
            <p className="text-xs text-muted-foreground">Marcador proyectado: {analysis.projectedScore}</p>
          </div>
        </CardContent>
      </Card>

      {analysis.warnings.map((warning) => (
        <Alert key={warning}>
          <AlertTriangle className="text-brand-yellow" />
          <AlertTitle>Advertencia de muestra</AlertTitle>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      ))}

      <div className="grid gap-4 xl:grid-cols-2">
        <ProfileCard name={analysis.input.player1.name} profile={analysis.profiles.player1} />
        <ProfileCard name={analysis.input.player2.name} profile={analysis.profiles.player2} />
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Mercados de tenis</h3>
            <p className="text-sm text-muted-foreground">Ordenados por recomendación y probabilidad estimada.</p>
          </div>
          <Badge variant="outline">{analysis.markets.filter((item) => item.recommendation === "fuerte").length} fuertes</Badge>
        </div>
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {orderedMarkets.map((item) => (
            <Card key={item.id} className={cn(item.recommendation === "fuerte" && "ring-brand-green/50")}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{MARKET_LABELS[item.category]}</p>
                    <CardTitle className="mt-1">{item.market}</CardTitle>
                  </div>
                  <Badge
                    variant={item.recommendation === "evitar" ? "outline" : "secondary"}
                    className={item.recommendation === "fuerte" ? "bg-brand-green/15 text-brand-green-bright" : undefined}
                  >
                    {item.recommendation}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base font-semibold">{item.selection}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/60 p-2.5"><span className="text-xs text-muted-foreground">Probabilidad</span><p className="font-semibold">{item.probability}%</p></div>
                  <div className="rounded-lg bg-muted/60 p-2.5"><span className="text-xs text-muted-foreground">Confianza</span><p className="font-semibold">{item.confidence}%</p></div>
                </div>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {item.evidence.map((evidence) => <li key={evidence}>• {evidence}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecordTennisResultDialog({
  id,
  player1,
  player2,
  current,
  predictedWinner,
  bestOf,
  onSave,
}: {
  id: string;
  player1: string;
  player2: string;
  current?: TennisRecordedOutcome;
  predictedWinner: string;
  bestOf: 3 | 5;
  onSave: (outcome: TennisRecordedOutcome) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [winner, setWinner] = React.useState(current?.winner ?? "");
  const [score, setScore] = React.useState(current?.score ?? "");
  const scoreTokens = score.trim().split(/\s+/).filter(Boolean);
  const parsedSets = scoreTokens.map((token) => token.match(/^(\d{1,2})(?:\(\d{1,2}\))?-(\d{1,2})(?:\(\d{1,2}\))?$/));
  const requiredSetWins = Math.ceil(bestOf / 2);
  const scoreError = score.trim() && (
    parsedSets.some((set) => !set)
      ? "Usa un marcador válido, por ejemplo: 6-3 4-6 6-2."
      : parsedSets.filter((set) => set && Number(set[1]) > Number(set[2])).length !== requiredSetWins
        ? `El ganador debe haber ganado ${requiredSetWins} sets.`
        : scoreTokens.length < requiredSetWins || scoreTokens.length > bestOf
          ? `El encuentro debe contener entre ${requiredSetWins} y ${bestOf} sets.`
          : ""
  );

  function beginEdit() {
    setWinner(current?.winner ?? "");
    setScore(current?.score ?? "");
  }

  function save() {
    if (!winner || !score.trim() || scoreError) return;
    onSave({ id, winner, score: score.trim(), recordedAt: new Date().toISOString() });
    setOpen(false);
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant={current ? "outline" : "default"} onClick={beginEdit}>{current ? <PencilLine /> : <ClipboardCheck />}{current ? "Corregir resultado" : "Registrar resultado final"}</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>Resultado final</DialogTitle><DialogDescription>Este resultado auditará el pronóstico prepartido: {predictedWinner}. Puedes corregirlo después sin duplicar el partido.</DialogDescription></DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5"><Label>Ganador oficial</Label><Select value={winner} onValueChange={setWinner}><SelectTrigger className="w-full"><SelectValue placeholder="Selecciona el ganador" /></SelectTrigger><SelectContent><SelectItem value={player1}>{player1}</SelectItem><SelectItem value={player2}>{player2}</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label htmlFor={`tennis-score-${id}`}>Marcador final</Label><Input id={`tennis-score-${id}`} value={score} onChange={(event) => setScore(event.target.value)} placeholder="Ej. 6-3 6-4" /><p className="text-xs text-muted-foreground">Escribe los sets desde la perspectiva del ganador.</p>{scoreError && <p className="text-xs text-brand-red">{scoreError}</p>}</div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} disabled={!winner || !score.trim() || Boolean(scoreError)}><Save /> Guardar y auditar los 17 mercados</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

function MarketAuditDialog({ audits }: { audits: TennisMarketAuditResult[] }) {
  const hits = audits.filter((item) => item.status === "hit").length;
  const misses = audits.filter((item) => item.status === "miss").length;
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline"><ClipboardCheck /> Ver auditoría ({audits.length})</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader><DialogTitle>Auditoría de todos los mercados</DialogTitle><DialogDescription>Cada selección prepartido se compara con el marcador final. Resultado: {hits} aciertos y {misses} fallos.</DialogDescription></DialogHeader>
      <div className="grid gap-2 sm:grid-cols-2">
        {audits.map((item) => <div key={item.marketId} className={cn("rounded-lg border p-3", item.status === "hit" ? "border-brand-green/30 bg-brand-green/5" : item.status === "miss" ? "border-brand-red/30 bg-brand-red/5" : "border-border bg-muted/30")}><div className="flex items-start justify-between gap-2"><p className="text-xs text-muted-foreground">{item.market}</p><Badge className={cn(item.status === "hit" ? "bg-brand-green text-black" : item.status === "miss" ? "bg-brand-red text-white" : "")}>{item.status === "hit" ? "Acierto" : item.status === "miss" ? "Fallo" : "Nulo"}</Badge></div><p className="mt-1 font-semibold">{item.selection}</p><p className="mt-1 text-xs text-muted-foreground">Resultado: {item.actual}</p></div>)}
      </div>
    </DialogContent>
  </Dialog>;
}

function StoredEventCard({ event, outcome, returnDay, onLoad, onSaveOutcome }: { event: TennisStoredEvent; outcome?: TennisRecordedOutcome; returnDay: TennisDayFilter; onLoad: (event: TennisStoredEvent) => void; onSaveOutcome: (outcome: TennisRecordedOutcome) => void }) {
  const preview = analyzeTennisMatch(event.input);
  const strongMarkets = preview.markets.filter((market) => market.recommendation === "fuerte").length;
  const hit = outcome?.winner === preview.projectedWinner;
  const result = outcome?.score;
  const completed = Boolean(outcome);
  const marketAudits = outcome ? auditTennisMarkets(preview, outcome) : [];
  const marketHits = marketAudits.filter((item) => item.status === "hit").length;
  const marketMisses = marketAudits.filter((item) => item.status === "miss").length;
  return (
    <Card className="group border-brand-blue/30 bg-gradient-to-br from-brand-blue/10 via-card to-card transition-colors hover:border-brand-green/40">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge className={completed ? "bg-brand-blue text-white" : "bg-brand-green/20 text-brand-green-bright border-brand-green/30"}>
                {completed ? "Evento finalizado" : "Evento programado"}
              </Badge>
              {event.input.round && <Badge variant="outline">{event.input.round}</Badge>}
              <Badge variant="outline">{surfaceLabel(event.input.surface)}</Badge>
            </div>
            <CardTitle>{event.input.player1.name} vs {event.input.player2.name}</CardTitle>
            <CardDescription>{event.input.tournament} · {event.input.date}{event.input.time ? ` · ${event.input.time}` : ""}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href={`/tenis/${event.id}?day=${returnDay}`}>Abrir análisis completo <ArrowRight /></Link></Button>
            <Button variant="outline" onClick={() => onLoad(event)}><BarChart3 /> Cargar en editor</Button>
            <RecordTennisResultDialog id={event.id} player1={event.input.player1.name} player2={event.input.player2.name} current={outcome} predictedWinner={preview.projectedWinner} bestOf={event.input.bestOf} onSave={onSaveOutcome} />
            {outcome && <MarketAuditDialog audits={marketAudits} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl border border-border/70 bg-background/35 p-4 text-center">
          <div>
            <p className="text-lg font-semibold">{event.input.player1.name}</p>
            <p className="text-xs text-muted-foreground">{event.input.player1.ranking ? `Ranking ATP ${event.input.player1.ranking} · ` : ""}{preview.profiles.player1.winRate}% victorias</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{completed ? "Resultado" : "Encuentro"}</p>
            <p className="mt-1 font-mono text-lg font-bold">{result || `${event.input.date}${event.input.time ? ` · ${event.input.time}` : ""}`}</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{event.input.player2.name}</p>
            <p className="text-xs text-muted-foreground">{event.input.player2.ranking ? `Ranking ATP ${event.input.player2.ranking} · ` : ""}{preview.profiles.player2.winRate}% victorias</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Pronóstico prepartido</p><p className="mt-1 font-semibold text-brand-green-bright">{preview.projectedWinner} · {preview.projectedWinnerProbability}%</p></div>
          <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Datos procesados</p><p className="mt-1 flex items-center gap-1 font-semibold"><Database className="size-4" /> 40 partidos</p></div>
          <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Mercados</p><p className="mt-1 flex items-center gap-1 font-semibold"><Target className="size-4" /> {preview.markets.length} evaluados · {strongMarkets} fuertes</p></div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <p className="text-sm text-muted-foreground">{event.note}</p>
        {outcome && (
          <div className={cn("rounded-lg border px-4 py-2 text-sm", hit ? "border-brand-green/30 bg-brand-green/10" : "border-brand-red/30 bg-brand-red/10")}>
            <span className="text-xs text-muted-foreground">Resultado final · Ganador {hit ? "acertado" : "fallado"}</span>
            <p className={cn("font-semibold", hit ? "text-brand-green-bright" : "text-brand-red")}>{outcome.winner} · {result}</p>
            <p className="mt-1 text-xs text-muted-foreground">Todos los mercados: {marketHits} aciertos · {marketMisses} fallos</p>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TennisWorkspace({ initialDay = "today" }: { initialDay?: TennisDayFilter }) {
  const [tab, setTab] = React.useState("events");
  const [eventDayFilter, setEventDayFilter] = React.useState<TennisDayFilter>(initialDay);
  const [tournament, setTournament] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = React.useState("");
  const [round, setRound] = React.useState("");
  const [surface, setSurface] = React.useState<TennisSurface>("hard");
  const [bestOf, setBestOf] = React.useState<3 | 5>(3);
  const [player1Name, setPlayer1Name] = React.useState("");
  const [player2Name, setPlayer2Name] = React.useState("");
  const [player1Ranking, setPlayer1Ranking] = React.useState("");
  const [player2Ranking, setPlayer2Ranking] = React.useState("");
  const [player1History, setPlayer1History] = React.useState("");
  const [player2History, setPlayer2History] = React.useState("");
  const [analysis, setAnalysis] = React.useState<TennisAnalysis>();
  const [saved, setSaved] = React.useState<TennisAnalysis[]>([]);
  const [outcomes, setOutcomes] = React.useState<Record<string, TennisRecordedOutcome>>({});
  const [outcomeSyncError, setOutcomeSyncError] = React.useState<string>();
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSaved(readSavedAnalyses());
      const localOutcomes = readRecordedOutcomes();
      try {
        const serverOutcomes = await readServerOutcomes();
        if (cancelled) return;
        const merged = { ...serverOutcomes, ...localOutcomes };
        setOutcomes(merged);
        writeRecordedOutcomes(merged);
        if (Object.keys(localOutcomes).length) await persistServerOutcomes(localOutcomes);
        if (!cancelled) setOutcomeSyncError(undefined);
      } catch (error) {
        if (cancelled) return;
        setOutcomes(localOutcomes);
        setOutcomeSyncError((error as Error).message);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  function buildInput(): TennisMatchInput {
    const p1 = parseTennisHistoryText(player1History);
    const p2 = parseTennisHistoryText(player2History);
    if (p1.errors.length || p2.errors.length) throw new Error("Corrige las líneas inválidas de ambos historiales antes de analizar.");
    return {
      tournament: tournament.trim(),
      date,
      time: time || undefined,
      round: round || undefined,
      surface,
      bestOf,
      player1: { name: player1Name.trim(), ranking: player1Ranking ? Number(player1Ranking) : undefined, matches: p1.matches },
      player2: { name: player2Name.trim(), ranking: player2Ranking ? Number(player2Ranking) : undefined, matches: p2.matches },
    };
  }

  function handleLoadEvent(event: TennisStoredEvent) {
    const input = event.input;
    setTournament(input.tournament);
    setDate(input.date);
    setTime(input.time ?? "");
    setRound(input.round ?? "");
    setSurface(input.surface);
    setBestOf(input.bestOf);
    setPlayer1Name(input.player1.name);
    setPlayer2Name(input.player2.name);
    setPlayer1Ranking(input.player1.ranking ? String(input.player1.ranking) : "");
    setPlayer2Ranking(input.player2.ranking ? String(input.player2.ranking) : "");
    setPlayer1History(formatTennisHistoryText(input.player1.matches));
    setPlayer2History(formatTennisHistoryText(input.player2.matches));
    setErrors([]);
    setAnalysis(analyzeTennisMatch(input));
    setTab("new");
  }

  function handleAnalyze() {
    try {
      const input = buildInput();
      const inputErrors = validateTennisInput(input);
      if (inputErrors.length) {
        setErrors(inputErrors);
        return;
      }
      setErrors([]);
      setAnalysis(analyzeTennisMatch(input));
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "No se pudo analizar el encuentro."]);
    }
  }

  function handleSave() {
    if (!analysis) return;
    const next = [analysis, ...saved.filter((item) => item.id !== analysis.id)];
    setSaved(next);
    writeSavedAnalyses(next);
    setTab("saved");
  }

  function handleRemove(id: string) {
    if (!window.confirm("¿Eliminar este análisis de tenis guardado?")) return;
    const next = saved.filter((item) => item.id !== id);
    setSaved(next);
    writeSavedAnalyses(next);
  }

  function handleSaveOutcome(outcome: TennisRecordedOutcome) {
    const next = { ...outcomes, [outcome.id]: outcome };
    setOutcomes(next);
    writeRecordedOutcomes(next);
    void persistServerOutcomes({ [outcome.id]: outcome })
      .then(() => setOutcomeSyncError(undefined))
      .catch((error: Error) => setOutcomeSyncError(error.message));
  }

  const allPredictions = React.useMemo(() => {
    const byId = new Map<string, TennisAnalysis>();
    tennisEvents.forEach((event) => byId.set(event.id, analyzeTennisMatch(event.input)));
    saved.forEach((item) => byId.set(item.id, item));
    return [...byId.values()];
  }, [saved]);
  const analysesWithOutcome = allPredictions.map((item) => {
    const storedEvent = tennisEvents.find((event) => event.id === item.id);
    return {
      analysis: item,
      outcome: outcomes[item.id] ?? (storedEvent ? officialOutcome(storedEvent) : undefined),
    };
  });
  const marketAudits = analysesWithOutcome.flatMap((item) => item.outcome ? auditTennisMarkets(item.analysis, item.outcome) : []);
  const pendingMarkets = analysesWithOutcome.filter((item) => !item.outcome).reduce((sum, item) => sum + item.analysis.markets.length, 0);
  const audit = summarizeTennisMarketAudits(marketAudits, pendingMarkets);
  const modelComparison = React.useMemo(() => compareTennisModels(tennisEvents, outcomes), [outcomes]);
  const eventDayGroups = React.useMemo(() => groupTennisEventsByDay(tennisEvents), []);
  const selectedEventGroup = eventDayFilter === "yesterday"
    ? { id: "yesterday", title: "Ayer", date: formatTennisEventDate(eventDayGroups.yesterdayKey), events: eventDayGroups.yesterday }
    : eventDayFilter === "today"
    ? { id: "today", title: "Hoy", date: formatTennisEventDate(eventDayGroups.todayKey), events: eventDayGroups.today }
    : { id: "tomorrow", title: "Mañana", date: formatTennisEventDate(eventDayGroups.tomorrowKey), events: eventDayGroups.tomorrow };

  function handleEventDayFilter(day: TennisDayFilter) {
    setEventDayFilter(day);
    const url = new URL(window.location.href);
    url.searchParams.set("day", day);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-5">
      <TabsList>
        <TabsTrigger value="events"><Trophy /> Encuentros ({tennisEvents.length})</TabsTrigger>
        <TabsTrigger value="new"><BarChart3 /> Nuevo análisis</TabsTrigger>
        <TabsTrigger value="saved"><History /> Guardados ({saved.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="events" className="space-y-5">
        {outcomeSyncError && <Alert variant="destructive"><AlertTriangle /><AlertTitle>Resultados guardados solo en este navegador</AlertTitle><AlertDescription>{outcomeSyncError}</AlertDescription></Alert>}
        {modelComparison.after.matches > 0 && (
          <Card className="border-brand-green/30">
            <CardHeader>
              <CardTitle>Comparación antes vs. después del ajuste</CardTitle>
              <CardDescription>Retroalimentación sobre {modelComparison.after.matches} resultados finalizados. La prueba de robustez excluye un partido distinto en cada iteración.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Ganador del partido</p><p className="mt-1 text-xl font-bold">{modelComparison.before.winnerAccuracy}% → {modelComparison.after.winnerAccuracy}%</p><p className="text-xs text-brand-green-bright">{modelComparison.delta.winnerAccuracy >= 0 ? "+" : ""}{modelComparison.delta.winnerAccuracy} puntos</p></div>
                <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Todos los mercados</p><p className="mt-1 text-xl font-bold">{modelComparison.before.marketAccuracy}% → {modelComparison.after.marketAccuracy}%</p><p className="text-xs text-brand-green-bright">{modelComparison.delta.marketAccuracy >= 0 ? "+" : ""}{modelComparison.delta.marketAccuracy} puntos</p></div>
                <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs text-muted-foreground">Selecciones recomendadas</p><p className="mt-1 text-xl font-bold">{modelComparison.before.actionableAccuracy}% → {modelComparison.after.actionableAccuracy}%</p><p className="text-xs text-brand-green-bright">{modelComparison.delta.actionableAccuracy >= 0 ? "+" : ""}{modelComparison.delta.actionableAccuracy} puntos</p></div>
              </div>
              <Alert><Target /><AlertTitle>Mejora estable en la muestra</AlertTitle><AlertDescription>Al retirar cada partido por turno, la mejora de todos los mercados se mantiene entre +{modelComparison.jackknife.minMarketDelta} y +{modelComparison.jackknife.maxMarketDelta} puntos; en recomendados, entre +{modelComparison.jackknife.minActionableDelta} y +{modelComparison.jackknife.maxActionableDelta}. Es una calibración retrospectiva, no una garantía de error cero en partidos futuros.</AlertDescription></Alert>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Card><CardContent><p className="text-xs text-muted-foreground">Mercados registrados</p><p className="mt-1 text-2xl font-bold">{allPredictions.reduce((sum, item) => sum + item.markets.length, 0)}</p><p className="text-xs text-muted-foreground">{allPredictions.length} encuentros</p></CardContent></Card>
          <Card><CardContent><p className="text-xs text-muted-foreground">Mercados pendientes</p><p className="mt-1 text-2xl font-bold">{audit.pending}</p></CardContent></Card>
          <Card className="border-brand-green/30"><CardContent><p className="text-xs text-muted-foreground">Aciertos</p><p className="mt-1 flex items-center gap-2 text-2xl font-bold text-brand-green-bright"><CheckCircle2 className="size-5" />{audit.hits}</p></CardContent></Card>
          <Card className="border-brand-red/30"><CardContent><p className="text-xs text-muted-foreground">Fallos</p><p className="mt-1 flex items-center gap-2 text-2xl font-bold text-brand-red"><XCircle className="size-5" />{audit.misses}</p></CardContent></Card>
          <Card><CardContent><p className="text-xs text-muted-foreground">Efectividad de mercados</p><p className="mt-1 text-2xl font-bold">{audit.audited ? `${audit.accuracy}%` : "—"}</p><p className="text-xs text-muted-foreground">{audit.hits}/{audit.audited} selecciones</p></CardContent></Card>
        </div>
        <Card className="border-slate-800 bg-slate-900/90">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Día de los encuentros:</span>
              <Button variant={eventDayFilter === "yesterday" ? "default" : "outline"} size="sm" onClick={() => handleEventDayFilter("yesterday")} className={cn("text-xs font-bold", eventDayFilter === "yesterday" ? "bg-emerald-600 text-white hover:bg-emerald-500" : "border-slate-800 bg-slate-950/60 text-slate-300")}>Ayer ({eventDayGroups.yesterday.length})</Button>
              <Button variant={eventDayFilter === "today" ? "default" : "outline"} size="sm" onClick={() => handleEventDayFilter("today")} className={cn("text-xs font-bold", eventDayFilter === "today" ? "bg-emerald-600 text-white hover:bg-emerald-500" : "border-slate-800 bg-slate-950/60 text-slate-300")}>Hoy ({eventDayGroups.today.length})</Button>
              <Button variant={eventDayFilter === "tomorrow" ? "default" : "outline"} size="sm" onClick={() => handleEventDayFilter("tomorrow")} className={cn("text-xs font-bold", eventDayFilter === "tomorrow" ? "bg-emerald-600 text-white hover:bg-emerald-500" : "border-slate-800 bg-slate-950/60 text-slate-300")}>Mañana ({eventDayGroups.tomorrow.length})</Button>
            </div>
            <p className="text-xs text-muted-foreground">{selectedEventGroup.date}</p>
          </CardContent>
        </Card>
        <section className="space-y-3" aria-labelledby={`tennis-events-${selectedEventGroup.id}`}>
            <div className="flex items-center justify-between gap-3 border-b pb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-brand-green-bright" />
                <div>
                  <h3 id={`tennis-events-${selectedEventGroup.id}`} className="font-semibold">{selectedEventGroup.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedEventGroup.date}</p>
                </div>
              </div>
              <Badge variant="outline">{selectedEventGroup.events.length} {selectedEventGroup.events.length === 1 ? "encuentro" : "encuentros"}</Badge>
            </div>
            {selectedEventGroup.events.length ? selectedEventGroup.events.map((event) => <StoredEventCard key={event.id} event={event} outcome={outcomes[event.id] ?? officialOutcome(event)} returnDay={eventDayFilter} onLoad={handleLoadEvent} onSaveOutcome={handleSaveOutcome} />) : (
              <Card className="border-dashed"><CardContent className="py-6 text-center text-sm text-muted-foreground">No hay encuentros cargados para {selectedEventGroup.title.toLocaleLowerCase("es")}.</CardContent></Card>
            )}
        </section>
      </TabsContent>

      <TabsContent value="new" className="space-y-5">

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Encuentro de tenis</CardTitle>
            <CardDescription>Configura el partido que se analizará contra los 20 antecedentes de cada jugador.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tennis-tournament">Torneo</Label>
              <Input id="tennis-tournament" value={tournament} onChange={(event) => setTournament(event.target.value)} placeholder="Ej. ATP Cincinnati" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tennis-date">Fecha</Label>
              <Input id="tennis-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tennis-time">Hora</Label>
              <Input id="tennis-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tennis-round">Ronda</Label>
              <Input id="tennis-round" value={round} onChange={(event) => setRound(event.target.value)} placeholder="Ej. 1/16 de final" />
            </div>
            <div className="space-y-1.5">
              <Label>Formato</Label>
              <Select value={String(bestOf)} onValueChange={(value) => setBestOf(value === "5" ? 5 : 3)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="3">Mejor de 3 sets</SelectItem><SelectItem value="5">Mejor de 5 sets</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Superficie</Label>
              <Select value={surface} onValueChange={(value) => setSurface(value as TennisSurface)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard">Pista dura</SelectItem><SelectItem value="clay">Arcilla</SelectItem><SelectItem value="grass">Césped</SelectItem><SelectItem value="indoor">Pista cubierta</SelectItem><SelectItem value="carpet">Moqueta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 2xl:grid-cols-2">
          <PlayerHistoryInput number={1} name={player1Name} setName={setPlayer1Name} ranking={player1Ranking} setRanking={setPlayer1Ranking} history={player1History} setHistory={setPlayer1History} />
          <PlayerHistoryInput number={2} name={player2Name} setName={setPlayer2Name} ranking={player2Ranking} setRanking={setPlayer2Ranking} history={player2History} setHistory={setPlayer2History} />
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive"><AlertTriangle /><AlertTitle>Revisa la entrada</AlertTitle><AlertDescription>{errors.map((error) => <p key={error}>{error}</p>)}</AlertDescription></Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={handleAnalyze}><Trophy /> Analizar encuentro</Button>
          {analysis && <Button size="lg" variant="outline" onClick={handleSave}><Save /> Guardar análisis</Button>}
          <p className="text-xs text-muted-foreground">Solo las selecciones con ≥70% de probabilidad y confianza aparecen como fuertes.</p>
        </div>

        {analysis && <AnalysisResult analysis={analysis} />}
      </TabsContent>

      <TabsContent value="saved" className="space-y-4">
        {saved.length === 0 ? (
          <Card><CardContent className="flex min-h-48 flex-col items-center justify-center text-center"><History className="mb-3 size-8 text-muted-foreground" /><p className="font-medium">Todavía no hay análisis de tenis guardados</p><p className="text-sm text-muted-foreground">Genera el primero desde “Nuevo análisis”.</p></CardContent></Card>
        ) : saved.map((item) => (
          <Card key={item.id}>
            <CardContent className="grid gap-4 pt-1 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{surfaceLabel(item.input.surface)}</Badge><Badge variant="secondary">Mejor de {item.input.bestOf}</Badge></div>
                <h3 className="mt-2 text-lg font-semibold">{item.input.player1.name} vs {item.input.player2.name}</h3>
                <p className="text-sm text-muted-foreground">{item.input.tournament} · {item.input.date}</p>
                <p className="mt-2 text-sm"><CheckCircle2 className="mr-1 inline size-4 text-brand-green" />Pronóstico: <strong>{item.projectedWinner}</strong> ({item.projectedWinnerProbability}%)</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setAnalysis(item); setTab("new"); }}><CalendarDays /> Ver análisis</Button>
                <RecordTennisResultDialog id={item.id} player1={item.input.player1.name} player2={item.input.player2.name} current={outcomes[item.id]} predictedWinner={item.projectedWinner} bestOf={item.input.bestOf} onSave={handleSaveOutcome} />
                {outcomes[item.id] && <MarketAuditDialog audits={auditTennisMarkets(item, outcomes[item.id])} />}
                <Button variant="destructive" size="icon" onClick={() => handleRemove(item.id)} aria-label="Eliminar análisis"><Trash2 /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
