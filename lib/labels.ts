import {
  CompetitionType,
  ConfidenceLevel,
  CrossPatternStrength,
  DataQuality,
  MatchStatus,
  PatternStrength,
  ResultLetter,
  RiskLevel,
  TrendDirection,
} from "@/types";

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "Próximo",
  live: "En vivo",
  finished: "Finalizado",
  postponed: "Aplazado",
};

export const COMPETITION_TYPE_LABEL: Record<CompetitionType, string> = {
  league: "Liga",
  cup: "Copa",
  continental: "Continental",
  friendly: "Amistoso",
};

export const RESULT_LETTER_LABEL: Record<ResultLetter, string> = {
  W: "G",
  D: "E",
  L: "P",
};

export const PATTERN_STRENGTH_LABEL: Record<PatternStrength, string> = {
  muy_fuerte: "Muy fuerte",
  fuerte: "Fuerte",
  moderado: "Moderado",
  debil: "Débil",
};

export const CROSS_PATTERN_STRENGTH_LABEL: Record<CrossPatternStrength, string> = {
  muy_fuerte: "Muy fuerte",
  fuerte: "Fuerte",
  moderado: "Moderado",
  debil: "Débil",
  contradictorio: "Contradictorio",
};

export const CROSS_PATTERN_STRENGTH_COLOR: Record<CrossPatternStrength, string> = {
  muy_fuerte: "bg-brand-green/15 text-brand-green-bright border-brand-green/30",
  fuerte: "bg-brand-green/10 text-brand-green border-brand-green/25",
  moderado: "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/25",
  debil: "bg-muted text-muted-foreground border-border",
  contradictorio: "bg-brand-red/10 text-brand-red border-brand-red/25",
};

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  bajo: "Riesgo bajo",
  moderado: "Riesgo moderado",
  alto: "Riesgo alto",
};

export const RISK_LEVEL_COLOR: Record<RiskLevel, string> = {
  bajo: "text-brand-green border-brand-green/25 bg-brand-green/10",
  moderado: "text-brand-yellow border-brand-yellow/25 bg-brand-yellow/10",
  alto: "text-brand-red border-brand-red/25 bg-brand-red/10",
};

export const DATA_QUALITY_LABEL: Record<DataQuality, string> = {
  alta: "Calidad de datos alta",
  media: "Calidad de datos media",
  baja: "Calidad de datos baja",
};

export const TREND_LABEL: Record<TrendDirection, string> = {
  ascendente: "Tendencia ascendente",
  descendente: "Tendencia descendente",
  estable: "Tendencia estable",
};

export const CONFIDENCE_ORDER: ConfidenceLevel[] = ["muy_alta", "alta", "moderada", "baja", "evitar"];
