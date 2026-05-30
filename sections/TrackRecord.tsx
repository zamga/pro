import Reveal from "@/components/motion/Reveal";
import Counter from "@/components/motion/Counter";
import { trackRecord, type Metric } from "@/lib/content";

export default function TrackRecord() {
  return (
    <section id="track-record" className="shell section-pad">
      <span className="eyebrow">{trackRecord.eyebrow}</span>
      <h2 className="measure-sub">{trackRecord.title}</h2>
      <Reveal className="track__grid" childSelector=".track__stat" stagger={0.08}>
        {(trackRecord.stats as readonly Metric[]).map((s) => (
          <div className="track__stat" key={s.label}>
            <span className="track__value">
              <Counter
                to={s.countTo}
                prefix={s.prefix}
                suffix={s.suffix}
                decimals={s.decimals}
                fallback={s.value}
              />
            </span>
            <span className="track__label">{s.label}</span>
          </div>
        ))}
      </Reveal>
      <p className="track__note">{trackRecord.note}</p>
    </section>
  );
}
