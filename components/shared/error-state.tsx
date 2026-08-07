import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "No pudimos cargar esta información",
  description = "Ocurrió un problema inesperado. Inténtalo nuevamente en unos segundos.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-brand-red/20 bg-brand-red/5 px-6 py-14 text-center", className)}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-brand-red/10">
        <AlertTriangle className="size-5 text-brand-red" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-balance text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
