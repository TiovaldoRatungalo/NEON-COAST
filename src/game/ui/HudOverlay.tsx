/**
 * HUD Overlay — Minimal Phase 1 HUD showing controls hint and quality preset.
 * Synthwave aesthetic with neon accent colors and monospace labels.
 * Uses inline styles for layout to avoid Tailwind v4 class resolution issues.
 */
'use client';

import { useGameStore } from '@/game/state/gameStore';

export function HudOverlay() {
  const qualityPreset = useGameStore((s) => s.qualityPreset);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const weather = useGameStore((s) => s.weather);
  const loaded = useGameStore((s) => s.loaded);

  if (!loaded) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* ── Top-right info panel ─────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
        }}
      >
        <InfoChip label="QUALITY" value={qualityPreset.toUpperCase()} accent="#ff3377" />
        <InfoChip label="TIME" value={timeOfDay.toUpperCase()} accent="#00d4ff" />
        <InfoChip label="WEATHER" value={weather.toUpperCase()} accent="#22ffaa" />
      </div>

      {/* ── Bottom-center controls bar ───────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            padding: '8px 24px',
            background: 'rgba(10,10,21,0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '2px',
            fontFamily: 'var(--font-jetbrains), monospace',
          }}
        >
          <ControlHint label="Orbit" keys="LMB" />
          <ControlHint label="Pan" keys="RMB" />
          <ControlHint label="Zoom" keys="Scroll" />
          <ControlHint label="Time" keys="T" />
          <ControlHint label="Debug" keys="~" />
          <ControlHint label="FPS" keys="P" />
        </div>
      </div>

      {/* ── Version watermark ───────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '6px',
          right: '12px',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '9px',
          color: '#334455',
          letterSpacing: '0.05em',
        }}
      >
        NEON COAST v0.1 · Phase 1
      </div>
    </div>
  );
}

function InfoChip({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 10px',
        background: 'rgba(10,10,21,0.75)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${accent}33`,
        borderRadius: '2px',
        fontFamily: 'var(--font-jetbrains), monospace',
      }}
    >
      <span style={{ fontSize: '9px', color: accent, letterSpacing: '0.15em' }}>{label}</span>
      <span style={{ fontSize: '11px', color: '#ccccdd', letterSpacing: '0.05em' }}>{value}</span>
    </div>
  );
}

function ControlHint({ label, keys }: { label: string; keys: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ fontSize: '9px', color: '#556677', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <kbd
        style={{
          fontSize: '9px',
          color: '#889999',
          padding: '1px 5px',
          borderRadius: '2px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontFamily: 'inherit',
        }}
      >
        {keys}
      </kbd>
    </div>
  );
}
