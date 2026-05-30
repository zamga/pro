"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/**
 * Single source of truth for scroll + the unified RAF.
 *
 * - Lenis momentum scroll is driven by gsap.ticker (one RAF for Lenis,
 *   ScrollTrigger, the WebGL field and the cursor).
 * - `lenis.on('scroll', ScrollTrigger.update)` keeps pins/triggers in sync.
 * - Reduced-motion / coarse pointers skip Lenis entirely (native scroll) but
 *   ScrollTrigger still runs so reveals work.
 * - StrictMode-safe cleanup (dev double-mount): destroy Lenis, remove the ticker
 *   fn, kill every ScrollTrigger.
 */
export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGsap();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Top scroll-progress bar (compositor-only transform).
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    const progress = gsap.quickSetter(bar, "scaleX");
    const onProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress(max > 0 ? window.scrollY / max : 0);
    };

    if (reduced || coarse) {
      window.addEventListener("scroll", onProgress, { passive: true });
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(id);
        window.removeEventListener("scroll", onProgress);
        bar.remove();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", onProgress);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Smooth anchor navigation.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: 0 });
      }
    };
    document.addEventListener("click", onClick);

    let rt = 0;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(() => { lenis.resize(); ScrollTrigger.refresh(); }, 150);
    };
    window.addEventListener("resize", onResize);

    const refreshId = requestAnimationFrame(() => { ScrollTrigger.refresh(); onProgress(); });
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(refreshId);
      clearTimeout(rt);
      bar.remove();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
