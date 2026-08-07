"use client";

import { useCallback, useMemo, useState } from "react";
import { AnalysisConfig, AnalysisResult } from "@/types";
import { buildAnalysisId, cacheAnalysisConfig, generateAnalysis, resolveAnalysisById } from "@/services/analysis-service";

export const ANALYSIS_STAGES = [
  "Recopilando partidos",
  "Analizando rendimiento",
  "Buscando patrones",
  "Comparando rivales",
  "Evaluando mercados",
  "Preparando recomendación",
] as const;

const STAGE_DURATION_MS = 480;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useAnalysisGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (config: AnalysisConfig): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);
    setStageIndex(0);

    try {
      for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
        setStageIndex(i);
        await wait(STAGE_DURATION_MS);
      }

      const id = buildAnalysisId(config.homeTeamId, config.awayTeamId, config.matchCount);
      generateAnalysis(config); // validates the pairing before we navigate
      cacheAnalysisConfig(id, config);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el análisis.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const progress = useMemo(() => Math.round(((stageIndex + 1) / ANALYSIS_STAGES.length) * 100), [stageIndex]);

  return {
    isGenerating,
    stageIndex,
    stageLabel: ANALYSIS_STAGES[stageIndex],
    stages: ANALYSIS_STAGES,
    progress,
    error,
    run,
  };
}

export function useAnalysisResult(id: string | undefined): AnalysisResult | null {
  return useMemo(() => (id ? resolveAnalysisById(id) : null), [id]);
}
