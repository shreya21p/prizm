"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// ─── Vertex shader ────────────────────────────────────────────────────────────
const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;

    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
    pos.x += cos(pos.y * 8.0  + time * 1.5) * 0.05 * intensity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// ─── Fragment shader ───────────────────────────────────────────────────────────
const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3  color1;
  uniform vec3  color2;
  varying vec2  vUv;
  varying vec3  vPosition;

  void main() {
    vec2 uv = vUv;

    // Animated noise pattern
    float noise  = sin(uv.x * 20.0 + time)       * cos(uv.y * 15.0 + time * 0.8);
          noise += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;

    // Color mix
    vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
    color = mix(color, vec3(1.0), pow(abs(noise), 2.0) * intensity);

    // Radial glow
    float glow = 1.0 - length(uv - 0.5) * 2.0;
    glow = pow(max(glow, 0.0), 2.0);

    gl_FragColor = vec4(color * glow, glow * 0.75);
  }
`

// ─── ShaderPlane ──────────────────────────────────────────────────────────────
export function ShaderPlane({
  position,
  color1 = "#003366",
  color2 = "#00cfff",
}: {
  position: [number, number, number]
  color1?: string
  color2?: string
}) {
  const mesh = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      time:      { value: 0 },
      intensity: { value: 1.0 },
      color1:    { value: new THREE.Color(color1) },
      color2:    { value: new THREE.Color(color2) },
    }),
    [color1, color2],
  )

  useFrame((state) => {
    if (!mesh.current) return
    uniforms.time.value      = state.clock.elapsedTime
    uniforms.intensity.value = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.3
  })

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[2, 2, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── EnergyRing ───────────────────────────────────────────────────────────────
export function EnergyRing({
  radius = 1,
  position = [0, 0, 0] as [number, number, number],
  color = "#00cfff",
}: {
  radius?: number
  position?: [number, number, number]
  color?: string
}) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.z = state.clock.elapsedTime;
    (mesh.current.material as THREE.MeshBasicMaterial).opacity =
      0.45 + Math.sin(state.clock.elapsedTime * 3) * 0.2
  })

  return (
    <mesh ref={mesh} position={position}>
      <ringGeometry args={[radius * 0.82, radius, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── FloatingParticles ────────────────────────────────────────────────────────
export function FloatingParticles({ count = 120 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)

  const [positions, sizes] = useMemo(() => {
    const pos  = new Float32Array(count * 3)
    const siz  = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
      siz[i]         = Math.random() * 2 + 0.5
    }
    return [pos, siz]
  }, [count])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.elapsedTime * 0.04
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.025) * 0.1
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size"     args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#00cfff"
        size={0.04}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  )
}

// ─── GridLines ────────────────────────────────────────────────────────────────
export function GridLines() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    group.current.position.y = (state.clock.elapsedTime * 0.08) % 0.5
  })

  const lines = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const verts: number[] = []
    // Horizontal grid lines
    for (let y = -5; y <= 5; y += 0.5) {
      verts.push(-10, y, 0, 10, y, 0)
    }
    // Vertical grid lines
    for (let x = -10; x <= 10; x += 1) {
      verts.push(x, -5, 0, x, 5, 0)
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
    return geo
  }, [])

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#00cfff" transparent opacity={0.04} />
      </lineSegments>
    </group>
  )
}
