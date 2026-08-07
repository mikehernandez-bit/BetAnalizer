"use client";

import { Star } from "lucide-react";
import { FavoriteType } from "@/types";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  type: FavoriteType;
  refId: string;
  label: string;
  meta?: string;
  variant?: "icon" | "full";
  className?: string;
}

export function FavoriteButton({ type, refId, label, meta, variant = "icon", className }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(type, refId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({ id: `${type}-${refId}`, type, refId, label, meta });
  }

  if (variant === "full") {
    return (
      <Button variant={active ? "secondary" : "outline"} size="sm" onClick={handleClick} className={cn("gap-1.5", className)}>
        <Star className={cn("size-4", active && "fill-brand-yellow text-brand-yellow")} />
        {active ? "Guardado" : "Guardar"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand-yellow/40 hover:text-brand-yellow",
        active && "border-brand-yellow/40 text-brand-yellow",
        className
      )}
    >
      <Star className={cn("size-4", active && "fill-brand-yellow")} />
    </button>
  );
}
