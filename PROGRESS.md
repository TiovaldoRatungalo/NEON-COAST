# NEON COAST — Progress & Decisions

## Project Contract

**Genre**: Stylized-realistic open-world coastal city sandbox  
**Engine**: Three.js via React Three Fiber in Next.js (App Router)  
**Visual Target**: Sunset/night neon-lit city with rain, PBR materials, post-processing  
**Performance**: ~60 FPS on mid-range laptop at "Medium" preset  

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 App Router | SSR for metadata, App Router for layouts |
| 3D Renderer | R3F + drei + postprocessing | Declarative Three.js with React |
| Physics | @react-three/rapier | WASM Rapier3D, performant rigid bodies |
| State | Zustand | Lightweight, no boilerplate |
| Styling | Tailwind CSS v4 + inline styles | Inline for game UI (Tailwind for layouts) |
| Asset fallback | Procedural PBR placeholders | Game always runs without assets |

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Rendering foundation (sky, lighting, post-processing, street block, ocean, time-of-day) | ✅ Complete |
| 2 | Player on foot (capsule controller, WASD/jump/sprint, third-person chase cam, walk cycle) | ✅ Complete |
| 3 | Vehicles (arcade car physics, procedural body, headlights, brake lights, drift smoke, engine audio) | ✅ Complete |
| 4 | Living city (GPU-instanced rain, NPC traffic cars, fog transitions) | ✅ Complete |
| 5 | Gameplay loop (wanted level, mission system, cash/score, tutorial auto-progression) | ✅ Complete |
| 6 | HUD polish (speedometer SVG gauge, wanted stars, mission banner, animated cash display) | ✅ Complete |

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move forward / accelerate |
| S / ↓ | Move backward / brake |
| A / ← | Strafe left / steer left |
| D / → | Strafe right / steer right |
| Shift | Sprint |
| Space | Jump / handbrake (in vehicle) |
| F | Enter / exit vehicle (within 5m) |
| T | Cycle time of day |
| ~ | Toggle debug panel |
| P | Toggle FPS stats |

## Files Created

### Core
- `src/game/assets.ts` — Asset manifest + procedural fallbacks
- `src/game/state/gameStore.ts` — Global state (time, weather, quality)
- `src/game/state/vehicleStore.ts` — Vehicle state (speed, RPM, gear, braking)
- `src/game/state/gameplayStore.ts` — Gameplay state (wanted, score, cash, missions)

### World
- `src/game/world/SkyDome.tsx` — Gradient sky shader + sun/moon/stars
- `src/game/world/CityLighting.tsx` — Dynamic lighting + fog day/night
- `src/game/world/StreetBlock.tsx` — City block (road, sidewalks, buildings, props)
- `src/game/world/Ocean.tsx` — Gerstner wave ocean shader
- `src/game/world/RainSystem.tsx` — 4000-instance GPU rain particles
- `src/game/world/WorldColliders.tsx` — Rapier static colliders
- `src/game/world/PostProcessing.tsx` — Bloom, vignette, grain
- `src/game/world/TimeOfDayController.tsx` — Auto-cycling time system
- `src/game/world/ProceduralBuilding.tsx` — Instanced-window buildings
- `src/game/world/NeonSign.tsx` — Emissive neon signs
- `src/game/world/StreetLight.tsx` — Street lamps
- `src/game/world/PalmTree.tsx` — Wind-swayed palm trees
- `src/game/shaders/ocean.ts` — GLSL Gerstner wave shaders

### Player
- `src/game/player/PlayerCharacter.tsx` — WASD capsule controller
- `src/game/hooks/usePlayerControls.ts` — Keyboard input (zero-allocation ref)
- `src/game/hooks/useThirdPersonCamera.ts` — Smooth chase camera hook

### Vehicles
- `src/game/vehicles/CarVehicle.tsx` — Arcade car: Rapier physics + procedural body
- `src/game/hooks/useCarAudio.ts` — WebAudio engine synthesiser

### NPC
- `src/game/npc/TrafficSystem.tsx` — Instanced lane-following traffic

### Missions
- `src/game/missions/MissionSystem.tsx` — Mission condition checks

### UI
- `src/game/ui/LoadingScreen.tsx` — Synthwave loading screen
- `src/game/ui/HudOverlay.tsx` — Status chips + controls bar
- `src/game/ui/Speedometer.tsx` — SVG circular gauge (RPM + speed + gear)
- `src/game/ui/WantedDisplay.tsx` — 5-star wanted level
- `src/game/ui/MissionBanner.tsx` — Slide-in mission notifications
- `src/game/ui/CashDisplay.tsx` — Animated cash counter
- `src/game/ui/DebugPanel.tsx` — Leva debug panel
- `src/game/ui/StatsOverlay.tsx` — FPS stats
