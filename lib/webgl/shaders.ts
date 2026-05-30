/**
 * GLSL for the "Structure from the Unseen" particle field.
 *
 * Two draw calls share ONE displacement model:
 *   - a THREE.Points cloud (the grid nodes), and
 *   - a THREE.LineSegments scaffold connecting orthogonally-adjacent nodes.
 *
 * Both are fully STATELESS: every vertex owns static attributes
 * (aHome = the BufferGeometry "position", aChaos, aTarget, aRnd) and the vertex
 * shaders blend three stages purely from uniforms — no GPGPU / ping-pong.
 *
 *   Stage A  chaos -> home    (assemble out of deep Z-chaos, gated by aRnd)
 *   Stage B  cursor presence  (repulsion + bloom, faded out as morph takes over)
 *   Stage C  home -> target   (morph into the "O" monogram, scroll-driven)
 *
 * The displacement math is factored into DISPLACE_GLSL and `#include`-style
 * concatenated into BOTH vertex shaders, so the lines flex EXACTLY with the
 * points (same per-vertex world position) and the scaffold reads as a single
 * coherent structure rather than two independent layers.
 *
 * The expo easing here matches the shared GSAP "custom" ease so DOM and GPU
 * motion share one curve.
 */

/**
 * Shared GLSL: attribute/uniform/varying declarations + the displace() function.
 *
 * `displace()` returns the final world-space (model-space) position for a vertex
 * and writes the brass-glow factor + a normalised cursor proximity into out
 * params so the caller can size points and drive the fragment stage. It is
 * IDENTICAL for points and lines — that is what keeps them locked together.
 */
const DISPLACE_GLSL = /* glsl */ `
  precision highp float;

  attribute vec3  aChaos;   // seeded scatter origin (deep z-spread)
  attribute vec3  aTarget;  // monogram slot
  attribute float aRnd;     // per-vertex seed [0,1)

  uniform float uAssemble;  // 0 -> 1 master assemble progress
  uniform float uMorph;     // 0 -> 1 morph-to-monogram progress
  uniform vec2  uMouse;     // cursor position in world units (xy plane)
  uniform float uTime;      // seconds
  uniform float uRadius;    // cursor influence radius (world units)
  uniform float uStrength;  // cursor push strength (world units)

  // Inlined easeOutExpo, matching cubic-bezier(0.23,1,0.32,1) feel.
  float easeOutExpo(float t) {
    return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
  }

  // Shared displacement. Writes:
  //   outGlow  -> brass weight [0,1] (in-flight OR near cursor)
  //   outNear  -> smooth cursor proximity [0,1] (drives bloom / line lighting)
  vec3 displace(vec3 home, out float outGlow, out float outNear) {
    // --- Stage A: assemble from deep chaos to the lattice home -------------
    // Stagger by aRnd so the structure resolves front-to-back, not all at once.
    float stg = clamp((uAssemble - aRnd * 0.45) / 0.55, 0.0, 1.0);
    float ea  = easeOutExpo(stg);
    vec3  a   = mix(aChaos, home, ea);

    // --- Stage B: cursor presence (repulsion + bloom), gated off by morph --
    vec2  d    = a.xy - uMouse;
    float dist = length(d);
    float infl = 1.0 - smoothstep(0.0, uRadius, dist);
    float near = infl * infl;            // soft, wide falloff
    float push = near * (1.0 - uMorph);
    a.xy += (dist > 0.0001 ? d / dist : vec2(0.0)) * push * uStrength;
    a.z  += push * uStrength * 0.7;

    // Idle breathing on z so the field never feels frozen (fades during morph).
    a.z += sin(uTime * 0.6 + aRnd * 6.2831 + a.x * 0.15) * 0.12 * (1.0 - uMorph);

    // --- Stage C: morph to the monogram target -----------------------------
    vec3 pos = mix(a, aTarget, easeOutExpo(uMorph));

    // Brass while in flight (not yet assembled) or under the cursor bloom.
    outGlow = clamp(max(push, (1.0 - stg) * (1.0 - uMorph)), 0.0, 1.0);
    outNear = near;
    return pos;
  }
`;

