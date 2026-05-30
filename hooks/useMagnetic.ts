"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";

/**
 * Magnetic micro-interaction: the element eases toward the cursor within its
 * bounds and springs back on leave (gsap.quickTo on the shared ticker). No-op on
 * coarse pointers / reduced-motion.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.4) {
  const ref = useRef<T>(null);
  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "custom" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "custom" });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { xTo(0); yTo(0); };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return ref;
}
