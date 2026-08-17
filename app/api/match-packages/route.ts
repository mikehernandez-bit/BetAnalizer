import { NextRequest } from "next/server";
import { validateImportBatch, type ImportIssue } from "@/lib/validation/match-package";
import { findCrossPackageConflicts, hasPendingChanges, mergeImportedFile, removePackage } from "@/lib/match-package-merge";
import { readImportedFile, writeImportedFile } from "@/lib/match-package-store";

// Lee/escribe directamente el archivo en disco en cada request: no depende
// de caché de módulo ni de fetch cache — ESTA ruta siempre ve el dato más
// reciente. El problema es el RESTO del sitio: data/teams.ts, data/matches.ts,
// etc. hacen `import rawPackages from "@/data/imported-analysis-packages.json"`
// y calculan sus arrays UNA SOLA VEZ cuando el proceso de Node arranca — en
// `next dev` no se nota porque el watcher de Next recompila esos módulos
// solos; en producción (`next start` / standalone, que es lo que corre
// Docker) nadie los vuelve a evaluar, así que un partido importado queda
// invisible en el dashboard/"Encuentros analizados"/etc. hasta que el
// proceso se reinicia. Por eso, después de escribir un cambio real en
// producción, se reinicia el proceso a propósito — con `restart:
// unless-stopped` en docker-compose.yml, vuelve a levantar solo en segundos,
// ya con los datos frescos.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function scheduleProcessRestartIfNeeded() {
  if (process.env.NODE_ENV === "production") {
    setTimeout(() => process.exit(0), 500);
  }
}

/** GET: estado actual completo (usado para la comparación y para "Exportar JSON"). */
export async function GET() {
  try {
    const file = await readImportedFile();
    return Response.json({ success: true, ...file });
  } catch (error) {
    return Response.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

/**
 * POST: valida un lote de paquetes (y, si `confirm` es true, lo fusiona y
 * persiste). Sin `confirm`, es un "dry run" que solo devuelve el resumen de
 * cambios para la vista previa — no toca el disco.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "El cuerpo de la petición no es JSON válido.", issues: [] as ImportIssue[] },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null || !("packages" in body)) {
    return Response.json(
      { success: false, message: 'Falta el campo "packages" en el cuerpo de la petición.', issues: [] as ImportIssue[] },
      { status: 400 }
    );
  }

  const { packages: rawPackages, confirm } = body as { packages: unknown; confirm?: boolean };

  const batch = validateImportBatch(rawPackages);
  if (!batch.success) {
    return Response.json({ success: false, message: "El JSON no pasó la validación.", issues: batch.issues }, { status: 422 });
  }

  let current;
  try {
    current = await readImportedFile();
  } catch (error) {
    return Response.json({ success: false, message: (error as Error).message, issues: [] as ImportIssue[] }, { status: 500 });
  }

  const conflicts = findCrossPackageConflicts(current, batch.packages);
  if (conflicts.length > 0) {
    return Response.json(
      { success: false, message: "Se detectaron conflictos con paquetes ya importados.", issues: conflicts },
      { status: 409 }
    );
  }

  const { file, summary } = mergeImportedFile(current, batch.packages);
  const pending = hasPendingChanges(summary);

  if (!confirm) {
    return Response.json({ success: true, confirmed: false, summary });
  }

  if (pending) {
    try {
      await writeImportedFile(file);
    } catch (error) {
      return Response.json({ success: false, message: (error as Error).message, issues: [] as ImportIssue[] }, { status: 500 });
    }
  }

  const response = Response.json({ success: true, confirmed: true, summary, ...file });
  if (pending) scheduleProcessRestartIfNeeded();
  return response;
}

/** DELETE: elimina un paquete completo por id — única forma de borrar datos, siempre explícita. */
export async function DELETE(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  const packageId = typeof body === "object" && body !== null ? (body as Record<string, unknown>).packageId : undefined;
  if (typeof packageId !== "string" || packageId.length === 0) {
    return Response.json({ success: false, message: 'Falta el campo "packageId".' }, { status: 400 });
  }

  const current = await readImportedFile();
  if (!current.packages.some((p) => p.id === packageId)) {
    return Response.json({ success: false, message: `No existe ningún paquete con id "${packageId}".` }, { status: 404 });
  }

  const next = removePackage(current, packageId);
  await writeImportedFile(next);
  const response = Response.json({ success: true, ...next });
  scheduleProcessRestartIfNeeded();
  return response;
}
