import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import * as topojson from "topojson-client";
import { getThreatLevel, THREAT_LEVELS } from "@/utils/threat";
import type { AttackArc } from "@/types/threat";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Constants ────────────────────────────────────────────────

const COUNTRIES_URL =
  "https://unpkg.com/world-atlas@2/countries-110m.json";

/** Convert (lat, lon) → camera position at a given distance from globe center. */
function latLonToCamera(
  lat: number,
  lon: number,
  distance: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -distance * Math.sin(phi) * Math.cos(theta),
    distance * Math.cos(phi),
    distance * Math.sin(phi) * Math.sin(theta),
  );
}

// ── Inner 3-D scene ──────────────────────────────────────────

interface GlobeInstanceProps {
  arcs: AttackArc[];
  selectedAttack: AttackArc | null;
}

function GlobeInstance({ arcs, selectedAttack }: GlobeInstanceProps) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const { scene, camera } = useThree();

  // Auto-rotate logic
  const controlsRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const interactTimeout = useRef<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Focus-animation state
  const focusTarget = useRef<THREE.Vector3 | null>(null);
  const focusProgress = useRef(0);
  const focusStartPos = useRef(new THREE.Vector3());

  const handleInteract = useCallback(() => {
    setAutoRotate(false);
    if (interactTimeout.current) clearTimeout(interactTimeout.current);
    interactTimeout.current = window.setTimeout(() => {
      setAutoRotate(true);
    }, 5000);
  }, []);

  // ── Build globe once ──────────────────────────────────────
  useEffect(() => {
    const globe = new ThreeGlobe()
      .globeImageUrl(
        "//unpkg.com/three-globe/example/img/earth-night.jpg",
      )
      .bumpImageUrl(
        "//unpkg.com/three-globe/example/img/earth-topology.png",
      )
      .showAtmosphere(true)
      .atmosphereColor("#0ea5e9")
      .atmosphereAltitude(0.15)

      // ── Arcs ──
      .arcStartLat((d: unknown) => (d as AttackArc).src_lat)
      .arcStartLng((d: unknown) => (d as AttackArc).src_lon)
      .arcEndLat((d: unknown) => (d as AttackArc).dst_lat)
      .arcEndLng((d: unknown) => (d as AttackArc).dst_lon)
      .arcDashLength(0.4)
      .arcDashGap(2)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1500)

      // ── Source rings ──
      .ringLat((d: unknown) => (d as AttackArc).src_lat)
      .ringLng((d: unknown) => (d as AttackArc).src_lon)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(1000);

    // Custom globe material
    const globeMaterial =
      globe.globeMaterial() as THREE.MeshPhongMaterial;
    globeMaterial.color = new THREE.Color(0x0a1628);
    globeMaterial.emissive = new THREE.Color(0x1a2639);
    globeMaterial.emissiveIntensity = 0.15;
    globeMaterial.shininess = 0.8;

    // ── Load country polygons ──
    fetch(COUNTRIES_URL)
      .then((res) => res.json())
      .then((topoData) => {
        const countries = topojson.feature(
          topoData,
          topoData.objects.countries,
        );
        globe
          .polygonsData(
            (countries as unknown as GeoJSON.FeatureCollection).features,
          )
          .polygonCapColor(() => "rgba(8, 18, 38, 0.85)")
          .polygonSideColor(() => "rgba(30, 58, 95, 0.25)")
          .polygonStrokeColor(() => "rgba(51, 65, 85, 0.45)")
          .polygonAltitude(0.006);
      })
      .catch((err) => console.warn("Failed to load countries:", err));

    scene.add(globe);
    globeRef.current = globe;

    return () => {
      scene.remove(globe);
      if (interactTimeout.current) clearTimeout(interactTimeout.current);
    };
  }, [scene, interactTimeout, handleInteract]);

  // ── Update arcs data + selection-aware styling ────────────
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const selectedId = selectedAttack?.id ?? null;

    globe
      .arcsData(arcs)
      .arcColor((d: unknown) => {
        const arc = d as AttackArc;
        const threat = getThreatLevel(arc.confidence);
        if (selectedId === null) {
          // No selection — show all at moderate opacity
          return threat.color + "B3"; // ~70%
        }
        return arc.id === selectedId
          ? threat.color // full opacity
          : threat.color + "55"; // ~33% — subdued
      })
      .arcStroke((d: unknown) => {
        const arc = d as AttackArc;
        const threat = getThreatLevel(arc.confidence);
        if (selectedId === null) return threat.arcThickness * 0.8;
        return arc.id === selectedId
          ? Math.max(threat.arcThickness * 1.8, 2.0)
          : threat.arcThickness * 0.5;
      })
      .ringsData(arcs)
      .ringColor((d: unknown) => {
        const arc = d as AttackArc;
        const threat = getThreatLevel(arc.confidence);
        if (selectedId === null) return threat.color + "B3";
        return arc.id === selectedId
          ? threat.color
          : threat.color + "44";
      })
      .ringMaxRadius((d: unknown) => {
        const arc = d as AttackArc;
        const threat = getThreatLevel(arc.confidence);
        if (selectedId === null) return threat.ringMaxRadius;
        return arc.id === selectedId
          ? threat.ringMaxRadius * 1.5
          : threat.ringMaxRadius * 0.7;
      });
  }, [arcs, selectedAttack]);

  // ── Focus globe on selected attack ────────────────────────
  useEffect(() => {
    if (!selectedAttack) {
      focusTarget.current = null;
      return;
    }
    const dist = camera.position.length() || 250;
    focusTarget.current = latLonToCamera(
      selectedAttack.src_lat,
      selectedAttack.src_lon,
      dist,
    );
    focusStartPos.current = camera.position.clone();
    focusProgress.current = 0;

    // Pause auto-rotate during focus
    setAutoRotate(false);
    if (interactTimeout.current) clearTimeout(interactTimeout.current);
    interactTimeout.current = window.setTimeout(() => {
      setAutoRotate(true);
    }, 5000);
  }, [selectedAttack, camera, interactTimeout]);

  // ── Animate camera focus ──────────────────────────────────
  useFrame(() => {
    if (!focusTarget.current || focusProgress.current >= 1) return;

    focusProgress.current = Math.min(focusProgress.current + 0.02, 1);
    const t = easeInOutCubic(focusProgress.current);

    camera.position.lerpVectors(
      focusStartPos.current,
      focusTarget.current,
      t,
    );
    camera.lookAt(0, 0, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  });

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
      <Stars
        radius={300}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── Outer wrapper with HUD overlays ─────────────────────────

interface Props {
  arcs: AttackArc[];
  selectedAttack: AttackArc | null;
  selectedIndex: number | null;
  onSelectPrev: () => void;
  onSelectNext: () => void;
}

export function GlobeView({
  arcs,
  selectedAttack,
  selectedIndex,
  onSelectPrev,
  onSelectNext,
}: Props) {
  const latestArc = selectedAttack ?? arcs[0] ?? null;
  const latestThreat = latestArc ? getThreatLevel(latestArc.confidence) : null;
  const hudLabel = selectedAttack ? "SELECTED THREAT" : "LATEST THREAT";

  return (
    <div className="relative h-full w-full bg-[#020617] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 250] }}>
        <GlobeInstance arcs={arcs} selectedAttack={selectedAttack} />
      </Canvas>

      {/* Live Telemetry Badge */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-mono text-xs text-slate-300 font-semibold tracking-wider">
            LIVE TELEMETRY
          </span>
        </div>
      </div>

      {/* Threat HUD (selected or latest) */}
      <div className="absolute top-4 right-4 pointer-events-none w-[220px]">
        {latestArc && latestThreat && (
          <div className="bg-slate-950/80 backdrop-blur border border-slate-800 rounded p-3 shadow-xl">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[10px] text-slate-500 font-bold tracking-widest">
                {hudLabel}
              </div>
              <div
                className={`text-[9px] font-bold tracking-wider ${latestThreat.tailwindText}`}
              >
                {latestThreat.label}
              </div>
            </div>
            <div
              className={`font-mono text-sm mb-2 ${latestThreat.tailwindText}`}
            >
              {latestArc.ip}
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">SRC</span>
                <span
                  className="text-slate-300 truncate max-w-[120px] text-right"
                  title={`${latestArc.src_city}, ${latestArc.src_country}`}
                >
                  {latestArc.src_city || latestArc.src_country}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DST</span>
                <span
                  className="text-slate-300 truncate max-w-[120px] text-right"
                  title={latestArc.dst_city}
                >
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
          {[...THREAT_LEVELS].reverse().map((threat) => (
            <div
              key={threat.level}
              className="flex items-center gap-2 text-[10px] font-mono"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: threat.color,
                  boxShadow: `0 0 8px ${threat.color}99`,
                }}
              ></span>
              <span className={`w-14 ${threat.tailwindText}`}>
                {threat.label}
              </span>
              <span className="text-slate-500">
                {threat.maxConfidence === 100
                  ? `${threat.minConfidence}+`
                  : threat.minConfidence === 0
                    ? `<${threat.maxConfidence + 1}`
                    : `${threat.minConfidence}-${threat.maxConfidence}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Threat Navigation Bar ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-full px-2 py-1.5 shadow-xl">
          <button
            onClick={onSelectPrev}
            className="flex items-center justify-center w-7 h-7 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-600 transition-colors text-slate-400 hover:text-slate-200"
            title="Previous threat"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2 min-w-[120px] justify-center">
            <span className="font-mono text-xs text-slate-300 tracking-wider">
              {selectedIndex !== null ? (
                <>
                  THREAT{" "}
                  <span className="text-cyan-400 font-bold">
                    {selectedIndex + 1}
                  </span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-500">{arcs.length}</span>
                </>
              ) : (
                <>
                  <span className="text-slate-600">—</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-500">{arcs.length}</span>
                </>
              )}
            </span>
          </div>

          <button
            onClick={onSelectNext}
            className="flex items-center justify-center w-7 h-7 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-600 transition-colors text-slate-400 hover:text-slate-200"
            title="Next threat"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom-left Counter */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <span className="text-xs text-slate-500 font-mono tracking-widest bg-slate-950/60 backdrop-blur px-3 py-1.5 rounded-full border border-slate-800/50">
          {arcs.length} ACTIVE THREATS VISUALIZED
        </span>
      </div>
    </div>
  );
}
