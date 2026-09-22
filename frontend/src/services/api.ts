import type {
  AttackArc,
  AttackStats,
  RefreshResult,
  TrendSummary,
  TrendPeriod,
  Layer3Summary,
} from "@/types/threat";
import { MAX_ARCS } from "@/utils/threat";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

// ── Helpers ──────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Attack endpoints ─────────────────────────────────────────

export function fetchArcs(limit = MAX_ARCS): Promise<AttackArc[]> {
  return request<AttackArc[]>(`/api/attacks/arcs?limit=${limit}`);
}

export function fetchStats(): Promise<AttackStats> {
  return request<AttackStats>("/api/attacks/stats");
}

export function refreshAttacks(): Promise<RefreshResult> {
  return request<RefreshResult>("/api/attacks/refresh", { method: "POST" });
}

// ── Trend endpoints ──────────────────────────────────────────

export function fetchHttpTrends(period: TrendPeriod): Promise<TrendSummary> {
  return request<TrendSummary>(`/api/trends/http?period=${period}`);
}

/**
 * Layer 3 protocol breakdown endpoint
 */
export function fetchLayer3(): Promise<Layer3Summary> {
  return request<Layer3Summary>("/api/trends/layer3");
}
