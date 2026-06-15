"use client";
import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface GlobeMarker {
  lat: number;
  lng: number;
  src: string;
  label?: string;
  size?: number;
}

export interface Globe3DConfig {
  /** Globe radius */
  radius?: number;
  /** Globe base color (used as fallback or tint) */
  globeColor?: string;
  /** URL to the Earth texture map */
  textureUrl?: string;
  /** URL to the bump/elevation map for terrain */
  bumpMapUrl?: string;
  /** Whether to show atmosphere glow */
  showAtmosphere?: boolean;
  /** Atmosphere color */
  atmosphereColor?: string;
  /** Atmosphere intensity */
  atmosphereIntensity?: number;
  /** Atmosphere blur/softness (higher = more diffuse, default 3) */
  atmosphereBlur?: number;
  /** Terrain bump scale (0 = flat, higher = more pronounced) */
  bumpScale?: number;
  /** Auto rotate speed (0 = disabled) */
  autoRotateSpeed?: number;
  /** Enable zoom */
  enableZoom?: boolean;
  /** Enable pan */
  enablePan?: boolean;
  /** Min zoom distance */
  minDistance?: number;
  /** Max zoom distance */
  maxDistance?: number;
  /** Initial rotation */
  initialRotation?: { x: number; y: number };
  /** Marker default size */
  markerSize?: number;
  /** Show wireframe overlay */
  showWireframe?: boolean;
  /** Wireframe color */
  wireframeColor?: string;
  /** Ambient light intensity */
  ambientIntensity?: number;
  /** Point light intensity */
  pointLightIntensity?: number;
  /** Background color (null for transparent) */
  backgroundColor?: string | null;
}

interface Globe3DProps {
  /** Array of markers to display on the globe */
  markers?: GlobeMarker[];
  /** Globe configuration */
  config?: Globe3DConfig;
  /** Additional CSS classes */
  className?: string;
  /** Callback when a marker is clicked */
  onMarkerClick?: (marker: GlobeMarker) => void;
  /** Callback when a marker is hovered */
  onMarkerHover?: (marker: GlobeMarker | null) => void;
  isExploring?: boolean;
}

// ============================================================================
// Constants - Earth Texture URLs (NASA Blue Marble)
// ============================================================================

const DEFAULT_EARTH_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
const DEFAULT_BUMP_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png";

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert latitude/longitude to 3D cartesian coordinates
 */
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// ============================================================================
// PulsingRing Component
// ============================================================================

interface PulsingRingProps {
  position: THREE.Vector3;
  color?: string;
}

