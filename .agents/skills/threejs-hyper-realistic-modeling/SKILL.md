---
name: threejs-hyper-realistic-modeling
description: Use this skill for creating non-generic, stable, hyper-realistic, low-poly and performant 3D models and scenes in React Three Fiber. Trigger when the user wants high quality 3D scenes or asks to fix 3D rendering issues.
---

# Three.js & R3F Hyper-Realistic / Stylized Modeling Skill

This skill distills the workflow for creating extremely stable, non-generic, and beautiful 3D experiences using React Three Fiber (R3F) and Drei, while avoiding common pitfalls that cause jitter, crashes, or rendering artifacts.

## 1. Avoid Procedural Noise Textures (Jitter Fix)
- **Do NOT** use `canvas.getContext('2d')` to generate procedural textures with thousands of random dots (`Math.random()`) for "realism". 
- **Why:** When the 3D camera moves, high-frequency noise textures without proper mipmapping or anti-aliasing create severe aliasing, shimmering, and moire patterns (jittering).
- **Solution:** Rely on simple, stylized, low-poly aesthetics. Use `MeshStandardMaterial` or `MeshPhysicalMaterial` with proper colors, `roughness`, `metalness`, and `flatShading: true` to catch the lighting beautifully without any jitter.

## 2. Text and UI Overlays (Shaking Fix)
- **Do NOT** place `<Html center>` components inside the `<Canvas>` if the 3D camera is constantly moving or panning. The 3D-to-2D projection will cause the UI to violently shake as it tries to track the world origin.
- **Solution:** Place text overlays **outside** the `<Canvas>` as standard DOM elements (e.g., `position: absolute`, `z-index: 20`). Drive their animations natively using Framer Motion (`useTransform`, `useMotionValueEvent`) tied to the global scroll progress.

## 3. Font Loading Crashes (Blank Canvas Fix)
- **Do NOT** use the `<Text>` component from `@react-three/drei` (which uses `troika-three-text`) inside a `<Suspense>` boundary if you are loading heavy dynamic text. It has a known bug where attempting to format text before the font fully loads in the Web Worker throws a `trim of undefined` error, permanently breaking the Suspense boundary and leaving a blank screen.
- **Solution:** Use Drei's `<Html>` component for in-scene text labels (if the camera is static), or standard DOM overlays outside the canvas. 

## 4. Lighting and Volumetrics (Visibility Fix)
- **SpotLight Issues:** If a `<SpotLight>` from `@react-three/drei` is missing its volumetric cone or highlight, **remove** the `depthBuffer={depthBuffer}` prop. It frequently bugs out and causes the cone to vanish when the scene graph changes or if camera depth sorting fails.
- **Dynamic Dimming:** When highlighting an object by dimming the environment, never drop ambient or directional lights to `0.0`. Drop them to a low but visible threshold (e.g., `0.2` and `0.5`) to maintain contrast without making the scene pitch black.

## 5. Camera Control
- **Excessive Zoom:** Always explicitly define the initial camera position on your `<Canvas>` (e.g., `camera={{ position: [0, 20, 80], fov: 50 }}`). Relying on the default `[0, 0, 5]` will result in a highly zoomed-in, broken perspective.
- **Spring Physics:** When building custom cursors or interactive camera tracking, use a tighter spring coefficient (e.g., `0.45` instead of `0.15`) to prevent sluggish, lagging controls.
