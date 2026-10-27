/**
 * PalmTree — Procedural palm tree with wind-sway animation.
 * Trunk uses tapered cylinder segments; leaves use flat planes with alpha.
 */
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface PalmTreeProps {
  position: [number, number, number];
  height?: number;
  swaySpeed?: number;
  swayAmount?: number;
}

export function PalmTree({
  position,
  height = 8,
  swaySpeed = 1.2,
  swayAmount = 0.03,
}: PalmTreeProps) {
  const groupRef = useRef<THREE.Group>(null);
  // Random phase offset so trees don't sway in sync
  const phaseOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  // Wind sway animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * swaySpeed + phaseOffset;
    groupRef.current.rotation.z = Math.sin(t) * swayAmount;
    groupRef.current.rotation.x = Math.cos(t * 0.7) * swayAmount * 0.5;
  });

  // Leaf geometry — 6 fronds arranged radially
  const leaves = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const angle = (i / 7) * Math.PI * 2;
      const droop = -0.4 - Math.random() * 0.3;
      return {
        angle,
        droop,
        length: 3 + Math.random() * 1.5,
        twist: (Math.random() - 0.5) * 0.3,
      };
    });
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Trunk — built from tapered segments for a natural curve */}
      {Array.from({ length: 5 }).map((_, i) => {
        const segHeight = height / 5;
        const t = i / 5;
        const radius = 0.2 - t * 0.08;
        const lean = Math.sin(t * 1.5) * 0.3;
        return (
          <mesh
            key={`trunk-${i}`}
            castShadow
            position={[lean, segHeight * i + segHeight / 2, 0]}
          >
            <cylinderGeometry
              args={[radius - 0.02, radius, segHeight, 8]}
            />
            <meshStandardMaterial
              color="#4a3520"
              roughness={0.95}
              metalness={0.0}
            />
          </mesh>
        );
      })}

      {/* Coconuts */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={`coconut-${i}`}
          position={[
            Math.cos((i / 3) * Math.PI * 2) * 0.25,
            height - 0.3,
            Math.sin((i / 3) * Math.PI * 2) * 0.25,
          ]}
        >
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#5a4020" roughness={0.8} />
        </mesh>
      ))}

      {/* Palm fronds */}
      {leaves.map((leaf, i) => (
        <group
          key={`frond-${i}`}
          position={[0, height, 0]}
          rotation={[leaf.droop, leaf.angle, leaf.twist]}
        >
          <mesh>
            <boxGeometry args={[0.6, 0.04, leaf.length]} />
            <meshStandardMaterial
              color="#1a5a20"
              roughness={0.8}
              metalness={0.0}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Leaf blades along the frond */}
          {Array.from({ length: 5 }).map((_, j) => {
            const t = (j + 1) / 6;
            return (
              <mesh
                key={`blade-${j}`}
                position={[0.35, 0, -leaf.length * 0.4 + t * leaf.length * 0.9]}
                rotation={[0, 0, -0.4]}
              >
                <boxGeometry args={[0.5, 0.02, 0.3]} />
                <meshStandardMaterial
                  color="#1a6a25"
                  roughness={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
          {Array.from({ length: 5 }).map((_, j) => {
            const t = (j + 1) / 6;
            return (
              <mesh
                key={`blade-r-${j}`}
                position={[-0.35, 0, -leaf.length * 0.4 + t * leaf.length * 0.9]}
                rotation={[0, 0, 0.4]}
              >
                <boxGeometry args={[0.5, 0.02, 0.3]} />
                <meshStandardMaterial
                  color="#1a6a25"
                  roughness={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}
