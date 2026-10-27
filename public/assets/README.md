# NEON COAST — Asset Guide

## Directory Structure

```
public/assets/
├── cars/
│   ├── sedan.glb          — Player-drivable sedan (~30k tris)
│   ├── sports_car.glb     — Fast sports car (~40k tris)
│   └── police_car.glb     — Police chase vehicle (~35k tris)
├── buildings/
│   ├── skyscraper_01.glb  — Tall downtown building
│   ├── skyscraper_02.glb  — Alternate skyscraper
│   ├── shop_01.glb        — Street-level shop
│   ├── apartment_01.glb   — Residential block
│   └── warehouse_01.glb   — Harbor district warehouse
├── props/
│   ├── streetlight.glb    — Streetlight with emissive bulb
│   ├── palm_tree.glb      — Palm tree (beach/boardwalk)
│   ├── bench.glb          — Park bench
│   ├── hydrant.glb        — Fire hydrant
│   ├── trash_bin.glb      — Street trash bin
│   ├── traffic_light.glb  — Traffic signal
│   ├── road_straight.glb  — Straight road section
│   ├── road_turn.glb      — 90° road turn
│   └── road_intersection.glb — 4-way intersection
├── characters/
│   ├── player.glb         — Main player character with skeleton
│   ├── pedestrian_01.glb  — NPC pedestrian variant 1
│   └── pedestrian_02.glb  — NPC pedestrian variant 2
├── hdri/
│   ├── sunset.hdr         — Sunset sky HDRI (2K–4K)
│   └── night.hdr          — Night sky HDRI (2K–4K)
└── textures/
    ├── road_diffuse.jpg   — Road surface albedo
    ├── road_normal.jpg    — Road surface normal map
    ├── road_roughness.jpg — Road surface roughness map
    ├── concrete_diffuse.jpg
    ├── concrete_normal.jpg
    ├── concrete_roughness.jpg
    ├── puddle_noise.jpg   — Noise map for puddle placement
    └── window_emissive.jpg — Window glow map for buildings
```

## Where to Find Free Assets

### 3D Models

| Source | URL | License | Best For |
|--------|-----|---------|----------|
| Kenney | https://kenney.nl/assets | CC0 | Cars, props, city kit |
| Quaternius | https://quaternius.com | CC0 | Characters, vehicles, buildings |
| Poly Haven | https://polyhaven.com/models | CC0 | High-quality props |
| Sketchfab | https://sketchfab.com (filter CC0/CC-BY) | CC0 / CC-BY | Everything |

### Characters & Animations

| Source | URL | License | Best For |
|--------|-----|---------|----------|
| Mixamo | https://mixamo.com | Free for use | Characters + animations |
| Ready Player Me | https://readyplayer.me | Free tier | Stylized characters |

### HDRI Environments

| Source | URL | License | Best For |
|--------|-----|---------|----------|
| Poly Haven | https://polyhaven.com/hdris | CC0 | Sunset/night skies |
| HDRi Haven (archive) | https://polyhaven.com/hdris | CC0 | All environments |

### PBR Textures

| Source | URL | License | Best For |
|--------|-----|---------|----------|
| Poly Haven | https://polyhaven.com/textures | CC0 | Roads, concrete, metal |
| ambientCG | https://ambientcg.com | CC0 | All PBR materials |

## Model Requirements

- Format: `.glb` (binary glTF)
- Draco compressed preferred
- Cars: separate wheel nodes named `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`
- Characters: rigged with Mixamo-compatible skeleton
- Buildings: origin at base center, Y-up
- Keep total scene under 40 MB initial load; stream additional chunks

## Without Assets

The game runs without any asset files. All missing models are replaced with stylish
procedural PBR placeholders (proper materials, not grey boxes).
