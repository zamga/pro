"use client";

import { createElement, useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/** Split into line masks (font-metric aware) — inner spans translate up to reveal. */
function splitLines(el: HTMLElement): HTMLElement[] {
  const words = el.textContent ? el.textContent.split(/(\s+)/) : [];
  el.textContent = "";
  words.forEach((w) => {
    if (w.trim() === "") { el.appendChild(document.createTextNode(w)); return; }
    const s = document.createElement("span");
    s.className = "w";
    s.textContent = w;
    el.appendChild(s);
  });
  const spans = Array.prototype.slice.call(el.querySelectorAll("span.w")) as HTMLElement[];
  const lines: HTMLElement[][] = [];
  let cur: HTMLElement[] = [];
  let top: number | null = null;
  spans.forEach((s) => {
    const t = s.offsetTop;
    if (top === null || Math.abs(t - top) > 2) { if (cur.length) lines.push(cur); cur = []; top = t; }
    cur.push(s);
  });
  if (cur.length) lines.push(cur);

  el.textContent = "";
  const inners: HTMLElement[] = [];
  lines.forEach((line) => {
    const mask = document.createElement("span");
    mask.className = "line-mask";
    const inner = document.createElement("span");
    inner.className = "line-inner";
    line.forEach((s, i) => {
      inner.appendChild(s);
      if (i < line.length - 1) inner.appendChild(document.createTextNode(" "));
    });
    mask.appendChild(inner);
    el.appendChild(mask);
    inners.push(inner);
  });
  return inners;
}

/**
 * Heading that reveals line-by-line from a clip mask. `playOnPreloaderDone`
 * waits for the preloader (the hero); otherwise plays on scroll-enter.
 */
export default function SplitLines({
  text,
  as = "h2",
  className,
  stagger = 0.07,
  playOnPreloaderDone = false,
}: {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  stagger?: number;
  playOnPreloaderDone?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let killed = false;
    let st: ScrollTrigger | undefined;

    const setup = () => {
      if (killed || !el) return;
      const inners = splitLines(el);
      if (reduced) { gsap.set(inners, { yPercent: 0 }); return; }
      gsap.set(inners, { yPercent: 110 });
      const play = () => gsap.to(inners, { yPercent: 0, duration: 1.15, stagger, ease: "custom" });

      if (playOnPreloaderDone) {
        const w = window as Window & { __preloaderDone?: boolean };
        if (w.__preloaderDone) play();
        else document.addEventListener("preloaderdone", play, { once: true });
        window.setTimeout(() => { if (!w.__preloaderDone) play(); }, 3500);
      } else {
        st = ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: play });
      }
    };

    if (document.fonts?.ready) document.fonts.ready.then(setup);
    else setup();

    return () => { killed = true; st?.kill(); };
  }, [text, stagger, playOnPreloaderDone]);

  return createElement(as, { ref, className }, text);
}
