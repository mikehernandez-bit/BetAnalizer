"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TrendLineChartProps {
  data: { label: string; value: number; secondaryValue?: number }[];
  primaryName?: string;
  secondaryName?: string;
  color?: string;
  secondaryColor?: string;
  area?: boolean;
}

export function TrendLineChart({
  data,
  primaryName = "Valor",
  secondaryName,
  color = "#22C55E",
  secondaryColor = "#3B82F6",
  area = true,
}: TrendLineChartProps) {
  const Chart = area ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Chart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        {area ? (
          <Area type="monotone" dataKey="value" name={primaryName} stroke={color} strokeWidth={2} fill="url(#trendFill)" />
        ) : (
          <Line type="monotone" dataKey="value" name={primaryName} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        )}
        {secondaryName && !area && (
          <Line type="monotone" dataKey="secondaryValue" name={secondaryName} stroke={secondaryColor} strokeWidth={2} dot={{ r: 3 }} />
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
