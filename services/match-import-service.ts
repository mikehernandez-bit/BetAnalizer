import type { ImportedFile, ImportIssue } from "@/lib/validation/match-package";
import type { ImportSummary } from "@/lib/match-package-merge";

// Capa de servicio para la pantalla "Agregar partido": a diferencia del resto
// de services/*.ts (que envuelven data/ directamente), este envuelve la ruta
// API /api/match-packages porque necesita escribir en disco, algo que solo
// puede pasar en el servidor. Mantiene el mismo espíritu: la UI nunca llama
// a fetch() directamente, solo a funciones con nombre de este archivo.

export interface PreviewResult {
  success: true;
  confirmed: false;
  summary: ImportSummary;
}

export interface ConfirmResult {
  success: true;
  confirmed: true;
  summary: ImportSummary;
  file: ImportedFile;
}

export interface ImportErrorResult {
  success: false;
  message: string;
  issues: ImportIssue[];
}

async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function fetchCurrentPackages(): Promise<ImportedFile> {
  const res = await fetch("/api/match-packages", { cache: "no-store" });
  const data = await parseJsonSafe(res);
  if (!res.ok || !data.success) {
    throw new Error(typeof data.message === "string" ? data.message : "No se pudo obtener el estado actual.");
  }
  return { version: 1, packages: (data.packages as ImportedFile["packages"]) ?? [] };
}

async function postBatch(packages: unknown, confirm: boolean): Promise<PreviewResult | ConfirmResult | ImportErrorResult> {
  const res = await fetch("/api/match-packages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packages, confirm }),
  });
  const data = await parseJsonSafe(res);

  if (!res.ok || !data.success) {
    return {
      success: false,
      message: typeof data.message === "string" ? data.message : "No se pudo procesar el JSON.",
      issues: (data.issues as ImportIssue[]) ?? [],
    };
  }

  if (confirm) {
    return {
      success: true,
      confirmed: true,
      summary: data.summary as ImportSummary,
      file: { version: 1, packages: (data.packages as ImportedFile["packages"]) ?? [] },
    };
  }
  return { success: true, confirmed: false, summary: data.summary as ImportSummary };
}

/** Valida en el servidor y calcula el diff contra el estado actual, sin escribir nada. */
export async function previewImportRequest(packages: unknown): Promise<PreviewResult | ImportErrorResult> {
  return (await postBatch(packages, false)) as PreviewResult | ImportErrorResult;
}

/** Valida, fusiona y persiste (a menos que no haya cambios pendientes). */
export async function confirmImportRequest(packages: unknown): Promise<ConfirmResult | ImportErrorResult> {
  return (await postBatch(packages, true)) as ConfirmResult | ImportErrorResult;
}

export async function deletePackageRequest(packageId: string): Promise<ImportedFile> {
  const res = await fetch("/api/match-packages", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packageId }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok || !data.success) {
    throw new Error(typeof data.message === "string" ? data.message : "No se pudo eliminar el paquete.");
  }
  return { version: 1, packages: (data.packages as ImportedFile["packages"]) ?? [] };
}
