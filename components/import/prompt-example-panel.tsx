"use client";

import * as React from "react";
import { Check, Copy, FileJson, MessageSquareText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/shared/export-button";
import { getStrictMatchPackagePrompt, MATCH_PACKAGE_EXAMPLE_JSON } from "@/lib/match-package-prompt";

function CopyButton({ getText, label }: { getText: () => string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API no disponible (permiso denegado, contexto no seguro, etc.)
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
      {copied ? <Check className="size-4 text-brand-green" /> : <Copy className="size-4" />}
      {copied ? "Copiado" : label}
    </Button>
  );
}

export function PromptExamplePanel() {
  const strictPrompt = React.useMemo(() => getStrictMatchPackagePrompt(), []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="size-4 text-brand-green-bright" /> Prompt para otra IA
              </CardTitle>
              <CardDescription className="mt-1">
                Cópialo y pégalo en Claude, ChatGPT u otra IA. Pídele el partido que quieras investigar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CopyButton getText={() => strictPrompt} label="Copiar prompt" />
          <pre className="max-h-72 overflow-auto rounded-lg bg-muted/50 p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {strictPrompt}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="size-4 text-brand-green-bright" /> Ejemplo de JSON válido
          </CardTitle>
          <CardDescription className="mt-1">Estructura exacta que debe devolver la IA (o que puedes editar a mano).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <CopyButton getText={() => MATCH_PACKAGE_EXAMPLE_JSON} label="Copiar ejemplo" />
            <ExportButton filename="ejemplo-partido.json" getContent={() => MATCH_PACKAGE_EXAMPLE_JSON} label="Descargar ejemplo" />
          </div>
          <pre className="max-h-72 overflow-auto rounded-lg bg-muted/50 p-3 text-[11px] leading-relaxed whitespace-pre text-muted-foreground">
            {MATCH_PACKAGE_EXAMPLE_JSON}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
