import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Ribbon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#10b981') }, // emerald
      uColor2: { value: new THREE.Color('#14b8a6') }, // teal
      uColor3: { value: new THREE.Color('#06b6d4') }, // cyan
    }),
    []
  );

  const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec3 pos = position;

      float wave1 = sin(pos.x * 1.2 + uTime * 0.5) * 0.4;
      float wave2 = sin(pos.x * 2.0 - uTime * 0.3) * 0.2;
      float wave3 = cos(pos.x * 0.8 + uTime * 0.4) * 0.3;

      pos.y += wave1 + wave2;
      pos.z += wave3;

      vElevation = wave1 + wave2 + wave3;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vec3 color = mix(uColor1, uColor2, vUv.x);
      color = mix(color, uColor3, sin(vUv.x * 3.14159 + uTime * 0.2) * 0.5 + 0.5);

      float glow = (vElevation + 1.0) * 0.3;
      color = mix(color, vec3(1.0), glow * 0.15);

      float alpha = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
      alpha *= smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
      alpha *= 0.5;

      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.1;
      meshRef.current.rotation.x = -0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <planeGeometry args={[14, 3, 180, 40]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 80;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#10b981"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export function FlowingRibbon() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <Ribbon />
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
