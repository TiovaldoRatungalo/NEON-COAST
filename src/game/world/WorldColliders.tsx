/**
 * WorldColliders — Static trimesh/box colliders for the city floor, road, and sidewalks.
 * Rapier static RigidBodies. Matches StreetBlock geometry exactly.
 */
'use client';

import { RigidBody } from '@react-three/rapier';

export function WorldColliders() {
  return (
    <>
      {/* Main ground plane */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 10]}>
        <mesh visible={false}>
          <boxGeometry args={[300, 1, 300]} />
        </mesh>
      </RigidBody>

      {/* Road surface */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 10]}>
        <mesh visible={false}>
          <boxGeometry args={[16, 0.1, 130]} />
        </mesh>
      </RigidBody>

      {/* Left sidewalk */}
      <RigidBody type="fixed" colliders="cuboid" position={[-12.5, 0.15, 10]}>
        <mesh visible={false}>
          <boxGeometry args={[9, 0.3, 130]} />
        </mesh>
      </RigidBody>

      {/* Right sidewalk */}
      <RigidBody type="fixed" colliders="cuboid" position={[12.5, 0.15, 10]}>
        <mesh visible={false}>
          <boxGeometry args={[9, 0.3, 130]} />
        </mesh>
      </RigidBody>

      {/* Left building row collider (simplified box) */}
      <RigidBody type="fixed" colliders="cuboid" position={[-26, 20, 10]}>
        <mesh visible={false}>
          <boxGeometry args={[16, 80, 130]} />
        </mesh>
      </RigidBody>

      {/* Right building row collider */}
      <RigidBody type="fixed" colliders="cuboid" position={[26, 20, 10]}>
        <mesh visible={false}>
          <boxGeometry args={[16, 80, 130]} />
        </mesh>
      </RigidBody>
    </>
  );
}
