"use client";

import { useRef, useState, Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

function LogoModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouse.x * 0.5, 0.1);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, mouse.y * 0.3, 0.1);
    const targetScale = hovered ? 1.2 : 1;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <primitive
        ref={ref}
        object={scene}
        scale={2}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    </Float>
  );
}

function FallbackLogo() {
  const ref = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouse.x * 0.3, 0.1);
    const targetScale = hovered ? 1.15 : 1;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#00fff5"
            emissive="#00fff5"
            emissiveIntensity={hovered ? 1 : 0.3}
            wireframe
          />
        </mesh>
        <Html center>
          <div className="text-cyan-400 font-bold text-lg whitespace-nowrap">
            TxNB
          </div>
        </Html>
      </group>
    </Float>
  );
}

export function Logo() {
  const logoModelUrl = process.env.NEXT_PUBLIC_LOGO_MODEL;

  return (
    <Suspense fallback={<FallbackLogo />}>
      {logoModelUrl ? <LogoModel url={logoModelUrl} /> : <FallbackLogo />}
    </Suspense>
  );
}
