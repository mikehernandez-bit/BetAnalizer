import { promises as fs } from "fs";
import path from "path";
import { importedFileSchema, type ImportedFile } from "@/lib/validation/match-package";

// ============================================================================
// Persistencia de los paquetes importados.
//
// El proyecto no tiene backend/DB: los datos "reales" viven en
// `data/imported-analysis-packages.json` y se leen con un `import` estático
// en `data/imported-data.ts` (ver README, sección "Metodología de datos").
// Este módulo es la única pieza que escribe ese archivo en runtime (desde la
// ruta API de "Agregar partido"), reutilizando exactamente el mismo archivo
// y la misma forma que ya consume el resto de la app — así no se rompe nada
// existente y `next dev` recompila las páginas que dependen de él en cuanto
// cambia. Solo se importa desde código de servidor (route handlers).
//
// La ruta se resuelve de forma perezosa (no en un `const` de import) y admite
// un override por variable de entorno: así las pruebas automatizadas pueden
// apuntar a un archivo temporal en vez de escribir sobre los datos reales del
// proyecto, sin tener que tocar la ruta API en sí.
// ============================================================================

export function getStorePath(): string {
  const override = process.env.MATCH_PACKAGES_STORE_PATH;
  return override ? path.resolve(override) : path.join(process.cwd(), "data", "imported-analysis-packages.json");
}

/** Lee el archivo de paquetes importados directamente del disco (sin caché de módulo). */
export async function readImportedFile(filePath: string = getStorePath()): Promise<ImportedFile> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return { version: 1, packages: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`El archivo de almacenamiento (${filePath}) contiene JSON inválido.`);
  }

  const result = importedFileSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`El archivo de almacenamiento (${filePath}) no cumple el esquema esperado.`);
  }
  return result.data;
}

/** Escribe el archivo de paquetes importados (2 espacios de indentación, igual que el archivo original). */
export async function writeImportedFile(file: ImportedFile, filePath: string = getStorePath()): Promise<void> {
  const json = `${JSON.stringify(file, null, 2)}\n`;
  await fs.writeFile(filePath, json, "utf-8");
}
