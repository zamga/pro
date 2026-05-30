"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { caseStudies } from "@/lib/content";

/**
 * Horizontal-scroll pinned gallery of selected facilities (desktop). On mobile /
 * reduced-motion the track becomes a native horizontal swipe (no pin).
 */
export default function CaseStudies() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const sec = root.current;
    const tr = track.current;
    const viewport = tr?.parentElement;
    if (!sec || !tr || !viewport) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { viewport.style.overflowX = "auto"; return; }

    const mm = gsap.matchMedia();
    mm.add("(min-width: 760px)", () => {
      const dist = () => tr.scrollWidth - viewport.clientWidth;
      const tween = gsap.to(tr, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => tween.kill();
    });
    mm.add("(max-width: 759px)", () => {
      viewport.style.overflowX = "auto";
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="facilities" className="cases section-pad" ref={root}>
      <div className="shell cases__head">
        <div>
          <span className="eyebrow">{caseStudies.eyebrow}</span>
          <h2 className="measure-sub">{caseStudies.title}</h2>
        </div>
        <span className="cases__hint">Scroll →</span>
      </div>
      <div className="shell cases__viewport">
        <div className="cases__track" ref={track}>
          {caseStudies.items.map((c) => (
            <article className="case" data-cursor="discover" key={c.id}>
              <div className="case__top">
                <span className="case__type">{c.type}</span>
                <span className="case__year">{c.year}</span>
              </div>
              <span className="case__amount">{c.amount}</span>
              <span className="case__cp">{c.counterparty}</span>
              <span className="case__region">{c.region}</span>
              <div className="case__line" />
              <span className="case__row"><b>Structure.</b> {c.structure}</span>
              <span className="case__row"><b>Outcome.</b> {c.outcome}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
