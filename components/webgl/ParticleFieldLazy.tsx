"use client";

/**
 * Client-only, deferred mount wrapper for the WebGL particle field.
 *
 * The heavy three.js bundle is code-split (ssr:false) and the field is only
 * MOUNTED after the preloader finishes (or, as a fallback, once the main thread
 * goes idle / a timeout elapses). This keeps three off the critical path and
 * avoids competing with the preloader animation for the first paint.
 *
 * page.tsx (or layout) imports the DEFAULT export and renders <ParticleFieldLazy />.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Code-split the renderer; render nothing while it loads.
const ParticleField = dynamic(() => import("./ParticleField"), {
  ssr: false,
  loading: () => null,
});

export default function ParticleFieldLazy() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const reveal = () => setMounted(true);

    if ((window as unknown as { __preloaderDone?: boolean }).__preloaderDone) {
      reveal();
      return;
    }

    const onPreloaderDone = () => {
      cleanup();
      reveal();
    };
    document.addEventListener("preloaderdone", onPreloaderDone, { once: true });

    // Fallbacks in case the preloader event never fires.
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(reveal, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(reveal, 2500);
    }

    function cleanup() {
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    }

    return () => {
      document.removeEventListener("preloaderdone", onPreloaderDone);
      cleanup();
    };
  }, []);

  return mounted ? <ParticleField /> : null;
}
