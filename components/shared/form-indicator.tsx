import { ResultLetter } from "@/types";
import { cn } from "@/lib/utils";

interface FormIndicatorProps {
  results: ResultLetter[];
  size?: "sm" | "md";
  className?: string;
}

const RESULT_STYLES: Record<ResultLetter, string> = {
  W: "bg-brand-green/20 text-brand-green-bright border-brand-green/40",
  D: "bg-brand-yellow/15 text-brand-yellow border-brand-yellow/40",
  L: "bg-brand-red/15 text-brand-red border-brand-red/40",
};

/** `results` ordered most-recent-first; rendered oldest → newest (left → right). */
export function FormIndicator({ results, size = "sm", className }: FormIndicatorProps) {
  const ordered = [...results].reverse();
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Forma reciente: ${results.join(", ")}`}>
      {ordered.map((result, i) => (
        <span
          key={i}
          className={cn(
            "flex items-center justify-center rounded-md border font-semibold",
            RESULT_STYLES[result],
            size === "sm" ? "size-5 text-[10px]" : "size-6 text-xs",
            i === ordered.length - 1 && "ring-1 ring-offset-1 ring-offset-background ring-current"
          )}
        >
          {result}
        </span>
      ))}
    </div>
  );
}
