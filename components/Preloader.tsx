"use client";

import { useEffect, useRef, useState } from "react";

/**
 * (5) Minimalist typographic preloader.
 *
 * Counts 00 -> 100 with variable, decelerating increments, then slides/fades away
 * on the shared expo curve to reveal the page. Scroll is locked while visible.
 * Reduced-motion users get an instant reveal.
 */
export default function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("is-loading");

    if (reduced) {
      setCount(100);
      setDone(true);
      document.body.classList.remove("is-loading");
      return;
    }

    let value = 0;
    let raf = 0;
    let last = performance.now();

    const run = (now: number) => {
      const dt = now - last;
      // Variable easing: faster early, slower as it approaches 100.
      const remaining = 100 - value;
      const step = Math.max(0.4, remaining * 0.04) * (dt / 16.67);
      value = Math.min(100, value + step);
      setCount(Math.round(value));

      if (value < 100) {
        last = now;
        raf = requestAnimationFrame(run);
      } else {
        // Brief hold at 100, then reveal.
        setTimeout(() => {
          setDone(true);
          document.body.classList.remove("is-loading");
        }, 380);
      }
    };

    raf = requestAnimationFrame(run);
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("is-loading");
    };
  }, []);

  return (
    <div ref={ref} className={`preloader${done ? " is-done" : ""}`} aria-hidden="true">
      <span className="preloader__word">Obsidian Capital</span>
      <span className="preloader__count">{String(count).padStart(2, "0")}</span>
    </div>
  );
}
