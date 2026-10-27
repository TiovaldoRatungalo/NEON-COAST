/**
 * Ocean — Animated water surface with Gerstner waves, foam, and fresnel.
 * Uses custom shader material for realistic water appearance.
 */
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/game/state/gameStore';
import { oceanVertexShader, oceanFragmentShader } from '@/game/shaders/ocean';

interface OceanProps {
  size?: number;
  position?: [number, number, number];
}

export function Ocean({ size = 500, position = [0, -0.5, 0] }: OceanProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWaveHeight: { value: 0.8 },
      uWaveFrequency: { value: 0.15 },
      uDeepColor: { value: new THREE.Color('#0a1628') },
      uShallowColor: { value: new THREE.Color('#1a4a6e') },
      uFoamColor: { value: new THREE.Color('#d4e8f0') },
      uFoamThreshold: { value: 0.35 },
      uSunDirection: { value: new THREE.Vector3(0.5, 0.3, 0.7).normalize() },
      uSunColor: { value: new THREE.Color('#ff8844') },
      uFresnelPower: { value: 2.5 },
    }),
    []
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;

    // Shift colors based on time of day
    if (timeOfDay === 'sunset') {
      uniforms.uDeepColor.value.lerp(new THREE.Color('#1a2840'), delta * 0.5);
      uniforms.uShallowColor.value.lerp(new THREE.Color('#2a5a7e'), delta * 0.5);
      uniforms.uSunColor.value.lerp(new THREE.Color('#ff6633'), delta * 0.5);
    } else {
      uniforms.uDeepColor.value.lerp(new THREE.Color('#050d1a'), delta * 0.5);
      uniforms.uShallowColor.value.lerp(new THREE.Color('#0a2040'), delta * 0.5);
      uniforms.uSunColor.value.lerp(new THREE.Color('#334466'), delta * 0.5);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[size, size, 128, 128]} />
      <shaderMaterial
        vertexShader={oceanVertexShader}
        fragmentShader={oceanFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
