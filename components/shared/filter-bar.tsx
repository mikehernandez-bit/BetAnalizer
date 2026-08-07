"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: React.ReactNode;
  activeCount?: number;
  className?: string;
}

export function FilterBar({ children, activeCount = 0, className }: FilterBarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="hidden flex-1 flex-wrap items-center gap-2 md:flex">{children}</div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 md:hidden">
            <SlidersHorizontal className="size-4" />
            Filtros
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-6">{children}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
