/**
 * StatsOverlay — FPS/memory stats display in top-left corner.
 * Toggle with P key. Uses drei Stats component.
 */
'use client';

import { Stats } from '@react-three/drei';
import { useGameStore } from '@/game/state/gameStore';

export function StatsOverlay() {
  const showStats = useGameStore((s) => s.showStats);

  if (!showStats) return null;

  return <Stats showPanel={0} className="stats-panel" />;
}
