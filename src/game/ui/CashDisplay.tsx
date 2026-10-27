/**
 * CashDisplay — Top-left cash counter with animated increment.
 * Pulses green when cash increases.
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameplayStore } from '@/game/state/gameplayStore';

const MONO = 'var(--font-jetbrains), monospace';

export function CashDisplay() {
  const cash = useGameplayStore((s) => s.cash);
  const [displayed, setDisplayed] = useState(cash);
  const [pulse, setPulse]         = useState(false);
  const prevCash                  = useRef(cash);

  useEffect(() => {
    if (cash === prevCash.current) return;
    const diff = cash - prevCash.current;
    prevCash.current = cash;
    if (diff > 0) setPulse(true);

    // Animate number scrolling
    const start = displayed;
    const end   = cash;
    const duration = 800;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(start + (end - start) * ease));
      if (t < 1) requestAnimationFrame(tick);
      else setPulse(false);
    };
    requestAnimationFrame(tick);
  }, [cash]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '16px',
      zIndex: 45,
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '3px',
        padding: '6px 12px',
        background: 'rgba(10,10,21,0.8)',
        border: `1px solid ${pulse ? '#22ffaa88' : 'rgba(34,255,170,0.2)'}`,
        borderRadius: '2px',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.3s',
        boxShadow: pulse ? '0 0 20px rgba(34,255,170,0.3)' : 'none',
      }}>
        <span style={{
          fontFamily: MONO,
          fontSize: '10px',
          color: '#22ffaa',
          letterSpacing: '0.1em',
        }}>$</span>
        <span style={{
          fontFamily: MONO,
          fontSize: '18px',
          fontWeight: 700,
          color: pulse ? '#22ffaa' : '#ccffee',
          transition: 'color 0.3s',
          letterSpacing: '0.05em',
        }}>
          {displayed.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
