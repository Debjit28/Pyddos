export type ThreatLevel = "SAFE" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface ThreatClassification {
  level: ThreatLevel;
  label: string;
  color: string;
  tailwindText: string;
  tailwindBg: string;
  tailwindBorder: string;
}

/**
 * Derives threat severity from a confidence score (0-100).
 * 0–44  : SAFE / LOW (Cyan)
 * 45–69 : ELEVATED (Yellow)
 * 70–84 : HIGH (Orange)
 * 85-100: CRITICAL (Red)
 */
export function getThreatLevel(confidence: number): ThreatClassification {
  if (confidence >= 85) {
    return {
      level: "CRITICAL",
      label: "CRITICAL",
      color: "#ef4444", // red-500
      tailwindText: "text-red-500",
      tailwindBg: "bg-red-500/10",
      tailwindBorder: "border-red-500/30",
    };
  }
  
  if (confidence >= 70) {
    return {
      level: "HIGH",
      label: "HIGH",
      color: "#f97316", // orange-500
      tailwindText: "text-orange-500",
      tailwindBg: "bg-orange-500/10",
      tailwindBorder: "border-orange-500/30",
    };
  }
  
  if (confidence >= 45) {
    return {
      level: "ELEVATED",
      label: "ELEVATED",
      color: "#facc15", // yellow-400
      tailwindText: "text-yellow-400", // using yellow-400 for better visibility in dark mode than 500
      tailwindBg: "bg-yellow-400/10",
      tailwindBorder: "border-yellow-400/30",
    };
  }
  
  return {
    level: "SAFE",
    label: "SAFE",
    color: "#22d3ee", // cyan-400
    tailwindText: "text-cyan-400",
    tailwindBg: "bg-cyan-400/10",
    tailwindBorder: "border-cyan-400/30",
  };
}
