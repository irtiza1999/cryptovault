import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, RoundedBox, Float, Edges } from '@react-three/drei';
import * as THREE from 'three';

function GridBlock({ char, targetPos, color, index }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.lerp(targetPos, 0.08);
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 2 + index) * 0.008;
    }
  });

  return (
    <group>
      <RoundedBox ref={ref} args={[1, 0.8, 1]} radius={0.15} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
        <Edges scale={1.1} threshold={15} color="#475569" />
      </RoundedBox>
      <Text 
        position={[targetPos.x, targetPos.y, targetPos.z + 0.6]} 
        fontSize={0.65} 
        color="white" 
        anchorX="center" 
        anchorY="middle"
        fontWeight="bold"
      >
        {char || ' '}
      </Text>
    </group>
  );
}

export default function TranspositionGrid3D({ stepIndex = 0, result }) {
  const matrix = result?.intermediate?.firstMatrix || [];
  const permuted = result?.intermediate?.firstPermuted || [];
  
  const blocks = useMemo(() => {
    if (!matrix.length) return [];
    const rows = matrix.length;
    const cols = matrix[0].length;
    const data = [];

    matrix.forEach((row, r) => {
      row.forEach((char, c) => {
        const xOrig = c - (cols / 2) + 0.5;
        const zOrig = r - (rows / 2) + 0.5;
        let xTarget = xOrig;
        let zTarget = zOrig;

        if (stepIndex > 0 && permuted[r]) {
          const targetCol = permuted[r].indexOf(char);
          xTarget = targetCol - (cols / 2) + 0.5;
        }

        data.push({
          id: `r${r}-c${c}`,
          char,
          orig: new THREE.Vector3(xOrig * 1.8, 0, zOrig * 1.8),
          target: new THREE.Vector3(xTarget * 1.8, 0, zTarget * 1.8),
          color: (r + c) % 2 === 0 ? "#115e59" : "#1e40af"
        });
      });
    });
    return data;
  }, [matrix, permuted, stepIndex]);

  return (
    <div style={{ width: '100%', height: '500px', background: 'var(--bg)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', position: 'relative' }}>
      <Canvas camera={{ position: [0, 12, 6], fov: 40 }} shadows>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[0, 20, 0]} angle={0.2} penumbra={1} intensity={2} castShadow />

        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
          <group>
            {blocks.map((block) => (
              <GridBlock 
                key={block.id} 
                char={block.char} 
                targetPos={stepIndex > 0 ? block.target : block.orig} 
                color={block.color}
                index={parseInt(block.id.split('c')[1])}
              />
            ))}
          </group>
        </Float>
        
        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}
