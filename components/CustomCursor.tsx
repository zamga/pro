"use client";

import { useEffect, useRef } from "react";
import { CURSOR_LABELS, CursorKey } from "@/lib/cursor";
import { gsap, registerGsap } from "@/lib/gsap";

/**
 * Weighted custom cursor. The LERP follow now runs through `gsap.quickTo` on the
 * shared gsap.ticker (one RAF for the whole app), not its own loop. Elements with
 * `data-cursor` expand the circle and surface a contextual label. Disabled on
 * coarse pointers / reduced-motion.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    registerGsap();
    document.body.classList.add("cursor-active");
    gsap.set(dot, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const xTo = gsap.quickTo(dot, "x", { duration: 0.45, ease: "custom" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.45, ease: "custom" });
    let visible = false;

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!visible) { visible = true; dot.classList.add("is-visible"); }
    };
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>("[data-cursor]");
      const key = el?.dataset.cursor as CursorKey | undefined;
      if (key && CURSOR_LABELS[key]) {
        label.textContent = CURSOR_LABELS[key];
        dot.classList.add("is-active");
      } else {
        dot.classList.remove("is-active");
      }
    };
    const onLeave = () => { visible = false; dot.classList.remove("is-visible"); };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("cursor-active");
    };
  }, []);

  return (
    <div ref={dotRef} className="cursor" aria-hidden="true">
      <span ref={labelRef} className="cursor__label" />
    </div>
  );
}
