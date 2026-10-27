/**
 * GameScene — Full Phase 1–6 scene composition.
 * World + Physics + Player + Vehicles + NPC Traffic + Rain + Missions.
 */
'use client';

import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { SkyDome } from '@/game/world/SkyDome';
import { CityLighting } from '@/game/world/CityLighting';
import { StreetBlock } from '@/game/world/StreetBlock';
import { Ocean } from '@/game/world/Ocean';
import { RainSystem } from '@/game/world/RainSystem';
import { PostProcessingPipeline } from '@/game/world/PostProcessing';
import { TimeOfDayController } from '@/game/world/TimeOfDayController';
import { WorldColliders } from '@/game/world/WorldColliders';
import { PlayerCharacter } from '@/game/player/PlayerCharacter';
import { CarVehicle } from '@/game/vehicles/CarVehicle';
import { TrafficSystem } from '@/game/npc/TrafficSystem';
import { MissionSystem } from '@/game/missions/MissionSystem';
import { StatsOverlay } from '@/game/ui/StatsOverlay';
import { useGameStore } from '@/game/state/gameStore';

const PARKED_CARS: Array<{ id: string; pos: [number,number,number]; color: string }> = [
  { id: 'car-01', pos: [-5,  0.4,  5],  color: '#1a1a3a' },
  { id: 'car-02', pos: [ 5,  0.4, -18], color: '#3a1a1a' },
  { id: 'car-03', pos: [-5,  0.4, -38], color: '#1a2a1a' },
];

export function GameScene() {
  const setQualityPreset = useGameStore((s) => s.setQualityPreset);
  const playerGroupRef   = useRef<THREE.Group>(null);

  return (
    <>
      <PerformanceMonitor
        onDecline={() => {
          const current = useGameStore.getState().qualityPreset;
          const down: Record<string, 'low' | 'medium' | 'high'> = {
            ultra: 'high', high: 'medium', medium: 'low',
          };
          if (current in down) setQualityPreset(down[current]);
        }}
      />
      <AdaptiveDpr pixelated />
      <TimeOfDayController autoCycle cycleDuration={300} />

      {/* ── World geometry ────────────────────────────────────── */}
      <Suspense fallback={null}>
        <SkyDome />
        <CityLighting />
        <StreetBlock />
        <Ocean position={[120, -1, 0]} size={400} />
        <RainSystem />
        <TrafficSystem />
      </Suspense>

      {/* ── Physics simulation ────────────────────────────────── */}
      <Physics gravity={[0, -20, 0]} timeStep="vary">
        <Suspense fallback={null}>
          <WorldColliders />
          <PlayerCharacter spawnPosition={[0, 1, 40]} groupRef={playerGroupRef} />
          {PARKED_CARS.map((car) => (
            <CarVehicle
              key={car.id}
              id={car.id}
              position={car.pos}
              color={car.color}
              playerRef={playerGroupRef}
            />
          ))}
        </Suspense>
      </Physics>

      {/* ── Game systems (no render output) ─────────────────── */}
      <MissionSystem />

      <PostProcessingPipeline />
      <StatsOverlay />
    </>
  );
}
