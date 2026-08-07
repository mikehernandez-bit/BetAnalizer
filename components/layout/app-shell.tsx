"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { MobileBottomNav } from "@/components/layout/mobile-navbar";
import { Footer } from "@/components/layout/footer";
import { AppStateProvider } from "@/lib/app-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <div className="flex min-h-dvh w-full">
        <Sidebar />
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <TopNavbar />
          <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
          <Footer />
        </div>
      </div>
      <MobileBottomNav />
    </AppStateProvider>
  );
}
