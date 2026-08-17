"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, FileCheck2, Percent, PlusCircle, Trophy, XCircle } from "lucide-react";
import { AnalysisStatus, RecordedMatchOutcome, TrackedTicket, TrackedTicketMatch } from "@/types";
import { readTrackedTickets, updateTrackedTicketMatchOutcome } from "@/lib/bet-records";
import { getTeamById } from "@/data/teams";
import { formatDateLong } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<AnalysisStatus, { label: string; className: string }> = {
  ganada: { label: "Acertado", className: "border-brand-green/25 bg-brand-green/10 text-brand-green-bright" },
  perdida: { label: "Fallido", className: "border-brand-red/25 bg-brand-red/10 text-brand-red" },
  pendiente: { label: "Pendiente", className: "border-brand-blue/25 bg-brand-blue/10 text-brand-blue" },
  anulada: { label: "Anulado", className: "border-border bg-muted text-muted-foreground" },
};

const SELECTION_STATUS = {
  acertada: { label: "Acertó", className: "text-brand-green-bright" },
  fallida: { label: "Falló", className: "text-brand-red" },
  pendiente: { label: "Pendiente", className: "text-brand-blue" },
  sin_datos: { label: "Falta dato", className: "text-amber-500" },
} as const;

type OutcomeForm = Record<"homeGoals" | "awayGoals" | "homeGoalsFirstHalf" | "awayGoalsFirstHalf" | "homeCorners" | "awayCorners" | "homeYellowCards" | "awayYellowCards" | "homeRedCards" | "awayRedCards", string>;
const EMPTY_OUTCOME: OutcomeForm = { homeGoals: "", awayGoals: "", homeGoalsFirstHalf: "", awayGoalsFirstHalf: "", homeCorners: "", awayCorners: "", homeYellowCards: "", awayYellowCards: "", homeRedCards: "", awayRedCards: "" };

function outcomeToForm(outcome?: RecordedMatchOutcome): OutcomeForm {
  const number = (value: number | undefined) => value === undefined ? "" : String(value);
  return outcome ? {
    homeGoals: number(outcome.homeGoals), awayGoals: number(outcome.awayGoals),
    homeGoalsFirstHalf: number(outcome.homeGoalsFirstHalf), awayGoalsFirstHalf: number(outcome.awayGoalsFirstHalf),
    homeCorners: number(outcome.homeCorners), awayCorners: number(outcome.awayCorners),
    homeYellowCards: number(outcome.homeYellowCards), awayYellowCards: number(outcome.awayYellowCards),
    homeRedCards: number(outcome.homeRedCards), awayRedCards: number(outcome.awayRedCards),
  } : EMPTY_OUTCOME;
}

function toNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function allSelections(tickets: TrackedTicket[]) {
  return tickets.flatMap((ticket) => ticket.matches.flatMap((match) => match.selections));
}

function allMatches(tickets: TrackedTicket[]) {
  return tickets.flatMap((ticket) => ticket.matches);
}

