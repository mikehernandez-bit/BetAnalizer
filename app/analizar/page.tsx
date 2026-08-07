"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { AnalysisWizardValues, analysisWizardSchema, defaultWizardValues } from "@/lib/validation/analysis-wizard";
import { AnalysisConfig } from "@/types";
import { useAnalysisGenerator } from "@/hooks/use-analysis";
import { WizardStepper } from "@/components/analysis/wizard/wizard-stepper";
import { StepMatch } from "@/components/analysis/wizard/step-match";
import { StepConfig } from "@/components/analysis/wizard/step-config";
import { StepOdds } from "@/components/analysis/wizard/step-odds";
import { LoadingAnalysis } from "@/components/shared/loading-analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function toAnalysisConfig(values: AnalysisWizardValues): AnalysisConfig {
  const odds: Partial<Record<string, number>> = {};
  Object.entries(values.odds ?? {}).forEach(([key, value]) => {
    if (typeof value === "number" && !Number.isNaN(value) && value > 1) odds[key] = value;
  });
  return { ...values, odds };
}

export default function AnalizarPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const generator = useAnalysisGenerator();

  const methods = useForm<AnalysisWizardValues>({
    resolver: zodResolver(analysisWizardSchema),
    defaultValues: defaultWizardValues("mjallby-aif", "slovan-bratislava"),
    mode: "onChange",
  });

  async function handleGenerate(values: AnalysisWizardValues) {
    const id = await generator.run(toAnalysisConfig(values));
    if (id) router.push(`/analisis/${id}`);
  }

  async function goNext() {
    if (step === 1) {
      const valid = await methods.trigger(["competitionId", "season", "date", "homeTeamId", "awayTeamId", "matchCount"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  if (generator.isGenerating) {
    return (
      <Card>
        <CardContent className="py-6">
          <LoadingAnalysis stages={generator.stages} stageIndex={generator.stageIndex} progress={generator.progress} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analizar partido</CardTitle>
          <CardDescription>Configura los parámetros y genera un análisis estadístico completo en segundos.</CardDescription>
        </CardHeader>
        <CardContent>
          <WizardStepper current={step} />
        </CardContent>
      </Card>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleGenerate)}>
          <Card>
            <CardContent className="space-y-6 pt-2">
              {step === 1 && <StepMatch />}
              {step === 2 && <StepConfig />}
              {step === 3 && <StepOdds />}

              {generator.error && <p className="text-sm text-brand-red">{generator.error}</p>}

              <div className="flex items-center justify-between border-t border-border pt-5">
                <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                  Atrás
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={goNext}>
                    Continuar
                  </Button>
                ) : (
                  <Button type="submit" size="lg" className="gap-2">
                    <Sparkles className="size-4" /> Generar análisis completo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
