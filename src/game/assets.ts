/**
 * Asset manifest — maps logical names to file paths.
 * The loader in useAsset falls back to procedural PBR placeholders
 * when a file is missing, so the game always boots.
 */

// ── Model Paths ──────────────────────────────────────────────
export const MODELS = {
  // Vehicles
  sedan: '/assets/cars/sedan.glb',
  sportsCar: '/assets/cars/sports_car.glb',
  policeCar: '/assets/cars/police_car.glb',

  // Buildings
  skyscraper01: '/assets/buildings/skyscraper_01.glb',
  skyscraper02: '/assets/buildings/skyscraper_02.glb',
  shop01: '/assets/buildings/shop_01.glb',
  apartment01: '/assets/buildings/apartment_01.glb',
  warehouse01: '/assets/buildings/warehouse_01.glb',

  // Props
  streetlight: '/assets/props/streetlight.glb',
  palmTree: '/assets/props/palm_tree.glb',
  bench: '/assets/props/bench.glb',
  hydrant: '/assets/props/hydrant.glb',
  trashBin: '/assets/props/trash_bin.glb',
  trafficLight: '/assets/props/traffic_light.glb',

  // Characters
  player: '/assets/characters/player.glb',
  pedestrian01: '/assets/characters/pedestrian_01.glb',
  pedestrian02: '/assets/characters/pedestrian_02.glb',
} as const;

export type ModelName = keyof typeof MODELS;

// ── HDRI Paths ───────────────────────────────────────────────
export const HDRI = {
  sunset: '/assets/hdri/sunset.hdr',
  night: '/assets/hdri/night.hdr',
} as const;

export type HdriName = keyof typeof HDRI;

// ── Texture Paths ────────────────────────────────────────────
export const TEXTURES = {
  roadDiffuse: '/assets/textures/road_diffuse.jpg',
  roadNormal: '/assets/textures/road_normal.jpg',
  roadRoughness: '/assets/textures/road_roughness.jpg',
  concreteDiffuse: '/assets/textures/concrete_diffuse.jpg',
  concreteNormal: '/assets/textures/concrete_normal.jpg',
  concreteRoughness: '/assets/textures/concrete_roughness.jpg',
  puddleNoise: '/assets/textures/puddle_noise.jpg',
  windowEmissive: '/assets/textures/window_emissive.jpg',
} as const;

export type TextureName = keyof typeof TEXTURES;
