import { z } from "zod";

// ============================================================================
// Esquema de validación para paquetes de partidos importados vía JSON.
//
// Es la fuente única de verdad para la forma "ESTRUCTURA JSON OBLIGATORIA"
// documentada en la pantalla "Agregar partido": la usan tanto la carga
// estática de `data/imported-analysis-packages.json` (build time) como la
// ruta API `/api/match-packages` (runtime, datos pegados/subidos por el
// usuario). No cambia `types/` — sigue siendo el contrato de dominio; este
// archivo solo valida la forma de un paquete "crudo" antes de fusionarlo.
// ============================================================================

export const MIN_HISTORY_PER_TEAM = 4;
/** No es un mínimo de esquema (eso sigue siendo MIN_HISTORY_PER_TEAM): es lo que le exigimos
 *  a la IA en el prompt como estándar, para que el historial tenga suficiente profundidad. */
export const RECOMMENDED_HISTORY_PER_TEAM = 10;

const DATA_STATUS_VALUES = ["verified", "provided", "estimated"] as const;
export type DataStatus = (typeof DATA_STATUS_VALUES)[number];
const dataStatusSchema = z.enum(DATA_STATUS_VALUES);

const resultLetterSchema = z.enum(["W", "D", "L"]);
const competitionTypeSchema = z.enum(["league", "cup", "continental", "friendly"]);
const matchStatusSchema = z.enum(["scheduled", "live", "finished", "postponed"]);
const venueSchema = z.enum(["local", "visitante"]);

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal de 6 dígitos, ej: #16A34A");

const idSchema = z
  .string()
  .min(1, "El id no puede estar vacío")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones (kebab-case), sin espacios");

const urlSchema = z.url("Debe ser una URL completa (http:// o https://)");

// ----------------------------------------------------------------------------
// Bloques
// ----------------------------------------------------------------------------

export const competitionSchema = z
  .strictObject({
    id: idSchema,
    name: z.string().min(1),
    shortName: z.string().min(1),
    country: z.string().min(1),
    tier: z.number().int().positive(),
    season: z.string().min(1),
    color: hexColorSchema,
    totalTeams: z.number().int().positive(),
  })
  .describe("competition");

export const teamSchema = z
  .strictObject({
    id: idSchema,
    name: z.string().min(1),
    shortName: z.string().min(1),
    code: z.string().min(2).max(4),
    country: z.string().min(1),
    competitionId: z.string().min(1),
    stadium: z.string().min(1),
    founded: z.number().int().positive(),
    primaryColor: hexColorSchema,
    secondaryColor: hexColorSchema,
    position: z.number().int().positive(),
    played: z.number().int().nonnegative(),
    won: z.number().int().nonnegative(),
    drawn: z.number().int().nonnegative(),
    lost: z.number().int().nonnegative(),
    goalsFor: z.number().int().nonnegative(),
    goalsAgainst: z.number().int().nonnegative(),
    points: z.number().int().nonnegative(),
    form: z.array(resultLetterSchema).min(1).max(10),
    avgGoalsFor: z.number().nonnegative(),
    avgGoalsAgainst: z.number().nonnegative(),
    avgCorners: z.number().nonnegative(),
  })
  .describe("team");

export const matchSchema = z
  .strictObject({
    id: idSchema,
    competitionId: z.string().min(1),
    competitionType: competitionTypeSchema,
    season: z.string().min(1),
    matchday: z.number().int().positive(),
    date: z.iso.date("Fecha inválida, usa formato YYYY-MM-DD"),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usa formato HH:mm en 24 horas, ej: 20:00"),
    stadium: z.string().min(1),
    neutralVenue: z.boolean().optional(),
    homeTeamId: z.string().min(1),
    awayTeamId: z.string().min(1),
    status: matchStatusSchema,
  })
  .describe("match");

