/**
 * SkyDome — Procedural gradient sky with sun/moon and stars at night.
 * No HDRI dependency: runs as fallback or as primary sky.
 * Uses a vertex-colored sphere for sky gradient.
 */
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/game/state/gameStore';

// Star vertex shader — positions stars on a sphere with twinkle
const starVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    vAlpha = 0.5 + 0.5 * sin(uTime * 2.0 + aPhase);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.2, d) * vAlpha;
    gl_FragColor = vec4(0.9, 0.92, 1.0, alpha);
  }
`;

// Sky gradient vertex shader — colors each vertex based on height (Y)
const skyVertexShader = /* glsl */ `
  varying float vHeight;
  void main() {
    vHeight = normalize(position).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = /* glsl */ `
  uniform vec3 uSkyTop;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSkyBottom;
  varying float vHeight;

  void main() {
    // Blend: bottom -> horizon -> top
    vec3 col;
    if (vHeight > 0.0) {
      col = mix(uSkyHorizon, uSkyTop, pow(vHeight, 0.6));
    } else {
      col = mix(uSkyHorizon, uSkyBottom, -vHeight * 2.0);
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function SkyDome() {
  const starsRef = useRef<THREE.Points>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const skyMatRef = useRef<THREE.ShaderMaterial>(null);

  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const timeProgress = useGameStore((s) => s.timeProgress);

  // Star geometry — generated once
  const { starPositions, starSizes, starPhases } = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.7 + 0.3);
      const r = 400;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 1 + Math.random() * 3;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { starPositions: positions, starSizes: sizes, starPhases: phases };
  }, []);

  // Sky gradient uniforms
  const skyUniforms = useMemo(
    () => ({
      uSkyTop: { value: new THREE.Color('#1a0a3e') },    // deep purple
      uSkyHorizon: { value: new THREE.Color('#c04020') }, // warm orange horizon
      uSkyBottom: { value: new THREE.Color('#050510') },  // near-black below
    }),
    []
  );

  // Star uniforms
  const starUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    starUniforms.uTime.value = clock.getElapsedTime();

    // Night factor: 0 = full sunset, 1 = full night
    const nightFactor = timeOfDay === 'night' ? Math.min(timeProgress + 0.1, 1) : Math.max(1 - timeProgress * 3, 0);

    // Shift sky colors for time of day
    skyUniforms.uSkyTop.value.lerp(
      nightFactor > 0.5
        ? new THREE.Color('#020208')   // night: near black
        : new THREE.Color('#1a0a3e'),  // sunset: deep purple
      0.03
    );
    skyUniforms.uSkyHorizon.value.lerp(
      nightFactor > 0.5
        ? new THREE.Color('#0a0520')   // night: dark blue
        : new THREE.Color('#c04020'),  // sunset: orange
      0.03
    );

    // Stars visible at night
    if (starsRef.current) {
      const starOpacity = Math.min(nightFactor * 2, 1);
      starsRef.current.visible = starOpacity > 0.05;
      const mat = starsRef.current.material as THREE.ShaderMaterial;
      mat.opacity = starOpacity;
    }

    // Sun
    if (sunRef.current) {
      sunRef.current.visible = nightFactor < 0.7;
      if (sunRef.current.visible) {
        const angle = nightFactor * 0.6;
        sunRef.current.position.set(
          100 * Math.cos(angle),
          80 - nightFactor * 60,
          80 * Math.sin(angle)
        );
      }
    }

    // Moon
    if (moonRef.current) {
      moonRef.current.visible = nightFactor > 0.4;
    }
  });

  return (
    <group>
      {/* Gradient sky sphere */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[450, 32, 24]} />
        <shaderMaterial
          ref={skyMatRef}
          vertexShader={skyVertexShader}
          fragmentShader={skyFragmentShader}
          uniforms={skyUniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Sun disc */}
      <mesh ref={sunRef} position={[100, 80, 80]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial color="#ffaa44" toneMapped={false} />
      </mesh>

      {/* Sun glow halo */}
      <mesh ref={sunRef} position={[100, 80, 80]}>
        <sphereGeometry args={[16, 12, 12]} />
        <meshBasicMaterial
          color="#ff6622"
          transparent
          opacity={0.12}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Moon */}
      <mesh ref={moonRef} position={[-120, 180, -80]} visible={false}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#dde4f0" toneMapped={false} />
      </mesh>

      {/* Stars */}
      <points ref={starsRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[starSizes, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[starPhases, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={starVertexShader}
          fragmentShader={starFragmentShader}
          uniforms={starUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
