import { Info } from "lucide-react";
import { ValueLevel } from "@/types";
import { VALUE_LEVEL_COLOR, VALUE_LEVEL_LABEL } from "@/utils/odds";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ValueIndicatorProps {
  level: ValueLevel;
  diff?: number;
  className?: string;
}

export function ValueIndicator({ level, diff, className }: ValueIndicatorProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex cursor-default items-center gap-1 text-xs font-medium", VALUE_LEVEL_COLOR[level], className)}>
          {VALUE_LEVEL_LABEL[level]}
          {typeof diff === "number" && diff > 0 && ` (+${diff.toFixed(1)} pts)`}
          <Info className="size-3 opacity-60" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-56 text-xs">
        Diferencia entre la estimación estadística de BetAnalyzer y la probabilidad implícita de la cuota. Es una
        referencia orientativa, no una predicción garantizada.
      </TooltipContent>
    </Tooltip>
  );
}
