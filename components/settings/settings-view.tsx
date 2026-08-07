"use client";

import * as React from "react";
import { MarketCategory, UserPreferences } from "@/types";
import { useTheme } from "@/lib/theme-provider";
import { useFavorites } from "@/hooks/use-favorites";
import { MARKET_CATEGORY_LABELS } from "@/data/markets";
import { MATCH_COUNT_OPTIONS } from "@/lib/validation/analysis-wizard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/shared/export-button";
import { Sun, Moon, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "betanalyzer-preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: "Aldair Daza",
  email: "aldairdaza28@gmail.com",
  theme: "dark",
  language: "es",
  timezone: "America/Bogota",
  oddsFormat: "decimal",
  defaultMatchCount: 10,
  minConfidence: 60,
  favoriteMarketCategories: ["corners", "goles"],
  notifications: { newPatterns: true, matchReminders: true, weeklySummary: false, oddsMovement: false },
};

const MARKET_CATEGORIES = Object.keys(MARKET_CATEGORY_LABELS) as MarketCategory[];
const TIMEZONES = ["America/Bogota", "America/Mexico_City", "America/Argentina/Buenos_Aires", "Europe/Madrid", "UTC"];

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { favorites, remove } = useFavorites();
  const [prefs, setPrefs] = React.useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    // Preferences live in localStorage only, so they can't be read until after mount.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setPrefs({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
    } catch {
      // ignore malformed local storage
    }
  }, []);

  function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function toggleMarketCategory(category: MarketCategory) {
    const next = prefs.favoriteMarketCategories.includes(category)
      ? prefs.favoriteMarketCategories.filter((c) => c !== category)
      : [...prefs.favoriteMarketCategories, category];
    update("favoriteMarketCategories", next);
  }

  function clearFavorites() {
    favorites.forEach((f) => remove(f.id));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Información básica de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Nombre</Label>
            <Input id="displayName" value={prefs.displayName} onChange={(e) => update("displayName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={prefs.email} onChange={(e) => update("email", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Tema e idioma de la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Tema</Label>
            <div className="flex gap-2">
              <Button variant={theme === "dark" ? "secondary" : "outline"} size="sm" className="flex-1 gap-1.5" onClick={() => setTheme("dark")}>
                <Moon className="size-4" /> Oscuro
              </Button>
              <Button variant={theme === "light" ? "secondary" : "outline"} size="sm" className="flex-1 gap-1.5" onClick={() => setTheme("light")}>
                <Sun className="size-4" /> Claro
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Idioma</Label>
            <Select value={prefs.language} onValueChange={(v) => update("language", v as UserPreferences["language"])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Zona horaria</Label>
            <Select value={prefs.timezone} onValueChange={(v) => update("timezone", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análisis</CardTitle>
          <CardDescription>Valores por defecto para tus nuevos análisis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Formato de cuotas</Label>
              <Select value={prefs.oddsFormat} onValueChange={(v) => update("oddsFormat", v as UserPreferences["oddsFormat"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decimal">Decimal (1.85)</SelectItem>
                  <SelectItem value="fraccional">Fraccional (17/20)</SelectItem>
                  <SelectItem value="americana">Americana (-118)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cantidad predeterminada de partidos</Label>
              <div className="flex gap-2">
                {MATCH_COUNT_OPTIONS.map((count) => (
                  <Button
                    key={count}
                    size="sm"
                    variant={prefs.defaultMatchCount === count ? "secondary" : "outline"}
                    className={cn("flex-1", prefs.defaultMatchCount === count && "border-brand-green/30 text-brand-green-bright")}
                    onClick={() => update("defaultMatchCount", count)}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Nivel mínimo de confianza</Label>
              <span className="text-sm font-semibold text-brand-green-bright">{prefs.minConfidence}%</span>
            </div>
            <Slider
              value={[prefs.minConfidence]}
              min={40}
              max={90}
              step={5}
              onValueChange={([v]) => update("minConfidence", v)}
            />
            <p className="text-xs text-muted-foreground">Los mercados por debajo de este umbral se marcarán como &quot;evitar&quot;.</p>
          </div>

          <div className="space-y-2">
            <Label>Preferencias de mercados</Label>
            <div className="flex flex-wrap gap-2">
              {MARKET_CATEGORIES.map((category) => {
                const active = prefs.favoriteMarketCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleMarketCategory(category)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active ? "border-brand-green/30 bg-brand-green/10 text-brand-green-bright" : "border-border text-muted-foreground hover:border-brand-green/25"
                    )}
                  >
                    {MARKET_CATEGORY_LABELS[category]}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "newPatterns" as const, label: "Nuevos patrones detectados" },
            { key: "matchReminders" as const, label: "Recordatorios de partidos" },
            { key: "weeklySummary" as const, label: "Resumen semanal" },
            { key: "oddsMovement" as const, label: "Movimiento de cuotas" },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
              <span className="text-sm text-foreground">{item.label}</span>
              <Switch
                checked={prefs.notifications[item.key]}
                onCheckedChange={(checked) => update("notifications", { ...prefs.notifications, [item.key]: checked })}
              />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de datos</CardTitle>
          <CardDescription>Tus preferencias y favoritos se guardan solo en este navegador.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <ExportButton filename="betanalyzer-datos.json" getContent={() => JSON.stringify({ preferences: prefs, favorites }, null, 2)} label="Exportar mis datos" />
          <Button variant="outline" size="sm" className="gap-1.5 text-brand-red hover:text-brand-red" onClick={clearFavorites}>
            <Trash2 className="size-4" /> Borrar favoritos
          </Button>
          {saved && (
            <Badge variant="outline" className="gap-1 border-brand-green/25 bg-brand-green/10 text-brand-green-bright">
              <Check className="size-3" /> Guardado
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
