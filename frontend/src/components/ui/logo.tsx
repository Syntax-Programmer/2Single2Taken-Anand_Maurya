import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Styled SVG Emblem */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      >
        {/* Shield Outer Shape */}
        <path
          d="M18 2.5C23.5 2.5 29 4.5 31.5 6.5C32.5 12.5 31.5 22.5 18 33.5C4.5 22.5 3.5 12.5 4.5 6.5C7 4.5 12.5 2.5 18 2.5Z"
          fill="#002B49"
          stroke="#C5A059"
          strokeWidth="1.5"
        />
        
        {/* Pillar of Justice */}
        <path
          d="M18 10V25"
          stroke="#C5A059"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14 25H22"
          stroke="#C5A059"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 10H21"
          stroke="#C5A059"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Balance Scale Bar */}
        <path
          d="M10 13.5C13 12 15 12 18 12C21 12 23 12 26 13.5"
          stroke="#C5A059"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Left Scale Pan */}
        <path
          d="M10 13.5L8 19C8 20.1 8.9 21 10 21C11.1 21 12 20.1 12 19L10 13.5Z"
          fill="#C5A059"
        />

        {/* Right Scale Pan */}
        <path
          d="M26 13.5L24 19C24 20.1 24.9 21 26 21C27.1 21 28 20.1 28 19L26 13.5Z"
          fill="#C5A059"
        />

        {/* Small center dial decoration */}
        <circle cx="18" cy="12" r="1.5" fill="#002B49" stroke="#C5A059" strokeWidth="1" />
      </svg>

      {!iconOnly && (
        <span className="font-ibm-plex-sans font-bold text-xl tracking-tight text-primary">
          Docket<span className="text-accent font-medium">IQ</span>
        </span>
      )}
    </div>
  );
}
