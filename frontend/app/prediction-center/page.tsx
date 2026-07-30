import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { PredictionTabs } from "@/components/prediction/prediction-tabs";
import { Footer } from "@/components/layout/footer";

export default function PredictionCenterPage() {
  return (
    <>
      <header className="border-b border-border bg-white">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-judicial-500/20 bg-judicial-50 text-judicial-500">
              <Scale className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <span className="font-plex text-[19px] font-semibold tracking-tight text-judicial-700">
              DocketIQ
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-judicial-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to overview
          </Link>
        </div>
      </header>

      <main className="min-h-[calc(100vh-80px)] bg-background py-16">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wide2 text-gold-600">
              Prediction Center
            </span>
            <h1 className="rule-gold mt-4 font-plex text-3xl font-semibold text-slate-900 sm:text-[2.1rem]">
              Run a scheduling prediction
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-500">
              Select a module, enter the case-file details, and generate an
              advisory estimate for the bench.
            </p>
          </div>

          <PredictionTabs />
        </div>
      </main>

      <Footer />
    </>
  );
}
