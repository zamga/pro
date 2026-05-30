import Reveal from "@/components/motion/Reveal";
import { strategies } from "@/lib/content";

export default function Strategies() {
  return (
    <section id="strategies" className="shell section-pad">
      <span className="eyebrow">{strategies.eyebrow}</span>
      <h2 className="measure-sub">{strategies.title}</h2>
      <Reveal className="solutions__grid" childSelector=".solution" stagger={0.1}>
        {strategies.items.map((s) => (
          <article className="solution" data-cursor="solutions" key={s.index}>
            <span className="solution__index">{s.index}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            {s.points && (
              <ul className="solution__points">
                {s.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            )}
          </article>
        ))}
      </Reveal>
    </section>
  );
}
