/**
 * ProceduralBuilding — Generates a PBR building with emissive windows.
 * Used as fallback when .glb building models are missing.
 */
'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/game/state/gameStore';

interface ProceduralBuildingProps {
  position: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  color?: string;
  emissiveColor?: string;
  windowRows?: number;
  windowCols?: number;
}

// Reusable geometry for all windows
const WINDOW_GEO = new THREE.BoxGeometry(1, 1, 1);

export function ProceduralBuilding({
  position,
  width = 10,
  depth = 10,
  height = 30,
  color = '#2a2a3e',
  emissiveColor = '#ff6b35',
  windowRows = 8,
  windowCols = 4,
}: ProceduralBuildingProps) {
  const windowRef = useRef<THREE.InstancedMesh>(null);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  // Emissive intensity: high at night, low at sunset
  const emissiveIntensity = timeOfDay === 'night' ? 2.0 : 0.3;

  // Generate window instance matrices — memoized so they're only computed once
  const { matrices, count } = useMemo(() => {
    const m: THREE.Matrix4[] = [];
    const wW = (width * 0.65) / windowCols;   // window width
    const wH = (height * 0.55) / windowRows;  // window height
    const startX = -(width * 0.325);
    const startY = height * 0.15;
    const tempMat = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();
    const tempScale = new THREE.Vector3(wW * 0.75, wH * 0.65, 0.08);
    const identityQ = new THREE.Quaternion();
    const sideQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI * 0.5, 0));

    // Front and back face windows
    for (let face = 0; face < 2; face++) {
      const zOff = face === 0 ? depth * 0.502 : -depth * 0.502;
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          if (Math.random() < 0.18) continue; // some dark windows
          const x = startX + col * (wW * 1.25) + wW * 0.5;
          const y = startY + row * (wH * 1.2) + wH * 0.5;
          tempPos.set(x, y, zOff);
          tempMat.compose(tempPos, identityQ, tempScale);
          m.push(tempMat.clone());
        }
      }
    }

    // Side face windows
    const sideCols = Math.max(2, Math.floor(windowCols * (depth / width)));
    const swW = (depth * 0.65) / sideCols;
    const swScale = new THREE.Vector3(swW * 0.75, wH * 0.65, 0.08);

    for (let face = 0; face < 2; face++) {
      const xOff = face === 0 ? width * 0.502 : -width * 0.502;
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < sideCols; col++) {
          if (Math.random() < 0.22) continue;
          const z = -(depth * 0.325) + col * (swW * 1.25) + swW * 0.5;
          const y = startY + row * (wH * 1.2) + wH * 0.5;
          tempPos.set(xOff, y, z);
          tempMat.compose(tempPos, sideQ, swScale);
          m.push(tempMat.clone());
        }
      }
    }

    return { matrices: m, count: m.length };
  }, [width, depth, height, windowRows, windowCols]);

  // Set all instance matrices once after mount
  useEffect(() => {
    if (!windowRef.current) return;
    for (let i = 0; i < count; i++) {
      windowRef.current.setMatrixAt(i, matrices[i]);
    }
    windowRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices, count]);

  // Update emissive intensity when time changes
  useFrame(() => {
    if (!windowRef.current) return;
    const mat = windowRef.current.material as THREE.MeshStandardMaterial;
    const target = timeOfDay === 'night' ? 2.0 : 0.3;
    if (Math.abs(mat.emissiveIntensity - target) > 0.05) {
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.02;
    }
  });

  return (
    <group position={position}>
      {/* Main building body */}
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Rooftop ledge */}
      <mesh castShadow position={[0, height + 0.25, 0]}>
        <boxGeometry args={[width + 0.5, 0.5, depth + 0.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Rooftop AC unit */}
      <mesh castShadow position={[width * 0.18, height + 1.1, depth * 0.08]}>
        <boxGeometry args={[2.2, 1.2, 1.8]} />
        <meshStandardMaterial color="#2a2a35" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Windows — instanced */}
      <instancedMesh ref={windowRef} args={[WINDOW_GEO, undefined, count]} frustumCulled>
        <meshStandardMaterial
          color="#0d1020"
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.05}
          metalness={0.9}
        />
      </instancedMesh>
    </group>
  );
}
