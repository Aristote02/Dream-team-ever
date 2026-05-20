import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Environment, MeshDistortMaterial, Icosahedron, Torus } from "@react-three/drei";
import type { Mesh, Group } from "three";

function GoldOrb() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.18;
    ref.current.rotation.y = state.clock.elapsedTime * 0.25;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <Icosahedron ref={ref} args={[1.35, 4]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#f59e0b"
          emissive="#92400e"
          emissiveIntensity={0.35}
          roughness={0.18}
          metalness={0.95}
          distort={0.38}
          speed={1.6}
        />
      </Icosahedron>
    </Float>
  );
}

function Rings() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.z = state.clock.elapsedTime * 0.15;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });
  return (
    <group ref={group}>
      <Torus args={[2.2, 0.018, 16, 120]} rotation={[Math.PI / 2.4, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.6} metalness={1} roughness={0.2} />
      </Torus>
      <Torus args={[2.7, 0.012, 16, 120]} rotation={[Math.PI / 2.8, Math.PI / 5, 0]}>
        <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.4} metalness={1} roughness={0.3} />
      </Torus>
      <Torus args={[3.3, 0.008, 16, 120]} rotation={[Math.PI / 2.2, -Math.PI / 6, 0]}>
        <meshStandardMaterial color="#fcd34d" emissive="#92400e" emissiveIntensity={0.3} metalness={1} roughness={0.4} />
      </Torus>
    </group>
  );
}

function OrbitingShards() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.4;
  });
  const shards = Array.from({ length: 8 });
  return (
    <group ref={group}>
      {shards.map((_, i) => {
        const angle = (i / shards.length) * Math.PI * 2;
        const r = 2.6;
        return (
          <Float key={i} speed={1.2 + i * 0.1} floatIntensity={0.6}>
            <mesh position={[Math.cos(angle) * r, Math.sin(angle * 0.7) * 0.5, Math.sin(angle) * r]}>
              <octahedronGeometry args={[0.12, 0]} />
              <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={1} metalness={1} roughness={0.2} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export function Hero3DScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-full" aria-hidden />;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={2.5} color="#fbbf24" />
      <pointLight position={[-5, -3, -3]} intensity={1.5} color="#b45309" />
      <spotLight position={[0, 6, 4]} intensity={1.2} angle={0.5} penumbra={1} color="#fde68a" />
      <Suspense fallback={null}>
        <GoldOrb />
        <Rings />
        <OrbitingShards />
        <Stars radius={20} depth={30} count={1200} factor={3} fade speed={1} />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}