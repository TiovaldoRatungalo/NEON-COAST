import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile Three.js ecosystem packages
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing',
    '@react-three/rapier',
    'postprocessing',
  ],
  // Allow static assets from public/
  images: {
    unoptimized: true,
  },
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
};

export default nextConfig;
