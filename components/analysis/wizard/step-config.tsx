"use client";

import { Controller, useFormContext } from "react-hook-form";
import { AnalysisWizardValues, CONFIG_TOGGLES } from "@/lib/validation/analysis-wizard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function StepConfig() {
  const { control } = useFormContext<AnalysisWizardValues>();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CONFIG_TOGGLES.map(({ key, label, hint }) => (
        <Controller
          key={key}
          control={control}
          name={key}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-brand-green/25">
              <span className="min-w-0">
                <Label className="cursor-pointer text-sm font-medium text-foreground">{label}</Label>
                {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
              </span>
              <Switch checked={field.value as boolean} onCheckedChange={field.onChange} className="shrink-0" />
            </label>
          )}
        />
      ))}
    </div>
  );
}
