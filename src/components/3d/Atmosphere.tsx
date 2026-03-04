"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Atmosphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.z = time * 0.02;
  });

  return (
    <>
      <fog attach="fog" args={["#0a0a0f", 5, 25]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="#00fff5" intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#ff00ff" intensity={0.5} />
      
      <mesh ref={meshRef} position={[0, 0, -10]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0.8} />
      </mesh>
    </>
  );
}
