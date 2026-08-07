import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center", className)}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-balance text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
