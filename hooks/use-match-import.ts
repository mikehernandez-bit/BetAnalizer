"use client";

import * as React from "react";
import { validateImportBatch, type ImportIssue, type MatchPackage } from "@/lib/validation/match-package";
import type { ImportSummary } from "@/lib/match-package-merge";
import { confirmImportRequest, deletePackageRequest, fetchCurrentPackages, previewImportRequest } from "@/services/match-import-service";
import type { ImportedFile } from "@/lib/validation/match-package";

export type ImportStage = "empty" | "invalid_json" | "invalid_schema" | "validated" | "previewing" | "previewed" | "importing" | "imported";

export interface UseMatchImportResult {
  rawText: string;
  setRawText: (text: string) => void;
  loadFile: (file: File) => Promise<void>;
  stage: ImportStage;
  parseError: string | null;
  issues: ImportIssue[];
  packages: MatchPackage[] | null;
  summary: ImportSummary | null;
  successMessage: string | null;
  errorMessage: string | null;
  isBusy: boolean;
  currentFile: ImportedFile | null;
  loadCurrentFile: () => Promise<void>;
  validate: () => Promise<void>;
  confirmImport: () => Promise<void>;
  reset: () => void;
  loadPackageForEditing: (pkg: MatchPackage) => void;
  removePackageById: (packageId: string) => Promise<void>;
}

export function useMatchImport(): UseMatchImportResult {
  const [rawText, setRawTextState] = React.useState("");
  const [stage, setStage] = React.useState<ImportStage>("empty");
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [issues, setIssues] = React.useState<ImportIssue[]>([]);
  const [packages, setPackages] = React.useState<MatchPackage[] | null>(null);
  const [summary, setSummary] = React.useState<ImportSummary | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);
  const [currentFile, setCurrentFile] = React.useState<ImportedFile | null>(null);

  const setRawText = React.useCallback((text: string) => {
    setRawTextState(text);
    setStage("empty");
    setParseError(null);
    setIssues([]);
    setPackages(null);
    setSummary(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const loadFile = React.useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".json")) {
        setErrorMessage("Solo se aceptan archivos .json.");
        return;
      }
      const text = await file.text();
      setRawText(text);
    },
    [setRawText]
  );

  const loadCurrentFile = React.useCallback(async () => {
    try {
      const file = await fetchCurrentPackages();
      setCurrentFile(file);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, []);

  const validate = React.useCallback(async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIssues([]);
    setSummary(null);

    if (!rawText.trim()) {
      setParseError("Pega o sube un JSON primero.");
      setStage("invalid_json");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      setParseError(`JSON mal formado: ${(error as Error).message}`);
      setPackages(null);
      setStage("invalid_json");
      return;
    }
    setParseError(null);

    const batch = validateImportBatch(parsed);
    if (!batch.success) {
      setIssues(batch.issues);
      setPackages(null);
      setStage("invalid_schema");
      return;
    }

    setPackages(batch.packages);
    setStage("validated");

    setIsBusy(true);
    setStage("previewing");
    try {
      const result = await previewImportRequest(parsed);
      if (!result.success) {
        setIssues(result.issues);
        setErrorMessage(result.message);
        setStage("invalid_schema");
        return;
      }
      setSummary(result.summary);
      setStage("previewed");
    } catch (error) {
      setErrorMessage((error as Error).message);
      setStage("validated");
    } finally {
      setIsBusy(false);
    }
  }, [rawText]);

  const confirmImport = React.useCallback(async () => {
    if (!rawText.trim()) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      setParseError(`JSON mal formado: ${(error as Error).message}`);
      return;
    }

    setIsBusy(true);
    setStage("importing");
    setErrorMessage(null);
    try {
      const result = await confirmImportRequest(parsed);
      if (!result.success) {
        setIssues(result.issues);
        setErrorMessage(result.message);
        setStage("previewed");
        return;
      }
      setSummary(result.summary);
      setCurrentFile(result.file);
      setStage("imported");
      const t = result.summary.totals;
      const parts: string[] = [];
      if (t.newPackages) parts.push(`${t.newPackages} partido(s) nuevo(s)`);
      if (t.updatedPackages) parts.push(`${t.updatedPackages} actualizado(s)`);
      if (t.unchangedPackages && !t.newPackages && !t.updatedPackages) parts.push("sin cambios (ya estaba importado)");
      setSuccessMessage(`Importación completada: ${parts.join(", ") || "sin cambios"}.`);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setStage("previewed");
    } finally {
      setIsBusy(false);
    }
  }, [rawText]);

  const reset = React.useCallback(() => {
    setRawTextState("");
    setStage("empty");
    setParseError(null);
    setIssues([]);
    setPackages(null);
    setSummary(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const loadPackageForEditing = React.useCallback(
    (pkg: MatchPackage) => {
      setRawText(JSON.stringify({ version: 1, packages: [pkg] }, null, 2));
    },
    [setRawText]
  );

  const removePackageById = React.useCallback(async (packageId: string) => {
    setIsBusy(true);
    setErrorMessage(null);
    try {
      const file = await deletePackageRequest(packageId);
      setCurrentFile(file);
      setSuccessMessage(`Paquete "${packageId}" eliminado.`);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }, []);

  return {
    rawText,
    setRawText,
    loadFile,
    stage,
    parseError,
    issues,
    packages,
    summary,
    successMessage,
    errorMessage,
    isBusy,
    currentFile,
    loadCurrentFile,
    validate,
    confirmImport,
    reset,
    loadPackageForEditing,
    removePackageById,
  };
}
