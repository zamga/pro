"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { thesis } from "@/lib/content";

/**
 * Pinned scrollytelling: the stage pins while the three process steps cross-fade
 * and a progress rail fills. On mobile / reduced-motion it degrades to stacked
 * reveals (no pin).
 */
export default function Thesis() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const steps = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".thesis__step"));
    const ticks = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".thesis__tick i"));
    if (!steps.length) return;

    if (reduced) {
      gsap.set(steps, { autoAlpha: 1, position: "relative" });
      gsap.set(ticks, { scaleX: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const small = window.matchMedia("(max-width: 759px)").matches;

      if (small) {
        gsap.set(steps, { position: "relative" });
        steps.forEach((s, i) => {
          gsap.set(s, { autoAlpha: 0, y: 20 });
          ScrollTrigger.create({
            trigger: s, start: "top 82%", once: true,
            onEnter: () => {
              gsap.to(s, { autoAlpha: 1, y: 0, duration: 0.8 });
              gsap.to(ticks[i], { scaleX: 1, duration: 0.6 });
            },
          });
        });
        return;
      }

      gsap.set(steps, { autoAlpha: 0, y: 20 });
      gsap.set(steps[0], { autoAlpha: 1, y: 0 });
      gsap.set(ticks, { scaleX: 0 });
      gsap.set(ticks[0], { scaleX: 1 });

      const stage = el.querySelector(".thesis__stage");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=" + steps.length * 100 + "%",
          pin: stage,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      for (let i = 1; i < steps.length; i++) {
        tl.to(steps[i - 1], { autoAlpha: 0, y: -20, duration: 0.5 }, i)
          .to(steps[i], { autoAlpha: 1, y: 0, duration: 0.5 }, i)
          .to(ticks[i], { scaleX: 1, duration: 0.5 }, i);
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="thesis" className="thesis section-pad" ref={root}>
      <div className="shell thesis__stage">
        <div>
          <span className="eyebrow">{thesis.eyebrow}</span>
          <h2>{thesis.title}</h2>
          <p className="thesis__intro">{thesis.intro}</p>
        </div>
        <div>
          <div className="thesis__steps">
            {thesis.steps.map((s) => (
              <div className="thesis__step" key={s.index}>
                <span className="thesis__index">{s.index}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <div className="thesis__rail">
            {thesis.steps.map((s) => (
              <span className="thesis__tick" key={s.index}><i /></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
