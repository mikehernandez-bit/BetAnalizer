import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { step: 1, label: "Seleccionar partido" },
  { step: 2, label: "Configurar análisis" },
  { step: 3, label: "Cuotas opcionales" },
];

export function WizardStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map(({ step, label }, i) => {
        const done = step < current;
        const active = step === current;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  done && "border-brand-green bg-brand-green text-primary-foreground",
                  active && "border-brand-green text-brand-green-bright",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : step}
              </span>
              <span className={cn("hidden text-sm font-medium sm:block", active ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className={cn("h-px flex-1", done ? "bg-brand-green" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}
