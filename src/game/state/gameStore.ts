/**
 * Core game state — Zustand store.
 * Manages time of day, weather, quality settings, and UI state.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Quality Presets ──────────────────────────────────────────
export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface QualitySettings {
  shadows: boolean;
  shadowMapSize: number;
  bloom: boolean;
  ao: boolean;
  antialiasing: boolean;
  reflections: boolean;
  drawDistance: number;
  particleCount: number;
  dpr: [number, number]; // min, max device pixel ratio
}

export const QUALITY_PRESETS: Record<QualityPreset, QualitySettings> = {
  low: {
    shadows: false,
    shadowMapSize: 512,
    bloom: false,
    ao: false,
    antialiasing: false,
    reflections: false,
    drawDistance: 150,
    particleCount: 100,
    dpr: [0.5, 0.75],
  },
  medium: {
    shadows: true,
    shadowMapSize: 1024,
    bloom: true,
    ao: true,
    antialiasing: true,
    reflections: false,
    drawDistance: 300,
    particleCount: 500,
    dpr: [0.75, 1],
  },
  high: {
    shadows: true,
    shadowMapSize: 2048,
    bloom: true,
    ao: true,
    antialiasing: true,
    reflections: true,
    drawDistance: 500,
    particleCount: 1000,
    dpr: [1, 1.5],
  },
  ultra: {
    shadows: true,
    shadowMapSize: 4096,
    bloom: true,
    ao: true,
    antialiasing: true,
    reflections: true,
    drawDistance: 800,
    particleCount: 2000,
    dpr: [1, 2],
  },
};

// ── Time of Day ──────────────────────────────────────────────
export type TimeOfDay = 'sunset' | 'night';

// ── Weather ──────────────────────────────────────────────────
export type Weather = 'clear' | 'rain';

// ── Game State ───────────────────────────────────────────────
export interface GameState {
  // Loading
  loaded: boolean;
  loadProgress: number;
  setLoaded: (v: boolean) => void;
  setLoadProgress: (v: number) => void;

  // Time
  timeOfDay: TimeOfDay;
  /** 0 = sunset start, 1 = deep night */
  timeProgress: number;
  setTimeOfDay: (t: TimeOfDay) => void;
  setTimeProgress: (p: number) => void;

  // Weather
  weather: Weather;
  setWeather: (w: Weather) => void;

  // Quality
  qualityPreset: QualityPreset;
  quality: QualitySettings;
  setQualityPreset: (p: QualityPreset) => void;

  // UI
  showDebug: boolean;
  showStats: boolean;
  paused: boolean;
  toggleDebug: () => void;
  toggleStats: () => void;
  togglePause: () => void;

  // Player
  money: number;
  heat: number;
  addMoney: (amount: number) => void;
  setHeat: (h: number) => void;
}

/** Auto-detect quality based on device pixel ratio and GPU heuristics */
function detectDefaultPreset(): QualityPreset {
  if (typeof window === 'undefined') return 'medium';
  const dpr = window.devicePixelRatio ?? 1;
  // Simple heuristic: high-DPR usually means decent GPU
  if (dpr >= 2) return 'high';
  if (dpr >= 1.5) return 'medium';
  return 'low';
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => {
      const defaultPreset = detectDefaultPreset();
      return {
        // Loading
        loaded: false,
        loadProgress: 0,
        setLoaded: (v) => set({ loaded: v }),
        setLoadProgress: (v) => set({ loadProgress: v }),

        // Time
        timeOfDay: 'sunset' as TimeOfDay,
        timeProgress: 0,
        setTimeOfDay: (t) => set({ timeOfDay: t }),
        setTimeProgress: (p) => set({ timeProgress: p }),

        // Weather
        weather: 'clear' as Weather,
        setWeather: (w) => set({ weather: w }),

        // Quality
        qualityPreset: defaultPreset,
        quality: QUALITY_PRESETS[defaultPreset],
        setQualityPreset: (p) =>
          set({ qualityPreset: p, quality: QUALITY_PRESETS[p] }),

        // UI
        showDebug: false,
        showStats: false,
        paused: false,
        toggleDebug: () => set((s) => ({ showDebug: !s.showDebug })),
        toggleStats: () => set((s) => ({ showStats: !s.showStats })),
        togglePause: () => set((s) => ({ paused: !s.paused })),

        // Player
        money: 0,
        heat: 0,
        addMoney: (amount) => set((s) => ({ money: s.money + amount })),
        setHeat: (h) => set({ heat: Math.max(0, Math.min(5, h)) }),
      };
    },
    {
      name: 'neon-coast-save',
      partialize: (state) => ({
        qualityPreset: state.qualityPreset,
        quality: state.quality,
        money: state.money,
        showStats: state.showStats,
      }),
    }
  )
);
