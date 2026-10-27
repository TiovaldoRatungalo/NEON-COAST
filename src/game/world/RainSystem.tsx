/**
 * RainSystem — GPU-instanced rain particle system.
 * 5000 instanced quads falling with wind drift.
 * Renders only when weather = 'rain'. Resets puddles on dry.
 */
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/game/state/gameStore';

const RAIN_COUNT = 4000;
const RAIN_SPREAD = 80;
const RAIN_HEIGHT = 35;
const DROP_SPEED  = 22; // m/s
const WIND_X      = 0.8;

// Reuse matrix / positions
const _mat    = new THREE.Matrix4();
const _scale  = new THREE.Vector3(0.02, 0.6, 0.02);
const _q      = new THREE.Quaternion();

export function RainSystem() {
  const ref     = useRef<THREE.InstancedMesh>(null);
  const weather = useGameStore((s) => s.weather);

  // Initial drop positions scattered around origin
  const positions = useMemo(() => {
    const p = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      p[i * 3]     = (Math.random() - 0.5) * RAIN_SPREAD;
      p[i * 3 + 1] = Math.random() * RAIN_HEIGHT;
      p[i * 3 + 2] = (Math.random() - 0.5) * RAIN_SPREAD;
    }
    return p;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || weather !== 'rain') return;

    for (let i = 0; i < RAIN_COUNT; i++) {
      // Move drop downward + wind drift
      positions[i * 3]     += WIND_X * delta;
      positions[i * 3 + 1] -= DROP_SPEED * delta;

      // Wrap back to top when below ground
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3]     = (Math.random() - 0.5) * RAIN_SPREAD;
        positions[i * 3 + 1] = RAIN_HEIGHT;
        positions[i * 3 + 2] = (Math.random() - 0.5) * RAIN_SPREAD;
      }

      _mat.compose(
        new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]),
        _q,
        _scale
      );
      ref.current.setMatrixAt(i, _mat);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  if (weather !== 'rain') return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, RAIN_COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color="#88aacc"
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
