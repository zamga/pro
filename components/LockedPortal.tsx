"use client";

import { useRef, useState } from "react";

/**
 * (7a) Secure "Locked Portal" / virtual data room.
 *
 * A password block floats over a blurred SECURE backdrop. Wrong submissions
 * trigger a custom in-card "security audit" message + shake (no native alert()).
 */
export default function LockedPortal() {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("Authorized counterparties only.");
  const [state, setState] = useState<"idle" | "error" | "ok">("idle");
  const cardRef = useRef<HTMLDivElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    // No real credential — this is a presentational gate.
    if (value.trim().toLowerCase() === "obsidian") {
      setState("ok");
      setMsg("Credentials accepted — provisioning secure session…");
      return;
    }

    setState("error");
    setMsg(`Access denied — audit logged ${new Date().toLocaleTimeString()}. Request clearance below.`);
    const card = cardRef.current;
    if (card) {
      card.classList.remove("is-shaking");
      void card.offsetWidth; // reflow to restart the animation
      card.classList.add("is-shaking");
    }
  };

  return (
    <div className="portal" data-cursor="decrypt">
      <div className="portal__backdrop" aria-hidden="true">SECURE</div>
      <div ref={cardRef} className="portal__card">
        <span className="portal__lock">◈ Encrypted Data Room</span>
        <h3 style={{ margin: 0 }}>Limited Partner Access</h3>
        <p style={{ color: "var(--ink-dim)", fontSize: "var(--step--1)" }}>
          Diligence materials, capital account statements and facility documentation
          are gated to verified LPs.
        </p>
        <form className="portal__row" onSubmit={submit}>
          <input
            className="portal__input"
            type="password"
            placeholder="• • • • • • • •"
            aria-label="Access credential"
            value={value}
            onChange={(e) => { setValue(e.target.value); setState("idle"); }}
          />
          <button className="btn btn--solid" type="submit" data-cursor="decrypt">
            Decrypt
          </button>
        </form>
        <p
          className={`portal__msg${state === "error" ? " is-error" : state === "ok" ? " is-ok" : ""}`}
          role="status"
          aria-live="polite"
        >
          {msg}
        </p>
      </div>
    </div>
  );
}
