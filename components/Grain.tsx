/**
 * (1) Tactile CSS-native SVG grain.
 *
 * A fixed, pointer-transparent fractal-noise overlay at very low opacity (set in
 * globals.css) gives the obsidian background a physical, analogue paper texture.
 * Pure SVG — no JavaScript.
 */
export default function Grain() {
  return (
    <svg className="grain" aria-hidden="true" focusable="false">
      <filter id="grain-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.82"
          numOctaves={3}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );
}
