"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * BACKGROUND MEDIA — PLACEHOLDER
 * Replace the <source> below with licensed, royalty-free footage of:
 *   - Supreme Court of India exterior, a courthouse entrance/corridor,
 *     law books, a gavel, or the Lady Justice statue.
 * Suggested stock sources: Pexels, Pixabay, Storyblocks (courthouse/justice).
 * Until real footage is supplied, the component falls back to a static
 * courthouse image (also a placeholder — swap /public/media/hero-fallback.jpg).
 */
const HERO_VIDEO_SRC = "/media/hero-courthouse.mp4"; // TODO: replace with licensed footage
const HERO_FALLBACK_IMAGE = "/media/hero-fallback.jpg"; // TODO: replace with licensed photo

export function Hero() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-judicial-900">
      {/* Background media layer */}
      <div className="absolute inset-0">
        {!videoFailed ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={HERO_FALLBACK_IMAGE}
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : (
          // Graceful fallback — real courthouse photograph placeholder
          <img
            src={HERO_FALLBACK_IMAGE}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        )}
        {/* Soft white overlay so headline type stays legible over footage */}
        <div className="absolute inset-0 bg-gradient-to-b from-judicial-900/80 via-judicial-900/55 to-judicial-900/85" />
        <div className="absolute inset-0 bg-white/[0.04]" />
      </div>

      {/* Content */}
      <div className="container relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[12px] font-medium tracking-wide2 text-white/80 backdrop-blur-sm">
            JUDICIAL DECISION SUPPORT SYSTEM
          </span>

          <h1 className="font-plex text-[2.5rem] font-semibold leading-[1.12] text-white sm:text-[3.4rem]">
            Smarter Scheduling.
            <br />
            Faster Justice.
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/80">
            Helping courts predict hearing duration, adjournment risk and case
            complexity through AI-assisted judicial scheduling.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="gold" className="group">
              <Link href="/prediction-center">
                Start Prediction
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <a
              href="#modules"
              className="text-sm font-medium text-white/75 underline-offset-4 hover:text-white hover:underline"
            >
              Explore the modules
            </a>
          </div>
        </motion.div>
      </div>

      {/* Base seam into the light page below */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}
