/**
 * NeonSign — Emissive neon sign with bloom glow and flicker animation.
 * Uses drei's Text component (bundles its own font via troika-three-text).
 */
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface NeonSignProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  text: string;
  color?: string;
  fontSize?: number;
}

export function NeonSign({
  position,
  rotation = [0, 0, 0],
  text,
  color = '#ff3377',
  fontSize = 1.5,
}: NeonSignProps) {
  const groupRef = useRef<THREE.Group>(null);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  // Subtle flicker — simulates neon tube flicker (no new objects per frame)
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const flicker = 0.85 + 0.15 * Math.sin(t * 20) * Math.sin(t * 13.7) * Math.sin(t * 7.3);

    for (const child of groupRef.current.children) {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissiveIntensity = 2.5 * flicker;
      }
    }
  });

  const signWidth = text.length * fontSize * 0.62 + 1;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Backing panel */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[signWidth, fontSize * 1.8, 0.15]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Neon text — troika handles its own font internally, no external file needed */}
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
      >
        {text}
        <meshStandardMaterial
          color={colorObj}
          emissive={colorObj}
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </Text>

      {/* Bloom pickup glow plane behind text */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[signWidth * 0.95, fontSize * 1.1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.12}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
