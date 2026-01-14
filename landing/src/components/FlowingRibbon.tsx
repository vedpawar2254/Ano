import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Ribbon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#8b5cf6') },
      uColor2: { value: new THREE.Color('#ec4899') },
      uColor3: { value: new THREE.Color('#f97316') },
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

      // More dramatic wave animations
      float wave1 = sin(pos.x * 1.5 + uTime * 0.8) * 0.5;
      float wave2 = sin(pos.x * 2.5 - uTime * 0.5) * 0.3;
      float wave3 = cos(pos.x * 1.0 + uTime * 0.6) * 0.4;
      float wave4 = sin(pos.y * 3.0 + uTime * 0.4) * 0.2;

      pos.y += wave1 + wave2;
      pos.z += wave3 + wave4;

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
      // Dynamic color mixing based on position and time
      float t = sin(uTime * 0.3) * 0.5 + 0.5;
      vec3 color = mix(uColor1, uColor2, vUv.x);
      color = mix(color, uColor3, sin(vUv.x * 3.14159 + uTime * 0.3) * 0.5 + 0.5);

      // Add glow based on elevation
      float glow = (vElevation + 1.0) * 0.5;
      color = mix(color, vec3(1.0), glow * 0.2);

      // Smooth edges
      float alpha = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
      alpha *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
      alpha *= 0.7;

      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.15;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.08) * 0.05 - 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} rotation={[-0.3, 0, 0.1]}>
      <planeGeometry args={[12, 4, 200, 50]} />
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

function SecondaryRibbon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#6366f1') },
      uColor2: { value: new THREE.Color('#a855f7') },
    }),
    []
  );

  const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;

      float wave1 = sin(pos.x * 2.0 - uTime * 0.6) * 0.3;
      float wave2 = cos(pos.x * 1.5 + uTime * 0.4) * 0.2;

      pos.y += wave1;
      pos.z += wave2;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec3 color = mix(uColor1, uColor2, vUv.x + sin(uTime * 0.2) * 0.2);

      float alpha = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
      alpha *= 0.4;

      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15 + 1) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -1, -1]} rotation={[-0.1, 0.2, -0.1]}>
      <planeGeometry args={[10, 2, 150, 30]} />
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
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
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
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function GlowingSpheres() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={group}>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 5,
            Math.sin((i / 5) * Math.PI * 2) * 2,
            Math.sin((i / 5) * Math.PI * 2) * 3 - 2,
          ]}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#8b5cf6' : '#ec4899'}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
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
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.5} />
        <Ribbon />
        <SecondaryRibbon />
        <FloatingParticles />
        <GlowingSpheres />
      </Canvas>
    </div>
  );
}