export const historyRecordSchema = z
  .strictObject({
    matchId: idSchema,
    date: z.iso.date("Fecha inválida, usa formato YYYY-MM-DD"),
    opponentId: z.string().min(1),
    competitionId: z.string().min(1),
    competitionType: competitionTypeSchema,
    venue: venueSchema,
    result: resultLetterSchema,
    goalsFor: z.number().int().nonnegative(),
    goalsAgainst: z.number().int().nonnegative(),
    cornersFor: z.number().int().nonnegative(),
    cornersAgainst: z.number().int().nonnegative(),
    shotsFor: z.number().int().nonnegative(),
    shotsAgainst: z.number().int().nonnegative(),
    shotsOnTargetFor: z.number().int().nonnegative(),
    shotsOnTargetAgainst: z.number().int().nonnegative(),
    possession: z.number().min(0).max(100),
    yellowCards: z.number().int().nonnegative(),
    redCards: z.number().int().nonnegative(),
    yellowCardsAgainst: z.number().int().nonnegative().optional(),
    redCardsAgainst: z.number().int().nonnegative().optional(),
    resultStatus: dataStatusSchema.optional(),
    statsStatus: dataStatusSchema.optional(),
    note: z.string().min(1).optional(),
  })
  .describe("historyRecord");

const dataQualitySchema = z
  .strictObject({
    resultData: dataStatusSchema.optional(),
    providedAdvancedStats: dataStatusSchema.optional(),
    newAdvancedStats: dataStatusSchema.optional(),
    warning: z.string().min(1).optional(),
  })
  .describe("dataQuality");

const historyMetaSchema = z
  .strictObject({
    matchesPerTeam: z.number().int().nonnegative().optional(),
    newMatchesPerTeam: z.number().int().nonnegative().optional(),
    sortOrder: z.string().optional(),
    verifiedFieldsForNewMatches: z.array(z.string()).optional(),
    estimatedFieldsForNewMatches: z.array(z.string()).optional(),
  })
  .describe("historyMeta");

export const packageSchema = z
  .strictObject({
    id: idSchema,
    researchedAt: z.iso.datetime("Usa formato ISO 8601 completo, ej: 2026-08-04T10:00:00.000Z"),
    sourceUrls: z.array(urlSchema).min(1, "Incluye al menos una fuente"),
    competitions: z.array(competitionSchema).min(1, "Incluye al menos una competición"),
    teams: z.tuple([teamSchema, teamSchema]),
    match: matchSchema,
    histories: z.record(
      z.string(),
      z
        .array(historyRecordSchema)
        .min(MIN_HISTORY_PER_TEAM, `Se requieren al menos ${MIN_HISTORY_PER_TEAM} partidos históricos por equipo`)
    ),
    dataQuality: dataQualitySchema.optional(),
    historyMeta: historyMetaSchema.optional(),
    historySummary: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
  })
  .describe("package")
  .superRefine((pkg, ctx) => {
    const competitionIds = new Set(pkg.competitions.map((c) => c.id));
    if (competitionIds.size !== pkg.competitions.length) {
      ctx.addIssue({ code: "custom", path: ["competitions"], message: "Hay ids de competición duplicados dentro del paquete." });
    }

    const [teamA, teamB] = pkg.teams;
    if (teamA.id === teamB.id) {
      ctx.addIssue({ code: "custom", path: ["teams", 1, "id"], message: "El equipo local y visitante deben tener ids distintos." });
    }
    const teamIds = new Set(pkg.teams.map((t) => t.id));

    pkg.teams.forEach((team, i) => {
      if (!competitionIds.has(team.competitionId)) {
        ctx.addIssue({
          code: "custom",
          path: ["teams", i, "competitionId"],
          message: `El equipo "${team.id}" referencia la competición "${team.competitionId}", que no existe en "competitions".`,
        });
      }
    });

    if (!competitionIds.has(pkg.match.competitionId)) {
      ctx.addIssue({
        code: "custom",
        path: ["match", "competitionId"],
        message: `El partido referencia la competición "${pkg.match.competitionId}", que no existe en "competitions".`,
      });
    }
    if (!teamIds.has(pkg.match.homeTeamId)) {
      ctx.addIssue({ code: "custom", path: ["match", "homeTeamId"], message: "El equipo local del partido no está en \"teams\"." });
    }
    if (!teamIds.has(pkg.match.awayTeamId)) {
      ctx.addIssue({ code: "custom", path: ["match", "awayTeamId"], message: "El equipo visitante del partido no está en \"teams\"." });
    }
    if (pkg.match.homeTeamId === pkg.match.awayTeamId) {
      ctx.addIssue({ code: "custom", path: ["match", "awayTeamId"], message: "El equipo local y visitante del partido deben ser distintos." });
    }

    const historyKeys = Object.keys(pkg.histories);
    for (const teamId of teamIds) {
      if (!historyKeys.includes(teamId)) {
        ctx.addIssue({ code: "custom", path: ["histories", teamId], message: `Falta el historial del equipo "${teamId}".` });
      }
    }
    historyKeys.forEach((teamId) => {
      if (!teamIds.has(teamId)) {
        ctx.addIssue({
          code: "custom",
          path: ["histories", teamId],
          message: `"${teamId}" no es ninguno de los dos equipos del paquete ("${teamA.id}" / "${teamB.id}").`,
        });
      }
      const records = pkg.histories[teamId] ?? [];
      const matchIds = new Set<string>();
      records.forEach((record, i) => {
        if (matchIds.has(record.matchId)) {
          ctx.addIssue({
            code: "custom",
            path: ["histories", teamId, i, "matchId"],
            message: `matchId "${record.matchId}" duplicado en el historial de "${teamId}".`,
          });
        }
        matchIds.add(record.matchId);
      });
    });
  });

