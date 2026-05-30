export default function Footer() {
  return (
    <footer className="footer shell">
      <div className="footer__top">
        <span className="footer__mark">Obsidian<span style={{ color: "var(--accent)" }}>.</span></span>
        <nav>
          <ul className="nav__links" style={{ flexDirection: "column", gap: "var(--space-2xs)", textAlign: "right" }}>
            <li><a href="#solutions" data-cursor="solutions">Solutions</a></li>
            <li><a href="#approach" data-cursor="discover">Approach</a></li>
            <li><a href="#portal" data-cursor="decrypt">Data Room</a></li>
            <li><a href="#contact" data-cursor="connect">Contact</a></li>
          </ul>
        </nav>
      </div>
      <div className="footer__legal">
        <span>© {new Date().getFullYear()} Obsidian Capital Partners</span>
        <span>For institutional & accredited counterparties only · Not an offer to sell securities.</span>
      </div>
    </footer>
  );
}
