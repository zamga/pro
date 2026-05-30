/**
 * Shared GSAP singleton: registers ScrollTrigger and a custom ease that exactly
 * matches the design token `--ease-out-expo: cubic-bezier(0.23, 1, 0.32, 1)`, so
 * the same curve governs DOM tweens and (inlined) the WebGL shader.
 *
 * Every client module imports { gsap, ScrollTrigger } from here, and calls
 * registerGsap() once (the ScrollProvider does this on mount).
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Newton-Raphson cubic-bezier solver (MIT, G. Renaudeau) → GSAP ease function. */
function bezier(mX1: number, mY1: number, mX2: number, mY2: number) {
  const N = 4, MIN = 0.001, PREC = 1e-7, MAXI = 10, SIZE = 11, STEP = 1 / (SIZE - 1);
  const s = new Float32Array(SIZE);
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a;
  const B = (a: number, b: number) => 3 * b - 6 * a;
  const C = (a: number) => 3 * a;
  const calc = (t: number, a: number, b: number) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t: number, a: number, b: number) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  const tForX = (x: number) => {
    let start = 0, cur = 1; const last = SIZE - 1;
    for (; cur !== last && s[cur] <= x; ++cur) start += STEP;
    --cur;
    const dist = (x - s[cur]) / (s[cur + 1] - s[cur]);
    let guess = start + dist * STEP;
    const init = slope(guess, mX1, mX2);
    if (init >= MIN) {
      for (let i = 0; i < N; ++i) {
        const sl = slope(guess, mX1, mX2); if (sl === 0) return guess;
        guess -= (calc(guess, mX1, mX2) - x) / sl;
      }
      return guess;
    }
    if (init === 0) return guess;
    let a = start + STEP, t2 = 0, cx = 0, i = 0;
    do { t2 = start + (a - start) / 2; cx = calc(t2, mX1, mX2) - x; if (cx > 0) a = t2; else start = t2; }
    while (Math.abs(cx) > PREC && ++i < MAXI);
    return t2;
  };
  for (let i = 0; i < SIZE; ++i) s[i] = calc(i * STEP, mX1, mX2);
  return (x: number) => (x === 0 ? 0 : x === 1 ? 1 : calc(tForX(x), mY1, mY2));
}

let registered = false;
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger);
  gsap.registerEase("custom", bezier(0.23, 1, 0.32, 1));
  gsap.defaults({ ease: "custom", duration: 1 });
}

export { gsap, ScrollTrigger };