function PulsingRing({ position, color = "#00d4ff" }: PulsingRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const quaternion = useMemo(() => {
    const normal = position.clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }, [position]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = (state.clock.getElapsedTime() * 0.8) % 1.0;
    const scale = 1.0 + t * 2.5;
    const opacity = 0.8 * (1.0 - t);
    meshRef.current.scale.set(scale, scale, 1);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (mat) {
      mat.opacity = opacity;
    }
  });

  return (
    <mesh position={position} quaternion={quaternion} ref={meshRef}>
      <ringGeometry args={[0.01, 0.05, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================================================
// RouteArc Component
// ============================================================================

interface RouteArcProps {
  p1: THREE.Vector3;
  p2: THREE.Vector3;
  color?: string;
  active?: boolean;
}

function RouteArc({ p1, p2, color = "#6d5dfd", active = true }: RouteArcProps) {
  const progress = useRef(Math.random());

  const curve = useMemo(() => {
    const distance = p1.distanceTo(p2);
    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const normal = midPoint.clone().normalize();
    const baseRadius = p1.length();
    const lift = distance * 0.25 + 0.15;
    const controlPoint = normal.multiplyScalar(baseRadius + lift);
    return new THREE.QuadraticBezierCurve3(p1, controlPoint, p2);
  }, [p1, p2]);

  const points = useMemo(() => curve.getPoints(50), [curve]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const progressArr = new Float32Array(points.length);
    for (let i = 0; i < points.length; i++) {
      progressArr[i] = i / (points.length - 1);
    }
    geo.setAttribute("pct", new THREE.BufferAttribute(progressArr, 1));
    return geo;
  }, [points]);

  const routeShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) },
        time: { value: 0 },
      },
      vertexShader: `
        attribute float pct;
        varying float vPct;
        void main() {
          vPct = pct;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying float vPct;
        void main() {
          // Flowing pulse wave along the route connection line
          float tMod = mod(time * 0.4, 1.0);
          float travel = mod(vPct - tMod + 1.0, 1.0);
          float pulse = exp(-pow(travel - 0.15, 2.0) / 0.012);
          
          float opacity = 0.22 + 0.68 * pulse;
          // Feather out ends of connection curves
          float edgeFade = smoothstep(0.0, 0.12, vPct) * smoothstep(1.0, 0.88, vPct);
          
          // White-hot core for the traveling pulse to make it extremely visible and realistic
          vec3 finalColor = mix(color, vec3(0.5, 0.9, 1.0), pulse * 0.95);
          gl_FragColor = vec4(finalColor, opacity * edgeFade);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }, [color]);

  const lineMesh = useMemo(() => new THREE.Line(lineGeometry, routeShaderMaterial), [lineGeometry, routeShaderMaterial]);

  // Comet tail particles: leader is large and bright, tail is smaller and faded
  const particles = useMemo(() => [
    { scale: 1.0, opacity: 0.95, offset: 0.0 },
    { scale: 0.8, opacity: 0.7, offset: -0.015 },
    { scale: 0.6, opacity: 0.45, offset: -0.03 },
    { scale: 0.4, opacity: 0.25, offset: -0.045 },
    { scale: 0.2, opacity: 0.1, offset: -0.06 },
  ], []);

  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, delta) => {
    // Update line shader clock
    routeShaderMaterial.uniforms.time.value = state.clock.getElapsedTime();

    if (!active) return;
    progress.current = (progress.current + delta * 0.15) % 1.0;
    particles.forEach((p, idx) => {
      const mesh = particleRefs.current[idx];
      if (mesh) {
        const pVal = (progress.current + p.offset + 1.0) % 1.0;
        const pos = curve.getPointAt(pVal);
        mesh.position.copy(pos);
      }
    });
  });

  return (
    <group>
      <primitive object={lineMesh} />

      {particles.map((p, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            particleRefs.current[idx] = el;
          }}
          scale={[p.scale, p.scale, p.scale]}
        >
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={p.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================================
// Marker Component (static - rotation handled by parent group)
// ============================================================================

interface MarkerProps {
  marker: GlobeMarker;
  radius: number;
  onClick?: (marker: GlobeMarker) => void;
  onHover?: (marker: GlobeMarker | null) => void;
}

function Marker({
  marker,
  radius,
  onClick,
  onHover,
}: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Load Nova logo texture for R3F sprite
  const logoTexture = useTexture("/assets/nova.png");

  // Surface position (where the node is located)
  const surfacePosition = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, radius * 1.001);
  }, [marker.lat, marker.lng, radius]);

  // Check if marker is facing the camera
  useFrame((state) => {
    // Direction from globe center to marker
    const markerDirection = surfacePosition.clone().normalize();

    // Direction from globe center to camera
    const cameraDirection = camera.position.clone().normalize();

    // Dot product: positive means facing camera, negative means behind
    const dot = markerDirection.dot(cameraDirection);

    // Show marker only if it's facing the camera
    setIsVisible(dot > 0.15);

    // Dynamic 3D rotation of the orb on its own axis and emissive pulsing
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.getElapsedTime() * 1.5;
      const mat = orbRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const pulse = Math.sin(state.clock.getElapsedTime() * 4.0) * 0.3 + 0.7; // 0.4 to 1.0
        mat.emissive.set(hovered ? "#f97316" : "#00d4ff");
        mat.emissiveIntensity = pulse * (hovered ? 1.8 : 0.8);
      }
    }
  });

  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    setHovered(true);
    onHover?.(marker);
  }, [marker, onHover]);

  const handlePointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
    setHovered(false);
    onHover?.(null);
  }, [onHover]);

  const handleClick = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onClick?.(marker);
  }, [marker, onClick]);

  return (
    <group ref={groupRef} visible={isVisible}>
      {/* Pulsing ring at the surface */}
      <PulsingRing position={surfacePosition} color={hovered ? "#f97316" : "#00d4ff"} />

      {/* 3D Shiny Metallic Orb with Nova Logo Texture */}
      <mesh
        ref={orbRef}
        position={surfacePosition}
        scale={hovered ? [1.5, 1.5, 1.5] : [1.0, 1.0, 1.0]}
      >
        <sphereGeometry args={[0.024, 32, 32]} />
        <meshStandardMaterial
          map={logoTexture}
          roughness={0.15}
          metalness={0.85}
          emissive={hovered ? "#f97316" : "#00d4ff"}
          emissiveIntensity={hovered ? 1.8 : 0.8}
        />
      </mesh>

      {/* Larger Invisible Hover Target for Easy Interaction */}
      <mesh
        position={surfacePosition}
        onPointerOver={handlePointerEnter}
        onPointerOut={handlePointerLeave}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Sleek location tooltip on hover */}
      {hovered && isVisible && (
        <Html distanceFactor={8} center position={surfacePosition}>
          <div className="pointer-events-none select-none rounded bg-neutral-900/90 px-2.5 py-1 text-[10px] font-medium text-white shadow-lg backdrop-blur-sm ring-1 ring-white/10 whitespace-nowrap transform -translate-y-5 transition-all duration-200">
            {marker.label}
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================================================
// Rotating Globe with Markers (all rotate together)
// ============================================================================

interface RotatingGlobeProps {
  config: Required<Globe3DConfig>;
  markers: GlobeMarker[];
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

function RotatingGlobe({
  config,
  markers,
  onMarkerClick,
  onMarkerHover,
}: RotatingGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetQuaternion = useRef<THREE.Quaternion | null>(null);
  const { camera } = useThree();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  // Load Earth textures
  const [earthTexture, bumpTexture] = useTexture([
    config.textureUrl,
    config.bumpMapUrl,
  ]);

  // Configure textures
  useMemo(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      earthTexture.anisotropy = 16;
    }
    if (bumpTexture) {
      bumpTexture.anisotropy = 8;
    }
  }, [earthTexture, bumpTexture]);

  // Create geometries
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(config.radius, 64, 64);
  }, [config.radius]);

  const wireframeGeometry = useMemo(() => {
    return new THREE.SphereGeometry(config.radius * 1.002, 32, 16);
  }, [config.radius]);

  // Pre-calculate 3D vectors for markers to draw connection lines
  const markersWithCoords = useMemo(() => {
    return markers.map((m) => ({
      ...m,
      vector: latLngToVector3(m.lat, m.lng, config.radius * 1.001),
    }));
  }, [markers, config.radius]);

  // Generate connection routes between consecutive markers
  const routes = useMemo(() => {
    const list = [];
    if (markersWithCoords.length > 1) {
      for (let i = 0; i < markersWithCoords.length; i++) {
        const start = markersWithCoords[i];
        const end = markersWithCoords[(i + 1) % markersWithCoords.length];
        list.push({
          key: `route-${i}-${start.label}-${end.label}`,
          p1: start.vector,
          p2: end.vector,
        });
      }
    }
    return list;
  }, [markersWithCoords]);

  // Handle smooth rotation centering on click
  const handleMarkerClick = useCallback((marker: GlobeMarker) => {
    const localDir = latLngToVector3(marker.lat, marker.lng, 1).normalize();
    const cameraDir = camera.position.clone().normalize();
    targetQuaternion.current = new THREE.Quaternion().setFromUnitVectors(localDir, cameraDir);
    onMarkerClick?.(marker);
  }, [camera, onMarkerClick]);

  useFrame(() => {
    if (targetQuaternion.current && groupRef.current) {
      groupRef.current.quaternion.slerp(targetQuaternion.current, 0.08);
      if (groupRef.current.quaternion.angleTo(targetQuaternion.current) < 0.01) {
        targetQuaternion.current = null;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main globe mesh with Earth texture */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={config.bumpScale * 0.05}
          roughness={0.7}
          metalness={0.0}
          emissive={isLight ? "#222222" : "#000000"}
        />
      </mesh>

      {/* Wireframe overlay */}
      {config.showWireframe && (
        <mesh geometry={wireframeGeometry}>
          <meshBasicMaterial
            color={config.wireframeColor}
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      )}

      {/* Markers - now inside the rotating group */}
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}-${marker.lat}-${marker.lng}`}
          marker={marker}
          radius={config.radius}
          onClick={handleMarkerClick}
          onHover={onMarkerHover}
        />
      ))}

      {/* Route connections */}
      {routes.map((route) => (
        <RouteArc
          key={route.key}
          p1={route.p1}
          p2={route.p2}
          color="#6d5dfd"
          active={config.autoRotateSpeed > 0}
        />
      ))}
    </group>
  );
}

