"use client";

import * as React from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  filename: string;
  getContent: () => string;
  label?: string;
}

export function ExportButton({ filename, getContent, label = "Exportar" }: ExportButtonProps) {
  const [done, setDone] = React.useState(false);

  function handleExport() {
    const blob = new Blob([getContent()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
      {done ? <Check className="size-4 text-brand-green" /> : <Download className="size-4" />}
      {done ? "Exportado" : label}
    </Button>
  );
}
