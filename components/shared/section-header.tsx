import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}

export function SectionHeader({ title, description, href, hrefLabel = "Ver todos" }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-green hover:underline">
          {hrefLabel} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
