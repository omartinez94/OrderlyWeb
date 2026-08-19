import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTranslate } from "../../hooks/useTranslate";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import "./ThreeAssetShowcase.css";

// Helper component for table diorama to animate individual table pulsate states
function TableMesh({ x, z, state, index }: { x: number; z: number; state: number; index: number }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Color match Orderly tokens (teal, aqua, amber)
  let emissiveColor = "#1F4254"; // Teal
  let color = "#EFF1ED";
  if (state === 1) {
    emissiveColor = "#98C9B0"; // Aqua
    color = "#E6F0EA";
  } else if (state === 2) {
    emissiveColor = "#F0B560"; // Amber
    color = "#FFF5E6";
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.25 + Math.sin(time * 2 + index) * 0.1;
    }
  });

  return (
    <group position={[x, -0.2, z]}>
      {/* Table cylinder */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          roughness={0.5}
          emissive={emissiveColor}
        />
      </mesh>

      {/* Glowing active state indicator ring above the table */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.2, 16]} />
        <meshBasicMaterial
          color={emissiveColor}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Surrounding tiny chairs */}
      {[-0.25, 0.25].map((cx, idx) => (
        <mesh key={idx} castShadow position={[cx, 0.08, 0]}>
          <boxGeometry args={[0.08, 0.16, 0.08]} />
          <meshStandardMaterial color="#B8C0B2" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ==========================================
// 1. Table Map Diorama Mesh (Floor Telemetry)
// ==========================================
function TableDiorama({ active, progress }: { active: boolean; progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);

  // Generate coordinate positions for 3x3 table grid
  const tables = useMemo(() => {
    const arr = [];
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        // Randomize table states (0: vacant, 1: preparing, 2: ready)
        const state = (x + z + 2) % 3;
        arr.push({ x: x * 0.8, z: z * 0.8, state });
      }
    }
    return arr;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Scale transitions (active vs inactive)
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, active ? 1 : 0, 0.1);

    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);

      // Diorama rotates slowly based on scroll progress and time
      groupRef.current.rotation.y = time * 0.1 + progress * 0.5;
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.05; // Gentle float
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Diorama base floor */}
      <mesh receiveShadow position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#D8DED5" roughness={0.9} transparent opacity={0.6} />
      </mesh>

      {/* 3x3 Table Layout */}
      {tables.map((tbl, i) => (
        <TableMesh key={i} x={tbl.x} z={tbl.z} state={tbl.state} index={i} />
      ))}
    </group>
  );
}

