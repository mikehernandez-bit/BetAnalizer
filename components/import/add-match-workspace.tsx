"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMatchImport } from "@/hooks/use-match-import";
import { PromptExamplePanel } from "@/components/import/prompt-example-panel";
import { JsonInputPanel } from "@/components/import/json-input-panel";
import { ValidationIssuesList } from "@/components/import/validation-issues-list";
import { ImportPreview } from "@/components/import/import-preview";
import { ImportedPackagesPanel } from "@/components/import/imported-packages-panel";
import { ApiFootballPanel } from "@/components/import/api-football-panel";
import type { MatchPackage } from "@/lib/validation/match-package";

export function AddMatchWorkspace() {
  const importState = useMatchImport();
  const [tab, setTab] = React.useState("api");

  React.useEffect(() => {
    void importState.loadCurrentFile();
    // Solo al montar: el resto de las actualizaciones vienen de las acciones del propio flujo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEditPackage(pkg: MatchPackage) {
    importState.loadPackageForEditing(pkg);
    setTab("importar");
  }

  function handleApiPackage(pkg: MatchPackage) {
    importState.loadPackageForEditing(pkg);
    setTab("importar");
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="api">Consultar API</TabsTrigger>
          <TabsTrigger value="prompt">Prompt y ejemplo</TabsTrigger>
          <TabsTrigger value="importar">Importar / editar JSON</TabsTrigger>
          <TabsTrigger value="paquetes">Paquetes importados ({importState.currentFile?.packages.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="mt-4">
          <ApiFootballPanel onPackageReady={handleApiPackage} />
        </TabsContent>

        <TabsContent value="prompt" className="mt-4">
          <PromptExamplePanel />
        </TabsContent>

        <TabsContent value="importar" className="mt-4 space-y-4">
          <JsonInputPanel importState={importState} />

          {importState.successMessage && (
            <Alert>
              <CheckCircle2 className="text-brand-green" />
              <AlertTitle>Listo</AlertTitle>
              <AlertDescription>{importState.successMessage}</AlertDescription>
            </Alert>
          )}

          {importState.errorMessage && (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>No se pudo completar la operación</AlertTitle>
              <AlertDescription>{importState.errorMessage}</AlertDescription>
            </Alert>
          )}

          <ValidationIssuesList issues={importState.issues} />

          {importState.summary && <ImportPreview importState={importState} />}
        </TabsContent>

        <TabsContent value="paquetes" className="mt-4">
          <ImportedPackagesPanel importState={importState} onEditPackage={handleEditPackage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
