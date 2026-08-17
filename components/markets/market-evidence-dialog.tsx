"use client";

import * as React from "react";
import { CheckCircle2, Database, Download, FlaskConical, Loader2, Check, XCircle, AlertTriangle } from "lucide-react";
import { CONFIDENCE_WEIGHTS, MarketEvaluation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateShort } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";
import { MarketFiveParametersTable } from "@/components/markets/market-five-parameters-table";
import { getTeamMatchPool } from "@/data/team-history";
import { getMatchById } from "@/data/matches";
import { getTeamById } from "@/data/teams";

const CONFIDENCE_LABELS: { key: keyof typeof CONFIDENCE_WEIGHTS; label: string }[] = [
  { key: "recentPerformance", label: "Rendimiento reciente" },
  { key: "rivalVulnerability", label: "Rival permite" },
  { key: "homeAwayCondition", label: "Condicion local/visita" },
  { key: "headToHead", label: "H2H" },
  { key: "commonOpponents", label: "Rivales comunes" },
  { key: "lastThreeTrend", label: "Ultimos 3" },
  { key: "dataQuality", label: "Calidad de datos" },
];

interface MarketEvidenceDialogProps {
  evaluation: MarketEvaluation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketEvidenceDialog({ evaluation, open, onOpenChange }: MarketEvidenceDialogProps) {
  const evidence = evaluation.evidence;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const match = getMatchById(evaluation.matchId);
  const homeTeam = match ? getTeamById(match.homeTeamId) : null;
  const awayTeam = match ? getTeamById(match.awayTeamId) : null;

  const handleDownloadDetailed = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!contentRef.current || downloading) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(contentRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: "#0B132B",
      });
      const safeFilename = `auditoria_detalle_${evaluation.market.id}.png`;
      const link = document.createElement("a");
      link.download = safeFilename;
      link.href = dataUrl;
      link.click();
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error("Error al capturar auditoria detallada:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(1120px,calc(100%-1rem))] max-w-none gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-border bg-card px-5 pt-5 pb-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-bright ring-1 ring-brand-green/20">
                <FlaskConical className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-lg">{evaluation.market.name}</DialogTitle>
                <DialogDescription className="mt-1">Auditoría completa de la probabilidad: fórmula, señales y partidos usados.</DialogDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-brand-green/30 bg-brand-green/10 text-xs font-semibold text-brand-green-bright hover:bg-brand-green/20"
              onClick={handleDownloadDetailed}
              title="Descargar captura completa del detalle de este card"
            >
              {downloading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : done ? (
                <Check className="size-3.5 text-brand-green-bright" />
              ) : (
                <Download className="size-3.5" />
              )}
              <span>Descargar detalle</span>
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-104px)]">
          <div ref={contentRef} className="space-y-5 px-5 py-5 sm:px-6">
            <section className="grid grid-cols-2 gap-2 rounded-xl border border-brand-green/20 bg-brand-green/5 p-3 sm:grid-cols-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Probabilidad</p>
                <p className="mt-0.5 text-xl font-bold text-brand-green-bright">{evaluation.statisticalEstimate}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Confianza</p>
                <p className="mt-0.5 text-xl font-bold text-foreground">{evaluation.confidence}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Muestra</p>
                <p className="mt-0.5 text-xl font-bold text-foreground">{evaluation.sampleSize}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Riesgo</p>
                <p className="mt-0.5 text-sm font-semibold capitalize text-foreground">{evaluation.riskLevel}</p>
              </div>
            </section>

            {evaluation.contradictions && evaluation.contradictions.length > 0 && (
              <section className="flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">
                    ⚠️ Advertencia de Calidad de Datos y Muestra al Descanso
                  </p>
                  <ul className="list-disc space-y-1 pl-4 leading-relaxed text-amber-200/90">
                    {evaluation.contradictions.map((contradiction, i) => (
                      <li key={i}>{contradiction}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {evaluation.probabilitySignals && evaluation.probabilitySignals.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Database className="size-4 text-brand-green-bright" /> Valores que forman el cruce
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {evaluation.probabilitySignals.map((signal) => (
                    <div key={`${signal.label}-${signal.value}`} className="rounded-lg border border-border bg-muted/25 p-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-xs text-muted-foreground">{signal.label}</p>
                        <p className="shrink-0 text-base font-bold text-brand-green-bright">{signal.value}</p>
                      </div>
                      {signal.detail && <p className="mt-1 text-[11px] text-muted-foreground/80">{signal.detail}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-xl border border-border bg-muted/20 p-3.5">
              <p className="text-sm font-semibold text-foreground">Como se obtuvo la probabilidad</p>
              <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                {evidence?.methodology.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-2">
                    <span className="font-semibold text-brand-green-bright">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            {match && (
              <section className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Tabla Desglose de 5 Parámetros (Local / Visita / Totales / H2H-Comunes)</p>
                <MarketFiveParametersTable
                  marketId={evaluation.market.id}
                  homeRecords={getTeamMatchPool(match.homeTeamId)}
                  awayRecords={getTeamMatchPool(match.awayTeamId)}
                  homeTeamName={homeTeam?.shortName}
                  awayTeamName={awayTeam?.shortName}
                />
              </section>
            )}

            <section className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Componentes de confianza</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {CONFIDENCE_LABELS.map(({ key, label }) => {
                  const value = evaluation.confidenceBreakdown[key];
                  const weight = CONFIDENCE_WEIGHTS[key] * 100;
                  return (
                    <div key={key} className="rounded-lg border border-border/80 bg-card p-2.5">
                      <p className="text-[10px] leading-tight text-muted-foreground">{label} ({weight}%)</p>
                      <p className="mt-1 text-base font-bold text-foreground">{value}%</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Partidos utilizados</p>
                  <p className="text-xs text-muted-foreground">Cada serie representa una entrada real del calculo.</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{evidence?.series.reduce((sum, series) => sum + series.total, 0) ?? 0} registros</Badge>
              </div>

              {evidence?.series.map((series) => (
                <article key={series.id} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/25 px-3.5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{series.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{series.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-brand-green/30 text-brand-green-bright">{series.hits}/{series.total} cumple</Badge>
                      <span className="text-sm font-bold text-foreground">{series.percentage}%</span>
                    </div>
                  </div>
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Rival</TableHead>
                        <TableHead>Marcador</TableHead>
                        <TableHead className="hidden md:table-cell">Valores</TableHead>
                        <TableHead className="text-right">Resultado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {series.matches.map((match) => (
                        <TableRow key={`${series.id}-${match.matchId}`}>
                          <TableCell className="font-medium text-foreground">{formatDateShort(match.date)}</TableCell>
                          <TableCell>
                            <div className="text-foreground">{match.opponent}</div>
                            <div className="text-[10px] capitalize text-muted-foreground">{match.venue} | {match.result}</div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{match.score}</TableCell>
                          <TableCell className="hidden max-w-72 truncate text-muted-foreground md:table-cell">{match.statistics}</TableCell>
                          <TableCell className="text-right">
                            <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", match.fulfilled ? "text-brand-green-bright" : "text-brand-red")}>
                              {match.fulfilled ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                              {match.fulfilled ? "Cumple" : "No cumple"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </article>
              ))}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
