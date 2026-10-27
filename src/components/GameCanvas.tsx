/**
 * GameCanvas — Root 3D canvas wrapper. Phase 6 complete.
 * All HUD layers rendered above the R3F Canvas.
 */
'use client';

import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { GameScene } from '@/components/GameScene';
import { LoadingScreen } from '@/game/ui/LoadingScreen';
import { HudOverlay } from '@/game/ui/HudOverlay';
import { DebugPanel } from '@/game/ui/DebugPanel';
import { Speedometer } from '@/game/ui/Speedometer';
import { WantedDisplay } from '@/game/ui/WantedDisplay';
import { MissionBanner } from '@/game/ui/MissionBanner';
import { CashDisplay } from '@/game/ui/CashDisplay';
import { useGameStore } from '@/game/state/gameStore';

export function GameCanvas() {
  const quality = useGameStore((s) => s.quality);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: '#050510' }}>
      {/* ── Overlays (always above canvas) ─── */}
      <LoadingScreen />
      <HudOverlay />
      <DebugPanel />
      <Speedometer />
      <WantedDisplay />
      <MissionBanner />
      <CashDisplay />

      {/* ── 3D Canvas ───────────────────────── */}
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        shadows={quality.shadows}
        dpr={quality.dpr}
        camera={{ fov: 55, near: 0.5, far: 2000, position: [0, 45, 100] }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <GameScene />
      </Canvas>
    </div>
  );
}
