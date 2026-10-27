/**
 * LoadingScreen — Synthwave-styled loading screen with animated progress.
 * Auto-dismisses when assets finish loading, or after a brief delay if no assets.
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useProgress } from '@react-three/drei';
import { useGameStore } from '@/game/state/gameStore';

export function LoadingScreen() {
  const { progress, active } = useProgress();
  const setLoaded = useGameStore((s) => s.setLoaded);
  const setLoadProgress = useGameStore((s) => s.setLoadProgress);
  const loaded = useGameStore((s) => s.loaded);
  const [fadeOut, setFadeOut] = useState(false);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [hasRealAssets, setHasRealAssets] = useState(false);
  const hasRealAssetsRef = useRef(false);
  const dismissedRef = useRef(false);

  // Track when real loading starts
  useEffect(() => {
    if (active) {
      hasRealAssetsRef.current = true;
      setHasRealAssets(true);
    }
  }, [active]);

  // Sync real progress to store
  useEffect(() => {
    if (hasRealAssetsRef.current) {
      setLoadProgress(progress);
    }
  }, [progress, setLoadProgress]);

  // Handle dismissal — no-assets case and real completion
  useEffect(() => {
    if (dismissedRef.current || loaded) return;

    // No assets to load: simulate progress and dismiss
    const noAssetsTimer = setTimeout(() => {
      if (!hasRealAssetsRef.current && !dismissedRef.current) {
        dismissedRef.current = true;
        // Animate fake progress from 0 → 100
        let p = 0;
        const interval = setInterval(() => {
          p += 12;
          setFakeProgress(Math.min(p, 100));
          if (p >= 100) {
            clearInterval(interval);
            setLoadProgress(100);
            setTimeout(() => {
              setFadeOut(true);
              setTimeout(() => setLoaded(true), 600);
            }, 400);
          }
        }, 60);
      }
    }, 300);

    return () => clearTimeout(noAssetsTimer);
  }, [loaded, setLoaded, setLoadProgress]);

  // Real assets finished loading
  useEffect(() => {
    if (dismissedRef.current || loaded) return;
    if (progress >= 100 && !active && hasRealAssetsRef.current) {
      dismissedRef.current = true;
      setLoadProgress(100);
      const t = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setLoaded(true), 600);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [progress, active, loaded, setLoaded, setLoadProgress]);

  if (loaded) return null;

  // Display progress: real if assets loaded, fake otherwise
  const displayProgress = hasRealAssets ? Math.min(progress, 100) : fakeProgress;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050510',
        transition: 'opacity 0.5s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      {/* Logo */}
      <div style={{ position: 'relative', marginBottom: '48px' }}>
        <h1
          style={{
            fontSize: '4rem',
            fontWeight: 900,
            letterSpacing: '0.3em',
            backgroundImage: 'linear-gradient(135deg, #ff3377, #ff6b35, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            userSelect: 'none',
            margin: 0,
          }}
        >
          NEON COAST
        </h1>
        {/* Mirror reflection */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            fontSize: '4rem',
            fontWeight: 900,
            letterSpacing: '0.3em',
            backgroundImage: 'linear-gradient(135deg, #ff3377, #ff6b35, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transform: 'scaleY(-1)',
            opacity: 0.18,
            maskImage: 'linear-gradient(to top, black 0%, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 70%)',
            userSelect: 'none',
          }}
        >
          NEON COAST
        </div>
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '11px',
          letterSpacing: '0.5em',
          color: '#667788',
          textTransform: 'uppercase',
          marginBottom: '60px',
        }}
      >
        Loading City
      </p>

      {/* Progress bar */}
      <div style={{ width: '320px' }}>
        <div
          style={{
            height: '2px',
            width: '100%',
            backgroundColor: '#1a1a2e',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${displayProgress}%`,
              background: 'linear-gradient(90deg, #ff3377, #ff6b35, #00d4ff)',
              boxShadow: '0 0 16px rgba(255,51,119,0.6)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '11px',
            color: '#445566',
          }}
        >
          <span>{Math.round(displayProgress)}%</span>
          <span>{displayProgress >= 100 ? 'READY' : 'LOADING...'}</span>
        </div>
      </div>

      {/* Corner brackets */}
      {[
        { top: '24px', left: '24px', borderLeft: '1px solid #ff337733', borderTop: '1px solid #ff337733' },
        { top: '24px', right: '24px', borderRight: '1px solid #ff337733', borderTop: '1px solid #ff337733' },
        { bottom: '24px', left: '24px', borderLeft: '1px solid #ff337733', borderBottom: '1px solid #ff337733' },
        { bottom: '24px', right: '24px', borderRight: '1px solid #ff337733', borderBottom: '1px solid #ff337733' },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...s }} />
      ))}

      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.03,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)',
        }}
      />
    </div>
  );
}
