"use client";

/**
 * "Structure from the Unseen" — the signature WebGL moment.
 *
 * A single fixed full-viewport THREE.Points field sits behind the whole page
 * (zIndex -1, transparent — the static obsidian background shows through). The
 * particles assemble out of chaos when the preloader finishes, react to the
 * cursor, breathe at idle, and — in the final ~22% of the scroll — morph into
 * the "O" monogram while the camera dollies in.
 *
 * Displacement is entirely stateless (see lib/webgl/shaders.ts): all motion is
 * driven by uniforms over static per-particle attributes. No GPGPU.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { buildField } from "@/lib/webgl/buildField";
import { vertexShader, fragmentShader } from "@/lib/webgl/shaders";

/** Camera reference distance; the dolly pulls in from here. */
const CAM_Z = 14;
/** Field-of-view (deg) — wide enough for a generous world plane. */
const FOV = 60;

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

    // --- Geometry + material ---------------------------------------------
    const geometry = new THREE.BufferGeometry();

    /** (Re)compute and assign all four attributes onto the geometry. */
    const assignAttributes = () => {
      const { worldW, worldH } = worldSize();
      const field = buildField({
        width: window.innerWidth * densityFactor,
        height: window.innerHeight * densityFactor,
        worldW,
        worldH,
      });
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(field.position, 3)
      );
      geometry.setAttribute("aChaos", new THREE.BufferAttribute(field.aChaos, 3));
      geometry.setAttribute(
        "aTarget",
        new THREE.BufferAttribute(field.aTarget, 3)
      );
      geometry.setAttribute("aRnd", new THREE.BufferAttribute(field.aRnd, 1));
      return { worldW, worldH };
    };

    let { worldW, worldH } = assignAttributes();

    const uniforms = {
      uAssemble: { value: 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector2(9999, 9999) },
      uTime: { value: 0 },
      uRadius: { value: worldH * 0.18 },
      uStrength: { value: worldH * 0.06 },
      uDPR: { value: dpr },
      uCamZ: { value: CAM_Z },
      uSize: { value: 7 },
      uColor: { value: new THREE.Color(0.9569, 0.9451, 0.9176) },
      uGlowColor: { value: new THREE.Color(1.0, 0.965, 0.86) },
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

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false; // displacement can move particles off the home bounds
    scene.add(points);

    // --- Cursor (world-space target, lerped each tick) -------------------
    const mouseTarget = new THREE.Vector2(9999, 9999);

    const toWorld = (clientX: number, clientY: number) => {
      // Map screen coords to the world plane at z=0.
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = -((clientY / window.innerHeight) * 2 - 1);
      mouseTarget.set((nx * worldW) / 2, (ny * worldH) / 2);
    };

    const onMouseMove = (e: MouseEvent) => toWorld(e.clientX, e.clientY);
    const onMouseLeave = () => mouseTarget.set(9999, 9999);
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
        duration: 1.6,
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
        camera.position.z = CAM_Z - p * 11;
        uniforms.uMorph.value = THREE.MathUtils.clamp((p - 0.78) / 0.22, 0, 1);
      },
    });

    // --- Render loop (driven by the GSAP ticker) -------------------------
    const tick = (time: number) => {
      uniforms.uTime.value = time;
      // Smoothly chase the cursor target.
      uniforms.uMouse.value.lerp(mouseTarget, 0.1);
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
      ({ worldW, worldH } = assignAttributes());
      uniforms.uRadius.value = worldH * 0.18;
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
        // Rebuild geometry attributes on the SAME Points object.
        ({ worldW, worldH } = assignAttributes());
        uniforms.uRadius.value = worldH * 0.18;
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

      geometry.dispose();
      material.dispose();
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
