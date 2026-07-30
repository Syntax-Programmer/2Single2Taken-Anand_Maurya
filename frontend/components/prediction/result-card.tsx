"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileCheck2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ResultCardProps {
  visible: boolean;
  headline: string;
  headlineLabel: string;
  confidence: number;
  meterLabel?: string;
  rightSlot?: React.ReactNode;
}

export function ResultCard({
  visible,
  headline,
  headlineLabel,
  confidence,
  meterLabel = "Model confidence",
  rightSlot,
}: ResultCardProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="border-judicial-100 bg-judicial-50/40 p-8">
            <div className="flex items-center gap-2 text-judicial-500">
              <FileCheck2 className="h-4 w-4" strokeWidth={1.8} />
              <span className="text-xs font-semibold uppercase tracking-wide2">
                Prediction Result
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm text-slate-500">{headlineLabel}</p>
                <p className="mt-1 font-plex text-4xl font-semibold text-slate-900">
                  {headline}
                </p>
              </div>
              {rightSlot}
            </div>

            <Separator className="my-6" />

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">{meterLabel}</span>
                <span className="font-medium text-slate-700">{confidence}%</span>
              </div>
              <Progress value={confidence} />
            </div>

            <p className="mt-6 text-xs leading-relaxed text-slate-400">
              This estimate is advisory and generated from historical scheduling
              patterns. It does not bind the presiding officer's discretion.
            </p>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
