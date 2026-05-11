import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Torus, Text, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function Ring({ radius, thickness, color, isInner, stepIndex, currentMapping }) {
  const groupRef = useRef();
  const letters = useMemo(() => {
    return ALPHABET.map((letter, i) => {
      const angle = (i / 26) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      let displayLetter = letter;
      if (isInner && currentMapping && currentMapping[letter]) {
        displayLetter = currentMapping[letter];
      }
      return { letter: displayLetter, position: [x, 0, z], rotation: [0, -angle + Math.PI / 2, 0] };
    });
  }, [radius, isInner, currentMapping]);

  useFrame((state) => {
    if (isInner && groupRef.current && currentMapping?.activeIndex !== undefined) {
      const activeAngle = (currentMapping.activeIndex / 26) * Math.PI * 2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -activeAngle, 0.05);
    } else if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <Torus args={[radius, thickness, 32, 128]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Torus>
      {letters.map((l, i) => {
        const isActive = currentMapping?.activeIndex === i;
        return (
          <group key={i} position={l.position} rotation={l.rotation}>
            <Text
              position={[0, thickness + 0.3, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.5}
              color={isActive ? "#0ea5e9" : "#ffffff"}
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
            >
              {l.letter}
            </Text>
            {isActive && (
              <pointLight position={[0, 0.8, 0]} distance={3} intensity={3} color="#0ea5e9" />
            )}
          </group>
        )
      })}
    </group>
  );
}

export default function CipherRings3D({ stepIndex = 0, result }) {
  const currentStep = result?.steps ? result.steps[stepIndex] : null;
  const currentMapping = useMemo(() => {
    if (!currentStep) return null;
    const charIn = (currentStep.in || "").toUpperCase();
    const activeIndex = ALPHABET.indexOf(charIn);
    return { activeIndex, in: currentStep.in, out: currentStep.out };
  }, [currentStep]);

  return (
    <div style={{ width: '100%', height: '500px', background: 'var(--bg)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', position: 'relative' }}>
      <Canvas camera={{ position: [0, 10, 0], fov: 45 }} shadows>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <spotLight position={[15, 15, 15]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Ring radius={3.5} thickness={0.3} color="#0f172a" isInner={false} stepIndex={stepIndex} currentMapping={currentMapping} />
          <Ring radius={2.6} thickness={0.3} color="#1e293b" isInner={true} stepIndex={stepIndex} currentMapping={currentMapping} />
        </Float>

        <OrbitControls enableZoom={true} minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}
