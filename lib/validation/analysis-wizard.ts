import { z } from "zod";

export const analysisWizardSchema = z
  .object({
    competitionId: z.string().min(1, "Selecciona una competición"),
    season: z.string().min(1),
    date: z.string().min(1, "Selecciona una fecha"),
    homeTeamId: z.string().min(1, "Selecciona el equipo local"),
    awayTeamId: z.string().min(1, "Selecciona el equipo visitante"),
    matchCount: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
    onlyLeague: z.boolean(),
    includeCups: z.boolean(),
    onlyHomeConditionTeamA: z.boolean(),
    onlyAwayConditionTeamB: z.boolean(),
    includeH2H: z.boolean(),
    includeCommonOpponents: z.boolean(),
    weightLastFive: z.boolean(),
    excludeRedCards: z.boolean(),
    excludeFriendlies: z.boolean(),
    odds: z.record(z.string(), z.union([z.number(), z.nan()]).optional()),
  })
  .refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: "El equipo local y visitante deben ser distintos",
    path: ["awayTeamId"],
  });

export type AnalysisWizardValues = z.infer<typeof analysisWizardSchema>;

export const MATCH_COUNT_OPTIONS = [5, 10, 15, 20] as const;

export const ODDS_FIELDS: { marketId: string; label: string }[] = [
  { marketId: "goals_over_15", label: "Más de 1.5 goles" },
  { marketId: "goals_over_25", label: "Más de 2.5 goles" },
  { marketId: "btts_yes", label: "Ambos equipos marcan" },
  { marketId: "corners_over_65", label: "Más de 6.5 córners" },
  { marketId: "corners_over_75", label: "Más de 7.5 córners" },
  { marketId: "corners_over_85", label: "Más de 8.5 córners" },
  { marketId: "corners_over_95", label: "Más de 9.5 córners" },
  { marketId: "corners_over_105", label: "Más de 10.5 córners" },
  { marketId: "corners_under_115", label: "Menos de 11.5 córners" },
  { marketId: "corners_home_over_35", label: "Equipo local más de 3.5 córners" },
  { marketId: "corners_home_over_45", label: "Equipo local más de 4.5 córners" },
  { marketId: "corners_away_over_35", label: "Equipo visitante más de 3.5 córners" },
  { marketId: "corners_away_over_45", label: "Equipo visitante más de 4.5 córners" },
  { marketId: "sot_total_over_75", label: "Tiros al arco (más de 7.5 totales)" },
];

export const CONFIG_TOGGLES: { key: keyof AnalysisWizardValues; label: string; hint?: string }[] = [
  { key: "onlyLeague", label: "Solo partidos de liga", hint: "Excluye copas y amistosos de la muestra" },
  { key: "includeCups", label: "Incluir copas", hint: "Suma los cruces de Copa Continental" },
  { key: "onlyHomeConditionTeamA", label: "Solo condición local del Equipo 1", hint: "Usa únicamente sus partidos como local" },
  { key: "onlyAwayConditionTeamB", label: "Solo condición visitante del Equipo 2", hint: "Usa únicamente sus partidos como visitante" },
  { key: "includeH2H", label: "Incluir enfrentamientos directos", hint: "Pondera el historial entre ambos equipos" },
  { key: "includeCommonOpponents", label: "Incluir rivales en común", hint: "Compara resultados contra rivales compartidos" },
  { key: "weightLastFive", label: "Dar más peso a los últimos 5 partidos", hint: "Prioriza la forma más reciente" },
  { key: "excludeRedCards", label: "Excluir partidos con expulsiones", hint: "Descarta partidos con tarjeta roja" },
  { key: "excludeFriendlies", label: "Excluir amistosos", hint: "No considera partidos de pretemporada" },
];

export function defaultWizardValues(homeTeamId = "", awayTeamId = ""): AnalysisWizardValues {
  return {
    competitionId: "all",
    season: "2026",
    date: new Date().toISOString().slice(0, 10),
    homeTeamId,
    awayTeamId,
    matchCount: 15,
    onlyLeague: false,
    includeCups: true,
    onlyHomeConditionTeamA: false,
    onlyAwayConditionTeamB: false,
    includeH2H: true,
    includeCommonOpponents: true,
    weightLastFive: true,
    excludeRedCards: false,
    excludeFriendlies: true,
    odds: {},
  };
}
