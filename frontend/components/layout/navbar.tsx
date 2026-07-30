"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-white/90 backdrop-blur-md"
          : "border-b border-white/10 bg-transparent"
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300",
              scrolled
                ? "border-judicial-500/20 bg-judicial-50 text-judicial-500"
                : "border-white/40 bg-white/10 text-white"
            )}
          >
            <Scale className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <span
            className={cn(
              "font-plex text-[19px] font-semibold tracking-tight transition-colors duration-300",
              scrolled ? "text-judicial-700" : "text-white"
            )}
          >
            DocketIQ
          </span>
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-9 text-sm font-medium md:flex transition-colors duration-300",
            scrolled ? "text-slate-600" : "text-white/85"
          )}
        >
          <a href="#modules" className="hover:opacity-80">
            Modules
          </a>
          <a href="#about" className="hover:opacity-80">
            About the Platform
          </a>
        </nav>

        <Button asChild size="default" variant={scrolled ? "primary" : "outline"} className={!scrolled ? "border-white/50 text-white hover:bg-white/10" : ""}>
          <Link href="/prediction-center">Start Prediction</Link>
        </Button>
      </div>
    </header>
  );
}