// ==========================================
// 2. Holographic POS Terminal (Device Sync)
// ==========================================
function DeviceSync({ active, progress }: { active: boolean; progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);
  const wireframeMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Create static floating particles flying into screen
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.0 + Math.random() * 1.5;
      arr.push({
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 2.0,
        z: Math.sin(angle) * radius,
        speed: 0.8 + Math.random() * 1.2,
        scale: 0.015 + Math.random() * 0.02,
      });
    }
    return arr;
  }, []);

  const particleRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, active ? 1 : 0, 0.1);

    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
      groupRef.current.rotation.y = -Math.PI / 4 + progress * Math.PI;
      groupRef.current.rotation.x = 0.25 + Math.sin(time * 0.8) * 0.05;
    }

    if (wireframeMatRef.current) {
      wireframeMatRef.current.opacity = 0.35 + Math.sin(time * 4) * 0.15;
    }

    // Animate particles flowing into the tablet screen (vortex flow)
    particleRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const p = particles[idx];
      const factor = (time * p.speed) % 1.0;

      // Interpolate from spawn radius to tablet center
      const currentRadius = THREE.MathUtils.lerp(2.0, 0.0, factor);
      const angle = time * p.speed + idx;

      mesh.position.x = Math.cos(angle) * currentRadius;
      mesh.position.z = Math.sin(angle) * currentRadius;
      mesh.position.y = p.y * (1.0 - factor);
      mesh.scale.setScalar(p.scale * (1.0 - factor)); // shrink as they hit tablet
    });
  });

  return (
    <group ref={groupRef}>
      {/* 3D Tablet Frame */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 1.0, 0.08]} />
        <meshStandardMaterial color="#0E141A" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Screen Solid Glass with emissive glow */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.5, 0.9]} />
        <meshStandardMaterial
          color="#1F4254"
          emissive="#4A8B98"
          emissiveIntensity={0.5 + progress * 0.5}
          roughness={0.1}
        />
      </mesh>

      {/* Glowing screen wireframe sweep (representing digital sync) */}
      <mesh position={[0, 0, 0.048]}>
        <planeGeometry args={[1.5, 0.9]} />
        <meshBasicMaterial
          ref={wireframeMatRef}
          color="#FF8A5A" // Tangerine sync light
          wireframe
          transparent
        />
      </mesh>

      {/* Floating incoming order particles */}
      {particles.map((_p, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            if (el) particleRefs.current[idx] = el;
          }}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#FF8A5A" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ==========================================
// 3. Exploded Stack of Plates (Bill Splitting)
// ==========================================
function BillSplitter({ active, progress }: { active: boolean; progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);

  // Refs for individual plates
  const p1 = useRef<THREE.Mesh>(null);
  const p2 = useRef<THREE.Mesh>(null);
  const p3 = useRef<THREE.Mesh>(null);

  // Dynamic spring targets for plate separation
  const yOffset = useRef({ p1: 0, p2: 0, p3: 0 });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, active ? 1 : 0, 0.1);

    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
      groupRef.current.rotation.y = time * 0.15;
    }

    // Plate separation (explosion) linked to scroll progress quadrant
    // When progress goes 0 -> 1, plates spread out vertically
    const targetGap = progress * 0.7; // Spread distance
    yOffset.current.p1 = THREE.MathUtils.lerp(yOffset.current.p1, -targetGap, 0.1);
    yOffset.current.p2 = THREE.MathUtils.lerp(yOffset.current.p2, 0, 0.1);
    yOffset.current.p3 = THREE.MathUtils.lerp(yOffset.current.p3, targetGap, 0.1);

    if (p1.current) p1.current.position.y = -0.4 + yOffset.current.p1;
    if (p2.current) p2.current.position.y = 0 + yOffset.current.p2;
    if (p3.current) p3.current.position.y = 0.4 + yOffset.current.p3;
  });

  return (
    <group ref={groupRef}>
      {/* Plate 1 (Bottom - main bill) */}
      <mesh ref={p1} castShadow receiveShadow position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.7, 0.6, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#F6F8F4"
          roughness={0.1}
          metalness={0.05}
          clearcoat={0.6}
          emissive="#1F4254"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Plate 2 (Middle - Seat split A) */}
      <mesh ref={p2} castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.6, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#F6F8F4"
          roughness={0.1}
          metalness={0.05}
          clearcoat={0.6}
          emissive="#4A8B98"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Plate 3 (Top - Seat split B) */}
      <mesh ref={p3} castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.7, 0.6, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#F6F8F4"
          roughness={0.1}
          metalness={0.05}
          clearcoat={0.6}
          emissive="#F26A3A"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Glowing connecting cords between split plates */}
      {active && progress > 0.1 && (
        <group>
          {/* Vertical light beam in center */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
            <meshBasicMaterial color="#4A8B98" transparent opacity={0.3 * progress} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ==========================================
// 4. Kitchen Ticket Splicer (Kitchen Routing)
// ==========================================
function KitchenSplicer({ active, progress }: { active: boolean; progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);

  const ticketRef = useRef<THREE.Mesh>(null);

  // Stream lines
  const stream1 = useRef<THREE.Mesh>(null);
  const stream2 = useRef<THREE.Mesh>(null);
  const stream3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, active ? 1 : 0, 0.1);

    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
      groupRef.current.rotation.y = -time * 0.1;
    }

    // 1. Ticket descends into prism based on progress
    const ticketY = THREE.MathUtils.lerp(1.5, 0.1, progress);
    if (ticketRef.current) {
      ticketRef.current.position.y = ticketY;
      ticketRef.current.rotation.z = Math.sin(time * 2.0) * 0.02; // Flutter
    }

    // 2. Colored streams split out of prism bottom as progress increases
    const splitScale = progress > 0.4 ? (progress - 0.4) / 0.6 : 0;
    const lerpedSplit = THREE.MathUtils.lerp(0, 1.2, splitScale);

    if (stream1.current) {
      stream1.current.position.set(
        -lerpedSplit * 0.6,
        -0.4 - lerpedSplit * 0.4,
        -lerpedSplit * 0.3,
      );
      stream1.current.scale.setScalar(splitScale);
    }
    if (stream2.current) {
      stream2.current.position.set(0, -0.5 - lerpedSplit * 0.5, lerpedSplit * 0.5);
      stream2.current.scale.setScalar(splitScale);
    }
    if (stream3.current) {
      stream3.current.position.set(lerpedSplit * 0.6, -0.4 - lerpedSplit * 0.4, -lerpedSplit * 0.3);
      stream3.current.scale.setScalar(splitScale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Master incoming ticket */}
      <mesh ref={ticketRef} castShadow position={[0, 1.5, 0]}>
        <planeGeometry args={[0.5, 0.8]} />
        <meshStandardMaterial color="#F6F8F4" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Central Glass Routing Prism */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <octahedronGeometry args={[0.45]} />
        <meshPhysicalMaterial
          color="#D8DED5"
          roughness={0.05}
          transmission={0.9}
          thickness={0.8}
          ior={1.5}
        />
      </mesh>

      {/* Split Stream A: Grill Line (Burnt Tangerine) */}
      <mesh ref={stream1} position={[-0.4, -0.5, -0.2]}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshBasicMaterial color="#FF8A5A" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>

      {/* Split Stream B: Pantry (Patina Aqua) */}
      <mesh ref={stream2} position={[0, -0.6, 0.4]}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshBasicMaterial color="#98C9B0" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>

      {/* Split Stream C: Bar (Tilled Teal) */}
      <mesh ref={stream3} position={[0.4, -0.5, -0.2]}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshBasicMaterial color="#4A8B98" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ==========================================
// 5. Parent Scroll-Deck Component
// ==========================================
export function ThreeAssetShowcase() {
  const translate = useTranslate("common");
  const { ref, progress } = useScrollProgress();
  const [hasWebGL, setHasWebGL] = useState(true);

  // Detect WebGL support for fallback safety (JSDOM/tests & legacy devices)
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const supportsWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setHasWebGL(supportsWebGL);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  // Split overall scroll progress (0 -> 1) into 4 distinct quadrants (0.0 - 0.25, etc.)
  const activeIndex = Math.min(3, Math.floor(progress * 4));

  // Compute individual progress inside each quadrant (0 -> 1)
  const quadrantProgress = (progress * 4) % 1.0;

  // Static list of asset copy mappings
  const assetData = useMemo(
    () => [
      {
        badge: translate("home.threeAssetShowcase.asset1.badge"),
        title: translate("home.threeAssetShowcase.asset1.title"),
        description: translate("home.threeAssetShowcase.asset1.description"),
      },
      {
        badge: translate("home.threeAssetShowcase.asset2.badge"),
        title: translate("home.threeAssetShowcase.asset2.title"),
        description: translate("home.threeAssetShowcase.asset2.description"),
      },
      {
        badge: translate("home.threeAssetShowcase.asset3.badge"),
        title: translate("home.threeAssetShowcase.asset3.title"),
        description: translate("home.threeAssetShowcase.asset3.description"),
      },
      {
        badge: translate("home.threeAssetShowcase.asset4.badge"),
        title: translate("home.threeAssetShowcase.asset4.title"),
        description: translate("home.threeAssetShowcase.asset4.description"),
      },
    ],
    [translate],
  );

  return (
    <section ref={ref} className="three-asset-showcase-container border-border-subtle border-t">
      <div className="three-asset-sticky">
        <div className="three-asset-layout">
          {/* Left Column: Interactive Story Crossfade */}
          <div className="three-asset-text-column">
            {assetData.map((asset, idx) => {
              const active = idx === activeIndex;
              return (
                <div
                  key={idx}
                  className={`three-asset-text-card transition-all duration-500 ease-out ${
                    active
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-4 scale-95 opacity-0"
                  }`}
                >
                  <span className="text-accent font-display mb-2 text-xs font-bold tracking-wider uppercase">
                    {asset.badge}
                  </span>
                  <h2 className="text-primary font-display mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
                    {asset.title}
                  </h2>
                  <p className="text-ink-muted font-sans text-base leading-relaxed md:text-lg">
                    {asset.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: WebGL Canvas Frame / Fallback */}
          <div className="three-asset-canvas-container">
            {hasWebGL ? (
              <Canvas
                shadows
                camera={{ fov: 45, position: [0, 0, 4.5] }}
                style={{ background: "transparent" }}
              >
                {/* Lighting setup */}
                <ambientLight intensity={0.8} />

                <directionalLight
                  position={[5, 8, 4]}
                  intensity={1.2}
                  castShadow
                  shadow-mapSize-width={512}
                  shadow-mapSize-height={512}
                />

                <pointLight
                  position={[-3, 2, 1]}
                  intensity={1.0}
                  color="#4A8B98" // Cool brand teal fill light
                />

                {/* Diorama Map Asset */}
                <TableDiorama
                  active={activeIndex === 0}
                  progress={activeIndex === 0 ? quadrantProgress : 0}
                />

                {/* POS Terminal Asset */}
                <DeviceSync
                  active={activeIndex === 1}
                  progress={activeIndex === 1 ? quadrantProgress : 0}
                />

                {/* Bill Splitter Stack Asset */}
                <BillSplitter
                  active={activeIndex === 2}
                  progress={activeIndex === 2 ? quadrantProgress : 0}
                />

                {/* Ticket Splicer Prism Asset */}
                <KitchenSplicer
                  active={activeIndex === 3}
                  progress={activeIndex === 3 ? quadrantProgress : 0}
                />

                {/* Shadow Catcher */}
                <mesh receiveShadow position={[0, -0.6, -1.0]}>
                  <planeGeometry args={[10, 10]} />
                  <shadowMaterial opacity={0.1} />
                </mesh>
              </Canvas>
            ) : (
              /* High-fidelity Static CSS Fallback */
              <div className="bg-surface-elevated border-border-strong text-ink shadow-elevation-card relative flex h-[360px] w-[320px] flex-col justify-center rounded-2xl border p-8 transition-all duration-300 select-none hover:scale-[1.02]">
                <span className="text-accent font-display mb-1.5 text-xs font-bold tracking-wider uppercase">
                  {assetData[activeIndex].badge}
                </span>
                <h3 className="text-primary font-display mb-3 text-2xl font-bold">
                  {assetData[activeIndex].title}
                </h3>
                <p className="text-ink-muted mb-6 font-sans text-sm leading-relaxed">
                  {assetData[activeIndex].description}
                </p>

                {/* Visual Placeholder Indicator */}
                <div className="border-border-subtle flex items-center gap-2 border-t pt-6">
                  {[0, 1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        dot === activeIndex ? "bg-primary w-8" : "bg-border-strong w-2.5"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
