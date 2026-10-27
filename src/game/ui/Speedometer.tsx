/**
 * Speedometer — Circular gauge HUD element.
 * Shows speed in km/h, RPM arc, and current gear.
 */
'use client';

import { useVehicleStore } from '@/game/state/vehicleStore';

const MONO = 'var(--font-jetbrains), monospace';

function Arc({ pct, color, radius = 52, stroke = 5 }: {
  pct: number; color: string; radius?: number; stroke?: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(pct, 1) * 0.75; // 270° sweep
  return (
    <circle
      cx="60" cy="60" r={radius}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeDasharray={`${dash} ${circumference}`}
      strokeDashoffset={circumference * 0.125} // start at 135°
      strokeLinecap="round"
      transform="rotate(135 60 60)"
    />
  );
}

export function Speedometer() {
  const { inVehicle, speed, rpm, gear } = useVehicleStore();
  if (!inVehicle) return null;

  const kmh   = Math.round(speed * 3.6);
  const rpmPct = rpm / 8000;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '140px',
      height: '140px',
      zIndex: 45,
      pointerEvents: 'none',
    }}>
      {/* SVG gauge */}
      <svg viewBox="0 0 120 120" width="140" height="140">
        {/* Background arc */}
        <Arc pct={1} color="rgba(255,255,255,0.06)" />
        {/* RPM arc */}
        <Arc pct={rpmPct} color={rpmPct > 0.8 ? '#ff3333' : '#ff6b35'} />
        {/* Speed arc inner */}
        <Arc pct={kmh / 220} color="#00d4ff" radius={44} stroke={4} />

        {/* Speed readout */}
        <text x="60" y="55" textAnchor="middle" fill="#ffffff"
          fontSize="20" fontWeight="700"
          fontFamily={MONO}>
          {kmh}
        </text>
        <text x="60" y="67" textAnchor="middle" fill="#667788"
          fontSize="7" fontFamily={MONO}>
          KM/H
        </text>
        {/* Gear */}
        <text x="60" y="82" textAnchor="middle" fill="#ff6b35"
          fontSize="11" fontWeight="700"
          fontFamily={MONO}>
          {gear}
        </text>
        <text x="60" y="90" textAnchor="middle" fill="#445566"
          fontSize="6" fontFamily={MONO}>
          GEAR
        </text>
      </svg>
    </div>
  );
}
