"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import { Logo } from "@/components/ui/logo";

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLanding) return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLanding]);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isLanding
          ? scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-border shadow-sm py-4"
            : "bg-transparent py-6"
          : "bg-white border-b border-border shadow-sm py-4 sticky"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="group">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-accent text-foreground/80 hover:text-primary"
            )}
          >
            Home
          </Link>
          <Link
            href="/cases"
            className={cn(
              "text-sm font-medium transition-colors hover:text-accent text-foreground/80 hover:text-primary"
            )}
          >
            My Cases
          </Link>
          <Link
            href="/prediction"
            className={cn(
              "text-sm font-medium transition-colors hover:text-accent text-foreground/80 hover:text-primary"
            )}
          >
            Prediction Center
          </Link>
        </nav>
      </div>
    </header>
  );
}
