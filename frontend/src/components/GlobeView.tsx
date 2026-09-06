import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import { getThreatLevel } from "@/utils/threat";
import type { AttackArc } from "@/types/threat";

interface Props {
  arcs: AttackArc[];
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
      .atmosphereColor("#0ea5e9") // subtle cyan/blue
      .atmosphereAltitude(0.15)
      .arcStartLat((d: unknown) => (d as AttackArc).src_lat)
      .arcStartLng((d: unknown) => (d as AttackArc).src_lon)
      .arcEndLat((d: unknown) => (d as AttackArc).dst_lat)
      .arcEndLng((d: unknown) => (d as AttackArc).dst_lon)
      .arcColor((d: unknown) => getThreatLevel((d as AttackArc).confidence).color)
      .arcDashLength(0.4)
      .arcDashGap(2)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1500)
      .arcStroke((d: unknown) => {
        const conf = (d as AttackArc).confidence;
        return conf >= 85 ? 1.0 : conf >= 70 ? 0.7 : conf >= 45 ? 0.5 : 0.3;
      })
      .ringLat((d: unknown) => (d as AttackArc).src_lat)
      .ringLng((d: unknown) => (d as AttackArc).src_lon)
      .ringColor((d: unknown) => getThreatLevel((d as AttackArc).confidence).color)
      .ringMaxRadius((d: unknown) => ((d as AttackArc).confidence >= 85 ? 4 : 3))
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(1000);
      
    // Custom globe material for clearer oceans and visible landmass
    const globeMaterial = globe.globeMaterial() as THREE.MeshPhongMaterial;
    globeMaterial.color = new THREE.Color(0x1a2639); // Deep navy blue for oceans
    globeMaterial.emissive = new THREE.Color(0x222b44); // Slight emissive glow
    globeMaterial.emissiveIntensity = 0.2; // Keep night lights visible without washing out
    globeMaterial.shininess = 0.8;

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
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
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
  const latestThreat = latestArc ? getThreatLevel(latestArc.confidence) : null;

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
        {latestArc && latestThreat && (
          <div className="bg-slate-950/80 backdrop-blur border border-slate-800 rounded p-3 shadow-xl">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[10px] text-slate-500 font-bold tracking-widest">LATEST THREAT</div>
              <div className={`text-[9px] font-bold tracking-wider ${latestThreat.tailwindText}`}>{latestThreat.label}</div>
            </div>
            <div className={`font-mono text-sm mb-2 ${latestThreat.tailwindText}`}>{latestArc.ip}</div>
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
                <span className={`font-bold ${latestThreat.tailwindText}`}>
                  {latestArc.confidence}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Threat Legend */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <div className="bg-slate-950/60 backdrop-blur border border-slate-800/50 rounded-lg p-2.5 shadow-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
            <span className="text-cyan-400 w-14">SAFE</span>
            <span className="text-slate-500">&lt;45</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></span>
            <span className="text-yellow-400 w-14">ELEVATED</span>
            <span className="text-slate-500">45-69</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
            <span className="text-orange-500 w-14">HIGH</span>
            <span className="text-slate-500">70-84</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span className="text-red-500 w-14">CRITICAL</span>
            <span className="text-slate-500">85+</span>
          </div>
        </div>
      </div>

      {/* Bottom Counter */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
          <span className="text-xs text-slate-500 font-mono tracking-widest bg-slate-950/60 backdrop-blur px-3 py-1.5 rounded-full border border-slate-800/50">
            {Math.min(arcs.length, 75)} ACTIVE THREATS VISUALIZED
          </span>
      </div>
    </div>
  );
}
