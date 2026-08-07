"use client";

import * as React from "react";
import { CheckCircle2, Loader2, PlusCircle, RefreshCcw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { PackageDiff } from "@/lib/match-package-merge";
import type { UseMatchImportResult } from "@/hooks/use-match-import";

const STATUS_META: Record<PackageDiff["status"], { label: string; badge: string; icon: React.ReactNode }> = {
  new: { label: "Nuevo", badge: "border-brand-green/30 bg-brand-green/10 text-brand-green-bright", icon: <PlusCircle className="size-3.5" /> },
  updated: { label: "Actualización", badge: "border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow", icon: <RefreshCcw className="size-3.5" /> },
  unchanged: { label: "Sin cambios", badge: "border-border bg-muted text-muted-foreground", icon: <CheckCircle2 className="size-3.5" /> },
};

function PackageDiffCard({ diff }: { diff: PackageDiff }) {
  const meta = STATUS_META[diff.status];
  const totalHistoryNew = diff.histories.reduce((sum, h) => sum + h.newRecords, 0);
  const totalHistoryUpdated = diff.histories.reduce((sum, h) => sum + h.updatedRecords, 0);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{diff.matchLabel}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{diff.packageId}</p>
        </div>
        <Badge variant="outline" className={`gap-1 ${meta.badge}`}>
          {meta.icon} {meta.label}
        </Badge>
      </div>

      {diff.status !== "unchanged" && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          <div className="rounded-md bg-muted/50 p-2">
            <p className="font-semibold text-foreground">
              {diff.teams.new + diff.teams.updated}/{diff.teams.new + diff.teams.updated + diff.teams.unchanged}
            </p>
            <p>Equipos ({diff.teams.new} nuevos)</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="font-semibold text-foreground">{diff.matchChanged ? "Sí" : "No"}</p>
            <p>Partido modificado</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="font-semibold text-foreground">{totalHistoryNew}</p>
            <p>Historiales nuevos</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="font-semibold text-foreground">{totalHistoryUpdated}</p>
            <p>Historiales actualizados</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ImportPreview({ importState }: { importState: UseMatchImportResult }) {
  const { summary, isBusy, stage, confirmImport } = importState;
  if (!summary) return null;

  const { totals } = summary;
  const hasChanges = totals.newPackages > 0 || totals.updatedPackages > 0;
  const willOverwrite = totals.updatedPackages > 0;

  const confirmButton = (
    <Button type="button" size="lg" className="gap-1.5" disabled={isBusy || !hasChanges}>
      {isBusy && stage === "importing" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      Confirmar importación
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista previa</CardTitle>
        <CardDescription>
          {totals.newPackages} nuevo(s) · {totals.updatedPackages} actualización(es) · {totals.unchangedPackages} sin cambios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {summary.packages.map((diff) => (
            <PackageDiffCard key={diff.packageId} diff={diff} />
          ))}
        </div>

        {!hasChanges && (
          <p className="rounded-lg border border-dashed border-border p-3 text-center text-sm text-muted-foreground">
            Este JSON ya está importado tal cual — no hay nada nuevo que confirmar.
          </p>
        )}

        {hasChanges && (
          <div className="flex justify-end">
            {willOverwrite ? (
              <Dialog>
                <DialogTrigger asChild>{confirmButton}</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Sobrescribir información existente?</DialogTitle>
                    <DialogDescription>
                      {totals.updatedPackages} paquete(s) ya existen en el sistema. Se actualizará el partido, equipos y competición con
                      los datos nuevos, y los historiales se fusionarán (nada se elimina, solo se agrega o corrige). Esta acción no se
                      puede deshacer desde aquí.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => void confirmImport()}>Sí, sobrescribir y continuar</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button type="button" size="lg" className="gap-1.5" disabled={isBusy} onClick={() => void confirmImport()}>
                {isBusy && stage === "importing" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Confirmar importación
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
