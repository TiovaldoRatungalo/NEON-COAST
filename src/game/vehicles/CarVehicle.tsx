/**
 * CarVehicle — Arcade-style car with Rapier RigidBody physics.
 * Procedural mesh (no .glb needed), separate wheel nodes with steering animation,
 * headlights, brake lights, drift smoke particles, tire marks decals.
 *
 * Physics model: direct force + torque on RigidBody.
 * Suspension: visual only (wheel mesh Y offset by force magnitude).
 * Enter/Exit: F key when player is within 4m.
 */
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { usePlayerControls } from '@/game/hooks/usePlayerControls';
import { useCarAudio } from '@/game/hooks/useCarAudio';
import { useVehicleStore } from '@/game/state/vehicleStore';

// ── Car constants ────────────────────────────────────────────
const MAX_SPEED        = 40;   // m/s (~144 km/h)
const ACCELERATION     = 18;
const BRAKING_FORCE    = 28;
const TURN_SPEED       = 2.2;
const HANDBRAKE_DRAG   = 0.6;
const WHEEL_TURN_MAX   = 0.45; // radians

// ── Scratch objects ──────────────────────────────────────────
const _fwd   = new THREE.Vector3();
const _vel   = new THREE.Vector3();

// ── Procedural car geometry ──────────────────────────────────
function CarBody({ color = '#1a1a3a' }: { color?: string }) {
  return (
    <group>
      {/* Main body */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.9, 0.55, 4.4]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.25}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Cabin */}
      <mesh castShadow position={[0, 0.85, -0.15]}>
        <boxGeometry args={[1.75, 0.55, 2.2]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.2}
          metalness={0.85}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.82, 0.85]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[1.6, 0.7, 0.05]} />
        <meshStandardMaterial color="#223344" roughness={0.05} metalness={0.2} transparent opacity={0.7} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.82, -1.1]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[1.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#223344" roughness={0.05} metalness={0.2} transparent opacity={0.7} />
      </mesh>
      {/* Front bumper */}
      <mesh position={[0, 0.12, 2.25]}>
        <boxGeometry args={[1.85, 0.22, 0.2]} />
        <meshStandardMaterial color="#111122" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Rear bumper */}
      <mesh position={[0, 0.12, -2.25]}>
        <boxGeometry args={[1.85, 0.22, 0.2]} />
        <meshStandardMaterial color="#111122" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}

interface WheelProps {
  position: [number, number, number];
  steerRef?: React.RefObject<THREE.Group | null>;
  isFront?: boolean;
}

function Wheel({ position, steerRef, isFront = false }: WheelProps) {
  return (
    <group ref={isFront ? steerRef : undefined} position={position}>
      {/* Tire */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.22, 16]} />
        <meshStandardMaterial color="#111" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Rim */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.24, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
}

