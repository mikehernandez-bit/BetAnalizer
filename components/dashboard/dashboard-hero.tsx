import Link from "next/link";
import { ArrowRight, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHero() {
  return (
    <section className="border-b border-border px-1 pb-8 pt-3 sm:px-2 sm:pb-10">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/25 bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
          Análisis estadístico orientativo
        </span>
        <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          Encuentros cargados y patrones completos
        </h1>
        <p className="mt-3 text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
          Cada partido solicitado se incorpora con el historial de ambos equipos, patrones individuales y coincidencias cruzadas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href="/analisis">
              <FileBarChart className="size-4" /> Ver encuentros analizados
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/analisis/levski-sofia-vs-kairat-almaty-5c">
              Abrir el último <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
