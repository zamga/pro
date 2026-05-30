/**
 * Geometry builder for the particle field.
 *
 * Produces the static attributes consumed by the (shared) vertex shaders:
 *   - position (aHome): a regular lattice on the z=0 plane
 *   - aChaos:           home + seeded scatter (DEEP z-spread) -> assemble FROM
 *   - aTarget:          a densely-sampled point of the "O" monogram -> morph TO
 *   - aRnd:             per-vertex seed [0,1)
 *   - lineIndex:        index pairs connecting orthogonally-adjacent grid nodes
 *                       into a wireframe "scaffold" (one THREE.LineSegments).
 *
 * Points and lines share the SAME geometry buffers (same attributes); the lines
 * simply add an index. Both flex together because the vertex shaders share one
 * displace() function. Everything is computed once per build (mount + resize).
 */

export interface BuildFieldArgs {
  /** Viewport width in CSS px (used only to derive grid density). */
  width: number;
  /** Viewport height in CSS px (used only to derive grid density). */
  height: number;
  /** Visible world width at z=0 (derived from camera fov/distance). */
  worldW: number;
  /** Visible world height at z=0. */
  worldH: number;
}

export interface BuiltField {
  /** aHome — the BufferGeometry "position" attribute. */
  position: Float32Array;
  aChaos: Float32Array;
  aTarget: Float32Array;
  aRnd: Float32Array;
  /** Index pairs (2 per segment) for the orthogonal scaffold LineSegments. */
  lineIndex: Uint32Array;
  /** Total grid nodes (point count). */
  count: number;
  /** Total scaffold segments (lineIndex.length / 2). */
  lineCount: number;
  cols: number;
  rows: number;
}

/** Clamp helper (numeric). */
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Build the lattice + scatter + monogram attributes + scaffold index.
 *
 * Grid density scales with viewport size (one node per ~30 CSS px) and is
 * clamped to keep the counts sane on both phones and large displays.
 */
export function buildField({ width, height, worldW, worldH }: BuildFieldArgs): BuiltField {
  const cols = clamp(Math.round(width / 30), 20, 150);
  const rows = clamp(Math.round(height / 30), 14, 95);
  const count = cols * rows;

  const position = new Float32Array(count * 3);
  const aChaos = new Float32Array(count * 3);
  const aRnd = new Float32Array(count);

  // The lattice fills 1.35x the visible world so the field bleeds past edges.
  const fieldW = worldW * 1.35;
  const fieldH = worldH * 1.35;
  const stepX = cols > 1 ? fieldW / (cols - 1) : 0;
  const stepY = rows > 1 ? fieldH / (rows - 1) : 0;
  const halfW = fieldW / 2;
  const halfH = fieldH / 2;

  // Scatter extents for the chaos origin. DEEP z-spread is the concept: the
  // field starts as a volumetric cloud and resolves into a crisp planar grid.
  const scatterXY = 0.85 * worldH;
  const scatterZ = 22;

  const idx = (r: number, c: number) => r * cols + c;

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i3 = i * 3;

      // aHome: lattice slot on z=0.
      const hx = -halfW + c * stepX;
      const hy = -halfH + r * stepY;
      position[i3] = hx;
      position[i3 + 1] = hy;
      position[i3 + 2] = 0;

      // aChaos: home displaced by a large seeded scatter with a deep z range.
      aChaos[i3] = hx + (Math.random() * 2 - 1) * scatterXY;
      aChaos[i3 + 1] = hy + (Math.random() * 2 - 1) * scatterXY;
      aChaos[i3 + 2] = (Math.random() * 2 - 1) * scatterZ;

      aRnd[i] = Math.random();
      i++;
    }
  }

  // --- Scaffold: connect each node to its right + lower orthogonal neighbour.
  // Right edges: (cols-1)*rows ; Down edges: cols*(rows-1). One pass, no dupes.
  const segCount = (cols - 1) * rows + cols * (rows - 1);
  const lineIndex = new Uint32Array(segCount * 2);
  let li = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = idx(r, c);
      if (c < cols - 1) {
        lineIndex[li++] = a;
        lineIndex[li++] = idx(r, c + 1);
      }
      if (r < rows - 1) {
        lineIndex[li++] = a;
        lineIndex[li++] = idx(r + 1, c);
      }
    }
  }

  // aTarget: the monogram ("O") sampled into world space.
  const aTarget = sampleGlyph("O", count, worldW, worldH);

  return {
    position,
    aChaos,
    aTarget,
    aRnd,
    lineIndex,
    count,
    lineCount: segCount,
    cols,
    rows,
  };
}

