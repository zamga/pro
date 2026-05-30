"use client";

import { useReveal } from "@/hooks/useReveal";

/**
 * Wraps content in a scroll reveal. Use `childSelector` to stagger inner items
 * (e.g. cards) instead of revealing the wrapper as one block.
 */
export default function Reveal({
  children,
  className,
  id,
  y,
  stagger,
  childSelector,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  y?: number;
  stagger?: number;
  childSelector?: string;
}) {
  const ref = useReveal<HTMLDivElement>({ y, stagger, childSelector });
  return (
    <div ref={ref} className={className} id={id}>
      {children}
    </div>
  );
}
