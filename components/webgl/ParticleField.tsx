"use client";

/**
 * "Structure from the Unseen" — the signature WebGL moment.
 *
 * A single fixed full-viewport field sits behind the whole page (zIndex -1,
 * transparent — the static obsidian background shows through). It is built from
 * TWO draw calls over ONE shared geometry:
 *
 *   - THREE.Points       — the grid nodes.
 *   - THREE.LineSegments  — an orthogonal "scaffold" wiring adjacent nodes into
 *                           a precise wireframe (digital scaffolding / structured
 *                           safety). The lines share the exact per-vertex
 *                           displacement as the points (one shared GLSL
 *                           displace()), so the structure flexes as one body.
 *
 * The field assembles out of DEEP Z-chaos when the preloader finishes, reacts
 * to the cursor (repulsion + a travelling brass bloom that lights up the
 * scaffold), breathes at idle, parallaxes faintly toward the cursor, and — in
 * the final ~22% of scroll — morphs into a clean, bright "O" monogram while the
 * camera dollies in and the scaffold lines fade out.
 *
 * Displacement is entirely stateless (see lib/webgl/shaders.ts): all motion is
 * driven by uniforms over static per-vertex attributes. No GPGPU.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { buildField } from "@/lib/webgl/buildField";
import {
  vertexShader,
  fragmentShader,
  lineVertexShader,
  lineFragmentShader,
} from "@/lib/webgl/shaders";

/** Camera reference distance; the dolly pulls in from here. */
const CAM_Z = 14;
/** Field-of-view (deg) — wide enough for a generous world plane. */
const FOV = 60;

/** Obsidian fog colour (matches the static background) — far nodes recede. */
const FOG_COLOR = 0x060708;
const FOG_DENSITY = 0.022;

/** Palette. Ink #f4f1ea base, brass #c8a25e glow. */
const INK = new THREE.Color(0.957, 0.945, 0.918); // #f4f1ea
const BRASS = new THREE.Color(0.78, 0.635, 0.37); // #c8a25e

