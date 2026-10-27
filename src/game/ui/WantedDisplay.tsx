/**
 * WantedDisplay — Shows wanted level as neon star icons.
 * 0 stars = clean, 5 stars = max heat.
 */
'use client';

import { useGameplayStore } from '@/game/state/gameplayStore';

export function WantedDisplay() {
  const wantedLevel = useGameplayStore((s) => s.wantedLevel);
  if (wantedLevel === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 45,
      display: 'flex',
      gap: '5px',
      alignItems: 'center',
      background: 'rgba(10,10,21,0.8)',
      border: '1px solid rgba(255,50,50,0.4)',
      borderRadius: '2px',
      padding: '5px 12px',
      backdropFilter: 'blur(8px)',
      pointerEvents: 'none',
    }}>
      <span style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '9px',
        color: '#ff4444',
        letterSpacing: '0.15em',
        marginRight: '6px',
      }}>
        WANTED
      </span>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i < wantedLevel ? '#ff3333' : 'rgba(255,255,255,0.1)'}
            stroke={i < wantedLevel ? '#ff6666' : 'rgba(255,255,255,0.15)'}
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  );
}