export function BetRecordsDashboard() {
  const [tickets, setTickets] = React.useState<TrackedTicket[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const [active, setActive] = React.useState<{ ticketId: string; matchId: string } | null>(null);
  const [form, setForm] = React.useState<OutcomeForm>(EMPTY_OUTCOME);
  const [formError, setFormError] = React.useState("");

  React.useEffect(() => {
    const loadId = window.setTimeout(() => {
      setTickets(readTrackedTickets());
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(loadId);
  }, []);

  const activeTicket = tickets.find((ticket) => ticket.id === active?.ticketId);
  const activeMatch = activeTicket?.matches.find((match) => match.matchId === active?.matchId);
  const selections = allSelections(tickets);
  const hits = selections.filter((selection) => selection.status === "acertada").length;
  const failures = selections.filter((selection) => selection.status === "fallida").length;
  const auditedSelections = hits + failures;
  const winnerAudits = allMatches(tickets).flatMap((match) => match.winnerPrediction?.correct === undefined ? [] : [match.winnerPrediction.correct]);
  const winnerHits = winnerAudits.filter(Boolean).length;

  const openSettlement = (ticket: TrackedTicket, match: TrackedTicketMatch) => {
    setActive({ ticketId: ticket.id, matchId: match.matchId });
    setForm(outcomeToForm(match.outcome));
    setFormError("");
  };

  const saveOutcome = () => {
    if (!active) return;
    const homeGoals = toNumber(form.homeGoals);
    const awayGoals = toNumber(form.awayGoals);
    if (homeGoals === undefined || awayGoals === undefined) {
      setFormError("El marcador final de ambos equipos es obligatorio.");
      return;
    }
    const outcome: RecordedMatchOutcome = {
      homeGoals, awayGoals,
      homeGoalsFirstHalf: toNumber(form.homeGoalsFirstHalf), awayGoalsFirstHalf: toNumber(form.awayGoalsFirstHalf),
      homeCorners: toNumber(form.homeCorners), awayCorners: toNumber(form.awayCorners),
      homeYellowCards: toNumber(form.homeYellowCards), awayYellowCards: toNumber(form.awayYellowCards),
      homeRedCards: toNumber(form.homeRedCards), awayRedCards: toNumber(form.awayRedCards),
      recordedAt: new Date().toISOString(),
    };
    const updated = updateTrackedTicketMatchOutcome(active.ticketId, active.matchId, outcome);
    if (!updated) return;
    setTickets((current) => current.map((ticket) => ticket.id === updated.id ? updated : ticket));
    setActive(null);
  };

  if (!mounted) return <div className="min-h-48" aria-busy="true" />;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-green/20 bg-[linear-gradient(120deg,color-mix(in_oklch,var(--brand-green)_12%,transparent),transparent_60%)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-bright">Auditoría de tickets</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground">Tickets blindados 70 / 80 / 90</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Aquí solo se guardan tickets generados con ambos filtros en 70%, 80% o 90%. Registra el resultado de cada encuentro y compara mercados y ganador previsto.</p>
          </div>
          <Button asChild variant="outline"><Link href="/ticket"><PlusCircle /> Generar ticket</Link></Button>
        </div>
      </section>

      <div className="adaptive-stat-grid grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ClipboardList} label="Tickets guardados" value={String(tickets.length)} />
        <StatCard icon={CheckCircle2} label="Mercados acertados" value={String(hits)} accent="green" />
        <StatCard icon={XCircle} label="Mercados fallidos" value={String(failures)} accent="red" />
        <StatCard icon={Percent} label="Precisión mercados" value={auditedSelections ? `${Math.round((hits / auditedSelections) * 100)}%` : "—"} accent="yellow" />
      </div>

      {winnerAudits.length > 0 && <p className="text-xs text-muted-foreground">Ganador previsto: <span className="font-semibold text-foreground">{winnerHits}/{winnerAudits.length}</span> aciertos ({Math.round((winnerHits / winnerAudits.length) * 100)}%).</p>}

      {tickets.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Aún no hay tickets auditables" description="Genera un Ticket ≥70%, ≥80% o ≥90% y usa “Guardar ticket” para congelar sus mercados y pronóstico de ganador." />
      ) : (
        <div className="space-y-5">
          {tickets.map((ticket) => {
            const ticketStatus = STATUS_STYLE[ticket.status];
            const selectionTotal = ticket.matches.reduce((total, match) => total + match.selections.length, 0);
            return (
              <Card key={ticket.id} className="overflow-hidden">
                <CardHeader className="gap-3 border-b border-border/70 bg-muted/20 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base"><Trophy className="size-4 text-brand-green-bright" /> Ticket blindado ≥{ticket.tier}%</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{ticket.matches.length} encuentros · {selectionTotal} mercados · Filtros: ≥{ticket.minConfidence}% confianza y ≥{ticket.minProbability}% probabilidad · Modelo {ticket.modelVersion}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px]", ticketStatus.className)}>{ticketStatus.label}</Badge>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {ticket.matches.map((match) => <TicketMatchAudit key={match.matchId} ticket={ticket} match={match} onSettle={openSettlement} />)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(activeMatch)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar resultado oficial</DialogTitle>
            <DialogDescription>Se audita este encuentro dentro de su ticket. Si una métrica no está disponible, el mercado queda como “Falta dato”, nunca como fallido.</DialogDescription>
          </DialogHeader>
          <OutcomeFields title="Resultado final" required fields={[["homeGoals", "Goles local"], ["awayGoals", "Goles visitante"]]} form={form} setForm={setForm} />
          <OutcomeFields title="Primer tiempo" fields={[["homeGoalsFirstHalf", "Goles local 1T"], ["awayGoalsFirstHalf", "Goles visitante 1T"]]} form={form} setForm={setForm} />
          <OutcomeFields title="Córners" fields={[["homeCorners", "Córners local"], ["awayCorners", "Córners visitante"]]} form={form} setForm={setForm} />
          <OutcomeFields title="Tarjetas amarillas" fields={[["homeYellowCards", "Amarillas local"], ["awayYellowCards", "Amarillas visitante"]]} form={form} setForm={setForm} />
          <OutcomeFields title="Tarjetas rojas" fields={[["homeRedCards", "Rojas local"], ["awayRedCards", "Rojas visitante"]]} form={form} setForm={setForm} />
          {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
          <DialogFooter><Button variant="outline" onClick={() => setActive(null)}>Cancelar</Button><Button onClick={saveOutcome}><FileCheck2 /> Auditar encuentro</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketMatchAudit({ ticket, match, onSettle }: { ticket: TrackedTicket; match: TrackedTicketMatch; onSettle: (ticket: TrackedTicket, match: TrackedTicketMatch) => void }) {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const matchStatus = STATUS_STYLE[match.status];
  const winner = match.winnerPrediction;
  return (
    <section className="rounded-xl border border-border/80 bg-background/35 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{home?.shortName ?? match.homeTeamId} <span className="text-muted-foreground">vs</span> {away?.shortName ?? match.awayTeamId}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{match.competition} · {formatDateLong(match.date)} · {match.time}</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px]", matchStatus.className)}>{matchStatus.label}</Badge>
      </div>
      {winner && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-2 text-xs">
          <span className="font-semibold text-cyan-300">Ganador previsto: {winner.label} ({winner.probability}%)</span>
          <span className="text-muted-foreground">1 {winner.homeWinProbability}% · X {winner.drawProbability}% · 2 {winner.awayWinProbability}%</span>
          {winner.correct !== undefined && <span className={winner.correct ? "font-semibold text-brand-green-bright" : "font-semibold text-brand-red"}>{winner.correct ? "Acertó ganador" : "Falló ganador"}</span>}
        </div>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {match.selections.map((selection) => {
          const state = SELECTION_STATUS[selection.status];
          return <div key={selection.id} className="rounded-lg border border-border/70 bg-muted/15 p-2"><div className="flex justify-between gap-2"><span className="text-xs font-medium text-foreground">{selection.marketName}</span><span className={cn("shrink-0 text-[10px] font-semibold", state.className)}>{state.label}</span></div><p className="mt-1 text-[10px] text-muted-foreground"><span className="font-semibold text-brand-green-bright">{selection.probability}%</span> prob. · {selection.confidence}% conf.</p>{selection.settlementNote && <p className="mt-1 text-[10px] text-muted-foreground">{selection.settlementNote}</p>}</div>;
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3"><p className="text-xs text-muted-foreground">{match.outcome ? `Resultado: ${match.outcome.homeGoals}-${match.outcome.awayGoals}` : "Resultado pendiente"}</p><Button size="sm" variant="outline" onClick={() => onSettle(ticket, match)}><FileCheck2 /> {match.outcome ? "Editar resultado" : "Registrar resultado"}</Button></div>
    </section>
  );
}

function OutcomeFields({ title, fields, form, setForm, required = false }: { title: string; fields: [keyof OutcomeForm, string][]; form: OutcomeForm; setForm: React.Dispatch<React.SetStateAction<OutcomeForm>>; required?: boolean }) {
  return <section><p className="mb-1.5 text-xs font-semibold text-foreground">{title}{required && <span className="ml-1 text-destructive">*</span>}</p><div className="grid grid-cols-2 gap-2">{fields.map(([key, label]) => <label key={key} className="text-[11px] text-muted-foreground">{label}<Input type="number" min="0" step="1" required={required} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1" /></label>)}</div></section>;
}
