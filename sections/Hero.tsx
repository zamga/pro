import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import SplitLines from "@/components/motion/SplitLines";
import Counter from "@/components/motion/Counter";
import Magnetic from "@/components/motion/Magnetic";
import { hero, type Metric } from "@/lib/content";

export default function Hero() {
  return (
    <>
      <Nav />

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
          <div className="hero__cta">
            <Magnetic strength={0.5}>
              <a className="btn btn--solid" href="#contact" data-cursor="connect">Request access →</a>
            </Magnetic>
          </div>
          <span className="scroll-cue" data-cursor="discover">Scroll</span>
        </div>
      </section>

      <Marquee />
    </>
  );
}
