/**
 * TimeOfDayController — Animates time progression and provides UI controls.
 * Smoothly transitions between sunset and night.
 */
'use client';

import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/game/state/gameStore';
import { useFrame } from '@react-three/fiber';

interface TimeOfDayControllerProps {
  /** Auto-cycle between sunset and night */
  autoCycle?: boolean;
  /** Seconds per full cycle (sunset → night → sunset) */
  cycleDuration?: number;
}

export function TimeOfDayController({
  autoCycle = false,
  cycleDuration = 120,
}: TimeOfDayControllerProps) {
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const setTimeProgress = useGameStore((s) => s.setTimeProgress);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  // Keyboard shortcut: T to toggle time
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        const next = timeOfDay === 'sunset' ? 'night' : 'sunset';
        setTimeOfDay(next);
        setTimeProgress(next === 'night' ? 0 : 0);
      }
    },
    [timeOfDay, setTimeOfDay, setTimeProgress]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-cycle logic
  useFrame((_, delta) => {
    if (!autoCycle) return;

    const currentProgress = useGameStore.getState().timeProgress;
    const speed = 1 / cycleDuration;
    const newProgress = currentProgress + delta * speed;

    if (newProgress >= 1) {
      // Switch time of day
      const current = useGameStore.getState().timeOfDay;
      const next = current === 'sunset' ? 'night' : 'sunset';
      setTimeOfDay(next);
      setTimeProgress(0);
    } else {
      setTimeProgress(newProgress);
    }
  });

  return null; // Controller is logic-only, no visual output
}
