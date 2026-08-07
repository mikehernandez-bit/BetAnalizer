"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/brand/logo-icon";

interface LoadingAnalysisProps {
  stages: readonly string[];
  stageIndex: number;
  progress: number;
}

export function LoadingAnalysis({ stages, stageIndex, progress }: LoadingAnalysisProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <LogoIcon size={56} />
      </motion.div>

      <h3 className="text-lg font-semibold text-foreground">Generando tu análisis completo</h3>
      <p className="mt-1 text-sm text-muted-foreground">Esto toma solo unos segundos.</p>

      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-green to-brand-green-bright"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <ul className="mt-7 w-full space-y-2.5 text-left">
        {stages.map((stage, i) => {
          const state = i < stageIndex ? "done" : i === stageIndex ? "active" : "pending";
          return (
            <li
              key={stage}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                state === "active" && "border-brand-green/30 bg-brand-green/5 text-foreground",
                state === "done" && "border-transparent text-muted-foreground",
                state === "pending" && "border-transparent text-muted-foreground/50"
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {state === "done" ? (
                    <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="size-4 text-brand-green" />
                    </motion.span>
                  ) : state === "active" ? (
                    <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="size-4 animate-spin text-brand-green-bright" />
                    </motion.span>
                  ) : (
                    <motion.span key="pending" className="size-1.5 rounded-full bg-border" />
                  )}
                </AnimatePresence>
              </span>
              {stage}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
