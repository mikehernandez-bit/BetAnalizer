"use client";

import * as React from "react";
import { CheckCircle2, CircleAlert, Download, Loader2, RefreshCw, Search, ServerCog } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ExportButton } from "@/components/shared/export-button";
import type { ApiFootballImportInput, ApiFootballImportResult, ApiFootballProgress } from "@/lib/api-football-import-types";
import type { MatchPackage } from "@/lib/validation/match-package";
import { consultApiFootball } from "@/services/api-football-import-service";

interface ApiFootballPanelProps {
  onPackageReady: (pkg: MatchPackage) => void;
}

const EMPTY_INPUT: ApiFootballImportInput = { homeTeam: "", awayTeam: "", date: "", time: "", competition: "" };

function fixtureIssueKey(issue: { fixtureId?: number; team?: string; date?: string }, index: number) {
  return `${issue.fixtureId ?? "package"}-${issue.team ?? ""}-${issue.date ?? ""}-${index}`;
}

export function ApiFootballPanel({ onPackageReady }: ApiFootballPanelProps) {
  const [input, setInput] = React.useState<ApiFootballImportInput>(EMPTY_INPUT);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<ApiFootballProgress | null>(null);
  const [result, setResult] = React.useState<ApiFootballImportResult | null>(null);
  const [problemsOpen, setProblemsOpen] = React.useState(false);
  const [showAvailable, setShowAvailable] = React.useState(false);

  function setField<K extends keyof ApiFootballImportInput>(field: K, value: ApiFootballImportInput[K]) {
    setInput((previous) => ({ ...previous, [field]: value }));
  }

  async function consult(fixtureId?: number) {
    if (!input.homeTeam.trim() || !input.awayTeam.trim() || !input.date) {
      setResult({ kind: "error", message: "Completa equipo local, visitante y fecha antes de consultar." });
      return;
    }
    setIsLoading(true);
    setResult(null);
    setProgress({ step: "Preparando consulta segura...", completed: 0, total: 24, homeCompleted: 0, awayCompleted: 0 });
    try {
      const next = await consultApiFootball({ ...input, fixtureId }, setProgress);
      setResult(next);
      if (next.kind === "incomplete") setProblemsOpen(true);
    } catch {
      setResult({ kind: "error", message: "No se pudo conectar con la ruta de API-Football." });
    } finally {
      setIsLoading(false);
    }
  }

  const percentage = progress ? Math.min(100, Math.round((progress.completed / Math.max(progress.total, 1)) * 100)) : 0;
  const buttonText = isLoading ? "Consultando API..." : result?.kind === "complete" ? "Datos cargados" : result?.kind === "error" ? "Error al consultar API" : "Consultar API";

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-brand-green/25">
        <CardHeader className="border-b border-brand-green/10 bg-brand-green/[0.035]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ServerCog className="size-4 text-brand-green-bright" /> Consultar API-Football
              </CardTitle>
              <CardDescription className="mt-1 max-w-2xl">
                Obtiene el fixture real y bloquea el archivo si API-Football no publica todos los datos obligatorios. La clave permanece solo en el servidor.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-brand-green/30 bg-brand-green/10 text-brand-green-bright">
              Datos reales solamente
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="api-home-team">Equipo local</Label>
              <Input id="api-home-team" value={input.homeTeam} onChange={(event) => setField("homeTeam", event.target.value)} placeholder="Plymouth Argyle" disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="api-away-team">Equipo visitante</Label>
              <Input id="api-away-team" value={input.awayTeam} onChange={(event) => setField("awayTeam", event.target.value)} placeholder="Exeter City" disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="api-date">Fecha</Label>
              <Input id="api-date" type="date" value={input.date} onChange={(event) => setField("date", event.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="api-time">Hora (America/Lima, opcional)</Label>
              <Input id="api-time" type="time" value={input.time} onChange={(event) => setField("time", event.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="api-competition">Competicion (opcional, para resolver empates)</Label>
              <Input id="api-competition" value={input.competition} onChange={(event) => setField("competition", event.target.value)} placeholder="Nombre de la liga o copa" disabled={isLoading} />
            </div>
          </div>

          <Button type="button" size="lg" className="gap-1.5" onClick={() => void consult()} disabled={isLoading}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {buttonText}
          </Button>

          {progress && (
            <div className="rounded-lg border border-border bg-muted/30 p-3" aria-live="polite">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-foreground">{progress.step}</span>
                <span className="font-mono text-xs text-muted-foreground">{percentage}%</span>
              </div>
              <Progress value={percentage} />
              {(progress.homeCompleted !== undefined || progress.awayCompleted !== undefined) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Local: {progress.homeCompleted ?? 0}/10 <span className="px-1">|</span> Visitante: {progress.awayCompleted ?? 0}/10
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {result?.kind === "ambiguous" && (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona el partido correcto</CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.candidates.map((candidate) => (
              <div key={candidate.fixtureId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{candidate.homeTeam} vs {candidate.awayTeam}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {candidate.competition} · {candidate.country} · {candidate.date} {candidate.time}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={isLoading} onClick={() => void consult(candidate.fixtureId)}>
                  Elegir fixture {candidate.fixtureId}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {result?.kind === "complete" && (
        <Card className="border-brand-green/30 bg-brand-green/[0.035]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-green-bright">
              <CheckCircle2 className="size-5" /> Paquete completo
            </CardTitle>
            <CardDescription>100% verificado para {result.summary.homeTeam} vs {result.summary.awayTeam}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <p className="rounded-md border border-brand-green/20 bg-background/40 p-2">Fixture: <strong>{result.summary.fixtureId}</strong></p>
              <p className="rounded-md border border-brand-green/20 bg-background/40 p-2">Local: <strong>{result.summary.homeHistoryCount}/10</strong></p>
              <p className="rounded-md border border-brand-green/20 bg-background/40 p-2">Visitante: <strong>{result.summary.awayHistoryCount}/10</strong></p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ExportButton filename={`${result.package.id}.json`} getContent={() => JSON.stringify(result.file, null, 2)} label="Descargar JSON" />
              <Button type="button" variant="outline" className="gap-1.5" onClick={() => onPackageReady(result.package)}>
                <Download className="size-4" /> Cargar en importador
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result?.kind === "error" && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Error al consultar API</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      {result?.kind === "incomplete" && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Datos incompletos de API-Football</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>{result.message} No se genero ningun JSON.</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setProblemsOpen(true)}>Ver problemas</Button>
          </AlertDescription>
        </Alert>
      )}

      {result?.kind === "incomplete" && (
        <Dialog open={problemsOpen} onOpenChange={setProblemsOpen}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>No se pudo completar el paquete</DialogTitle>
              <DialogDescription>El sistema no rellena datos ausentes ni genera un archivo parcial.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {result.issues.map((issue, index) => (
                <div key={fixtureIssueKey(issue, index)} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-medium text-foreground">
                    {issue.team ?? "Paquete"}{issue.opponent ? ` vs ${issue.opponent}` : ""}
                    {issue.date ? ` · ${issue.date}` : ""}
                    {issue.fixtureId ? ` · Fixture ${issue.fixtureId}` : ""}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-destructive">Faltan:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {issue.fields.map((field) => <li key={field}>{field}</li>)}
                  </ul>
                </div>
              ))}
              {showAvailable && (
                <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Se conservaron los datos que API-Football devolvio durante la consulta, pero no se muestran ni se exportan como paquete porque faltan campos obligatorios.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAvailable((value) => !value)}>Ver datos disponibles</Button>
              <Button type="button" variant="outline" disabled={isLoading} onClick={() => void consult()}>
                <RefreshCw className="size-4" /> Reintentar
              </Button>
              <DialogClose asChild><Button type="button">Cerrar</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
