import * as React from "react";
import { cn } from "@/lib/utils";
import { LogoIcon } from "./logo-icon";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 24, text: "text-base" },
  md: { icon: 30, text: "text-lg" },
  lg: { icon: 40, text: "text-2xl" },
};

export function Logo({ className, iconOnly = false, size = "md" }: LogoProps) {
  const { icon, text } = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon size={icon} className="shrink-0" />
      {!iconOnly && (
        <span className={cn("font-heading font-semibold tracking-tight", text)}>
          <span className="text-foreground">Bet</span>
          <span className="text-brand-green">Analyzer</span>
        </span>
      )}
    </div>
  );
}
