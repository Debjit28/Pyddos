import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import type { AttackArc } from "@/types/threat";

interface Props {
  arcs: AttackArc[];
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 90) return "#ef4444"; // red-500
  if (confidence >= 80) return "#f97316"; // orange-500
  return "#eab308"; // yellow-500
}

function GlobeInstance({ arcs }: Props) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const { scene } = useThree();

  // Auto-rotate logic
  const controlsRef = useRef(null);
  const interactTimeout = useRef<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const handleInteract = () => {
    setAutoRotate(false);
    if (interactTimeout.current) clearTimeout(interactTimeout.current);
    interactTimeout.current = window.setTimeout(() => {
      setAutoRotate(true);
    }, 3000);
  };

  useEffect(() => {
    const globe = new ThreeGlobe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#06b6d4") // cyan-500
      .atmosphereAltitude(0.15)
      .arcStartLat((d: unknown) => (d as AttackArc).src_lat)
      .arcStartLng((d: unknown) => (d as AttackArc).src_lon)
      .arcEndLat((d: unknown) => (d as AttackArc).dst_lat)
      .arcEndLng((d: unknown) => (d as AttackArc).dst_lon)
      .arcColor((d: unknown) => getConfidenceColor((d as AttackArc).confidence))
      .arcDashLength(0.4)
      .arcDashGap(2)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1500)
      .arcStroke((d: unknown) => ((d as AttackArc).confidence >= 90 ? 0.8 : 0.4))
      .ringLat((d: unknown) => (d as AttackArc).src_lat)
      .ringLng((d: unknown) => (d as AttackArc).src_lon)
      .ringColor((d: unknown) => getConfidenceColor((d as AttackArc).confidence))
      .ringMaxRadius(3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(1000);
      
    // Custom globe material for darker oceans
    const globeMaterial = globe.globeMaterial() as THREE.MeshPhongMaterial;
    globeMaterial.color = new THREE.Color(0x0a0a1a);
    globeMaterial.emissive = new THREE.Color(0x000000);
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 0.7;

    scene.add(globe);
    globeRef.current = globe;

    return () => {
      scene.remove(globe);
      if (interactTimeout.current) clearTimeout(interactTimeout.current);
    };
  }, [scene]);

  useEffect(() => {
    if (globeRef.current) {
      // Limit arcs to prevent overcrowding and maintain performance
      const displayArcs = arcs.slice(0, 75);
      globeRef.current
        .arcsData(displayArcs)
        .ringsData(displayArcs);
    }
  }, [arcs]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={150}
        maxDistance={400}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        onStart={handleInteract}
      />
      <Stars radius={300} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

export function GlobeView({ arcs }: Props) {
  const latestArc = arcs[0];

  return (
    <div className="relative h-full w-full bg-[#020617] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 250] }}>
        <GlobeInstance arcs={arcs} />
      </Canvas>
      
      {/* Live Telemetry Badge */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-mono text-xs text-slate-300 font-semibold tracking-wider">LIVE TELEMETRY</span>
        </div>
      </div>

      {/* Latest Threat HUD */}
      <div className="absolute top-4 right-4 pointer-events-none w-[220px]">
        {latestArc && (
          <div className="bg-slate-950/80 backdrop-blur border border-slate-800 rounded p-3 shadow-xl">
            <div className="text-[10px] text-slate-500 mb-1 font-bold tracking-widest">LATEST THREAT</div>
            <div className="font-mono text-sm text-red-400 mb-2">{latestArc.ip}</div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">SRC</span>
                <span className="text-slate-300 truncate max-w-[120px] text-right" title={`${latestArc.src_city}, ${latestArc.src_country}`}>
                  {latestArc.src_city || latestArc.src_country}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DST</span>
                <span className="text-slate-300 truncate max-w-[120px] text-right" title={latestArc.dst_city}>
                  {latestArc.dst_city || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between mt-1 pt-1 border-t border-slate-800">
                <span className="text-slate-500">CONFIDENCE</span>
                <span className={latestArc.confidence >= 90 ? "text-red-500 font-bold" : latestArc.confidence >= 80 ? "text-orange-500 font-bold" : "text-yellow-500 font-bold"}>
                  {latestArc.confidence}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Counter */}
      <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
          <span className="text-xs text-slate-500 font-mono tracking-widest bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800/50">
            {Math.min(arcs.length, 75)} ACTIVE THREATS VISUALIZED
          </span>
      </div>
    </div>
  );
}
