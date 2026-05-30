import Marquee from "@/components/Marquee";

export default function Hero() {
  return (
    <>
      <header className="nav shell" style={{ maxWidth: "none" }}>
        <span className="nav__mark" data-cursor="discover">Obsidian<span style={{ color: "var(--accent)" }}>.</span></span>
        <nav>
          <ul className="nav__links">
            <li><a href="#solutions" data-cursor="solutions">Solutions</a></li>
            <li><a href="#approach" data-cursor="discover">Approach</a></li>
            <li><a href="#portal" data-cursor="decrypt">Data Room</a></li>
            <li><a href="#contact" data-cursor="connect">Contact</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero shell">
        <div className="hero__inner">
          <span className="eyebrow">Private Credit · Fund Finance</span>
          <h1 className="measure-hero">Capital, structured against the unseen.</h1>
          <p className="hero__lede measure-sub">
            Bespoke liquidity solutions for general partners and limited partners
            operating at the frontier of alternative assets.
          </p>
          <dl className="hero__meta">
            <div>
              <dt>Deployed</dt>
              <dd>$4.2B+</dd>
            </div>
            <div>
              <dt>Facilities</dt>
              <dd>140</dd>
            </div>
            <div>
              <dt>Since</dt>
              <dd>2011</dd>
            </div>
          </dl>
        </div>
      </section>

      <Marquee />
    </>
  );
}
