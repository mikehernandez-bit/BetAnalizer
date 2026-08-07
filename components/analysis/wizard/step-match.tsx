"use client";

import { Controller, useFormContext } from "react-hook-form";
import { ArrowLeftRight } from "lucide-react";
import { AnalysisWizardValues, MATCH_COUNT_OPTIONS } from "@/lib/validation/analysis-wizard";
import { teams } from "@/data/teams";
import { CompetitionSelector } from "@/components/shared/competition-selector";
import { TeamSelector } from "@/components/shared/team-selector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StepMatch() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AnalysisWizardValues>();

  const competitionId = watch("competitionId");
  const homeTeamId = watch("homeTeamId");
  const awayTeamId = watch("awayTeamId");
  const matchCount = watch("matchCount");

  const availableTeams = teams.filter((t) => competitionId === "all" || t.competitionId === competitionId || t.id === homeTeamId || t.id === awayTeamId);

  function swapTeams() {
    setValue("homeTeamId", awayTeamId, { shouldValidate: true });
    setValue("awayTeamId", homeTeamId, { shouldValidate: true });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Competición</Label>
          <Controller
            control={control}
            name="competitionId"
            render={({ field }) => <CompetitionSelector value={field.value} onChange={field.onChange} includeAllOption />}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="season">Temporada</Label>
          <Input id="season" {...control.register("season")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" {...control.register("date")} />
        </div>
      </div>

      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-1.5">
          <Label>Equipo local</Label>
          <Controller
            control={control}
            name="homeTeamId"
            render={({ field }) => (
              <TeamSelector teams={availableTeams} value={field.value} onChange={field.onChange} excludeId={awayTeamId} placeholder="Equipo local" />
            )}
          />
          {errors.homeTeamId && <p className="text-xs text-brand-red">{errors.homeTeamId.message}</p>}
        </div>

        <Button type="button" variant="outline" size="icon" onClick={swapTeams} className="mb-0.5 justify-self-center" aria-label="Intercambiar equipos">
          <ArrowLeftRight className="size-4" />
        </Button>

        <div className="space-y-1.5">
          <Label>Equipo visitante</Label>
          <Controller
            control={control}
            name="awayTeamId"
            render={({ field }) => (
              <TeamSelector teams={availableTeams} value={field.value} onChange={field.onChange} excludeId={homeTeamId} placeholder="Equipo visitante" />
            )}
          />
          {errors.awayTeamId && <p className="text-xs text-brand-red">{errors.awayTeamId.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cantidad de partidos a analizar</Label>
        <div className="flex flex-wrap gap-2">
          {MATCH_COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setValue("matchCount", count, { shouldValidate: true })}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                matchCount === count
                  ? "border-brand-green bg-brand-green/10 text-brand-green-bright"
                  : "border-border text-muted-foreground hover:border-brand-green/30"
              )}
            >
              Últimos {count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