export const importedFileSchema = z.object({
  version: z.literal(1),
  packages: z.array(packageSchema),
});

export type Competition = z.infer<typeof competitionSchema>;
export type Team = z.infer<typeof teamSchema>;
export type Match = z.infer<typeof matchSchema>;
export type HistoryRecord = z.infer<typeof historyRecordSchema>;
export type MatchPackage = z.infer<typeof packageSchema>;
export type ImportedFile = z.infer<typeof importedFileSchema>;

// ----------------------------------------------------------------------------
// Validación de un lote (una o varias entregas de paquetes en un solo JSON)
// ----------------------------------------------------------------------------

export interface ImportIssue {
  path: string;
  field: string;
  message: string;
  received: string;
  expected: string;
  hint: string;
}

function describeValue(value: unknown): string {
  if (value === undefined) return "undefined (campo ausente)";
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  if (Array.isArray(value)) return `array de ${value.length} elemento(s)`;
  if (typeof value === "object") {
    try {
      const json = JSON.stringify(value);
      return json.length > 120 ? `${json.slice(0, 117)}...` : json;
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function getAtPath(obj: unknown, path: (string | number)[]): unknown {
  let current = obj;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

const HINTS: { test: RegExp; hint: string }[] = [
  { test: /\bdate\b/i, hint: "Usa formato YYYY-MM-DD, ej: 2026-08-04." },
  { test: /\btime\b/i, hint: "Usa formato HH:mm en 24 horas, ej: 20:00." },
  { test: /researchedAt/i, hint: "Usa formato ISO 8601 completo, ej: 2026-08-04T10:00:00.000Z." },
  { test: /[Cc]olor/i, hint: "Usa un color hexadecimal de 6 dígitos con #, ej: #16A34A." },
  { test: /sourceUrls/i, hint: "Cada fuente debe ser una URL completa que empiece con http:// o https://." },
  { test: /\bstatus\b/i, hint: "Usa uno de los valores permitidos para este campo (ver el ejemplo)." },
  { test: /Id$/, hint: "Usa un identificador único en minúsculas, con guiones, sin espacios (kebab-case)." },
];

function hintFor(path: string, code: string): string {
  const matched = HINTS.find((h) => h.test.test(path));
  if (matched) return matched.hint;
  switch (code) {
    case "invalid_type":
      return "Corrige el tipo de dato del campo según la estructura obligatoria.";
    case "too_small":
      return "Aumenta el valor, o agrega más elementos, según el mínimo requerido.";
    case "too_big":
      return "Reduce el valor, o quita elementos, según el máximo permitido.";
    case "invalid_value":
      return "Usa uno de los valores permitidos indicados en el mensaje.";
    case "unrecognized_keys":
      return "Elimina el/los campo(s) no reconocidos, o revisa que el nombre esté bien escrito.";
    case "invalid_format":
      return "Revisa el formato exacto exigido para este campo.";
    default:
      return "Revisa el valor contra la estructura JSON obligatoria del ejemplo.";
  }
}

/** Convierte un ZodError en una lista de problemas legibles para la UI. */
export function formatZodIssues(error: z.ZodError, rawInput: unknown): ImportIssue[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(raíz)";
    const field = String(issue.path[issue.path.length - 1] ?? "raíz");
    const received = describeValue(getAtPath(rawInput, issue.path as (string | number)[]));
    return {
      path,
      field,
      message: issue.message,
      received,
      expected: issue.message,
      hint: hintFor(path, issue.code),
    };
  });
}

export interface ParsedImportBatch {
  success: true;
  packages: MatchPackage[];
}

export interface FailedImportBatch {
  success: false;
  issues: ImportIssue[];
}

/**
 * Acepta tanto la forma obligatoria `{ version: 1, packages: [...] }` como,
 * por conveniencia, un único paquete pegado sin el sobre, o un array de
 * paquetes sin el sobre — así una IA que se salte el `version`/`packages`
 * (a pesar de que el prompt se lo pida) igual puede importarse.
 */
export function normalizeImportPayloadShape(raw: unknown): unknown[] {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.packages)) return obj.packages;
    if (typeof obj.id === "string" && obj.match) return [obj];
  }
  if (Array.isArray(raw)) return raw;
  return [raw];
}

