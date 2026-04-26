"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      // random point in sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.5; // radius 2.5
      const sinPhi = Math.sin(phi);
      
      pos[i] = r * sinPhi * Math.cos(theta);
      pos[i+1] = r * sinPhi * Math.sin(theta);
      pos[i+2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;
    }
    const { mouse } = state;
    if (ref.current) {
        // slight parallax based on mouse
        ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mouse.x * 0.5, 0.05);
        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, mouse.y * 0.5, 0.05);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#8b5cf6" 
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export function HeroScene() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t / 4) * Math.PI;
      meshRef.current.rotation.z = Math.cos(t / 4) * Math.PI;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#00ffff" />
      <directionalLight position={[-10, -10, -5]} intensity={2} color="#ff00ff" />
      
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh ref={meshRef} scale={0.7}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial 
            color="#0f172a"
            wireframe={true}
            emissive="#3b0764"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      <Sparkles count={200} scale={4} size={1.5} speed={0.4} opacity={0.6} color="#00ffff" />
      <ParticleField />
    </>
  );
}
