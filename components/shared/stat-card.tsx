import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: "green" | "yellow" | "red" | "blue" | "neutral";
  className?: string;
}

const ACCENT_MAP = {
  green: "bg-brand-green/10 text-brand-green",
  yellow: "bg-brand-yellow/10 text-brand-yellow",
  red: "bg-brand-red/10 text-brand-red",
  blue: "bg-brand-blue/10 text-brand-blue",
  neutral: "bg-muted text-foreground",
};

export function StatCard({ icon: Icon, label, value, hint, accent = "neutral", className }: StatCardProps) {
  return (
    <Card className={cn("transition-colors hover:border-border/80", className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">{value}</p>
          {hint && <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", ACCENT_MAP[accent])}>
          <Icon className="size-[18px]" />
        </div>
      </CardContent>
    </Card>
  );
}
