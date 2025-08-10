"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { Mesh, MeshStandardMaterial } from "three";

function Avatar() {
  const { scene } = useGLTF("/avatar.glb");

  scene.traverse((child) => {
    if ((child as Mesh).isMesh) {
      // (child as Mesh).material = new MeshStandardMaterial({ color: "#ffffff" });
    }
  });
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

export default function AvatarScene() {
  return (
    <Canvas className="h-screen w-full">
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      <OrbitControls enableZoom={false} />
      <Avatar />
    </Canvas>
  );
}
