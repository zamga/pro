import SplitLines from "@/components/motion/SplitLines";
import Reveal from "@/components/motion/Reveal";

/** Full-bleed crescendo — the one line the firm wants you to remember. */
export default function Statement() {
  return (
    <section id="statement" className="statement">
      <div className="shell statement__inner">
        <span className="eyebrow">The record</span>
        <SplitLines as="h2" className="statement__headline" text="Zero principal lost." stagger={0.08} />
        <Reveal>
          <p className="statement__sub">
            Across 140 facilities and fourteen vintages, every dollar of senior
            capital we have committed has been returned.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
