'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled — Three.js needs the browser
const GameCanvas = dynamic(
  () => import('@/components/GameCanvas').then((mod) => mod.GameCanvas),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="w-screen h-screen">
      <GameCanvas />
    </main>
  );
}
