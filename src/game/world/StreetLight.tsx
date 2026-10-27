/**
 * StreetLight — Procedural street lamp with emissive bulb and optional spot light.
 * Uses a limited number of real SpotLights for performance;
 * most lights are faked with emissive material + bloom.
 */
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/game/state/gameStore';

interface StreetLightProps {
  position: [number, number, number];
  side?: 'left' | 'right';
  /** Only first N lights get real SpotLight; rest use emissive-only */
  realLight?: boolean;
}

export function StreetLight({
  position,
  side = 'left',
  realLight = false,
}: StreetLightProps) {
  const spotRef = useRef<THREE.SpotLight>(null);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const quality = useGameStore((s) => s.quality);

  const lightIntensity = useMemo(() => {
    return timeOfDay === 'night' ? 15 : 2;
  }, [timeOfDay]);

  const emissiveIntensity = useMemo(() => {
    return timeOfDay === 'night' ? 3 : 0.5;
  }, [timeOfDay]);

  const armDirection = side === 'left' ? 1 : -1;

  return (
    <group position={position}>
      {/* Pole */}
      <mesh castShadow position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 7, 8]} />
        <meshStandardMaterial color="#2a2a35" roughness={0.6} metalness={0.8} />
      </mesh>

      {/* Arm */}
      <mesh castShadow position={[armDirection * 1.5, 6.8, 0]} rotation={[0, 0, armDirection * 0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 3.2, 6]} />
        <meshStandardMaterial color="#2a2a35" roughness={0.6} metalness={0.8} />
      </mesh>

      {/* Light fixture housing */}
      <mesh position={[armDirection * 2.8, 6.6, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.4]} />
        <meshStandardMaterial color="#1a1a25" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Emissive bulb */}
      <mesh position={[armDirection * 2.8, 6.45, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#ffddaa"
          emissive="#ffcc88"
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </mesh>

      {/* Real spotlight (only on select lights for perf) */}
      {realLight && quality.shadows && (
        <spotLight
          ref={spotRef}
          position={[armDirection * 2.8, 6.4, 0]}
          angle={0.6}
          penumbra={0.5}
          intensity={lightIntensity}
          color="#ffcc88"
          distance={20}
          castShadow={quality.shadows}
          shadow-mapSize-width={quality.shadowMapSize / 2}
          shadow-mapSize-height={quality.shadowMapSize / 2}
          shadow-bias={-0.001}
          target-position={[armDirection * 2.8, 0, 0]}
        />
      )}

      {/* Ground glow cone (fake volumetric via emissive cone) */}
      <mesh
        position={[armDirection * 2.8, 3.2, 0]}
        rotation={[0, 0, 0]}
      >
        <coneGeometry args={[2.5, 6.4, 16, 1, true]} />
        <meshStandardMaterial
          color="#ffcc88"
          emissive="#ffcc88"
          emissiveIntensity={emissiveIntensity * 0.15}
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
