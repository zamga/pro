import Marquee from "@/components/Marquee";
import SplitLines from "@/components/motion/SplitLines";
import Counter from "@/components/motion/Counter";
import { nav, hero, type Metric } from "@/lib/content";

export default function Hero() {
  return (
    <>
      <header className="nav shell" style={{ maxWidth: "none" }}>
        <span className="nav__mark" data-cursor="discover">
          {nav.brand}
          <span style={{ color: "var(--accent)" }}>.</span>
        </span>
        <nav>
          <ul className="nav__links">
            {nav.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} data-cursor="discover">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <section id="hero" className="hero shell">
        <div className="hero__inner">
          <span className="eyebrow">{hero.eyebrow}</span>
          <SplitLines as="h1" className="measure-hero" text={hero.title} stagger={0.06} playOnPreloaderDone />
          <p className="hero__lede measure-sub">{hero.lede}</p>
          <dl className="hero__meta">
            {(hero.metrics as readonly Metric[]).map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>
                  <Counter
                    to={m.countTo}
                    prefix={m.prefix}
                    suffix={m.suffix}
                    decimals={m.decimals}
                    fallback={m.value}
                    playOnPreloaderDone
                  />
                </dd>
              </div>
            ))}
          </dl>
          <span className="scroll-cue" data-cursor="discover">Scroll</span>
        </div>
      </section>

      <Marquee />
    </>
  );
}
