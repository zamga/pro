/**
 * GLSL for the "Structure from the Unseen" particle field.
 *
 * One THREE.Points cloud, fully STATELESS displacement: every particle owns
 * static attributes (aHome = the BufferGeometry "position", aChaos, aTarget,
 * aRnd) and the vertex shader blends three stages purely from uniforms — no
 * GPGPU / ping-pong render targets.
 *
 *   Stage A  chaos -> home    (assemble, gated per-particle by aRnd)
 *   Stage B  cursor repulsion (faded out as the morph takes over)
 *   Stage C  home -> target   (morph into the "O" monogram, scroll-driven)
 *
 * The expo easing here matches the shared GSAP "custom" ease so DOM and GPU
 * motion share one curve.
 */

/** Vertex displacement: assemble -> repel/breathe -> morph. */
export const vertexShader = /* glsl */ `
  precision highp float;

  attribute vec3  aChaos;   // seeded scatter origin (large z-spread)
  attribute vec3  aTarget;  // monogram / stat slot
  attribute float aRnd;     // per-particle seed [0,1)

  uniform float uAssemble;  // 0 -> 1 master assemble progress
  uniform float uMorph;     // 0 -> 1 morph-to-monogram progress
  uniform vec2  uMouse;     // cursor position in world units (xy plane)
  uniform float uTime;      // seconds
  uniform float uRadius;    // cursor influence radius (world units)
  uniform float uStrength;  // cursor push strength (world units)
  uniform float uDPR;       // clamped device pixel ratio
  uniform float uCamZ;      // |camera.z| reference for size attenuation
  uniform float uSize;      // base point size (px)

  varying float vGlow;      // 0..1 brass glow factor -> fragment

  // Inlined easeOutExpo, matching cubic-bezier(0.23,1,0.32,1) feel.
  float easeOutExpo(float t) {
    return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
  }

  void main() {
    // --- Stage A: assemble from chaos to the lattice home (position) ---
    float stg = clamp((uAssemble - aRnd * 0.4) / 0.6, 0.0, 1.0);
    vec3 a = mix(aChaos, position, easeOutExpo(stg));

    // --- Stage B: cursor repulsion (gated off as the morph takes over) ---
    vec2  d    = a.xy - uMouse;
    float dist = length(d);
    float infl = 1.0 - smoothstep(0.0, uRadius, dist);
    float push = infl * infl;
    a.xy += (dist > 0.0001 ? d / dist : vec2(0.0)) * push * uStrength * (1.0 - uMorph);
    a.z  += push * uStrength * 0.8 * (1.0 - uMorph);

    // Idle breathing on z so the field never feels frozen.
    a.z += sin(uTime * 0.6 + aRnd * 6.2831 + a.x * 0.15) * 0.12;

    // --- Stage C: morph to the monogram target ---
    vec3 pos = mix(a, aTarget, easeOutExpo(uMorph));

    // Brass glow while in flight (not yet assembled) and near the cursor.
    vGlow = max(push, 1.0 - stg);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct size, biased up near the cursor.
    gl_PointSize = uSize * uDPR * (1.0 + push * 2.2) * (uCamZ / -mvPosition.z);
  }
`;

/** Fragment: soft round point, brass glow mix, glow-weighted alpha. */
export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;      // ink (resting)
  uniform vec3 uGlowColor;  // brass (in flight / near cursor)

  varying float vGlow;

  void main() {
    // Distance from the point-sprite centre.
    vec2  c = gl_PointCoord - vec2(0.5);
    float r = length(c);
    if (r > 0.5) discard;

    float mask  = smoothstep(0.5, 0.0, r);
    vec3  color = mix(uColor, uGlowColor, vGlow);
    float alpha = mask * (0.15 + vGlow * 0.85);

    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Canonical uniform names, single source of truth for setup/typing.
 * (uColor/uGlowColor are THREE.Color; uMouse is THREE.Vector2; rest are floats.)
 */
export const uniformNames = [
  "uAssemble",
  "uMorph",
  "uMouse",
  "uTime",
  "uRadius",
  "uStrength",
  "uDPR",
  "uCamZ",
  "uSize",
  "uColor",
  "uGlowColor",
] as const;

export type UniformName = (typeof uniformNames)[number];
