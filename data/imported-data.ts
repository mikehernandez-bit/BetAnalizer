import rawPackages from "@/data/imported-analysis-packages.json";
import type { Competition, Match, Team, TeamMatchRecord } from "@/types";
import { importedFileSchema, removeLegacyHistoryAliases, type ImportedFile } from "@/lib/validation/match-package";
import { mergeHistoriesMaps } from "@/lib/match-package-merge";

// El esquema de validación vive en lib/validation/match-package.ts: lo usan
// tanto esta carga estática (build time) como la ruta API de "Agregar
// partido" (runtime), para no tener dos definiciones de la misma estructura.
const importedFile = importedFileSchema.parse(removeLegacyHistoryAliases(rawPackages));

export function mergeById<T extends { id: string }>(base: T[], imported: T[]): T[] {
  return [...new Map([...base, ...imported].map((item) => [item.id, item])).values()];
}

/**
 * Aplana un archivo de paquetes (`{ version, packages }`) a las cuatro
 * colecciones planas que consume el resto de `data/*.ts`. Exportada (en vez
 * de quedar inline) para poder probarla con datos sintéticos sin tocar el
 * archivo real en disco — ver tests/data-integration.test.ts.
 *
 * Varios paquetes pueden compartir un mismo equipo (ej: dos partidos
 * distintos del mismo club, importados por separado): el historial se
 * fusiona por matchId (igual que al importar una actualización) en vez de
 * pisarse, así no se pierde ningún partido histórico investigado antes.
 */
export function flattenImportedFile(file: ImportedFile) {
  return {
    competitions: file.packages.flatMap((item) => item.competitions) as Competition[],
    teams: file.packages.flatMap((item) => item.teams) as Team[],
    matches: file.packages.map((item) => item.match) as Match[],
    histories: file.packages.reduce<Record<string, TeamMatchRecord[]>>(
      (acc, item) => mergeHistoriesMaps(acc, item.histories) as Record<string, TeamMatchRecord[]>,
      {}
    ),
  };
}

const flattened = flattenImportedFile(importedFile);
export const importedCompetitions = flattened.competitions;
export const importedTeams = flattened.teams;
export const importedMatches = flattened.matches;
export const importedHistories = flattened.histories;

/** Devuelve el paquete completo asociado a un partido importado. */
export function getImportedPackage(matchId: string) {
  return importedFile.packages.find((item) => item.match.id === matchId);
}

export function getImportedSources(matchId: string): string[] {
  return getImportedPackage(matchId)?.sourceUrls ?? [];
}
