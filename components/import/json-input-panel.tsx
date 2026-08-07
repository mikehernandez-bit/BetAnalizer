"use client";

import * as React from "react";
import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UseMatchImportResult } from "@/hooks/use-match-import";

interface JsonInputPanelProps {
  importState: UseMatchImportResult;
}

export function JsonInputPanel({ importState }: JsonInputPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { rawText, setRawText, loadFile, validate, parseError, isBusy, stage } = importState;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await loadFile(file);
    e.target.value = "";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar partido</CardTitle>
        <CardDescription>Sube el archivo .json que te devolvió la IA, o pega el contenido directamente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileChange} />
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" /> Subir archivo .json
          </Button>
          <span className="text-xs text-muted-foreground">o pega el JSON abajo</span>
        </div>

        <Textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder='{"version": 1, "packages": [ ... ]}'
          className="min-h-64 font-mono text-xs"
          spellCheck={false}
          aria-invalid={Boolean(parseError)}
        />

        {parseError && (
          <Alert variant="destructive">
            <AlertTitle>JSON mal formado</AlertTitle>
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button type="button" className="gap-1.5" onClick={() => void validate()} disabled={isBusy || !rawText.trim()}>
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {stage === "previewing" ? "Validando..." : "Validar JSON"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
