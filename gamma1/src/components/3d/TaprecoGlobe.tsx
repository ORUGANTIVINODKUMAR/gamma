import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { BackSide, BufferAttribute, BufferGeometry, Color, MathUtils, Vector3 } from 'three'
import type { Group, Sprite } from 'three'
import { getSoftSprite } from './sprite'

interface Props {
  mouse: RefObject<{ x: number; y: number }>
  mobile?: boolean
  reduced?: boolean
}

const R = 1.5

const rimVertex = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`
const rimFragment = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  uniform vec3 uRim; uniform vec3 uCore;
  void main() {
    float f = 1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
    float rim = pow(f, 2.6);
    vec3 col = mix(uCore, uRim, smoothstep(0.1, 0.9, f));
    gl_FragColor = vec4(col, 0.07 + rim * 0.5);
  }`

function latLon(lat: number, lon: number, r: number) {
  const phi = MathUtils.degToRad(90 - lat)
  const theta = MathUtils.degToRad(lon + 180)
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

function buildGraticule(radius: number) {
  const pts: number[] = []
  const seg = 72
  for (let lat = -60; lat <= 60; lat += 20) {
    for (let i = 0; i < seg; i++) {
      const a = latLon(lat, (i / seg) * 360, radius)
      const b = latLon(lat, ((i + 1) / seg) * 360, radius)
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }
  for (let lon = 0; lon < 360; lon += 20) {
    for (let i = 0; i < seg / 2; i++) {
      const a = latLon(-90 + (i / (seg / 2)) * 180, lon, radius)
      const b = latLon(-90 + ((i + 1) / (seg / 2)) * 180, lon, radius)
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3))
  return g
}

function buildDots(count: number, radius: number) {
  const arr = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const t = golden * i
    arr[i * 3] = Math.cos(t) * r * radius
    arr[i * 3 + 1] = y * radius
    arr[i * 3 + 2] = Math.sin(t) * r * radius
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(arr, 3))
  return g
}

// A handful of US financial hubs rendered as quiet glowing nodes.
const NODES: [number, number][] = [
  [40.7, -74], // New York
  [41.9, -87.6], // Chicago
  [37.8, -122.4], // San Francisco
  [29.8, -95.4], // Houston
  [38.9, -77], // Washington
  [34, -118.2], // Los Angeles
]

export default function TaprecoGlobe({ mouse, mobile, reduced }: Props) {
  const root = useRef<Group>(null)
  const spin = useRef<Group>(null)
  const orbitA = useRef<Group>(null)
  const orbitB = useRef<Group>(null)
  const halos = useRef<(Sprite | null)[]>([])

  const graticule = useMemo(() => buildGraticule(R + 0.004), [])
  const dots = useMemo(() => buildDots(mobile ? 320 : 700, R + 0.012), [mobile])
  const nodePositions = useMemo(() => NODES.map(([a, b]) => latLon(a, b, R + 0.02)), [])
  const sprite = useMemo(() => getSoftSprite(), [])
  const uniforms = useMemo(
    () => ({ uRim: { value: new Color('#cdb584') }, uCore: { value: new Color('#e9eff7') } }),
    [],
  )

  useFrame(({ clock }, dt) => {
    if (reduced) return
    const t = clock.elapsedTime
    if (spin.current) spin.current.rotation.y = -1.9 + t * 0.07
    if (root.current) {
      const m = mouse.current
      root.current.rotation.x = MathUtils.damp(root.current.rotation.x, 0.28 - m.y * 0.12, 2.5, dt)
      root.current.rotation.y = MathUtils.damp(root.current.rotation.y, m.x * 0.2, 2.5, dt)
      root.current.position.y = Math.sin(t * 0.5) * 0.05
    }
    if (orbitA.current) orbitA.current.rotation.z = t * 0.18
    if (orbitB.current) orbitB.current.rotation.z = -t * 0.12
    halos.current.forEach((h, i) => h?.scale.setScalar(0.16 + Math.sin(t * 1.2 + i * 1.3) * 0.04))
  })

  return (
    <group ref={root} rotation={[0.28, 0, 0]} scale={mobile ? 0.92 : 1}>
      <group ref={spin} rotation={[0, -1.9, 0]}>
        {/* glass body */}
        <mesh>
          <sphereGeometry args={[R, 56, 56]} />
          <meshPhysicalMaterial
            color="#f7f9fc"
            transparent
            opacity={0.16}
            roughness={0.04}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.6}
            depthWrite={false}
          />
        </mesh>
        {/* fresnel rim light */}
        <mesh scale={1.002}>
          <sphereGeometry args={[R, 56, 56]} />
          <shaderMaterial vertexShader={rimVertex} fragmentShader={rimFragment} uniforms={uniforms} transparent depthWrite={false} />
        </mesh>
        {/* inner back-face shading gives the glass a sense of thickness */}
        <mesh scale={0.985}>
          <sphereGeometry args={[R, 40, 40]} />
          <meshBasicMaterial color="#e6ebf3" transparent opacity={0.1} side={BackSide} depthWrite={false} />
        </mesh>

        <lineSegments geometry={graticule}>
          <lineBasicMaterial color="#b49c66" transparent opacity={0.38} depthWrite={false} />
        </lineSegments>

        <points geometry={dots}>
          <pointsMaterial map={sprite} size={0.034} color="#c9a962" transparent opacity={0.85} depthWrite={false} sizeAttenuation />
        </points>

        {nodePositions.map((p, i) => (
          <group key={i} position={p}>
            <mesh>
              <sphereGeometry args={[0.022, 12, 12]} />
              <meshBasicMaterial color="#b8923f" />
            </mesh>
            <sprite
              ref={(m) => {
                halos.current[i] = m
              }}
              scale={0.16}
            >
              <spriteMaterial map={sprite} color="#e3c677" transparent opacity={0.8} depthWrite={false} />
            </sprite>
          </group>
        ))}
      </group>

      {/* orbital rings with a single travelling light each */}
      <group rotation={[1.25, 0.2, 0.3]}>
        <group ref={orbitA}>
          <mesh>
            <torusGeometry args={[2.15, 0.0045, 8, 160]} />
            <meshBasicMaterial color="#c9ad74" transparent opacity={0.55} />
          </mesh>
          <mesh position={[2.15, 0, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#fff6dc" emissive="#e6c777" emissiveIntensity={0.9} />
          </mesh>
        </group>
      </group>
      <group rotation={[1.9, -0.5, 0.9]}>
        <group ref={orbitB}>
          <mesh>
            <torusGeometry args={[2.5, 0.003, 8, 160]} />
            <meshBasicMaterial color="#9fb0c7" transparent opacity={0.45} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#c9d6e8" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
