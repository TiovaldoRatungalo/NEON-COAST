# NEON COAST 🌆

A stylized-realistic 3D open-world coastal city sandbox built with Three.js and Next.js.

![Phase 1](https://img.shields.io/badge/Phase-1%20%2F%206-ff3377)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Controls

| Key/Input | Action |
|-----------|--------|
| **LMB Drag** | Orbit camera |
| **RMB Drag** | Pan camera |
| **Scroll** | Zoom in/out |
| **T** | Toggle time of day (sunset ↔ night) |
| **~** | Toggle debug panel (quality, time, weather) |
| **P** | Toggle FPS stats |

## Quality Presets

The game auto-detects the best quality preset for your device. You can change it in the debug panel (~).

| Preset | Shadows | Bloom | AO | AA | Reflections | Draw Distance |
|--------|---------|-------|----|----|-------------|---------------|
| Low | ❌ | ❌ | ❌ | ❌ | ❌ | 150m |
| Medium | ✅ | ✅ | ✅ | ✅ | ❌ | 300m |
| High | ✅ | ✅ | ✅ | ✅ | ✅ | 500m |
| Ultra | ✅ | ✅ | ✅ | ✅ | ✅ | 800m |

## Assets

See [public/assets/README.md](public/assets/README.md) for the full list of expected asset files and where to download them (Poly Haven, Kenney, Quaternius, Sketchfab, Mixamo).

**The game runs without any external assets** — all missing models are replaced with procedural PBR placeholders.

## Tech Stack

- **Next.js 16** (App Router + TypeScript strict)
- **Three.js** + React Three Fiber + drei + postprocessing
- **Rapier** (WASM physics — Phase 2+)
- **Zustand** (state management)
- **Tailwind CSS v4** (UI)
- **Leva** (debug controls)

## Project Status

See [PROGRESS.md](PROGRESS.md) for detailed status and decisions.

## Attribution

See [CREDITS.md](CREDITS.md) for all third-party library and asset credits.
