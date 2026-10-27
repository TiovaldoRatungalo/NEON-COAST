/**
 * StreetBlock — One handcrafted city block with roads, buildings, props, and neon signs.
 * Phase 1 showcase scene. Uses inline materials (no primitive sharing issues).
 */
'use client';

import { ProceduralBuilding } from './ProceduralBuilding';
import { NeonSign } from './NeonSign';
import { StreetLight } from './StreetLight';
import { PalmTree } from './PalmTree';

// ── Building Layout ──────────────────────────────────────────
interface BuildingDef {
  pos: [number, number, number];
  width: number;
  depth: number;
  height: number;
  color: string;
  emissive: string;
  rows: number;
  cols: number;
}

const BUILDINGS: BuildingDef[] = [
  // Left side — downtown towers
  { pos: [-26, 0, -40], width: 14, depth: 12, height: 55, color: '#1e1e32', emissive: '#ff6b35', rows: 14, cols: 5 },
  { pos: [-26, 0, -10], width: 12, depth: 14, height: 40, color: '#2a2040', emissive: '#00d4ff', rows: 10, cols: 4 },
  { pos: [-26, 0,  22], width: 16, depth: 12, height: 65, color: '#1a1a2e', emissive: '#ff3377', rows: 16, cols: 6 },
  { pos: [-26, 0,  55], width: 14, depth: 14, height: 35, color: '#252540', emissive: '#ffaa22', rows:  9, cols: 5 },

  // Right side — shops & apartments
  { pos: [26, 0, -40], width: 12, depth: 10, height: 25, color: '#2d2d42', emissive: '#22ffaa', rows:  7, cols: 4 },
  { pos: [26, 0, -10], width: 14, depth: 12, height: 45, color: '#1c1c30', emissive: '#ff6b35', rows: 11, cols: 5 },
  { pos: [26, 0,  22], width: 10, depth: 10, height: 30, color: '#282848', emissive: '#aa66ff', rows:  8, cols: 3 },
  { pos: [26, 0,  55], width: 16, depth: 14, height: 50, color: '#1a1a2e', emissive: '#00d4ff', rows: 12, cols: 6 },

  // Background skyline
  { pos: [-58, 0, -30], width: 18, depth: 16, height: 80, color: '#151528', emissive: '#ff4466', rows: 20, cols: 7 },
  { pos: [-58, 0,  30], width: 20, depth: 14, height: 70, color: '#1a1a30', emissive: '#00aaff', rows: 18, cols: 8 },
  { pos: [ 58, 0, -20], width: 16, depth: 14, height: 60, color: '#1e1e35', emissive: '#ffbb33', rows: 15, cols: 6 },
  { pos: [ 58, 0,  40], width: 14, depth: 16, height: 75, color: '#161630', emissive: '#ff66aa', rows: 19, cols: 5 },
];

// ── Neon Sign Positions ──────────────────────────────────────
const NEON_SIGNS = [
  { pos: [-19, 12, -10] as [number,number,number], rotation: [0, Math.PI/2, 0] as [number,number,number], text: 'NEON COAST', color: '#ff3377' },
  { pos: [ 19,  8, -40] as [number,number,number], rotation: [0, -Math.PI/2, 0] as [number,number,number], text: 'PARADISE',   color: '#00d4ff' },
  { pos: [-19, 15,  22] as [number,number,number], rotation: [0,  Math.PI/2, 0] as [number,number,number], text: 'HOTEL',      color: '#ffaa22' },
  { pos: [ 19, 10,  22] as [number,number,number], rotation: [0, -Math.PI/2, 0] as [number,number,number], text: 'ARCADE',     color: '#aa66ff' },
  { pos: [-19,  8,  55] as [number,number,number], rotation: [0,  Math.PI/2, 0] as [number,number,number], text: 'DRINKS',     color: '#22ffaa' },
  { pos: [ 19, 14,  55] as [number,number,number], rotation: [0, -Math.PI/2, 0] as [number,number,number], text: 'CLUB',       color: '#ff6b35' },
];

// Lane marking Z positions
const LANE_ZS = Array.from({ length: 16 }, (_, i) => -50 + i * 8);
// Crosswalk Z positions
const CROSSWALK_ZS = [-42, 8, 58];

export function StreetBlock() {
  return (
    <group>
      {/* ── Ground plane ───────────────────────────────────── */}
      <mesh receiveShadow position={[0, -0.02, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#0d0d15" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* ── Main Road ──────────────────────────────────────── */}
      <mesh receiveShadow position={[0, 0.01, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 130]} />
        <meshStandardMaterial color="#181818" roughness={0.82} metalness={0.03} />
      </mesh>

      {/* Center dashed lane markings */}
      {LANE_ZS.map((z) => (
        <mesh key={`lane-${z}`} receiveShadow position={[0, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 3.5]} />
          <meshStandardMaterial color="#cccc44" roughness={0.6} emissive="#cccc44" emissiveIntensity={0.08} />
        </mesh>
      ))}

      {/* ── Sidewalks ──────────────────────────────────────── */}
      <mesh receiveShadow castShadow position={[-12.5, 0.15, 10]}>
        <boxGeometry args={[9, 0.3, 130]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh receiveShadow castShadow position={[12.5, 0.15, 10]}>
        <boxGeometry args={[9, 0.3, 130]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Curb strips */}
      <mesh castShadow position={[-8, 0.06, 10]}>
        <boxGeometry args={[0.3, 0.12, 130]} />
        <meshStandardMaterial color="#555560" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[8, 0.06, 10]}>
        <boxGeometry args={[0.3, 0.12, 130]} />
        <meshStandardMaterial color="#555560" roughness={0.8} />
      </mesh>

      {/* ── Crosswalks ─────────────────────────────────────── */}
      {CROSSWALK_ZS.flatMap((z) =>
        Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={`cross-${z}-${i}`}
            receiveShadow
            position={[-5.4 + i * 1.8, 0.018, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[1.2, 3.5]} />
            <meshStandardMaterial color="#d8d8cc" roughness={0.75} />
          </mesh>
        ))
      )}

      {/* ── Buildings ──────────────────────────────────────── */}
      {BUILDINGS.map((b, i) => (
        <ProceduralBuilding
          key={`bldg-${i}`}
          position={b.pos}
          width={b.width}
          depth={b.depth}
          height={b.height}
          color={b.color}
          emissiveColor={b.emissive}
          windowRows={b.rows}
          windowCols={b.cols}
        />
      ))}

      {/* ── Neon Signs ─────────────────────────────────────── */}
      {NEON_SIGNS.map((sign, i) => (
        <NeonSign
          key={`neon-${i}`}
          position={sign.pos}
          rotation={sign.rotation}
          text={sign.text}
          color={sign.color}
        />
      ))}

      {/* ── Street Lights ──────────────────────────────────── */}
      {Array.from({ length: 9 }, (_, i) => (
        <StreetLight
          key={`light-l-${i}`}
          position={[-9, 0, -48 + i * 14]}
          side="left"
          realLight={i < 3}
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <StreetLight
          key={`light-r-${i}`}
          position={[9, 0, -48 + i * 14]}
          side="right"
          realLight={i < 3}
        />
      ))}

      {/* ── Palm Trees ─────────────────────────────────────── */}
      {Array.from({ length: 7 }, (_, i) => (
        <PalmTree key={`palm-l-${i}`} position={[-15.5, 0.3, -38 + i * 17]} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <PalmTree key={`palm-r-${i}`} position={[15.5, 0.3, -38 + i * 17]} />
      ))}
    </group>
  );
}
