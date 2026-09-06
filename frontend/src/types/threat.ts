/** Matches a single item from GET /api/attacks/arcs */
export interface AttackArc {
  id: string;
  src_lat: number;
  src_lon: number;
  src_city: string;
  src_country: string;
  dst_lat: number;
  dst_lon: number;
  dst_city: string;
  confidence: number;
  ip: string;
  timestamp: string; // ISO-8601
}

/** Matches a single entry in AttackStats.top_countries */
export interface TopCountry {
  country: string;
  count: number;
}

/** Matches GET /api/attacks/stats */
export interface AttackStats {
  total_ips: number;
  high_confidence: number;
  countries_affected: number;
  top_countries: TopCountry[];
  last_updated: string; // ISO-8601
}

/** Matches POST /api/attacks/refresh */
export interface RefreshResult {
  fetched: number;
  geolocated: number;
  new_arcs: number;
}

/** Matches a single trend data point */
export interface TrafficTrend {
  timestamp: string; // ISO-8601
  requests_total: number;
  threats_total: number;
  attack_percentage: number;
}

/** Matches GET /api/trends/http?period=<period> */
export interface TrendSummary {
  period: string;
  trends: TrafficTrend[];
  peak_attack_time: string | null;
  total_threats: number;
  avg_attack_percentage: number;
}

/** Valid trend periods */
export type TrendPeriod = "1h" | "24h" | "7d";

/** WebSocket connection states */
export type ConnectionStatus = "connecting" | "connected" | "disconnected";

/** Data mode indicator — driven by VITE_DATA_MODE env var */
export type DataMode = "live" | "demo";

// ── WebSocket message types ──────────────────────────────────

export interface WsInitMessage {
  type: "init";
  data: {
    arcs: AttackArc[];
    stats: AttackStats;
  };
}

export interface WsNewArcMessage {
  type: "new_arc";
  data: AttackArc;
}

export interface WsStatsRefreshMessage {
  type: "stats_refresh";
  data: AttackStats;
}

export interface WsPongMessage {
  type: "pong";
}

export type WsMessage =
  | WsInitMessage
  | WsNewArcMessage
  | WsStatsRefreshMessage
  | WsPongMessage;
