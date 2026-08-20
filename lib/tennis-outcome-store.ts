import { promises as fs } from "fs";
import path from "path";
import type { TennisRecordedOutcome } from "@/types/tennis";

export interface TennisOutcomeFile {
  version: 1;
  outcomes: Record<string, TennisRecordedOutcome>;
}

export function getTennisOutcomeStorePath(): string {
  const override = process.env.TENNIS_OUTCOMES_STORE_PATH;
  return override ? path.resolve(override) : path.join(process.cwd(), "data", "tennis-recorded-outcomes.json");
}

function isRecordedOutcome(value: unknown, id: string): value is TennisRecordedOutcome {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return item.id === id
    && typeof item.winner === "string"
    && item.winner.trim().length > 0
    && typeof item.score === "string"
    && item.score.trim().length > 0
    && typeof item.recordedAt === "string"
    && !Number.isNaN(Date.parse(item.recordedAt));
}

export function parseTennisOutcomeFile(value: unknown): TennisOutcomeFile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("El almacenamiento de resultados de tenis no contiene un objeto válido.");
  }
  const file = value as Record<string, unknown>;
  if (file.version !== 1 || !file.outcomes || typeof file.outcomes !== "object" || Array.isArray(file.outcomes)) {
    throw new Error("El almacenamiento de resultados de tenis no cumple el esquema esperado.");
  }
  const entries = Object.entries(file.outcomes);
  if (entries.length > 500 || entries.some(([id, outcome]) => !isRecordedOutcome(outcome, id))) {
    throw new Error("El almacenamiento de resultados de tenis contiene registros inválidos.");
  }
  return { version: 1, outcomes: Object.fromEntries(entries) };
}

export async function readTennisOutcomeFile(filePath: string = getTennisOutcomeStorePath()): Promise<TennisOutcomeFile> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return parseTennisOutcomeFile(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { version: 1, outcomes: {} };
    if (error instanceof SyntaxError) throw new Error(`El archivo de resultados (${filePath}) contiene JSON inválido.`);
    throw error;
  }
}

export async function writeTennisOutcomeFile(file: TennisOutcomeFile, filePath: string = getTennisOutcomeStorePath()): Promise<void> {
  const validated = parseTennisOutcomeFile(file);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(validated, null, 2)}\n`, "utf-8");
  await fs.rename(temporaryPath, filePath);
}
