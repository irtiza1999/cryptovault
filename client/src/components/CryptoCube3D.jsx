import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Edges, Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function MiniBlock({ position, hex, isActive, index }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      if (isActive) {
        const scale = 1.1 + Math.sin(state.clock.elapsedTime * 8 + index) * 0.1;
        ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        ref.current.rotation.y += 0.05;
      } else {
        ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <Box ref={ref} args={[0.9, 0.9, 0.9]}>
        <meshStandardMaterial 
          color={isActive ? "#38bdf8" : "#0f172a"} 
          roughness={0.2} 
          metalness={0.8}
          emissive={isActive ? "#0ea5e9" : "#000000"}
          emissiveIntensity={isActive ? 1.5 : 0}
        />
        <Edges scale={1.1} threshold={15} color={isActive ? "#7dd3fc" : "#334155"} />
      </Box>
      {/* Floating text strictly in front */}
      <Text
        position={[0, 0, 0.6]} 
        fontSize={0.45}
        color={isActive ? "white" : "#64748b"}
        anchorX="center"
        anchorY="middle"
      >
        {hex || '00'}
      </Text>
    </group>
  );
}

export default function CryptoCube3D({ stepIndex = 0, result }) {
  const stateHex = useMemo(() => {
    const rounds = result?.rounds || [];
    const curRound = rounds[stepIndex];
    const hex = curRound?.stateHex || "0".repeat(32);
    const parts = [];
    for (let i = 0; i < 32; i += 2) {
      parts.push(hex.slice(i, i + 2).toUpperCase());
    }
    return parts;
  }, [result, stepIndex]);

  const blocks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 16; i++) {
      const x = (i % 4) - 1.5;
      const y = Math.floor(i / 4) - 1.5;
      arr.push({ id: i, position: [x * 1.2, -y * 1.2, 0] });
    }
    return arr;
  }, []);

  return (
    <div style={{ width: '100%', height: '500px', background: 'var(--bg)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', position: 'relative', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1, pointerEvents: 'none' }}>
        <span className="pill badge-encrypt" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>AES CYBERLAB 3D</span>
      </div>

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} shadows>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#1e40af" />

        <React.Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
            <group>
              {blocks.map((block, i) => (
                <MiniBlock 
                  key={block.id} 
                  position={block.position} 
                  hex={stateHex[i]} 
                  isActive={stepIndex > 0 && i === (stateHex.length - 1 - (Math.floor(Date.now() / 250) % 16))}
                  index={i}
                />
              ))}
            </group>
          </Float>
          
          <OrbitControls enableZoom={true} />
        </React.Suspense>
      </Canvas>
      
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: '500' }}>
        Interactive AES State Matrix • 128-bit
      </div>
    </div>
  );
}
