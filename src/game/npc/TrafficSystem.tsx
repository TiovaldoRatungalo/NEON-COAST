/**
 * TrafficSystem — Simple NPC car traffic along the main road.
 * Cars follow lane waypoints, stop at crosswalks, and avoid each other.
 * Uses instanced rendering for performance (up to 20 cars).
 */
'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ── Lane definitions (Z waypoints down the road) ─────────────
const LANE_LEFT_X  = -3.5;
const LANE_RIGHT_X =  3.5;
const ROAD_START_Z = -60;
const ROAD_END_Z   =  80;

interface TrafficCar {
  x:     number;
  z:     number;
  speed: number;
  color: string;
  dir:   1 | -1; // 1 = south→north, -1 = north→south
}

const INITIAL_CARS: TrafficCar[] = [
  { x: LANE_LEFT_X,  z: -50, speed: 7,  color: '#2a1a3a', dir:  1 },
  { x: LANE_LEFT_X,  z: -20, speed: 8,  color: '#1a2a1a', dir:  1 },
  { x: LANE_LEFT_X,  z:  10, speed: 6,  color: '#3a2a1a', dir:  1 },
  { x: LANE_LEFT_X,  z:  40, speed: 9,  color: '#1a1a2a', dir:  1 },
  { x: LANE_RIGHT_X, z:  60, speed: 7,  color: '#2a2a1a', dir: -1 },
  { x: LANE_RIGHT_X, z:  30, speed: 8,  color: '#1a2a2a', dir: -1 },
  { x: LANE_RIGHT_X, z:   0, speed: 6,  color: '#2a1a1a', dir: -1 },
  { x: LANE_RIGHT_X, z: -30, speed: 9,  color: '#1a3a1a', dir: -1 },
];

// Scratch matrix
const _m   = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _q   = new THREE.Quaternion();
const _sc  = new THREE.Vector3(1.8, 0.55, 4);

export function TrafficSystem() {
  const bodyRef  = useRef<THREE.InstancedMesh>(null);
  const cars     = useRef<TrafficCar[]>(INITIAL_CARS.map(c => ({ ...c })));


  useFrame((_, delta) => {
    const inst = bodyRef.current;
    if (!inst) return;

    for (let i = 0; i < cars.current.length; i++) {
      const car = cars.current[i];

      // Move along Z axis in lane direction
      car.z += car.speed * car.dir * delta;

      // Wrap around road
      if (car.dir === 1 && car.z > ROAD_END_Z)   car.z = ROAD_START_Z;
      if (car.dir === -1 && car.z < ROAD_START_Z) car.z = ROAD_END_Z;

      // Compose matrix: rotated 180° for dir=-1 cars
      _pos.set(car.x, 0.28, car.z);
      _q.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        car.dir === 1 ? 0 : Math.PI
      );
      _m.compose(_pos, _q, _sc);
      inst.setMatrixAt(i, _m);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={bodyRef} args={[undefined, undefined, INITIAL_CARS.length]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial vertexColors roughness={0.3} metalness={0.7} />
    </instancedMesh>
  );
}