// ============================================================================
// Orbiting Satellite Component
// ============================================================================

interface SatelliteData {
  label: string;
  orbitRadius: number;
  speed: number;
  /** Tilt angles (radians) for the orbital plane */
  tiltX: number;
  tiltZ: number;
  /** Starting phase offset */
  phase: number;
  color: string;
}

const SKILL_SATELLITES: SatelliteData[] = [
  { label: "LLMs & GenAI", orbitRadius: 3.0, speed: 0.35, tiltX: 0.3, tiltZ: 0.1, phase: 0, color: "#6D5DFD" },
  { label: "Frameworks & Agents", orbitRadius: 3.2, speed: 0.28, tiltX: -0.5, tiltZ: 0.4, phase: Math.PI / 3, color: "#00D4FF" },
  { label: "Vector & Databases", orbitRadius: 3.4, speed: 0.32, tiltX: 0.6, tiltZ: -0.3, phase: Math.PI * 2 / 3, color: "#8B5CF6" },
  { label: "Cloud & DevOps", orbitRadius: 3.1, speed: 0.25, tiltX: -0.2, tiltZ: -0.5, phase: Math.PI, color: "#10B981" },
  { label: "Backend & APIs", orbitRadius: 3.3, speed: 0.30, tiltX: 0.4, tiltZ: 0.6, phase: Math.PI * 4 / 3, color: "#F59E0B" },
  { label: "Frontend & UI", orbitRadius: 3.5, speed: 0.22, tiltX: -0.4, tiltZ: 0.2, phase: Math.PI * 5 / 3, color: "#EF4444" },
];

