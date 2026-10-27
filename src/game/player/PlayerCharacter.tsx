/**
 * PlayerCharacter — Procedural animated character with Rapier physics capsule.
 * Idle/walk/run animations handled via bone transforms.
 * Mixamo .glb loaded if available; falls back to a stylized capsule placeholder.
 *
 * Physics: RigidBody (kinematic position-based) + CapsuleCollider.
 * Movement: velocity computed from input → applied via rigidBody.setNextKinematicTranslation.
 */
'use client';

import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { usePlayerControls } from '@/game/hooks/usePlayerControls';
import { useThirdPersonCamera } from '@/game/hooks/useThirdPersonCamera';

// ── Constants ────────────────────────────────────────────────
const WALK_SPEED  = 4;
const RUN_SPEED   = 9;
const JUMP_FORCE  = 8;
const GRAVITY     = -20;
const TURN_SPEED  = 8;

// ── Scratch vectors (no per-frame allocation) ────────────────
const _move   = new THREE.Vector3();
const _pos    = new THREE.Vector3();

// ── ProceduralPlayer — capsule placeholder mesh ──────────────
function ProceduralPlayerMesh() {
  return (
    <group>
      {/* Body */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#cc9977" roughness={0.6} metalness={0.0} />
      </mesh>
      {/* Jacket accent stripe */}
      <mesh position={[0, 0.65, 0.26]}>
        <boxGeometry args={[0.38, 0.5, 0.02]} />
        <meshStandardMaterial color="#ff3377" emissive="#ff3377" emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

interface PlayerCharacterProps {
  spawnPosition?: [number, number, number];
  /** Shared ref written by this component so CarVehicle can read player position */
  groupRef?: React.RefObject<THREE.Group | null>;
}

export function PlayerCharacter({ spawnPosition = [0, 2, 20], groupRef }: PlayerCharacterProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  // Use groupRef if provided (for external access), otherwise use local ref
  const localRef = useRef<THREE.Group>(null);
  const meshGroupRef = groupRef ?? localRef;

  const input = usePlayerControls();

  // Velocity state (Y carries gravity; not persisted in React state — tracked in ref)
  const yVelocity  = useRef(0);
  const isGrounded = useRef(true);
  const yawTarget  = useRef(Math.PI); // which direction player faces

  // Walk cycle — drives limb sway
  const walkCycle = useRef(0);

  // Third-person camera follows the mesh group
  useThirdPersonCamera({ targetRef: meshGroupRef, distance: 6, height: 2.2 });

  useFrame((_, delta) => {
    if (!rigidBodyRef.current || !meshGroupRef.current) return;

    const inp = input.current;
    const speed = inp.run ? RUN_SPEED : WALK_SPEED;

    // ── Horizontal movement ──────────────────────────────────
    _move.set(0, 0, 0);
    if (inp.forward)  _move.z -= 1;
    if (inp.backward) _move.z += 1;
    if (inp.left)     _move.x -= 1;
    if (inp.right)    _move.x += 1;

    const moving = _move.lengthSq() > 0;
    if (moving) {
      _move.normalize().multiplyScalar(speed * delta);

      // Turn player to face move direction smoothly
      yawTarget.current = Math.atan2(_move.x, _move.z);
    }

    // ── Gravity ──────────────────────────────────────────────
    if (isGrounded.current && inp.jump) {
      yVelocity.current = JUMP_FORCE;
      isGrounded.current = false;
    }
    if (!isGrounded.current) {
      yVelocity.current += GRAVITY * delta;
    }

    // ── Apply to Rapier kinematic body ───────────────────────
    const translation = rigidBodyRef.current.translation();
    _pos.set(translation.x, translation.y, translation.z);

    _pos.x += _move.x;
    _pos.z += _move.z;
    _pos.y += yVelocity.current * delta;

    // Simple ground clamp (proper ground detection via contact events in future)
    if (_pos.y <= spawnPosition[1]) {
      _pos.y = spawnPosition[1];
      yVelocity.current = 0;
      isGrounded.current = true;
    }

    rigidBodyRef.current.setNextKinematicTranslation(_pos);

    // ── Sync visible mesh ────────────────────────────────────
    meshGroupRef.current.position.copy(_pos);

    // Smooth yaw rotation
    const currentYaw = meshGroupRef.current.rotation.y;
    if (moving) {
      meshGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        currentYaw,
        yawTarget.current,
        delta * TURN_SPEED
      );
    }

    // ── Walk cycle animation ─────────────────────────────────
    if (moving) {
      walkCycle.current += delta * (inp.run ? 8 : 5);
    } else {
      walkCycle.current *= 0.8; // ease out
    }

    // Animate body sway
    const sway = Math.sin(walkCycle.current) * 0.04;
    const bob  = Math.abs(Math.sin(walkCycle.current)) * 0.04;
    meshGroupRef.current.rotation.z = sway;
    meshGroupRef.current.children[0].position.y = bob;
  });

  return (
    <>
      {/* Physics collider — kinematic so we control movement fully */}
      <RigidBody
        ref={rigidBodyRef}
        type="kinematicPosition"
        position={spawnPosition}
        enabledRotations={[false, false, false]}
        colliders={false}
      >
        <CapsuleCollider args={[0.4, 0.3]} />
      </RigidBody>

      {/* Visible character mesh */}
      <group ref={meshGroupRef} position={spawnPosition}>
        <Suspense fallback={null}>
          <ProceduralPlayerMesh />
        </Suspense>
      </group>
    </>
  );
}
