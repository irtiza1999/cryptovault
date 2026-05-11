import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, Text, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function DataPacket({ left, right, stepIndex }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <group position={[-2.5, 0, 0]}>
        <Sphere args={[0.7, 32, 32]}>
          <meshStandardMaterial color="#3b82f6" metalness={0.9} roughness={0.2} />
        </Sphere>
        <Text position={[0, 1, 0.8]} fontSize={0.3} color="white" fontWeight="bold">L-Half</Text>
        <Text position={[0, -1.2, 0.8]} fontSize={0.18} color="#bae6fd" maxWidth={2} textAlign="center">
          {left || '0'.repeat(32)}
        </Text>
      </group>

      <group position={[2.5, 0, 0]}>
        <Sphere args={[0.7, 32, 32]}>
          <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.2} />
        </Sphere>
        <Text position={[0, 1, 0.8]} fontSize={0.3} color="white" fontWeight="bold">R-Half</Text>
        <Text position={[0, -1.2, 0.8]} fontSize={0.18} color="#fecaca" maxWidth={2} textAlign="center">
          {right || '0'.repeat(32)}
        </Text>
      </group>

      <Cylinder args={[0.04, 0.04, 3.5, 8]} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#334155" />
      </Cylinder>
    </group>
  );
}

export default function FeistelTower3D({ stepIndex = 0, result }) {
  const currentRound = result?.rounds ? result.rounds[stepIndex] : null;

  return (
    <div style={{ width: '100%', height: '500px', background: 'var(--bg)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 40 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <group position={[0, 0, 0]}>
          <Box args={[1.8, 1.8, 1.2]} position={[0, 0, -0.5]}>
            <meshStandardMaterial color="#10b981" metalness={0.8} roughness={0.2} opacity={0.6} transparent />
          </Box>
            <Text position={[0, 0, 0.8]} fontSize={0.6} color="#34d399" fontWeight="bold">F</Text>
            <DataPacket left={currentRound?.left} right={currentRound?.right} stepIndex={stepIndex} />
          </group>
        </Float>
        
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