interface OrbitingSatelliteProps {
  data: SatelliteData;
  globeRadius: number;
}

function OrbitingSatellite({ data, globeRadius }: OrbitingSatelliteProps) {
  const billboardGroupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);

  // Load satellite texture
  const satelliteTexture = useTexture("/assets/space_ satellite.png");

  // Trail positions buffer (circular buffer of last N positions)
  const trailCount = 40;
  const trailPositions = useRef(new Float32Array(trailCount * 3));
  const trailOpacities = useRef(new Float32Array(trailCount));
  const trailIndex = useRef(0);
  const frameCounter = useRef(0);

  // Orbital plane tilt as a quaternion
  const orbitQuaternion = useMemo(() => {
    const euler = new THREE.Euler(data.tiltX, 0, data.tiltZ);
    return new THREE.Quaternion().setFromEuler(euler);
  }, [data.tiltX, data.tiltZ]);

  // Trail geometry created imperatively
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(trailPositions.current, 3));
    geo.setAttribute("opacity", new THREE.BufferAttribute(trailOpacities.current, 1));
    return geo;
  }, []);

  // Backing Glow Halo material
  const haloMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(data.color) },
        pulse: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 color;
        uniform float pulse;
        void main() {
          float d = length(vUv - vec2(0.5));
          float glow = smoothstep(0.5, 0.0, d);
          glow = pow(glow, 2.5) * (0.45 + 0.3 * pulse);
          gl_FragColor = vec4(color, glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [data.color]);

  // Precompute RingGeometry and ShaderMaterial for Orbit Ring
  const rVal = globeRadius * (data.orbitRadius / 2);
  const ringWidth = 0.016;
  const orbitRingGeometry = useMemo(() => {
    return new THREE.RingGeometry(rVal - ringWidth / 2, rVal + ringWidth / 2, 128);
  }, [rVal]);

  const orbitMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(data.color) },
        satelliteAngle: { value: 0 },
        rAnchor: { value: rVal },
        halfWidth: { value: ringWidth / 2 },
      },
      vertexShader: `
        varying vec3 vLocalPosition;
        void main() {
          vLocalPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vLocalPosition;
        uniform vec3 color;
        uniform float satelliteAngle;
        uniform float rAnchor;
        uniform float halfWidth;
        void main() {
          float r = length(vLocalPosition.xy);
          float edgeFade = smoothstep(halfWidth, halfWidth * 0.2, abs(r - rAnchor));
          
          float angle = atan(vLocalPosition.y, vLocalPosition.x);
          if (angle < 0.0) angle += 6.2831853;
          
          float diff = angle - satelliteAngle;
          diff = mod(diff + 3.14159265, 6.2831853) - 3.14159265;
          
          float dash = step(0.18, sin(angle * 60.0));
          
          float trailAngle = -diff;
          if (trailAngle < 0.0) trailAngle += 6.2831853;
          
          float trail = exp(-trailAngle * 2.5);
          
          float opacity = (0.05 * dash + 0.65 * trail) * edgeFade;
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [data.color, rVal]);

  // Trail shader material for size-tapering fading dots
  const trailMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(data.color) },
      },
      vertexShader: `
        attribute float opacity;
        varying float vOpacity;
        void main() {
          vOpacity = opacity;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (1.5 + 3.0 * opacity) * (6.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, d) * vOpacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [data.color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * data.speed + data.phase;
    const r = globeRadius * (data.orbitRadius / 2);

    // Calculate position on a circular orbit in XZ plane
    const localPos = new THREE.Vector3(
      Math.cos(t) * r,
      0,
      Math.sin(t) * r
    );

    // Apply orbital tilt
    localPos.applyQuaternion(orbitQuaternion);

    // Billboard group positioning and camera facing
    if (billboardGroupRef.current) {
      billboardGroupRef.current.position.copy(localPos);
      billboardGroupRef.current.quaternion.copy(state.camera.quaternion);
    }

    // Gentle rotation of the satellite sprite itself
    if (meshRef.current) {
      meshRef.current.rotation.z = t * 0.4;
    }

    // Update pulsing on backing halo
    haloMaterial.uniforms.pulse.value = Math.sin(state.clock.getElapsedTime() * 5.0) * 0.5 + 0.5;

    // Update orbit ring signal sweep angle
    const currentAngle = (t % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    orbitMaterial.uniforms.satelliteAngle.value = currentAngle;

    // Update trail every 3 frames
    frameCounter.current++;
    if (frameCounter.current % 3 === 0 && trailRef.current) {
      const idx = trailIndex.current % trailCount;
      trailPositions.current[idx * 3] = localPos.x;
      trailPositions.current[idx * 3 + 1] = localPos.y;
      trailPositions.current[idx * 3 + 2] = localPos.z;
      trailIndex.current++;

      // Update opacities (newest = bright, oldest = faded)
      for (let i = 0; i < trailCount; i++) {
        const age = (trailIndex.current - i + trailCount) % trailCount;
        trailOpacities.current[i] = Math.max(0, 1 - age / trailCount) * 0.6;
      }

      trailGeometry.attributes.position.needsUpdate = true;
      const opacityAttr = trailGeometry.getAttribute("opacity") as THREE.BufferAttribute;
      if (opacityAttr) {
        opacityAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Trail particles */}
      <points ref={trailRef} geometry={trailGeometry}>
        <primitive object={trailMaterial} attach="material" />
      </points>

      {/* Billboarded Satellite & Halo */}
      <group ref={billboardGroupRef}>
        {/* Glow Halo */}
        <mesh scale={[1.6, 1.6, 1.6]}>
          <planeGeometry args={[0.22, 0.22]} />
          <primitive object={haloMaterial} attach="material" />
        </mesh>

        {/* Satellite PNG */}
        <mesh
          ref={meshRef}
          scale={hovered ? [1.4, 1.4, 1.4] : [1, 1, 1]}
        >
          <planeGeometry args={[0.22, 0.22]} />
          <meshBasicMaterial
            map={satelliteTexture}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Larger Invisible Hover Target for Easy Interaction */}
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "auto";
            setHovered(false);
          }}
        >
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Hover tooltip */}
        {hovered && (
          <Html
            distanceFactor={8}
            center
            position={[0, 0, 0]}
          >
            <div
              className="pointer-events-none select-none whitespace-nowrap transform -translate-y-6 transition-all duration-200"
              style={{
                background: "rgba(15, 15, 30, 0.85)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${data.color}40`,
                borderRadius: "8px",
                padding: "6px 14px",
                boxShadow: `0 0 16px ${data.color}30, 0 4px 12px rgba(0,0,0,0.3)`,
              }}
            >
              <span
                className="text-[11px] font-bold tracking-wide"
                style={{ color: data.color }}
              >
                {data.label}
              </span>
            </div>
          </Html>
        )}
      </group>

      {/* Orbit ring (subtle dotted circle with traveling sweep) */}
      <group quaternion={orbitQuaternion}>
        <mesh rotation={[Math.PI / 2, 0, 0]} geometry={orbitRingGeometry}>
          <primitive object={orbitMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

interface OrbitingSatellitesProps {
  globeRadius: number;
}

function OrbitingSatellites({ globeRadius }: OrbitingSatellitesProps) {
  return (
    <group>
      {SKILL_SATELLITES.map((sat, idx) => (
        <OrbitingSatellite
          key={`satellite-${idx}-${sat.label}`}
          data={sat}
          globeRadius={globeRadius}
        />
      ))}
    </group>
  );
}

// ============================================================================
// Atmosphere Component (stays static - doesn't rotate)
// ============================================================================

interface AtmosphereProps {
  radius: number;
  color: string;
  intensity: number;
  blur: number;
}

function Atmosphere({ radius, color, intensity, blur }: AtmosphereProps) {
  const fresnelPower = Math.max(0.5, 5 - blur);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        atmosphereColor: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        fresnelPower: { value: fresnelPower },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 atmosphereColor;
        uniform float intensity;
        uniform float fresnelPower;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), fresnelPower);
          gl_FragColor = vec4(atmosphereColor, fresnel * intensity);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [color, intensity, fresnelPower]);

  return (
    <mesh scale={[1.12, 1.12, 1.12]}>
      <sphereGeometry args={[radius, 64, 32]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
}

// ============================================================================
// Scene Component
// ============================================================================

interface SceneProps {
  markers: GlobeMarker[];
  config: Required<Globe3DConfig>;
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
  isExploring?: boolean;
}

function Scene({ markers, config, onMarkerClick, onMarkerHover, isExploring = false }: SceneProps) {
  const { camera, gl } = useThree();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const [autoRotateActive, setAutoRotateActive] = useState(config.autoRotateSpeed > 0);
  const autoRotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track whether we're animating the camera for the explore transition
  const isAnimatingRef = useRef(false);
  const targetZRef = useRef(config.radius * 3.1);

  // Helper: schedule auto-rotate resume after a delay
  const scheduleAutoRotateResume = useCallback((delayMs = 4000) => {
    if (autoRotateTimeoutRef.current) {
      clearTimeout(autoRotateTimeoutRef.current);
    }
    autoRotateTimeoutRef.current = setTimeout(() => {
      if (config.autoRotateSpeed > 0) {
        setAutoRotateActive(true);
      }
    }, delayMs);
  }, [config.autoRotateSpeed]);

  // Set initial camera position
  React.useEffect(() => {
    camera.position.set(0, 0, config.radius * 3.7);
    camera.lookAt(0, 0, 0);
  }, [camera, config.radius]);

  // When isExploring changes, trigger a one-shot camera Z animation
  React.useEffect(() => {
    targetZRef.current = isExploring ? config.radius * 1.5 : config.radius * 3.7;
    isAnimatingRef.current = true;
  }, [isExploring, config.radius]);

  // Only animate camera Z when a transition is active (not every frame)
  useFrame(() => {
    if (!isAnimatingRef.current) return;
    const diff = Math.abs(camera.position.z - targetZRef.current);
    if (diff < 0.01) {
      camera.position.z = targetZRef.current;
      isAnimatingRef.current = false;
    } else {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZRef.current, 0.08);
    }
  });

  const handleInteractionStart = useCallback(() => {
    setAutoRotateActive(false);
    if (autoRotateTimeoutRef.current) {
      clearTimeout(autoRotateTimeoutRef.current);
    }
  }, []);

  const handleInteractionEnd = useCallback(() => {
    scheduleAutoRotateResume(4000);
  }, [scheduleAutoRotateResume]);

  const handleMarkerClick = useCallback((marker: GlobeMarker) => {
    setAutoRotateActive(false);
    scheduleAutoRotateResume(4000);
    onMarkerClick?.(marker);
  }, [scheduleAutoRotateResume, onMarkerClick]);

  // Fallback: pointerup on the canvas DOM ensures auto-rotate resumes
  // even if OrbitControls' onEnd doesn't fire (e.g. a simple click).
  React.useEffect(() => {
    const canvas = gl.domElement;
    // Prevent touch-action conflicts on mobile so the globe is freely draggable
    canvas.style.touchAction = "none";

    const handlePointerUp = () => {
      scheduleAutoRotateResume(4000);
    };
    canvas.addEventListener("pointerup", handlePointerUp);
    return () => {
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [gl.domElement, scheduleAutoRotateResume]);

  React.useEffect(() => {
    return () => {
      if (autoRotateTimeoutRef.current) {
        clearTimeout(autoRotateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={isLight ? 1.0 : config.ambientIntensity} />
      <directionalLight
        position={[config.radius * 5, config.radius * 2, config.radius * 5]}
        intensity={isLight ? 1.3 : config.pointLightIntensity}
        color="#ffffff"
      />
      <directionalLight
        position={[-config.radius * 3, config.radius, -config.radius * 2]}
        intensity={isLight ? 0.25 : config.pointLightIntensity * 0.3}
        color="#88ccff"
      />

      {/* Rotating Globe with Markers */}
      <RotatingGlobe
        config={config}
        markers={markers}
        onMarkerClick={handleMarkerClick}
        onMarkerHover={onMarkerHover}
      />

      {/* Atmosphere (static) */}
      {config.showAtmosphere && (
        <Atmosphere
          radius={config.radius}
          color={isLight ? "#b9dbff" : config.atmosphereColor}
          intensity={isLight ? 0.6 : config.atmosphereIntensity}
          blur={config.atmosphereBlur}
        />
      )}

      {/* Orbiting skill satellites */}
      <OrbitingSatellites globeRadius={config.radius} />

      {/* Controls — full 360° rotation enabled */}
      <OrbitControls
        makeDefault
        enablePan={config.enablePan}
        enableZoom={config.enableZoom}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        rotateSpeed={0.8}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        autoRotate={autoRotateActive}
        autoRotateSpeed={config.autoRotateSpeed}
        enableDamping
        dampingFactor={0.1}
        onStart={handleInteractionStart}
        onEnd={handleInteractionEnd}
      />
    </>
  );
}

// ============================================================================
// Loading Fallback
// ============================================================================

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex shrink-0 flex-col items-center gap-3">
        <span className="inline-block shrink-0 text-sm text-neutral-400">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-sm font-semibold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 uppercase"
          >
            Loading NovaSphere AI...
          </motion.p>
        </span>
      </div>
    </Html>
  );
}

// ============================================================================
// Main Globe3D Component
// ============================================================================

const defaultConfig: Required<Globe3DConfig> = {
  radius: 2,
  globeColor: "#1a1a2e",
  textureUrl: DEFAULT_EARTH_TEXTURE,
  bumpMapUrl: DEFAULT_BUMP_TEXTURE,
  showAtmosphere: true,
  atmosphereColor: "#4da6ff",
  atmosphereIntensity: 0.8,
  atmosphereBlur: 2,
  bumpScale: 1,
  autoRotateSpeed: 0.9,
  enableZoom: true,
  enablePan: false,
  minDistance: 7.2,
  maxDistance: 8.5,
  initialRotation: { x: 0, y: 0 },
  markerSize: 0.06,
  showWireframe: false,
  wireframeColor: "#4a9eff",
  ambientIntensity: 0.6,
  pointLightIntensity: 1.5,
  backgroundColor: null,
};

export function Globe3D({
  markers = [],
  config = {},
  className,
  onMarkerClick,
  onMarkerHover,
  isExploring = false,
}: Globe3DProps) {
  const mergedConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config],
  );

  return (
    <div className={cn("relative h-[500px] w-full cursor-pointer", className)}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, mergedConfig.radius * 3.7],
        }}
        style={{
          background: mergedConfig.backgroundColor || "transparent",
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            markers={markers}
            config={mergedConfig}
            onMarkerClick={onMarkerClick}
            onMarkerHover={onMarkerHover}
            isExploring={isExploring}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Globe3D;
