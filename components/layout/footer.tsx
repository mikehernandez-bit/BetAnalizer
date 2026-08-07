import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-6 pb-24 text-xs text-muted-foreground md:px-6 md:pb-6">
      <p className="mx-auto max-w-5xl text-balance leading-relaxed">
        BetAnalyzer ofrece análisis estadísticos con fines informativos. Las tendencias históricas no
        garantizan resultados futuros. Apuesta de forma responsable.{" "}
        <Link href="/configuracion" className="font-medium text-brand-green hover:underline">
          Juego responsable
        </Link>
        .
      </p>
    </footer>
  );
}
