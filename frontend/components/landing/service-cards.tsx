"use client";

import { motion } from "framer-motion";
import { Timer, ShieldAlert, LayoutGrid, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

const modules = [
  {
    numeral: "I",
    icon: Timer,
    title: "Hearing Duration Prediction",
    description: "Estimate how long a hearing may take.",
  },
  {
    numeral: "II",
    icon: ShieldAlert,
    title: "Adjournment Risk Prediction",
    description: "Estimate the probability of adjournment.",
  },
  {
    numeral: "III",
    icon: LayoutGrid,
    title: "Case Complexity Classification",
    description: "Classify cases into Low, Medium and High complexity.",
  },
];

export function ServiceCards() {
  return (
    <section id="modules" className="bg-background py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wide2 text-gold-600">
            Prediction Modules
          </span>
          <h2 className="mt-4 font-plex text-3xl font-semibold text-slate-900 sm:text-[2.25rem]">
            Three modules. One docket.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
            Each module reads case-file signals already familiar to a registry
            clerk and returns a plain, defensible estimate for the bench.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/prediction-center" className="group block h-full">
                <Card className="flex h-full flex-col p-8 hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="flex items-start justify-between">
                    {/* Signature element: a docket-seal numeral, styled after
                        a case-number stamp rather than a generic 01/02/03 */}
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/60">
                      <span className="font-plex text-lg font-semibold text-gold-600">
                        {m.numeral}
                      </span>
                    </div>
                    <m.icon
                      className="h-5 w-5 text-judicial-500/70 transition-colors group-hover:text-judicial-500"
                      strokeWidth={1.6}
                    />
                  </div>

                  <h3 className="rule-gold mt-7 font-plex text-lg font-semibold text-slate-900">
                    {m.title}
                  </h3>
                  <p className="mt-4 flex-1 text-[14.5px] leading-relaxed text-slate-500">
                    {m.description}
                  </p>

                  <div className="mt-8 flex items-center gap-1.5 text-sm font-medium text-judicial-500">
                    Open module
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
