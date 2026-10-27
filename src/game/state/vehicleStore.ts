/**
 * VehicleStore — Zustand slice for active vehicle state.
 * Tracks which vehicle the player is currently driving.
 */
import { create } from 'zustand';

export interface VehicleState {
  inVehicle: boolean;
  vehicleId: string | null;
  speed: number;       // m/s
  rpm: number;         // 0–8000
  gear: number;        // 1–6
  braking: boolean;
  drifting: boolean;

  enterVehicle: (id: string) => void;
  exitVehicle: () => void;
  setSpeed: (s: number) => void;
  setRpm: (r: number) => void;
  setGear: (g: number) => void;
  setBraking: (b: boolean) => void;
  setDrifting: (d: boolean) => void;
}

export const useVehicleStore = create<VehicleState>()((set) => ({
  inVehicle: false,
  vehicleId: null,
  speed: 0,
  rpm: 800,
  gear: 1,
  braking: false,
  drifting: false,

  enterVehicle: (id) => set({ inVehicle: true, vehicleId: id }),
  exitVehicle:  ()   => set({ inVehicle: false, vehicleId: null, speed: 0, rpm: 800, gear: 1 }),
  setSpeed:   (s) => set({ speed: s }),
  setRpm:     (r) => set({ rpm: r }),
  setGear:    (g) => set({ gear: g }),
  setBraking: (b) => set({ braking: b }),
  setDrifting:(d) => set({ drifting: d }),
}));
