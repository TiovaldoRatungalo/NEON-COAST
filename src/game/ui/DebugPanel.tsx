/**
 * DebugPanel — Leva-powered debug controls for lighting, time, weather, quality.
 * Only visible when showDebug is true (toggle with ~ key).
 */
'use client';

import { useEffect, useCallback } from 'react';
import { useControls, folder } from 'leva';
import { useGameStore } from '@/game/state/gameStore';
import type { QualityPreset, TimeOfDay, Weather } from '@/game/state/gameStore';

export function DebugPanel() {
  const showDebug = useGameStore((s) => s.showDebug);
  const toggleDebug = useGameStore((s) => s.toggleDebug);
  const toggleStats = useGameStore((s) => s.toggleStats);
  const setQualityPreset = useGameStore((s) => s.setQualityPreset);
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const setTimeProgress = useGameStore((s) => s.setTimeProgress);
  const setWeather = useGameStore((s) => s.setWeather);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        toggleDebug();
      }
      if (e.key === 'p' || e.key === 'P') {
        toggleStats();
      }
    },
    [toggleDebug, toggleStats]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Leva controls (only rendered when debug is shown)
  useControls(
    'Game',
    {
      Quality: folder({
        preset: {
          value: useGameStore.getState().qualityPreset,
          options: ['low', 'medium', 'high', 'ultra'] as QualityPreset[],
          onChange: (v: QualityPreset) => setQualityPreset(v),
        },
      }),
      Time: folder({
        timeOfDay: {
          value: useGameStore.getState().timeOfDay,
          options: ['sunset', 'night'] as TimeOfDay[],
          onChange: (v: TimeOfDay) => {
            setTimeOfDay(v);
            setTimeProgress(v === 'night' ? 0.5 : 0);
          },
        },
        progress: {
          value: useGameStore.getState().timeProgress,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v: number) => setTimeProgress(v),
        },
      }),
      Weather: folder({
        weather: {
          value: useGameStore.getState().weather,
          options: ['clear', 'rain'] as Weather[],
          onChange: (v: Weather) => setWeather(v),
        },
      }),
    },
    { collapsed: false },
    [showDebug]
  );

  // Hide leva root when debug is off
  useEffect(() => {
    const levaRoot = document.getElementById('leva__root');
    if (levaRoot) {
      levaRoot.style.display = showDebug ? 'block' : 'none';
    }
  }, [showDebug]);

  return null;
}
