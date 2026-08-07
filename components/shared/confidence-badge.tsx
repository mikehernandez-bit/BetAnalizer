import { TrendingUp, Minus, TrendingDown, ShieldAlert } from "lucide-react";
import { ConfidenceLevel } from "@/types";
import { CONFIDENCE_LEVEL_LABEL, CONFIDENCE_LEVEL_COLOR } from "@/utils/confidence";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<ConfidenceLevel, typeof TrendingUp> = {
  muy_alta: TrendingUp,
  alta: TrendingUp,
  moderada: Minus,
  baja: TrendingDown,
  evitar: ShieldAlert,
};

const BG_MAP: Record<ConfidenceLevel, string> = {
  muy_alta: "bg-brand-green/15 border-brand-green/30",
  alta: "bg-brand-green/10 border-brand-green/25",
  moderada: "bg-brand-yellow/10 border-brand-yellow/25",
  baja: "bg-orange-500/10 border-orange-500/25",
  evitar: "bg-brand-red/10 border-brand-red/25",
};

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score?: number;
  className?: string;
  size?: "sm" | "md";
}

export function ConfidenceBadge({ level, score, className, size = "md" }: ConfidenceBadgeProps) {
  const Icon = ICON_MAP[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        BG_MAP[level],
        CONFIDENCE_LEVEL_COLOR[level],
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {CONFIDENCE_LEVEL_LABEL[level]}
      {typeof score === "number" && <span className="opacity-80">· {score}%</span>}
    </span>
  );
}
