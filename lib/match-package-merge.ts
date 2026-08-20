import type { Competition, HistoryRecord, ImportedFile, ImportIssue, MatchPackage, Team } from "@/lib/validation/match-package";

// ============================================================================
// Fusión de paquetes de partidos importados.
//
// Reglas (ver README / pantalla "Agregar partido"):
// - Paquete con `id` nuevo -> se agrega.
// - Paquete con `id` existente -> se fusiona (nunca se pierde información no
//   reemplazada, nunca se borra nada de forma automática).
// - `match`, `teams` y `competitions` de un paquete describen SIEMPRE ese
//   mismo partido: en una actualización se reemplazan por la versión entrante
//   completa (que ya pasó la validación estricta, así que nunca es un dato
//   parcial o inválido pisando uno válido).
// - `histories` es acumulativo: los registros se fusionan por `matchId`
//   (el entrante gana en caso de conflicto), preservando los que no vinieron
//   en la nueva importación, y quedan ordenados por fecha descendente.
// - `sourceUrls` se une (sin duplicados). `dataQuality`/`historyMeta` se
//   reemplazan solo si el paquete entrante los trae; si no, se conserva lo
//   anterior.
// - Si el paquete entrante es idéntico al existente, se considera "sin
//   cambios" y no se reescribe nada (idempotencia).
// ============================================================================

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortValue((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

/** Fusiona dos listas de historial por fecha (o `matchId` de respaldo, el más nuevo gana) y ordena desc. por fecha. */
export function mergeHistoryRecords(oldRecords: HistoryRecord[], newRecords: HistoryRecord[]): HistoryRecord[] {
  const byKey = new Map<string, HistoryRecord>();
  if (Array.isArray(oldRecords)) {
    oldRecords.forEach((record) => {
      const key = record.date || record.matchId;
      byKey.set(key, record);
    });
  }
  if (Array.isArray(newRecords)) {
    newRecords.forEach((record) => {
      const key = record.date || record.matchId;
      const existing = byKey.get(key);
      if (existing) {
        byKey.set(key, { ...existing, ...record });
      } else {
        byKey.set(key, record);
      }
    });
  }
  return [...byKey.values()].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.matchId < b.matchId ? 1 : -1;
  });
}

export function mergeHistoriesMaps(
  oldMap: Record<string, HistoryRecord[]>,
  newMap: Record<string, HistoryRecord[]>
): Record<string, HistoryRecord[]> {
  const teamIds = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
  const result: Record<string, HistoryRecord[]> = {};
  for (const teamId of teamIds) {
    const oldRecords = oldMap[teamId] ?? [];
    const newRecords = newMap[teamId] ?? [];
    if (newRecords.length >= 10) {
      result[teamId] = [...newRecords];
    } else if (oldRecords.length >= 10 && newRecords.length === 0) {
      result[teamId] = [...oldRecords];
    } else {
      result[teamId] = mergeHistoryRecords(oldRecords, newRecords);
    }
  }
  return result;
}

export interface EntityDiffCounts {
  new: number;
  updated: number;
  unchanged: number;
}

function upsertById<T extends { id: string }>(oldList: T[], incomingList: T[]): { merged: T[]; diff: EntityDiffCounts } {
  const map = new Map(oldList.map((item) => [item.id, item]));
  const diff: EntityDiffCounts = { new: 0, updated: 0, unchanged: 0 };
  incomingList.forEach((item) => {
    const prev = map.get(item.id);
    if (!prev) diff.new += 1;
    else if (!deepEqual(prev, item)) diff.updated += 1;
    else diff.unchanged += 1;
    map.set(item.id, item);
  });
  return { merged: [...map.values()], diff };
}

export interface HistoryDiff {
  teamId: string;
  newRecords: number;
  updatedRecords: number;
  unchangedRecords: number;
}

