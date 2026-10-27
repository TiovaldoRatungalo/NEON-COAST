/**
 * MissionSystem — Checks mission completion conditions every frame.
 * Wires vehicle speed, enter-vehicle events, and wanted level to mission objectives.
 * Triggers tutorial sequence on first load.
 */
'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVehicleStore } from '@/game/state/vehicleStore';
import { useGameplayStore } from '@/game/state/gameplayStore';

export function MissionSystem() {
  const vehicleStore  = useVehicleStore();
  const gameplayStore = useGameplayStore();
  const checkedRef    = useRef<Set<string>>(new Set());

  // ── Tutorial: enter vehicle ──────────────────────────────────
  useEffect(() => {
    if (!vehicleStore.inVehicle) return;
    const mission = gameplayStore.activeMission;
    if (mission?.id === 'tutorial-01' && !checkedRef.current.has(mission.id)) {
      checkedRef.current.add(mission.id);
      gameplayStore.completeMission();
      // Queue next mission
      setTimeout(() => {
        gameplayStore.startMission({
          id: 'drive-01',
          title: 'Midnight Run',
          description: 'Push a car to full speed under the neon lights.',
          objective: 'Reach 120 km/h',
          completed: false,
          reward: 1500,
        });
      }, 3000);
    }
  }, [vehicleStore.inVehicle, gameplayStore]);

  // ── Speed mission ─────────────────────────────────────────────
  useFrame((_, delta) => {
    gameplayStore.tickPlayTime(delta);

    const mission = gameplayStore.activeMission;
    if (!mission) return;

    if (
      mission.id === 'drive-01' &&
      !checkedRef.current.has(mission.id) &&
      vehicleStore.speed * 3.6 >= 120 // m/s → km/h
    ) {
      checkedRef.current.add(mission.id);
      gameplayStore.completeMission();
    }
  });

  return null;
}
