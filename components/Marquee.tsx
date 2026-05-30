/**
 * (6) Hardware-accelerated marquee.
 *
 * The track is duplicated so a 50% translate3d loop is seamless. The animation is
 * a GPU-composited transform (see globals.css) for 60fps with low CPU cost; it
 * pauses under prefers-reduced-motion.
 */
const ITEMS = [
  "Net Asset Value Facilities",
  "GP & Management Co. Credit",
  "Asymmetric Arbitrage Funding",
  "Secondary LP Liquidity",
];

export default function Marquee() {
  // Render the sequence twice inside the track for a continuous loop.
  const sequence = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {sequence.map((item, i) => (
          <span className="marquee__item" key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
