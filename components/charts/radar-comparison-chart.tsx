"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface RadarComparisonChartProps {
  data: { metric: string; teamA: number; teamB: number }[];
  teamAName: string;
  teamBName: string;
}

export function RadarComparisonChart({ data, teamAName, teamBName }: RadarComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} axisLine={false} />
        <Radar name={teamAName} dataKey="teamA" stroke="#22C55E" fill="#22C55E" fillOpacity={0.28} strokeWidth={2} />
        <Radar name={teamBName} dataKey="teamB" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.22} strokeWidth={2} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
        <Tooltip
          contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "var(--foreground)" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