function diffHistoryForTeam(oldRecords: HistoryRecord[], newRecords: HistoryRecord[]): Omit<HistoryDiff, "teamId"> {
  const oldById = new Map(oldRecords.map((record) => [record.matchId, record]));
  let newCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  newRecords.forEach((record) => {
    const prev = oldById.get(record.matchId);
    if (!prev) newCount += 1;
    else if (!deepEqual(prev, record)) updatedCount += 1;
    else unchangedCount += 1;
  });
  return { newRecords: newCount, updatedRecords: updatedCount, unchangedRecords: unchangedCount };
}

export interface PackageDiff {
  packageId: string;
  status: "new" | "updated" | "unchanged";
  matchId: string;
  matchLabel: string;
  competitions: EntityDiffCounts;
  teams: EntityDiffCounts;
  matchChanged: boolean;
  histories: HistoryDiff[];
  sourceUrlsAdded: number;
}

function labelFor(pkg: MatchPackage): string {
  const home = pkg.teams.find((t) => t.id === pkg.match.homeTeamId) as Team | undefined;
  const away = pkg.teams.find((t) => t.id === pkg.match.awayTeamId) as Team | undefined;
  return `${home?.shortName ?? pkg.match.homeTeamId} vs ${away?.shortName ?? pkg.match.awayTeamId}`;
}

/** Compara un paquete entrante contra el existente (si lo hay) sin mutar nada. */
export function diffPackage(existing: MatchPackage | undefined, incoming: MatchPackage): PackageDiff {
  if (!existing) {
    return {
      packageId: incoming.id,
      status: "new",
      matchId: incoming.match.id,
      matchLabel: labelFor(incoming),
      competitions: { new: incoming.competitions.length, updated: 0, unchanged: 0 },
      teams: { new: incoming.teams.length, updated: 0, unchanged: 0 },
      matchChanged: true,
      histories: Object.entries(incoming.histories).map(([teamId, records]) => ({
        teamId,
        newRecords: records.length,
        updatedRecords: 0,
        unchangedRecords: 0,
      })),
      sourceUrlsAdded: incoming.sourceUrls.length,
    };
  }

  const identical = deepEqual(existing, incoming);
  const { diff: competitions } = upsertById<Competition>(existing.competitions, incoming.competitions);
  const { diff: teams } = upsertById<Team>(existing.teams, incoming.teams);
  const matchChanged = !deepEqual(existing.match, incoming.match);
  const teamIds = new Set([...Object.keys(existing.histories), ...Object.keys(incoming.histories)]);
  const histories = [...teamIds].map((teamId) => ({
    teamId,
    ...diffHistoryForTeam(existing.histories[teamId] ?? [], incoming.histories[teamId] ?? []),
  }));
  const sourceUrlsAdded = incoming.sourceUrls.filter((url) => !existing.sourceUrls.includes(url)).length;

  return {
    packageId: incoming.id,
    status: identical ? "unchanged" : "updated",
    matchId: incoming.match.id,
    matchLabel: labelFor(incoming),
    competitions,
    teams,
    matchChanged,
    histories,
    sourceUrlsAdded,
  };
}

/** Fusiona un paquete existente con su versión entrante siguiendo las reglas del módulo. */
export function mergePackage(existing: MatchPackage, incoming: MatchPackage): MatchPackage {
  return {
    id: incoming.id,
    researchedAt: existing.researchedAt > incoming.researchedAt ? existing.researchedAt : incoming.researchedAt,
    sourceUrls: [...new Set([...existing.sourceUrls, ...incoming.sourceUrls])],
    // match/teams/competitions describen un único partido: la versión entrante
    // ya es un objeto completo y válido, así que reemplaza a la anterior.
    competitions: incoming.competitions,
    teams: incoming.teams,
    match: incoming.match,
    histories: mergeHistoriesMaps(existing.histories, incoming.histories),
    dataQuality: incoming.dataQuality ?? existing.dataQuality,
    historyMeta: incoming.historyMeta ?? existing.historyMeta,
    historySummary: incoming.historySummary ?? existing.historySummary,
  };
}

