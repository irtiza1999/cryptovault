import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Tube, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

class SpiralCurve extends THREE.Curve {
  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const turns = 6;
    const radius = 3.5;
    const height = 8;
    const angle = t * Math.PI * 2 * turns;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (t - 0.5) * height;
    return optionalTarget.set(x, y, z);
  }
}

function DataParticle({ stepIndex, value, totalSteps }) {
  const ref = useRef();
  const curve = useMemo(() => new SpiralCurve(), []);
  
  useFrame((state) => {
    if (ref.current) {
      const progress = totalSteps > 0 ? stepIndex / (totalSteps - 1) : 0;
      const pos = curve.getPoint(progress);
      ref.current.position.lerp(pos, 0.1);
    }
  });

  return (
    <group>
      <Sphere ref={ref} args={[0.5, 16, 16]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
      </Sphere>
      {value && (
        <Text
          position={[0, 1.5, 0.5]}
          fontSize={0.4}
          color="#fbbf24"
          fontWeight="bold"
        >
          {String(value)}
        </Text>
      )}
    </group>
  );
}

export default function RSAClock3D({ stepIndex = 0, result }) {
  const curve = useMemo(() => new SpiralCurve(), []);
  const steps = result?.steps || [];
  const currentStep = steps[stepIndex];

  return (
    <div style={{ width: '100%', height: '500px', background: '#020617', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <group>
            <Tube args={[curve, 100, 0.05, 8, false]}>
              <meshStandardMaterial color="#334155" wireframe transparent opacity={0.3} />
            </Tube>
            <DataParticle 
              stepIndex={stepIndex} 
              value={currentStep?.value || currentStep?.formula} 
              totalSteps={steps.length}
            />
          </group>
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}
