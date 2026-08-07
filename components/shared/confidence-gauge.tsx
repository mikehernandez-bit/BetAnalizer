"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ConfidenceLevel } from "@/types";
import { CONFIDENCE_LEVEL_LABEL } from "@/utils/confidence";
import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  score: number;
  level: ConfidenceLevel;
  size?: number;
  label?: string;
  className?: string;
}

const STROKE_COLOR: Record<ConfidenceLevel, string> = {
  muy_alta: "#39FF88",
  alta: "#22C55E",
  moderada: "#F59E0B",
  baja: "#FB923C",
  evitar: "#EF4444",
};

export function ConfidenceGauge({ score, level, size = 128, label, className }: ConfidenceGaugeProps) {
  const strokeWidth = size * 0.09;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={STROKE_COLOR[level]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-foreground">{clamped}%</span>
        <span className="text-center text-[10px] leading-tight text-muted-foreground">{label ?? CONFIDENCE_LEVEL_LABEL[level]}</span>
      </div>
    </div>
  );
}
