import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OddsInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  label: string;
}

export const OddsInput = React.forwardRef<HTMLInputElement, OddsInputProps>(({ label, id, ...props }, ref) => {
  const inputId = id ?? `odds-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={inputId} ref={ref} type="number" step="0.01" min="1.01" placeholder="1.85" inputMode="decimal" {...props} />
    </div>
  );
});
OddsInput.displayName = "OddsInput";
