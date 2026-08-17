"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToAnalysesButton() {
  return (
    <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
      <Link href="/analisis">
        <ArrowLeft className="size-4" />
        Regresar a encuentros analizados
      </Link>
    </Button>
  );
}
