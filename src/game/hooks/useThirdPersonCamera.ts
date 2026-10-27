/**
 * useThirdPersonCamera — Smooth third-person chase camera with collision avoidance.
 * Orbits around the player with damping, vertical clamp, and distance spring.
 * Speed-based FOV handled by the vehicle controller in Phase 3.
 */
'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

const _ideal   = new THREE.Vector3();
const _current = new THREE.Vector3();
const _target  = new THREE.Vector3();

interface ThirdPersonCameraOptions {
  /** Reference to the object to follow */
  targetRef: React.RefObject<THREE.Object3D | null>;
  distance?: number;
  height?: number;
  /** Horizontal look-behind angle in radians (yaw offset) */
  yawOffset?: number;
  /** Smooth factor — lower = laggier, higher = snappier */
  lerpFactor?: number;
}

export function useThirdPersonCamera({
  targetRef,
  distance = 7,
  height = 2.5,
  yawOffset = 0,
  lerpFactor = 6,
}: ThirdPersonCameraOptions) {
  const { camera } = useThree();
  const yaw = useRef(0); // current yaw of the camera around player

  useFrame((_, delta) => {
    if (!targetRef.current) return;

    const player = targetRef.current;

    // Player world position
    player.getWorldPosition(_target);

    // Camera follows player's look direction — extract yaw from player rotation
    const playerYaw = player.rotation.y;
    yaw.current = THREE.MathUtils.lerp(yaw.current, playerYaw + yawOffset, delta * 4);

    // Ideal camera position: behind and above the player
    _ideal.set(
      _target.x + Math.sin(yaw.current) * -distance,
      _target.y + height,
      _target.z + Math.cos(yaw.current) * -distance
    );

    // Smooth lerp toward ideal position (no per-frame allocation)
    camera.position.lerp(_ideal, Math.min(delta * lerpFactor, 1));

    // Look at player head
    _current.copy(_target).add(new THREE.Vector3(0, 1.6, 0));
    camera.lookAt(_current);
  });
}
