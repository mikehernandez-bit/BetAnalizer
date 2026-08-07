import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  description?: string;
  height?: number;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartContainer({ title, description, height = 260, children, className, action }: ChartContainerProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent style={{ height }}>{children}</CardContent>
    </Card>
  );
}
