import { promises as fs } from "fs";
import path from "path";
import type { RecordedMatchOutcome } from "@/types";

export interface FootballOutcomeFile {
  version: 1;
  outcomes: Record<string, RecordedMatchOutcome>;
}

export function getFootballOutcomeStorePath(): string {
  const override = process.env.FOOTBALL_OUTCOMES_STORE_PATH;
  return override ? path.resolve(override) : path.join(process.cwd(), "data", "football-recorded-outcomes.json");
}

function isRecordedMatchOutcome(value: unknown): value is RecordedMatchOutcome {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.homeGoals === "number" &&
    typeof item.awayGoals === "number" &&
    typeof item.recordedAt === "string" &&
    !Number.isNaN(Date.parse(item.recordedAt))
  );
}

export function parseFootballOutcomeFile(value: unknown): FootballOutcomeFile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("El almacenamiento de resultados de fÃºtbol no contiene un objeto vÃ¡lido.");
  }
  const file = value as Record<string, unknown>;
  if (file.version !== 1 || !file.outcomes || typeof file.outcomes !== "object" || Array.isArray(file.outcomes)) {
    throw new Error("El almacenamiento de resultados de fÃºtbol no cumple el esquema esperado.");
  }
  const entries = Object.entries(file.outcomes);
  if (entries.length > 2000 || entries.some(([, outcome]) => !isRecordedMatchOutcome(outcome))) {
    throw new Error("El almacenamiento de resultados de fÃºtbol contiene registros invÃ¡lidos.");
  }
  return { version: 1, outcomes: Object.fromEntries(entries) as Record<string, RecordedMatchOutcome> };
}

export async function readFootballOutcomeFile(filePath: string = getFootballOutcomeStorePath()): Promise<FootballOutcomeFile> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return parseFootballOutcomeFile(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { version: 1, outcomes: {} };
    if (error instanceof SyntaxError) throw new Error(`El archivo de resultados (${filePath}) contiene JSON invÃ¡lido.`);
    throw error;
  }
}

export async function writeFootballOutcomeFile(
  file: FootballOutcomeFile,
  filePath: string = getFootballOutcomeStorePath()
): Promise<void> {
  const validated = parseFootballOutcomeFile(file);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(validated, null, 2)}\n`, "utf-8");
  await fs.rename(temporaryPath, filePath);
}