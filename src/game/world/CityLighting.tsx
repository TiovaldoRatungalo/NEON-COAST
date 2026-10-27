/**
 * CityLighting — Sun/moon directional light, ambient, hemisphere, and fog.
 * Transitions between sunset and night color temperatures.
 * Shadow frustum follows a fixed region around the city center.
 */
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/game/state/gameStore';

export function CityLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const { scene } = useThree();
  const quality = useGameStore((s) => s.quality);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const timeProgress = useGameStore((s) => s.timeProgress);

  // Set up fog once
  useMemo(() => {
    scene.fog = new THREE.FogExp2(0x100820, 0.007);
  }, [scene]);

  // Reusable scratch colors — never allocate in useFrame
  const scratchColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    // nightFactor: 0 = full sunset, 1 = full night
    const nightFactor = timeOfDay === 'night'
      ? Math.min(timeProgress * 1.5, 1)
      : Math.max(1 - timeProgress * 3, 0);

    if (dirLightRef.current) {
      // Sunset: warm orange-amber sun. Night: cold blue-grey moon
      scratchColor.setRGB(
        THREE.MathUtils.lerp(1.0, 0.2, nightFactor),
        THREE.MathUtils.lerp(0.45, 0.3, nightFactor),
        THREE.MathUtils.lerp(0.1, 0.5, nightFactor)
      );
      dirLightRef.current.color.copy(scratchColor);
      dirLightRef.current.intensity = THREE.MathUtils.lerp(2.8, 0.2, nightFactor);

      // Sun arcs from high-ish sunset angle down below horizon at night
      const elevation = THREE.MathUtils.lerp(35, -10, nightFactor);
      dirLightRef.current.position.set(60, elevation, 50);
    }

    if (ambientRef.current) {
      // Ambient: warm at sunset, dark blue-purple at night
      scratchColor.setRGB(
        THREE.MathUtils.lerp(0.25, 0.02, nightFactor),
        THREE.MathUtils.lerp(0.12, 0.02, nightFactor),
        THREE.MathUtils.lerp(0.05, 0.06, nightFactor)
      );
      ambientRef.current.color.copy(scratchColor);
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.5, 0.08, nightFactor);
    }

    if (scene.fog instanceof THREE.FogExp2) {
      // Sunset: dark purple haze. Night: near-black deep fog
      scene.fog.color.setRGB(
        THREE.MathUtils.lerp(0.07, 0.01, nightFactor),
        THREE.MathUtils.lerp(0.03, 0.01, nightFactor),
        THREE.MathUtils.lerp(0.12, 0.03, nightFactor)
      );
      scene.fog.density = THREE.MathUtils.lerp(0.006, 0.014, nightFactor);
    }
  });

  return (
    <>
      {/* Primary directional "sun" light */}
      <directionalLight
        ref={dirLightRef}
        position={[60, 35, 50]}
        intensity={2.8}
        color="#ff7722"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-near={1}
        shadow-camera-far={250}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0003}
        shadow-normalBias={0.05}
      />

      {/* Ambient fill — soft base light */}
      <ambientLight ref={ambientRef} intensity={0.5} color="#ffaa55" />

      {/* Hemisphere — sky/ground color bleed */}
      <hemisphereLight
        ref={hemiRef}
        args={['#ff8844', '#1a0a3e', 0.35]}
      />
    </>
  );
}
