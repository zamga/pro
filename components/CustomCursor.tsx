"use client";

import { useEffect, useRef } from "react";
import { CURSOR_LABELS, CursorKey } from "@/lib/cursor";

/**
 * (2) Weighted, lag-free custom cursor.
 *
 * A fixed circle eased toward the pointer with LERP for a heavy, physical feel.
 * Elements carrying `data-cursor="discover|decrypt|solutions|connect"` expand the
 * circle and surface the matching label. Disabled on coarse pointers and when the
 * user prefers reduced motion (native cursor is kept in those cases).
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

    document.body.classList.add("cursor-active");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        dot.classList.add("is-visible");
      }
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

    const onLeave = () => {
      visible = false;
      dot.classList.remove("is-visible");
    };

    // LERP loop — eased follow gives the cursor its weight.
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
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
