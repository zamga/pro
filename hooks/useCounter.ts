"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/**
 * Counter-up. By default it runs when the element scrolls into view. For
 * above-the-fold figures (the hero), pass `playOnPreloaderDone` so the count is
 * part of the intro instead of depending on a scroll. Reduced-motion shows the
 * final value immediately. Pair with `tabular-nums` to avoid width jitter.
 */
export function useCounter<T extends HTMLElement = HTMLElement>(
  to: number,
  opts?: { prefix?: string; suffix?: string; decimals?: number; playOnPreloaderDone?: boolean }
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;
    const prefix = opts?.prefix ?? "";
    const suffix = opts?.suffix ?? "";
    const decimals = opts?.decimals ?? 0;
    const fmt = (v: number) => prefix + v.toFixed(decimals) + suffix;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(to);
      return;
    }

    el.textContent = fmt(0);
    const o = { v: 0 };
    const play = () =>
      gsap.to(o, {
        v: to,
        duration: 1.6,
        ease: "custom",
        onUpdate: () => { el.textContent = fmt(o.v); },
        onComplete: () => { el.textContent = fmt(to); },
      });

    if (opts?.playOnPreloaderDone) {
      const w = window as Window & { __preloaderDone?: boolean };
      if (w.__preloaderDone) { play(); return; }
      const onDone = () => play();
      document.addEventListener("preloaderdone", onDone, { once: true });
      const t = window.setTimeout(() => { if (!w.__preloaderDone) play(); }, 3500);
      return () => { document.removeEventListener("preloaderdone", onDone); clearTimeout(t); };
    }

    const st = ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: play });
    return () => st.kill();
  }, [to, opts?.prefix, opts?.suffix, opts?.decimals, opts?.playOnPreloaderDone]);

  return ref;
}
