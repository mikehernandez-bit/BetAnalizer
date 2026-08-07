"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface AnalysisTabDef {
  value: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export function AnalysisTabs({ tabs, defaultValue }: { tabs: AnalysisTabDef[]; defaultValue: string }) {
  return (
    <Tabs defaultValue={defaultValue} className="gap-4">
      <div className="scrollbar-thin sticky top-16 z-20 -mx-4 overflow-x-auto bg-background/95 px-4 py-1.5 backdrop-blur md:-mx-0 md:px-0">
        <TabsList className="w-max min-w-full justify-start gap-1 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs data-[state=active]:border-brand-green/30 data-[state=active]:bg-brand-green/10 data-[state=active]:text-brand-green-bright sm:text-sm"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-6 focus-visible:outline-none">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