/** Points vertex shader: shared displace() + perspective-correct point sizing. */
export const vertexShader = /* glsl */ `
${DISPLACE_GLSL}

  uniform float uDPR;       // clamped device pixel ratio
  uniform float uCamZ;      // |camera.z| reference for size attenuation
  uniform float uSize;      // base point size (px)

  varying float vGlow;      // brass weight -> fragment
  varying float vDepth;     // view-space depth (for fog) -> fragment
  varying float vMorph;     // morph progress -> fragment (alpha lift)

  void main() {
    float glow, near;
    vec3 pos = displace(position, glow, near);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vGlow  = glow;
    vDepth = -mvPosition.z;
    vMorph = uMorph;

    // Perspective-correct size: bigger near the cursor (bloom) and during the
    // morph (so the "O" reads dense and bright at the footer).
    float grow = 1.0 + near * 2.6 + uMorph * 0.25;
    gl_PointSize = clamp(uSize * uDPR * grow * (uCamZ / -mvPosition.z), 0.0, 9.0 * uDPR);
  }
`;

/** Fragment: soft round point, brass glow mix, fog, morph-lifted alpha. */
export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3  uColor;      // ink (resting)
  uniform vec3  uGlowColor;  // brass (in flight / near cursor)
  uniform vec3  uFogColor;   // obsidian fog
  uniform float uFogDensity; // FogExp2 density

  varying float vGlow;
  varying float vDepth;
  varying float vMorph;

  void main() {
    // Distance from the point-sprite centre -> soft round mask.
    vec2  c = gl_PointCoord - vec2(0.5);
    float r = length(c);
    if (r > 0.5) discard;

    float mask  = smoothstep(0.5, 0.0, r);
    vec3  color = mix(uColor, uGlowColor, vGlow);

    // Restrained base opacity; lifts with glow and (a lot) during morph so the
    // monogram is clean and bright while the resting field stays minimal.
    float alpha = mask * (0.16 + vGlow * 0.74 + vMorph * 0.45);

    // Exponential-squared fog: far nodes recede into the obsidian.
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    color = mix(color, uFogColor, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

/** Lines vertex shader: SAME displace() so the scaffold flexes with the nodes. */
export const lineVertexShader = /* glsl */ `
${DISPLACE_GLSL}

  varying float vNear;   // cursor proximity -> fragment (brass lighting)
  varying float vDepth;  // view-space depth (for fog) -> fragment

  void main() {
    float glow, near;
    vec3 pos = displace(position, glow, near);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vNear  = near;
    vDepth = -mvPosition.z;
  }
`;

/**
 * Lines fragment: very low resting opacity, brightens toward brass near the
 * cursor (a travelling region of structured light), fogged by depth, and faded
 * to zero as the morph completes so the monogram reads clean.
 */
export const lineFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3  uColor;      // ink
  uniform vec3  uGlowColor;  // brass
  uniform vec3  uFogColor;   // obsidian fog
  uniform float uFogDensity;
  uniform float uMorph;      // scaffold fades out as this -> 1
  uniform float uAssemble;   // scaffold fades IN with the assemble

  varying float vNear;
  varying float vDepth;

  void main() {
    vec3 color = mix(uColor, uGlowColor, clamp(vNear * 1.15, 0.0, 1.0));

    // Ink ~0.05 at rest; up to ~0.42 under the cursor. Gated by assemble (so
    // lines draw in with the structure) and by (1 - morph) (so the O is clean).
    float alpha = (0.05 + vNear * 0.37) * uAssemble * (1.0 - uMorph);

    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    color = mix(color, uFogColor, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

/**
 * Canonical uniform names, single source of truth for setup/typing.
 * Shared by points + lines materials (each takes the subset it declares).
 *   uColor/uGlowColor/uFogColor are THREE.Color; uMouse is THREE.Vector2;
 *   the rest are floats.
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
  "uFogColor",
  "uFogDensity",
] as const;

export type UniformName = (typeof uniformNames)[number];
