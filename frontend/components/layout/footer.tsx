import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5 text-slate-500">
          <Scale className="h-4 w-4 text-judicial-500" strokeWidth={1.75} />
          <span className="font-plex text-sm font-medium text-slate-600">DocketIQ</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm">AI-Assisted Judicial Scheduling</span>
        </div>
        <p className="text-xs text-slate-400">
          Decision-support estimates only. Not a substitute for judicial discretion.
        </p>
      </div>
    </footer>
  );
}
