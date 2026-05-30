import Reveal from "@/components/motion/Reveal";
import { platform } from "@/lib/content";

export default function Platform() {
  return (
    <section id="platform" className="shell section-pad">
      <span className="eyebrow">{platform.eyebrow}</span>
      <h2 className="measure-sub">{platform.title}</h2>
      <div className="platform__inner">
        <Reveal className="platform__body">
          {platform.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </Reveal>
        <Reveal className="platform__pillars" childSelector=".pillar" stagger={0.1}>
          {platform.pillars.map((p) => (
            <div className="pillar" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
