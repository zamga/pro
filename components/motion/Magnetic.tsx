"use client";

import { useMagnetic } from "@/hooks/useMagnetic";

/** Inline-block wrapper that makes its child a magnetic, cursor-attracted target. */
export default function Magnetic({
  children,
  strength = 0.4,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useMagnetic<HTMLSpanElement>(strength);
  return (
    <span ref={ref} className={`magnetic${className ? " " + className : ""}`}>
      {children}
    </span>
  );
}
