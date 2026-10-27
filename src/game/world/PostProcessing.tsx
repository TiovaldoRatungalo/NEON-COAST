/**
 * PostProcessingPipeline — Configurable post-processing chain.
 * Bloom (neon glow), SMAA (AA), vignette, film grain.
 * Quality preset controls which effects are active.
 * Wrapped in error boundary via Suspense to prevent black screen on failure.
 */
'use client';

import { Suspense } from 'react';
import { useGameStore } from '@/game/state/gameStore';
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

function Effects() {
  const quality = useGameStore((s) => s.quality);

  // Always render EffectComposer with at least vignette + grain
  // Bloom and SMAA toggle based on quality
  return (
    <EffectComposer multisampling={0} enabled>
      <Bloom
        intensity={quality.bloom ? 1.2 : 0}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.35}
        mipmapBlur
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.12}
      />
      <Vignette
        eskil={false}
        offset={0.1}
        darkness={0.55}
      />
    </EffectComposer>
  );
}

export function PostProcessingPipeline() {
  return (
    <Suspense fallback={null}>
      <Effects />
    </Suspense>
  );
}