/**
 * Sample `text` (here the letter "O") into `count` world-space target slots.
 *
 * Renders the glyph centered on an offscreen 2D canvas, reads back the opaque
 * pixels, and maps each particle to a random opaque pixel scaled into world
 * units on (roughly) the z=0 plane with tiny jitter. Particles with no slot
 * (overflow, or when the canvas is unavailable) are pushed onto a faint far
 * depth plane (z in [-10,-6]) spread across the view so the morph reads as a
 * crisp monogram floating in front of a soft starfield.
 *
 * Returns a Float32Array(count*3). Safe on the server / without a 2D context
 * (falls back entirely to the far plane).
 */
export function sampleGlyph(
  text: string,
  count: number,
  worldW: number,
  worldH: number
): Float32Array {
  const out = new Float32Array(count * 3);

  // Offscreen raster resolution; aspect roughly tracks the visible world.
  const W = 512;
  const H = Math.max(1, Math.round(W * (worldH / worldW)));

  /** Place index `i` on the faint far starfield plane. */
  const placeFar = (i: number) => {
    const i3 = i * 3;
    out[i3] = (Math.random() * 2 - 1) * worldW * 0.65;
    out[i3 + 1] = (Math.random() * 2 - 1) * worldH * 0.65;
    out[i3 + 2] = -6 - Math.random() * 4; // [-10, -6]
  };

  // Collect opaque pixel coordinates from the rasterised glyph.
  const opaque: number[] = [];
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;

  if (typeof document !== "undefined") {
    canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext("2d");
  }

  if (ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Sized to fill most of the canvas height; a heavy weight gives a dense ring.
    const fontPx = Math.round(H * 0.78);
    ctx.font = `700 ${fontPx}px Georgia, "Times New Roman", serif`;
    ctx.fillText(text, W / 2, H / 2 + fontPx * 0.02);

    const data = ctx.getImageData(0, 0, W, H).data;
    // Sample every pixel for a DENSE candidate list so the morph is legible.
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const alpha = data[(y * W + x) * 4 + 3];
        if (alpha > 128) {
          opaque.push(x, y);
        }
      }
    }
  }

  const slots = opaque.length / 2;

  if (slots === 0) {
    // No glyph available — everything lives on the far plane.
    for (let i = 0; i < count; i++) placeFar(i);
    return out;
  }

  // Map raster pixels -> world units. The glyph occupies the central region.
  const glyphWorldH = worldH * 0.72;
  const glyphWorldW = glyphWorldH * (worldW / worldH); // keep raster aspect
  const jitter = glyphWorldH * 0.003;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Pick a random opaque pixel for an even, dense fill of the glyph.
    const p = Math.floor(Math.random() * slots) * 2;
    const px = opaque[p];
    const py = opaque[p + 1];

    // Normalise to [-0.5,0.5], flip Y (canvas y-down -> world y-up).
    const nx = px / W - 0.5;
    const ny = 0.5 - py / H;

    out[i3] = nx * glyphWorldW + (Math.random() * 2 - 1) * jitter;
    out[i3 + 1] = ny * glyphWorldH + (Math.random() * 2 - 1) * jitter;
    out[i3 + 2] = (Math.random() * 2 - 1) * 0.08; // tiny z jitter, ~z=0
  }

  return out;
}
