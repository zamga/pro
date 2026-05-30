"use client";

import { useEffect, useRef } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { nav } from "@/lib/content";

function NavLink({ href, label }: { href: string; label: string }) {
  const ref = useMagnetic<HTMLAnchorElement>(0.5);
  return (
    <a ref={ref} href={href} data-cursor="discover">{label}</a>
  );
}

/** Fixed, scroll-aware nav: transparent over the hero, glass after scrolling. */
export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const markRef = useMagnetic<HTMLAnchorElement>(0.4);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => el.classList.toggle("is-stuck", window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={ref} className="nav">
      <a ref={markRef} href="#hero" className="nav__mark" data-cursor="discover">
        {nav.brand}
        <span style={{ color: "var(--accent)" }}>.</span>
      </a>
      <nav>
        <ul className="nav__links">
          {nav.links.map((l) => (
            <li key={l.href}><NavLink href={l.href} label={l.label} /></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
