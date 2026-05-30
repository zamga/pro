"use client";

import { useCounter } from "@/hooks/useCounter";

/** Counter-up number; renders the final value as text fallback for no-JS/SSR. */
export default function Counter({
  to,
  prefix,
  suffix,
  decimals,
  fallback,
  className,
  playOnPreloaderDone,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  fallback: string;
  className?: string;
  playOnPreloaderDone?: boolean;
}) {
  const ref = useCounter<HTMLSpanElement>(to, { prefix, suffix, decimals, playOnPreloaderDone });
  return (
    <span ref={ref} className={className}>
      {fallback}
    </span>
  );
}
