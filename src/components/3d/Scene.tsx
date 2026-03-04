"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Particles } from "./Particles";
import { Atmosphere } from "./Atmosphere";

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color="#00fff5" wireframe />
    </mesh>
  );
}

export function Scene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Atmosphere />
          <Particles count={3000} />
        </Suspense>
      </Canvas>
    </div>
  );
}
