"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
}

export function DonutChart({ data }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={3} stroke="none">
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
