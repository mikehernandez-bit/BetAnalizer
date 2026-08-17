"use client";

import { useFormContext } from "react-hook-form";
import { AnalysisWizardValues, ODDS_FIELDS } from "@/lib/validation/analysis-wizard";
import { OddsInput } from "@/components/shared/odds-input";

export function StepOdds() {
  const { register } = useFormContext<AnalysisWizardValues>();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ingresa las cuotas que te ofrece tu casa de apuestas para comparar contra la estimación estadística de
        BetAnalyzer. Este paso es opcional: los mercados sin cuota cargada simplemente no muestran cuota ni
        indicador de valor — nunca se inventa un número de referencia.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ODDS_FIELDS.map((field) => (
          <OddsInput key={field.marketId} label={field.label} {...register(`odds.${field.marketId}` as const, { valueAsNumber: true })} />
        ))}
      </div>
    </div>
  );
}
