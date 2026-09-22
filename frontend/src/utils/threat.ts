export type ThreatLevel = "SAFE" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface ThreatClassification {
  level: ThreatLevel;
  label: string;
  color: string;
  tailwindText: string;
  tailwindBg: string;
  tailwindBorder: string;
  minConfidence: number;
  maxConfidence: number;
  arcStrokeOpacity: number;
  ringMaxRadius: number;
}

export const THREAT_LEVELS: ThreatClassification[] = [
  {
    level: "CRITICAL",
    label: "CRITICAL",
    color: "#ef4444", // red-500
    tailwindText: "text-red-500",
    tailwindBg: "bg-red-500/10",
    tailwindBorder: "border-red-500/30",
    minConfidence: 85,
    maxConfidence: 100,
    arcStrokeOpacity: 1.0,
    ringMaxRadius: 4,
  },
  {
    level: "HIGH",
    label: "HIGH",
    color: "#f97316", // orange-500
    tailwindText: "text-orange-500",
    tailwindBg: "bg-orange-500/10",
    tailwindBorder: "border-orange-500/30",
    minConfidence: 70,
    maxConfidence: 84,
    arcStrokeOpacity: 0.7,
    ringMaxRadius: 3,
  },
  {
    level: "ELEVATED",
    label: "ELEVATED",
    color: "#facc15", // yellow-400
    tailwindText: "text-yellow-400",
    tailwindBg: "bg-yellow-400/10",
    tailwindBorder: "border-yellow-400/30",
    minConfidence: 45,
    maxConfidence: 69,
    arcStrokeOpacity: 0.5,
    ringMaxRadius: 3,
  },
  {
    level: "SAFE",
    label: "SAFE",
    color: "#22d3ee", // cyan-400
    tailwindText: "text-cyan-400",
    tailwindBg: "bg-cyan-400/10",
    tailwindBorder: "border-cyan-400/30",
    minConfidence: 0,
    maxConfidence: 44,
    arcStrokeOpacity: 0.3,
    ringMaxRadius: 3,
  },
];

export function getThreatLevel(confidence: number): ThreatClassification {
  return THREAT_LEVELS.find((t) => confidence >= t.minConfidence) || THREAT_LEVELS[THREAT_LEVELS.length - 1];
}