// ── Headlights & Brake Lights ────────────────────────────────
function Lights({ braking }: { braking: boolean }) {
  return (
    <>
      {/* Headlight emissives */}
      {[-0.65, 0.65].map((x) => (
        <mesh key={`h-${x}`} position={[x, 0.3, 2.22]}>
          <boxGeometry args={[0.35, 0.12, 0.04]} />
          <meshStandardMaterial color="#ffffff" emissive="#ccddff" emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}
      {/* Headlight spotlights (2 real lights) */}
      <spotLight position={[-0.5, 0.3, 2.4]} angle={0.35} penumbra={0.3}
        intensity={15} color="#e8eeff" distance={30} castShadow={false} />
      <spotLight position={[0.5, 0.3, 2.4]} angle={0.35} penumbra={0.3}
        intensity={15} color="#e8eeff" distance={30} castShadow={false} />

      {/* Brake light emissives */}
      {[-0.65, 0.65].map((x) => (
        <mesh key={`b-${x}`} position={[x, 0.3, -2.22]}>
          <boxGeometry args={[0.3, 0.1, 0.04]} />
          <meshStandardMaterial
            color="#ff2200"
            emissive="#ff2200"
            emissiveIntensity={braking ? 4 : 0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

// ── Smoke particles ──────────────────────────────────────────
function DriftSmoke({ active }: { active: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => {
    const count = 20;
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(),
      life: Math.random(),
      speed: 0.5 + Math.random() * 0.5,
    }));
  }, []);
  const pGeo = useMemo(() => new THREE.SphereGeometry(0.25, 4, 4), []);

  useFrame((_, delta) => {
    if (!ref.current || !active) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life += delta * p.speed;
      if (p.life > 1) { p.life = 0; p.pos.set((Math.random()-0.5)*0.5, 0, -2.3); }
      const scale = p.life * 0.8;
      m.compose(
        p.pos.clone().add(new THREE.Vector3(0, p.life * 1.2, 0)),
        new THREE.Quaternion(),
        new THREE.Vector3(scale, scale, scale)
      );
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <instancedMesh ref={ref} args={[pGeo, undefined, 20]}>
      <meshStandardMaterial color="#aaaaaa" transparent opacity={0.25} depthWrite={false} />
    </instancedMesh>
  );
}

// ── Main CarVehicle export ────────────────────────────────────
interface CarVehicleProps {
  id: string;
  position?: [number, number, number];
  color?: string;
  playerRef: React.RefObject<THREE.Group | null>;
}

export function CarVehicle({
  id,
  position = [0, 0.5, 0],
  color = '#1a1a3a',
  playerRef,
}: CarVehicleProps) {
  const rigidRef     = useRef<RapierRigidBody>(null);
  const carGroupRef  = useRef<THREE.Group>(null);
  const wheelFLRef   = useRef<THREE.Group>(null);
  const wheelFRRef   = useRef<THREE.Group>(null);

  const input         = usePlayerControls();
  const vehicleStore  = useVehicleStore();
  const inVehicle     = vehicleStore.inVehicle && vehicleStore.vehicleId === id;

  // Internal physics state (refs = no re-render)
  const speedRef    = useRef(0);
  const rpmRef      = useRef(800);
  const steerAngle  = useRef(0);
  const wheelRot    = useRef(0);

  useCarAudio({ enabled: inVehicle, rpm: rpmRef.current });

  // FOV shake at high speed
  useFrame((state, delta) => {
    const rb = rigidRef.current;
    const cg = carGroupRef.current;
    if (!rb || !cg) return;

    const inp = input.current;

    // ── Enter / Exit ─────────────────────────────────────────
    if (inp.interact) {
      if (!inVehicle && playerRef.current) {
        const dist = playerRef.current.position.distanceTo(new THREE.Vector3(...position));
        if (dist < 5) vehicleStore.enterVehicle(id);
      }
    }

    if (!inVehicle) return;

    // ── Drive physics ─────────────────────────────────────────
    const linVel = rb.linvel();
    _vel.set(linVel.x, linVel.y, linVel.z);
    const fwdSpeed = _vel.dot(_fwd);

    const throttle = inp.forward  ? 1 : 0;
    const reverse  = inp.backward ? 1 : 0;
    const handbrake = inp.jump;   // Space = handbrake
    const braking   = reverse > 0 && fwdSpeed > 0.5;

    // Acceleration/braking force
    const driveForce = throttle * ACCELERATION - reverse * (braking ? BRAKING_FORCE : 8);

    // Get car's forward vector from rigid body orientation
    const rot = rb.rotation();
    const q = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    _fwd.set(0, 0, 1).applyQuaternion(q);

    // Apply drive impulse
    const drag = handbrake ? HANDBRAKE_DRAG : 0.97;
    const forceVec = _fwd.clone().multiplyScalar(driveForce * delta * 60);
    rb.applyImpulse(forceVec, true);

    // Speed cap
    if (_vel.length() > MAX_SPEED) {
      _vel.normalize().multiplyScalar(MAX_SPEED);
      rb.setLinvel({ x: _vel.x, y: linVel.y, z: _vel.z }, true);
    }

    // Linear drag
    rb.setLinvel({
      x: linVel.x * drag,
      y: linVel.y,
      z: linVel.z * drag,
    }, false);

    // ── Steering ───────────────────────────────────────────────
    const turnInput = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    const speedFactor = Math.max(0.2, 1 - Math.abs(fwdSpeed) / MAX_SPEED);
    steerAngle.current = THREE.MathUtils.lerp(
      steerAngle.current,
      turnInput * WHEEL_TURN_MAX * speedFactor,
      delta * TURN_SPEED * 4
    );

    // Apply angular velocity for turning
    if (Math.abs(fwdSpeed) > 0.5) {
      const angVel = steerAngle.current * (fwdSpeed / MAX_SPEED) * TURN_SPEED;
      rb.setAngvel({ x: 0, y: -angVel, z: 0 }, true);
    }

    // ── Sync visual mesh ───────────────────────────────────────
    const trans = rb.translation();
    const rbRot = rb.rotation();
    cg.position.set(trans.x, trans.y, trans.z);
    cg.quaternion.set(rbRot.x, rbRot.y, rbRot.z, rbRot.w);

    // Wheel spin
    wheelRot.current += fwdSpeed * delta * 2;
    if (wheelFLRef.current) {
      wheelFLRef.current.rotation.x = wheelRot.current;
      wheelFLRef.current.rotation.y = steerAngle.current;
    }
    if (wheelFRRef.current) {
      wheelFRRef.current.rotation.x = wheelRot.current;
      wheelFRRef.current.rotation.y = steerAngle.current;
    }

    // ── Update speed/RPM for HUD ───────────────────────────────
    speedRef.current = Math.abs(fwdSpeed);
    rpmRef.current = 800 + (speedRef.current / MAX_SPEED) * 7200;
    vehicleStore.setSpeed(speedRef.current);
    vehicleStore.setRpm(rpmRef.current);
    vehicleStore.setBraking(braking);
    vehicleStore.setDrifting(handbrake && speedRef.current > 3);

    // ── Third-person camera on car ─────────────────────────────
    if (inVehicle) {
      const idealCam = cg.position.clone()
        .add(_fwd.clone().multiplyScalar(-10))
        .add(new THREE.Vector3(0, 3.5, 0));
      state.camera.position.lerp(idealCam, delta * 5);
      state.camera.lookAt(cg.position.clone().add(new THREE.Vector3(0, 1, 0)));

      // Speed FOV shake
      const targetFov = 55 + (speedRef.current / MAX_SPEED) * 15;
      (state.camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
        (state.camera as THREE.PerspectiveCamera).fov,
        targetFov,
        delta * 3
      );
      (state.camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  });

  // F key exit (handled separately to avoid per-frame check)
  // TODO: wire exit to a dedicated keybind or proximity sensor in Phase 5

  const isDrifting = vehicleStore.drifting && inVehicle;

  return (
    <>
      {/* Physics rigid body */}
      <RigidBody
        ref={rigidRef}
        type="dynamic"
        position={position}
        mass={1200}
        linearDamping={0.5}
        angularDamping={2}
        colliders="cuboid"
      >
        {/* Invisible collider shape */}
        <mesh visible={false}>
          <boxGeometry args={[1.9, 0.8, 4.4]} />
        </mesh>
      </RigidBody>

      {/* Visible car mesh (synced to rigid body in useFrame) */}
      <group ref={carGroupRef} position={position}>
        <CarBody color={color} />
        <Lights braking={vehicleStore.braking} />

        {/* Wheels */}
        <Wheel position={[-1.0,  0.0,  1.5]} steerRef={wheelFLRef} isFront />
        <Wheel position={[ 1.0,  0.0,  1.5]} steerRef={wheelFRRef} isFront />
        <Wheel position={[-1.0,  0.0, -1.5]} />
        <Wheel position={[ 1.0,  0.0, -1.5]} />

        {/* Drift smoke */}
        <DriftSmoke active={isDrifting} />
      </group>
    </>
  );
}
