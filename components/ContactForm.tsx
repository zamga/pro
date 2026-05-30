"use client";

import { useState } from "react";
import Magnetic from "@/components/motion/Magnetic";

/**
 * (7b) Editorial contact form with floating labels.
 *
 * Labels float + recolor on focus / when filled via CSS (:focus and
 * :not(:placeholder-shown)) — each input therefore carries a single-space
 * placeholder so the "filled" selector resolves correctly. Submit is a
 * client-side stub (no backend wired).
 */
export default function ContactForm() {
  const [status, setStatus] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("Transmitting — a partner will respond within one business day.");
    form.reset();
    setTimeout(() => setStatus(""), 6000);
  };

  return (
    <form className="form" onSubmit={submit} data-cursor="connect">
      <div className="field">
        <input id="cf-name" type="text" placeholder=" " required autoComplete="name" />
        <label htmlFor="cf-name">Full name</label>
      </div>
      <div className="field field--offset">
        <input id="cf-firm" type="text" placeholder=" " autoComplete="organization" />
        <label htmlFor="cf-firm">Firm / fund</label>
      </div>
      <div className="field">
        <input id="cf-email" type="email" placeholder=" " required autoComplete="email" />
        <label htmlFor="cf-email">Work email</label>
      </div>
      <div className="field field--offset">
        <textarea id="cf-note" placeholder=" " rows={2} />
        <label htmlFor="cf-note">Mandate &amp; size</label>
      </div>
      <Magnetic strength={0.5}>
        <button className="btn" type="submit" data-cursor="connect">
          Request Introduction →
        </button>
      </Magnetic>
      <p className="form__status" role="status" aria-live="polite">{status}</p>
    </form>
  );
}
