"use client";

import * as React from "react";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Pattern, TeamMatchRecord, TrendDirection } from "@/types";
import { getTeamById } from "@/data/teams";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PATTERN_STRENGTH_LABEL } from "@/lib/labels";
import { formatDateShort } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const STRENGTH_STYLE: Record<Pattern["strength"], string> = {
  muy_fuerte: "border-brand-green/30 bg-brand-green/10 text-brand-green-bright",
  fuerte: "border-brand-green/25 bg-brand-green/5 text-brand-green",
  moderado: "border-brand-yellow/25 bg-brand-yellow/10 text-brand-yellow",
  debil: "border-border bg-muted text-muted-foreground",
};

const TREND_ICON: Record<TrendDirection, typeof TrendingUp> = {
  ascendente: TrendingUp,
  descendente: TrendingDown,
  estable: Minus,
};

interface PatternCardProps {
  pattern: Pattern;
  records?: TeamMatchRecord[];
}

export function PatternCard({ pattern, records }: PatternCardProps) {
  const [open, setOpen] = React.useState(false);
  const TrendIcon = TREND_ICON[pattern.trend];
  const related = records?.filter((r) => pattern.relatedMatchIds.includes(r.matchId)).slice(0, 6) ?? [];

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-foreground">{pattern.title}</p>
          <Badge variant="outline" className={cn("shrink-0 text-[10px]", STRENGTH_STYLE[pattern.strength])}>
            {PATTERN_STRENGTH_LABEL[pattern.strength]}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Progress value={pattern.percentage} className="h-2 flex-1" />
          <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">{pattern.percentage}%</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendIcon className="size-3.5" /> {pattern.hits} de {pattern.total} partidos
          </span>
          {related.length > 0 && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 font-medium text-brand-green hover:underline"
            >
              Partidos relacionados
              <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
          )}
        </div>

        {open && related.length > 0 && (
          <ul className="space-y-1 rounded-lg bg-muted/40 p-2 text-xs">
            {related.map((r) => {
              const opponent = getTeamById(r.opponentId);
              return (
                <li key={r.matchId} className="flex items-center justify-between text-muted-foreground">
                  <span>
                    vs {opponent?.shortName ?? r.opponentId} ({r.venue === "local" ? "L" : "V"})
                  </span>
                  <span className="tabular-nums">{formatDateShort(r.date)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