export interface ImportSummary {
  packages: PackageDiff[];
  totals: {
    newPackages: number;
    updatedPackages: number;
    unchangedPackages: number;
    newTeams: number;
    updatedTeams: number;
    newHistoryRecords: number;
    updatedHistoryRecords: number;
  };
}

export function summarizeDiffs(diffs: PackageDiff[]): ImportSummary {
  const totals = diffs.reduce(
    (acc, diff) => {
      if (diff.status === "new") acc.newPackages += 1;
      if (diff.status === "updated") acc.updatedPackages += 1;
      if (diff.status === "unchanged") acc.unchangedPackages += 1;
      acc.newTeams += diff.teams.new;
      acc.updatedTeams += diff.teams.updated;
      diff.histories.forEach((h) => {
        acc.newHistoryRecords += h.newRecords;
        acc.updatedHistoryRecords += h.updatedRecords;
      });
      return acc;
    },
    {
      newPackages: 0,
      updatedPackages: 0,
      unchangedPackages: 0,
      newTeams: 0,
      updatedTeams: 0,
      newHistoryRecords: 0,
      updatedHistoryRecords: 0,
    }
  );
  return { packages: diffs, totals };
}

export function hasPendingChanges(summary: ImportSummary): boolean {
  return summary.totals.newPackages > 0 || summary.totals.updatedPackages > 0;
}

/**
 * Detecta conflictos entre el lote entrante y el almacén actual que la
 * validación de esquema por sí sola no puede ver: un `match.id` que ya
 * pertenece a OTRO paquete existente.
 */
export function findCrossPackageConflicts(current: ImportedFile, incoming: MatchPackage[]): ImportIssue[] {
  const matchOwners = new Map(current.packages.map((p) => [p.match.id, p.id]));
  const issues: ImportIssue[] = [];
  incoming.forEach((pkg, index) => {
    const owner = matchOwners.get(pkg.match.id);
    if (owner && owner !== pkg.id) {
      issues.push({
        path: `packages.${index}.match.id`,
        field: "match.id",
        message: `match.id "${pkg.match.id}" ya pertenece al paquete existente "${owner}", pero este paquete usa el id "${pkg.id}".`,
        received: `"${pkg.id}"`,
        expected: `El paquete "${owner}" (mismo match.id)`,
        hint: `Si es el mismo partido, usa el id de paquete "${owner}" para actualizarlo. Si es un partido distinto, corrige el match.id.`,
      });
    }
  });
  return issues;
}

/** Calcula el diff de cada paquete entrante y devuelve el archivo fusionado (sin escribirlo a disco). */
export function mergeImportedFile(current: ImportedFile, incoming: MatchPackage[]): { file: ImportedFile; summary: ImportSummary } {
  let packages = [...current.packages];
  const diffs: PackageDiff[] = [];

  for (const pkg of incoming) {
    const existingIndex = packages.findIndex((p) => p.id === pkg.id);
    const existing = existingIndex >= 0 ? packages[existingIndex] : undefined;
    const diff = diffPackage(existing, pkg);
    diffs.push(diff);

    if (diff.status === "unchanged") continue;
    if (existing) {
      packages = packages.map((p, i) => (i === existingIndex ? mergePackage(existing, pkg) : p));
    } else {
      packages = [...packages, pkg];
    }
  }

  return { file: { version: 1, packages }, summary: summarizeDiffs(diffs) };
}

/** Vista previa: mismo cálculo que mergeImportedFile pero solo el resumen, para mostrar antes de confirmar. */
export function previewImport(current: ImportedFile, incoming: MatchPackage[]): ImportSummary {
  return mergeImportedFile(current, incoming).summary;
}

/** Elimina un paquete completo por id — la única forma de borrar datos, y siempre explícita. */
export function removePackage(current: ImportedFile, packageId: string): ImportedFile {
  return { version: 1, packages: current.packages.filter((p) => p.id !== packageId) };
}
