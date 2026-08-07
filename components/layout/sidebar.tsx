"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, Wifi } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LogoIcon } from "@/components/brand/logo-icon";
import { NAV_ITEMS, APP_VERSION } from "@/lib/navigation";
import { useAppState } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppState();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
        sidebarCollapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", sidebarCollapsed && "justify-center px-0")}>
        <Link href="/" aria-label="BetAnalyzer — inicio">
          {sidebarCollapsed ? <LogoIcon size={28} /> : <Logo size="sm" />}
        </Link>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActiveHref(pathname, item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              {active && (
                <span className="absolute left-0 h-5 w-0.5 rounded-full bg-brand-green-bright" aria-hidden />
              )}
              <item.icon className={cn("size-[18px] shrink-0", active && "text-brand-green-bright")} />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );

          if (!sidebarCollapsed) return link;

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className={cn("mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2", sidebarCollapsed && "justify-center px-0")}>
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-brand-green/15 text-xs font-semibold text-brand-green">AD</AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">Aldair Daza</p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Wifi className="size-3 text-brand-green" /> Conectado
              </p>
            </div>
          )}
        </div>

        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full text-muted-foreground hover:text-brand-red">
                <LogOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-brand-red">
            <LogOut className="size-4" /> Cerrar sesión
          </Button>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          {sidebarCollapsed ? <ChevronsRight className="size-3.5" /> : <><ChevronsLeft className="size-3.5" /> Contraer</>}
        </button>

        {!sidebarCollapsed && <p className="mt-2 text-center text-[11px] text-muted-foreground">v{APP_VERSION}</p>}
      </div>
    </aside>
  );
}
