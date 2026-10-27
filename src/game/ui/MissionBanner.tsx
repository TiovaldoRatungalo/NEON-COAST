/**
 * MissionBanner — Slide-in notification for mission start/complete.
 * Shows mission title and objective. Fades out after 4 seconds.
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameplayStore } from '@/game/state/gameplayStore';

const MONO = 'var(--font-jetbrains), monospace';

export function MissionBanner() {
  const activeMission      = useGameplayStore((s) => s.activeMission);
  const completedMissions  = useGameplayStore((s) => s.completedMissions);
  const cash               = useGameplayStore((s) => s.cash);

  const [visible, setVisible] = useState(false);
  const [banner, setBanner]   = useState<{
    title: string;
    sub: string;
    type: 'start' | 'complete';
    reward?: number;
  } | null>(null);
  const prevMissionId      = useRef<string | null>(null);
  const prevCompleted      = useRef<string[]>([]);

  // Show banner when mission starts
  useEffect(() => {
    if (!activeMission) return;
    if (activeMission.id === prevMissionId.current) return;
    prevMissionId.current = activeMission.id;
    setBanner({ title: activeMission.title, sub: activeMission.objective, type: 'start' });
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [activeMission]);

  // Show banner when mission completes
  useEffect(() => {
    const newCompleted = completedMissions.filter(id => !prevCompleted.current.includes(id));
    if (newCompleted.length === 0) return;
    prevCompleted.current = [...completedMissions];
    setBanner({ title: 'Mission Complete', sub: `+$${cash}`, type: 'complete' });
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [completedMissions, cash]);

  if (!banner) return null;

  const accent = banner.type === 'complete' ? '#22ffaa' : '#ff6b35';

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 46,
      pointerEvents: 'none',
      textAlign: 'center',
    }}>
      <div style={{
        padding: '10px 28px',
        background: 'rgba(8,8,18,0.9)',
        border: `1px solid ${accent}55`,
        borderRadius: '2px',
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 30px ${accent}22`,
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: '9px',
          color: accent,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}>
          {banner.type === 'complete' ? '✓ COMPLETE' : '◆ NEW MISSION'}
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: '14px',
          color: '#ffffff',
          fontWeight: 700,
          letterSpacing: '0.05em',
          marginBottom: '3px',
        }}>
          {banner.title}
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: '10px',
          color: '#889aaa',
          letterSpacing: '0.05em',
        }}>
          {banner.sub}
        </div>
      </div>
    </div>
  );
}