/** Valida un lote crudo (ya parseado desde JSON) contra el esquema de paquete. */
export function validateImportBatch(raw: unknown): ParsedImportBatch | FailedImportBatch {
  const candidates = normalizeImportPayloadShape(raw);
  const issues: ImportIssue[] = [];
  const packages: MatchPackage[] = [];

  candidates.forEach((candidate, index) => {
    const result = packageSchema.safeParse(candidate);
    if (!result.success) {
      issues.push(
        ...formatZodIssues(result.error, candidate).map((issue) => ({
          ...issue,
          path: `packages.${index}.${issue.path === "(raíz)" ? "" : issue.path}`.replace(/\.$/, ""),
        }))
      );
    } else {
      packages.push(result.data);
    }
  });

  if (issues.length > 0) return { success: false, issues };

  // Conflictos dentro del mismo lote: ids de paquete o de partido repetidos.
  const seenPackageIds = new Map<string, number>();
  const seenMatchIds = new Map<string, number>();
  packages.forEach((pkg, index) => {
    if (seenPackageIds.has(pkg.id)) {
      issues.push({
        path: `packages.${index}.id`,
        field: "id",
        message: `El id de paquete "${pkg.id}" está repetido dentro del mismo archivo (también en packages.${seenPackageIds.get(pkg.id)}).`,
        received: `"${pkg.id}"`,
        expected: "Un id de paquete único por archivo",
        hint: "Cada paquete representa un partido distinto: usa ids diferentes o combina los datos en un solo paquete.",
      });
    } else {
      seenPackageIds.set(pkg.id, index);
    }

    if (seenMatchIds.has(pkg.match.id)) {
      issues.push({
        path: `packages.${index}.match.id`,
        field: "match.id",
        message: `match.id "${pkg.match.id}" está repetido dentro del mismo archivo (también en packages.${seenMatchIds.get(pkg.match.id)}).`,
        received: `"${pkg.match.id}"`,
        expected: "Un match.id único por archivo",
        hint: "Cada match.id identifica un único partido principal: revisa si dos paquetes describen el mismo encuentro por error.",
      });
    } else {
      seenMatchIds.set(pkg.match.id, index);
    }
  });

  if (issues.length > 0) return { success: false, issues };
  return { success: true, packages };
}
