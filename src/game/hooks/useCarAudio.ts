/**
 * useCarAudio — WebAudio engine sound synthesiser.
 * Generates engine hum via OscillatorNode pitched by RPM.
 * No external audio files needed — pure WebAudio synthesis.
 */
'use client';

import { useEffect, useRef } from 'react';

interface CarAudioOptions {
  enabled: boolean;
  rpm: number;        // 800–8000
  volume?: number;    // 0–1
}

export function useCarAudio({ enabled, rpm, volume = 0.3 }: CarAudioOptions) {
  const ctxRef  = useRef<AudioContext | null>(null);
  const oscRef  = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  // Low sub oscillator for rumble
  const subRef  = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Stop audio
      if (oscRef.current)  { oscRef.current.stop();  oscRef.current = null; }
      if (subRef.current)  { subRef.current.stop();  subRef.current = null; }
      if (ctxRef.current)  { ctxRef.current.close(); ctxRef.current = null; }
      return;
    }

    // Start AudioContext on first enable (requires user interaction)
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;

    if (!gainRef.current) {
      gainRef.current = ctx.createGain();
      gainRef.current.gain.value = volume;
      gainRef.current.connect(ctx.destination);
    }

    if (!oscRef.current) {
      oscRef.current = ctx.createOscillator();
      oscRef.current.type = 'sawtooth';
      oscRef.current.connect(gainRef.current);
      oscRef.current.start();
    }

    if (!subRef.current) {
      subRef.current = ctx.createOscillator();
      subRef.current.type = 'square';
      const subGain = ctx.createGain();
      subGain.gain.value = 0.08;
      subRef.current.connect(subGain);
      subGain.connect(ctx.destination);
      subRef.current.start();
    }

    // Pitch = RPM mapped to Hz (idle ~800rpm → 40Hz, redline 8000 → 400Hz)
    const freq = (rpm / 8000) * 360 + 40;
    oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
    if (subRef.current) {
      subRef.current.frequency.setTargetAtTime(freq * 0.5, ctx.currentTime, 0.08);
    }

    return () => { /* oscillators persist between renders */ };
  }, [enabled, rpm, volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscRef.current?.stop();
      subRef.current?.stop();
      ctxRef.current?.close();
    };
  }, []);
}
