const SOLUTIONS = [
  {
    title: "Net Asset Value Facilities",
    body: "Portfolio-level leverage secured against diversified fund NAV — funding distributions, follow-ons and acceleration without forced exits.",
  },
  {
    title: "GP & Management Co. Credit",
    body: "Balance-sheet and GP commitment financing that lets managers scale their own stake alongside investors.",
  },
  {
    title: "Asymmetric Arbitrage Funding",
    body: "Structured lines for relative-value and event-driven strategies where convexity, not duration, drives the return.",
  },
  {
    title: "Secondary LP Liquidity",
    body: "Discreet, priced liquidity for limited partners seeking to rebalance ahead of a fund's natural horizon.",
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="shell section-pad">
      <span className="eyebrow">Solutions</span>
      <h2 className="measure-sub">Four lines of structured capital.</h2>
      <div className="solutions__grid">
        {SOLUTIONS.map((s, i) => (
          <article className="solution" key={s.title} data-cursor="discover">
            <span className="solution__index">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
