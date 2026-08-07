"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { MOBILE_NAV_ITEMS, NAV_ITEMS, APP_VERSION } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-6">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isActiveHref(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors",
                active && "text-brand-green-bright"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle asChild>
            <Logo size="sm" />
          </SheetTitle>
        </SheetHeader>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = isActiveHref(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent",
                  active && "bg-accent text-brand-green-bright"
                )}
              >
                <item.icon className="size-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-green/15 text-xs font-semibold text-brand-green">AD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Aldair Daza</p>
              <p className="text-xs text-muted-foreground">Conectado</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-brand-red">
            <LogOut className="size-4" /> Cerrar sesión
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">BetAnalyzer v{APP_VERSION}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