/** Navigator with the non-standard deviceMemory hint. */
interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Capability / preference guards ----------------------------------
    // No WebGL at all -> bail (static obsidian background remains).
    const probe = document.createElement("canvas");
    const hasWebGL = !!(
      probe.getContext("webgl2") || probe.getContext("webgl")
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!hasWebGL || reducedMotion) return;

    // --- Performance tier -> DPR + grid density --------------------------
    const nav = navigator as NavigatorWithMemory;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const lowEnd =
      coarsePointer ||
      (nav.deviceMemory !== undefined && nav.deviceMemory < 4) ||
      (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Density factor shrinks the width/height fed to buildField, halving the
    // grid on low-end devices (cols/rows derive from those dims).
    let densityFactor = 1;
    if (lowEnd) {
      dpr = Math.min(dpr, 1.5);
      densityFactor = 0.5;
    }

    // --- Renderer / scene / camera ---------------------------------------
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    // Exponential-squared fog: applied in-shader (see fragment stages) so far
    // nodes recede into the obsidian for real cinematic depth.
    scene.fog = new THREE.FogExp2(FOG_COLOR, FOG_DENSITY);

    const camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = CAM_Z;

    /** Visible world size on the z=0 plane for the current camera. */
    const worldSize = () => {
      const h = 2 * Math.tan((FOV * Math.PI) / 360) * CAM_Z;
      const w = h * (window.innerWidth / window.innerHeight);
      return { worldW: w, worldH: h };
    };

    // --- Geometry: points (non-indexed) + lines (indexed scaffold) -------
    // The two geometries SHARE the same BufferAttribute instances for the
    // per-vertex data — only the lines carry an index. This keeps one copy of
    // the attribute buffers in memory and exactly two draw calls (a non-indexed
    // Points geometry would otherwise be forced to render through the line
    // index, drawing the wrong vertices).
    const pointsGeo = new THREE.BufferGeometry();
    const linesGeo = new THREE.BufferGeometry();

    /** (Re)compute and assign all attributes onto both geometries. */
    const assignAttributes = () => {
      const { worldW, worldH } = worldSize();
      const field = buildField({
        width: window.innerWidth * densityFactor,
        height: window.innerHeight * densityFactor,
        worldW,
        worldH,
      });
      const posAttr = new THREE.BufferAttribute(field.position, 3);
      const chaosAttr = new THREE.BufferAttribute(field.aChaos, 3);
      const targetAttr = new THREE.BufferAttribute(field.aTarget, 3);
      const rndAttr = new THREE.BufferAttribute(field.aRnd, 1);

      pointsGeo.setAttribute("position", posAttr);
      pointsGeo.setAttribute("aChaos", chaosAttr);
      pointsGeo.setAttribute("aTarget", targetAttr);
      pointsGeo.setAttribute("aRnd", rndAttr);

      // Same attribute instances; the index turns adjacent nodes into segments.
      linesGeo.setAttribute("position", posAttr);
      linesGeo.setAttribute("aChaos", chaosAttr);
      linesGeo.setAttribute("aTarget", targetAttr);
      linesGeo.setAttribute("aRnd", rndAttr);
      linesGeo.setIndex(new THREE.BufferAttribute(field.lineIndex, 1));

      return { worldW, worldH, field };
    };

    let assigned = assignAttributes();
    let worldW = assigned.worldW;
    let worldH = assigned.worldH;

    if (typeof console !== "undefined" && typeof console.debug === "function") {
      // Count logic: points = cols*rows nodes; lines = right + down edges.
      console.debug(
        `[ParticleField] ${assigned.field.count} nodes / ` +
          `${assigned.field.lineCount} scaffold segments ` +
          `(${assigned.field.cols}x${assigned.field.rows})`
      );
    }

    // --- Uniforms (shared object: one update drives both materials) ------
    const uniforms = {
      uAssemble: { value: 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector2(9999, 9999) },
      uTime: { value: 0 },
      uRadius: { value: worldH * 0.26 }, // widened cursor influence
      uStrength: { value: worldH * 0.06 },
      uDPR: { value: dpr },
      uCamZ: { value: CAM_Z },
      uSize: { value: 6.5 },
      uColor: { value: INK.clone() },
      uGlowColor: { value: BRASS.clone() },
      uFogColor: { value: new THREE.Color(FOG_COLOR) },
      uFogDensity: { value: FOG_DENSITY },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    // Lines share the SAME uniforms object -> they always agree with points.
    const lineMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    // Parallax group: the whole field rotates a few hundredths of a radian
    // toward the cursor for a subtle living-depth effect.
    const group = new THREE.Group();

    const points = new THREE.Points(pointsGeo, material);
    points.frustumCulled = false; // displacement moves vertices off home bounds

    const lines = new THREE.LineSegments(linesGeo, lineMaterial);
    lines.frustumCulled = false;

    group.add(lines); // draw scaffold first (behind), nodes on top
    group.add(points);
    scene.add(group);

    // --- Cursor (world-space target, lerped each tick) -------------------
    const mouseTarget = new THREE.Vector2(9999, 9999);
    // Normalised pointer [-1,1] for the parallax (independent of leave reset).
    const parallaxTarget = new THREE.Vector2(0, 0);
    const parallax = new THREE.Vector2(0, 0);

    const toWorld = (clientX: number, clientY: number) => {
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = -((clientY / window.innerHeight) * 2 - 1);
      mouseTarget.set((nx * worldW) / 2, (ny * worldH) / 2);
      parallaxTarget.set(nx, ny);
    };

    const onMouseMove = (e: MouseEvent) => toWorld(e.clientX, e.clientY);
    const onMouseLeave = () => {
      mouseTarget.set(9999, 9999);
      parallaxTarget.set(0, 0);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // --- Assemble tween (fires when the preloader is done) ---------------
    let assembleTween: gsap.core.Tween | null = null;
    let safetyTimer: number | undefined;
    let started = false;

    const startAssemble = () => {
      if (started) return;
      started = true;
      window.clearTimeout(safetyTimer);
      const proxy = { v: 0 };
      assembleTween = gsap.to(proxy, {
        v: 1,
        duration: 1.8,
        ease: "custom",
        onUpdate: () => {
          uniforms.uAssemble.value = proxy.v;
        },
      });
    };

    const onPreloaderDone = () => startAssemble();

    if ((window as unknown as { __preloaderDone?: boolean }).__preloaderDone) {
      startAssemble();
    } else {
      document.addEventListener("preloaderdone", onPreloaderDone, {
        once: true,
      });
      // Safety: never leave the field invisible if the event never fires.
      safetyTimer = window.setTimeout(startAssemble, 3000);
    }

    // --- Scroll: camera dolly + morph in the final stretch ---------------
    registerGsap();
    const scrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        // Dolly INTO the lattice through the page, then pull BACK during the
        // morph so the monogram is framed and legible (not giant blurred bokeh).
        const morph = THREE.MathUtils.clamp((p - 0.78) / 0.22, 0, 1);
        const flythrough = Math.min(p / 0.78, 1);
        camera.position.z = CAM_Z - flythrough * 6 + morph * 5; // 14 → 8 → 13
        uniforms.uMorph.value = morph;
      },
    });

    // --- Render loop (driven by the GSAP ticker) -------------------------
    const tick = (time: number) => {
      uniforms.uTime.value = time;
      // Smoothly chase the cursor target.
      uniforms.uMouse.value.lerp(mouseTarget, 0.1);
      // Faint continuous parallax of the whole field toward the cursor.
      parallax.lerp(parallaxTarget, 0.04);
      group.rotation.y = parallax.x * 0.05;
      group.rotation.x = -parallax.y * 0.05;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    // Pause rendering when the tab is hidden.
    const onVisibility = () => {
      if (document.hidden) {
        gsap.ticker.remove(tick);
      } else {
        gsap.ticker.add(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // --- WebGL context loss / restore ------------------------------------
    const onContextLost = (e: Event) => {
      e.preventDefault();
      gsap.ticker.remove(tick);
    };
    const onContextRestored = () => {
      // Rebuild GPU-side resources, then resume.
      assigned = assignAttributes();
      worldW = assigned.worldW;
      worldH = assigned.worldH;
      uniforms.uRadius.value = worldH * 0.26;
      uniforms.uStrength.value = worldH * 0.06;
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      if (!document.hidden) gsap.ticker.add(tick);
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);

    // --- Debounced resize -------------------------------------------------
    let resizeRaf = 0;
    const onResize = () => {
      window.clearTimeout(resizeRaf);
      resizeRaf = window.setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        // Rebuild geometry attributes on the SAME geometry (points + lines).
        assigned = assignAttributes();
        worldW = assigned.worldW;
        worldH = assigned.worldH;
        uniforms.uRadius.value = worldH * 0.26;
        uniforms.uStrength.value = worldH * 0.06;
        ScrollTrigger.refresh();
      }, 180);
    };
    window.addEventListener("resize", onResize);

    // --- Cleanup ----------------------------------------------------------
    return () => {
      gsap.ticker.remove(tick);
      assembleTween?.kill();
      scrollTrigger.kill();
      window.clearTimeout(safetyTimer);
      window.clearTimeout(resizeRaf);

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("preloaderdone", onPreloaderDone);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);

      pointsGeo.dispose();
      linesGeo.dispose();
      material.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
