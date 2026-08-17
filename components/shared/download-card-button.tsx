"use client";

import * as React from "react";
import { Download, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DownloadCardButtonProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  filename?: string;
  className?: string;
}

export function DownloadCardButton({ targetRef, filename = "bet-analisis.png", className }: DownloadCardButtonProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;

    try {
      setDownloading(true);

      let node: HTMLElement | null = targetRef?.current ?? null;
      if (!node) {
        const buttonEl = e.currentTarget as HTMLElement;
        node =
          (buttonEl.closest(".card-download-target") as HTMLElement) ||
          (buttonEl.closest(".group") as HTMLElement) ||
          (buttonEl.closest(".rounded-xl") as HTMLElement) ||
          (buttonEl.closest(".rounded-lg") as HTMLElement);
      }

      if (!node) {
        console.error("No node found for card image capture.");
        return;
      }

      const dataUrl = await toPng(node, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: "#0B132B",
      });

      const safeFilename = filename.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
      const link = document.createElement("a");
      link.download = safeFilename.endsWith(".png") ? safeFilename : `${safeFilename}.png`;
      link.href = dataUrl;
      link.click();

      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error("Error al capturar la imagen de la tarjeta:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "size-7 shrink-0 rounded-md border border-border/50 bg-background/50 text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
        className
      )}
      title="Descargar captura de esta bet"
      aria-label="Descargar captura"
      onClick={handleDownload}
    >
      {downloading ? (
        <Loader2 className="size-3.5 animate-spin text-brand-green" />
      ) : done ? (
        <Check className="size-3.5 text-brand-green-bright" />
      ) : (
        <Download className="size-3.5" />
      )}
    </Button>
  );
}
