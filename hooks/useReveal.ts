"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/**
 * Scroll reveal using transform + autoAlpha only (never layout props → zero CLS).
 * Fires once on enter. Reduced-motion ships content visible immediately.
 *
 * `childSelector` staggers inner elements; otherwise the element itself reveals.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts?: {
  y?: number;
  stagger?: number;
  childSelector?: string;
  start?: string;
}) {
  const ref = useRef<T>(null);
  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const targets = opts?.childSelector
      ? gsap.utils.toArray<HTMLElement>(el.querySelectorAll(opts.childSelector))
      : [el];
    if (!targets.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(targets, { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.set(targets, { y: opts?.y ?? 40, autoAlpha: 0 });
    const st = ScrollTrigger.create({
      trigger: el,
      start: opts?.start ?? "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(targets, {
          y: 0,
          autoAlpha: 1,
          duration: 1.1,
          stagger: opts?.stagger ?? 0.1,
          overwrite: true,
        }),
    });
    return () => st.kill();
  }, [opts?.y, opts?.stagger, opts?.childSelector, opts?.start]);

  return ref;
}
