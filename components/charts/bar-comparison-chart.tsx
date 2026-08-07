"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BarComparisonChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  seriesA: { key: string; name: string; color?: string };
  seriesB?: { key: string; name: string; color?: string };
  horizontal?: boolean;
}

export function BarComparisonChart({ data, xKey, seriesA, seriesB, horizontal = false }: BarComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, left: horizontal ? 8 : -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={!horizontal} horizontal={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
          </>
        )}
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        {seriesB && <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />}
        <Bar dataKey={seriesA.key} name={seriesA.name} fill={seriesA.color ?? "#22C55E"} radius={[4, 4, 4, 4]} maxBarSize={28} />
        {seriesB && <Bar dataKey={seriesB.key} name={seriesB.name} fill={seriesB.color ?? "#3B82F6"} radius={[4, 4, 4, 4]} maxBarSize={28} />}
      </BarChart>
    </ResponsiveContainer>
  );
}
