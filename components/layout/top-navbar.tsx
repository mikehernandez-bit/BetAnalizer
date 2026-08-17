"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Moon, PanelLeftClose, PanelLeftOpen, Search, Settings, Sun, User } from "lucide-react";
import { MobileDrawer } from "@/components/layout/mobile-navbar";
import { useAppState } from "@/lib/app-context";
import { useTheme } from "@/lib/theme-provider";
import { competitions } from "@/data/competitions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

const PAGE_TITLES: { match: RegExp; title: string; subtitle?: string }[] = [
  { match: /^\/$/, title: "Inicio", subtitle: "Resumen general y partidos destacados" },
  { match: /^\/dashboard/, title: "Inicio", subtitle: "Resumen general y partidos destacados" },
  { match: /^\/analizar/, title: "Analizar partido", subtitle: "Genera un análisis estadístico completo" },
  { match: /^\/partidos\/.+/, title: "Detalle del partido" },
  { match: /^\/partidos/, title: "Partidos", subtitle: "Explora los próximos y últimos encuentros" },
  { match: /^\/equipos\/.+/, title: "Perfil del equipo" },
  { match: /^\/mercados/, title: "Mercados", subtitle: "Mercados ordenados por respaldo estadístico" },
  { match: /^\/analisis\/.+/, title: "Análisis completo" },
  { match: /^\/analisis/, title: "Encuentros analizados", subtitle: "Partidos cargados con datos y patrones completos" },
  { match: /^\/historial/, title: "Historial", subtitle: "Seguimiento de tus análisis pasados" },
  { match: /^\/favoritos/, title: "Favoritos", subtitle: "Partidos, equipos y mercados guardados" },
  { match: /^\/configuracion/, title: "Configuración", subtitle: "Preferencias de la plataforma" },
];

function getPageMeta(pathname: string): { title: string; subtitle?: string } {
  return PAGE_TITLES.find((p) => p.match.test(pathname)) ?? { title: "BetAnalyzer", subtitle: undefined };
}

const NOTIFICATIONS = [
  { id: 1, title: "Nuevo patrón fuerte detectado", detail: "Real Aurora FC — más de 4.5 córners", time: "Hace 12 min" },
  { id: 2, title: "Recordatorio de partido", detail: "CD Halcón Rojo vs. Sporting Cataluz en 2 horas", time: "Hace 1 h" },
  { id: 3, title: "Resumen semanal disponible", detail: "Tu reporte de rendimiento ya está listo", time: "Ayer" },
];

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const meta = getPageMeta(pathname);
  const { competitionId, setCompetitionId, dateIso, setDateIso, sidebarCollapsed, toggleSidebar } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = React.useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/partidos?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur md:px-6">
      <MobileDrawer />

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden size-9 text-muted-foreground hover:bg-accent hover:text-foreground md:flex"
        aria-label={sidebarCollapsed ? "Desplegar barra lateral" : "Ocultar barra lateral"}
        title={sidebarCollapsed ? "Desplegar barra lateral" : "Ocultar barra lateral"}
      >
        {sidebarCollapsed ? <PanelLeftOpen className="size-5 text-brand-green" /> : <PanelLeftClose className="size-5" />}
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground md:text-lg">{meta.title}</h1>
        {meta.subtitle && <p className="hidden truncate text-xs text-muted-foreground lg:block">{meta.subtitle}</p>}
      </div>

      <Select value={competitionId} onValueChange={setCompetitionId}>
        <SelectTrigger size="sm" className="hidden w-40 lg:flex">
          <SelectValue placeholder="Competición" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las ligas</SelectItem>
          {competitions.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar equipo o partido…"
          className="h-8 w-48 pl-8 lg:w-60"
          aria-label="Buscador general"
        />
      </form>

      <input
        type="date"
        value={dateIso}
        onChange={(e) => setDateIso(e.target.value)}
        aria-label="Selector de fecha"
        className="hidden h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 xl:block"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
            <Bell className="size-[18px]" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand-green-bright" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {NOTIFICATIONS.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
              <span className="text-sm font-medium">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.detail}</span>
              <span className="text-[11px] text-muted-foreground/70">{n.time}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Cambiar tema">
        {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="Menú de usuario">
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-green/15 text-xs font-semibold text-brand-green">AD</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Aldair Daza</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/configuracion" className="flex items-center gap-2">
              <User className="size-4" /> Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/configuracion" className="flex items-center gap-2">
              <Settings className="size-4" /> Configuración
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
