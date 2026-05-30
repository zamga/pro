"use client";

import { useRef, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import { dataRoom } from "@/lib/content";

/**
 * Secure "Locked Portal" / virtual data room. A password block floats over a
 * blurred SECURE backdrop. Wrong submissions trigger a custom in-card "security
 * audit" message + shake (no native alert()). Copy comes from lib/content.
 */
export default function LockedPortal() {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string>(dataRoom.messages.idle);
  const [state, setState] = useState<"idle" | "error" | "ok">("idle");
  const cardRef = useRef<HTMLDivElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    // No real credential — this is a presentational gate.
    if (value.trim().toLowerCase() === "obsidian") {
      setState("ok");
      setMsg(dataRoom.messages.success);
      return;
    }

    setState("error");
    setMsg(`${dataRoom.messages.errorPrefix} — audit logged ${new Date().toLocaleTimeString()}.`);
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
        <span className="portal__lock">◈ {dataRoom.lockLabel} Data Room</span>
        <h3 style={{ margin: 0 }}>{dataRoom.card.heading}</h3>
        <p style={{ color: "var(--ink-dim)", fontSize: "var(--step--1)" }}>{dataRoom.card.body}</p>
        <form className="portal__row" onSubmit={submit}>
          <input
            className="portal__input"
            type="password"
            placeholder={dataRoom.inputPlaceholder}
            aria-label="Access credential"
            value={value}
            onChange={(e) => { setValue(e.target.value); setState("idle"); }}
          />
          <Magnetic strength={0.45}>
            <button className="btn btn--solid" type="submit" data-cursor="decrypt">
              {dataRoom.buttonLabel}
            </button>
          </Magnetic>
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
