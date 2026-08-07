"use client";

import * as React from "react";
import { Database, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExportButton } from "@/components/shared/export-button";
import { EmptyState } from "@/components/shared/empty-state";
import type { MatchPackage } from "@/lib/validation/match-package";
import type { UseMatchImportResult } from "@/hooks/use-match-import";
import { formatDateLong } from "@/utils/formatters";

interface ImportedPackagesPanelProps {
  importState: UseMatchImportResult;
  onEditPackage: (pkg: MatchPackage) => void;
}

export function ImportedPackagesPanel({ importState, onEditPackage }: ImportedPackagesPanelProps) {
  const { currentFile, removePackageById, isBusy } = importState;
  const packages = currentFile?.packages ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4 text-brand-green-bright" /> Paquetes importados
            </CardTitle>
            <CardDescription className="mt-1">
              {packages.length} {packages.length === 1 ? "partido cargado" : "partidos cargados"} en el sistema.
            </CardDescription>
          </div>
          {packages.length > 0 && currentFile && (
            <ExportButton
              filename="imported-analysis-packages.json"
              getContent={() => JSON.stringify(currentFile, null, 2)}
              label="Exportar todo el JSON"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {packages.length === 0 ? (
          <EmptyState icon={Database} title="Todavía no hay partidos importados" description="Valida y confirma un JSON para verlo aquí." />
        ) : (
          <div className="space-y-2">
            {packages.map((pkg) => {
              const [home, away] = pkg.teams;
              return (
                <div key={pkg.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {home.shortName} vs {away.shortName}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {pkg.id}
                      </Badge>
                      Investigado el {formatDateLong(pkg.researchedAt.slice(0, 10))}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <ExportButton
                      filename={`${pkg.id}.json`}
                      getContent={() => JSON.stringify({ version: 1, packages: [pkg] }, null, 2)}
                      label="JSON"
                    />
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEditPackage(pkg)}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="icon-sm" aria-label={`Eliminar ${pkg.id}`}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>¿Eliminar este partido?</DialogTitle>
                          <DialogDescription>
                            Se eliminará por completo el paquete <span className="font-mono">{pkg.id}</span> ({home.shortName} vs{" "}
                            {away.shortName}) del sistema. Esta acción no se puede deshacer.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button variant="destructive" disabled={isBusy} onClick={() => void removePackageById(pkg.id)}>
                              Sí, eliminar
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
