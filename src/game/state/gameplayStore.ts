/**
 * gameplayStore — Zustand store for Phase 5 gameplay state.
 * Tracks wanted level (heat), score, mission, and player stats.
 * Persisted to localStorage.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WantedLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface Mission {
  id:          string;
  title:       string;
  description: string;
  objective:   string;
  completed:   boolean;
  reward:      number;
}

export interface GameplayState {
  wantedLevel:  WantedLevel;
  score:        number;
  cash:         number;
  activeMission: Mission | null;
  completedMissions: string[];
  playTime:     number; // seconds

  // Actions
  addWanted:       (n?: number) => void;
  removeWanted:    (n?: number) => void;
  resetWanted:     () => void;
  addScore:        (n: number) => void;
  addCash:         (n: number) => void;
  startMission:    (m: Mission) => void;
  completeMission: () => void;
  tickPlayTime:    (delta: number) => void;
}

const STARTER_MISSIONS: Mission[] = [
  {
    id: 'tutorial-01',
    title: 'Welcome to Neon Coast',
    description: 'Get behind the wheel and feel the city.',
    objective: 'Enter a vehicle',
    completed: false,
    reward: 500,
  },
  {
    id: 'drive-01',
    title: 'Midnight Run',
    description: 'Push a car to full speed under the neon lights.',
    objective: 'Reach 120 km/h',
    completed: false,
    reward: 1500,
  },
];

export const useGameplayStore = create<GameplayState>()(
  persist(
    (set, get) => ({
      wantedLevel:  0,
      score:        0,
      cash:         500,
      activeMission: STARTER_MISSIONS[0],
      completedMissions: [],
      playTime:     0,

      addWanted: (n = 1) =>
        set((s) => ({ wantedLevel: Math.min(5, s.wantedLevel + n) as WantedLevel })),
      removeWanted: (n = 1) =>
        set((s) => ({ wantedLevel: Math.max(0, s.wantedLevel - n) as WantedLevel })),
      resetWanted: () => set({ wantedLevel: 0 }),

      addScore: (n) => set((s) => ({ score: s.score + n })),
      addCash:  (n) => set((s) => ({ cash:  s.cash  + n })),

      startMission: (m) => set({ activeMission: m }),
      completeMission: () => {
        const { activeMission } = get();
        if (!activeMission) return;
        set((s) => ({
          activeMission: null,
          completedMissions: [...s.completedMissions, activeMission.id],
          cash:  s.cash  + activeMission.reward,
          score: s.score + activeMission.reward * 2,
        }));
      },

      tickPlayTime: (delta) => set((s) => ({ playTime: s.playTime + delta })),
    }),
    {
      name: 'neon-coast-gameplay',
      partialize: (s) => ({
        score: s.score,
        cash:  s.cash,
        completedMissions: s.completedMissions,
        playTime: s.playTime,
      }),
    }
  )
);
