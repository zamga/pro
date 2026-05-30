import { footer } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer shell">
      <div className="footer__top">
        <span className="footer__mark">
          {footer.brand}
          <span style={{ color: "var(--accent)" }}>.</span>
        </span>
        <nav>
          <ul
            className="nav__links"
            style={{ flexDirection: "column", gap: "var(--space-2xs)", textAlign: "right" }}
          >
            {footer.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} data-cursor="discover">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="footer__legal">
        <span>© {new Date().getFullYear()} {footer.copyrightHolder}</span>
        <span>{footer.disclaimer}</span>
      </div>
    </footer>
  );
}
