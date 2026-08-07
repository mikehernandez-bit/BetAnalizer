"use client";

import * as React from "react";
import { getTodayIso } from "@/services/match-service";

interface AppStateValue {
  competitionId: string;
  setCompetitionId: (id: string) => void;
  dateIso: string;
  setDateIso: (date: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [competitionId, setCompetitionId] = React.useState("all");
  const [dateIso, setDateIso] = React.useState(getTodayIso);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const value = React.useMemo(
    () => ({
      competitionId,
      setCompetitionId,
      dateIso,
      setDateIso,
      sidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((v) => !v),
    }),
    [competitionId, dateIso, sidebarCollapsed]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
