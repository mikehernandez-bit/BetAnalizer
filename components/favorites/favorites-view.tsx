"use client";

import * as React from "react";
import Link from "next/link";
import { Star, X } from "lucide-react";
import { FavoriteType } from "@/types";
import { useFavorites } from "@/hooks/use-favorites";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateShort } from "@/utils/formatters";

const TYPE_LABEL: Record<FavoriteType, string> = {
  match: "Partidos",
  team: "Equipos",
  market: "Mercados",
  analysis: "Análisis",
  pattern: "Patrones",
};

function hrefFor(type: FavoriteType, refId: string): string | null {
  if (type === "match") return `/partidos/${refId}`;
  if (type === "team") return `/equipos/${refId}`;
  if (type === "analysis") return `/analisis/${refId}`;
  if (type === "market") return `/mercados?market=${refId}`;
  return null;
}

export function FavoritesView() {
  const { favorites, remove } = useFavorites();

  if (favorites.length === 0) {
    return <EmptyState icon={Star} title="Todavía no guardaste favoritos" description="Marca partidos, equipos, mercados o análisis con la estrella para verlos aquí." />;
  }

  const types: FavoriteType[] = ["match", "team", "market", "analysis", "pattern"];

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">Todos ({favorites.length})</TabsTrigger>
        {types.map((type) => {
          const count = favorites.filter((f) => f.type === type).length;
          if (count === 0) return null;
          return (
            <TabsTrigger key={type} value={type}>
              {TYPE_LABEL[type]} ({count})
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="all" className="mt-4">
        <FavoritesGrid items={favorites} onRemove={remove} />
      </TabsContent>
      {types.map((type) => (
        <TabsContent key={type} value={type} className="mt-4">
          <FavoritesGrid items={favorites.filter((f) => f.type === type)} onRemove={remove} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function FavoritesGrid({ items, onRemove }: { items: ReturnType<typeof useFavorites>["favorites"]; onRemove: (id: string) => void }) {
  if (items.length === 0) {
    return <EmptyState title="Sin elementos en esta categoría" />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const href = hrefFor(item.type, item.refId);
        const body = (
          <CardContent className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{TYPE_LABEL[item.type]}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{item.label}</p>
              {item.meta && <p className="truncate text-xs text-muted-foreground">{item.meta}</p>}
              <p className="mt-1 text-[10px] text-muted-foreground">Guardado el {formatDateShort(item.addedAt.slice(0, 10))}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground hover:text-brand-red"
              onClick={(e) => {
                e.preventDefault();
                onRemove(item.id);
              }}
              aria-label="Quitar de favoritos"
            >
              <X className="size-4" />
            </Button>
          </CardContent>
        );

        return (
          <Card key={item.id} className="transition-colors hover:border-brand-green/30">
            {href ? <Link href={href}>{body}</Link> : body}
          </Card>
        );
      })}
    </div>
  );
}
