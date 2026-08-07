import { AlertTriangle } from "lucide-react";
import type { ImportIssue } from "@/lib/validation/match-package";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function ValidationIssuesList({ issues }: { issues: ImportIssue[] }) {
  if (issues.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>
        {issues.length} {issues.length === 1 ? "problema encontrado" : "problemas encontrados"}
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-3">
          {issues.map((issue, i) => (
            <div key={`${issue.path}-${i}`} className="rounded-lg border border-destructive/25 bg-destructive/5 p-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="destructive" className="font-mono text-[10px]">
                  {issue.path}
                </Badge>
                <span className="font-medium text-foreground">{issue.message}</span>
              </div>
              <dl className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-0.5 text-muted-foreground sm:grid-cols-2">
                <div>
                  <dt className="inline font-medium">Valor recibido: </dt>
                  <dd className="inline font-mono">{issue.received}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Cómo corregirlo: </dt>
                  <dd className="inline">{issue.hint}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
