import type { AttackArc, AttackStats, TrendSummary } from "@/types/threat";

const now = new Date().toISOString();

export const MOCK_ARCS: AttackArc[] = [
  {
    id: "mock-1",
    src_lat: 39.9042,
    src_lon: 116.4074,
    src_city: "Beijing",
    src_country: "China",
    dst_lat: 38.8951,
    dst_lon: -77.0364,
    dst_city: "Washington",
    confidence: 98,
    ip: "203.0.113.42",
    timestamp: now,
  },
  {
    id: "mock-2",
    src_lat: 55.7558,
    src_lon: 37.6173,
    src_city: "Moscow",
    src_country: "Russia",
    dst_lat: 51.5074,
    dst_lon: -0.1278,
    dst_city: "London",
    confidence: 85,
    ip: "198.51.100.12",
    timestamp: now,
  },
  {
    id: "mock-3",
    src_lat: -23.5505,
    src_lon: -46.6333,
    src_city: "Sao Paulo",
    src_country: "Brazil",
    dst_lat: 48.8566,
    dst_lon: 2.3522,
    dst_city: "Paris",
    confidence: 72,
    ip: "192.0.2.144",
    timestamp: now,
  },
];

export const MOCK_STATS: AttackStats = {
  total_ips: 1420,
  high_confidence: 450,
  countries_affected: 34,
  top_countries: [
    { country: "China", count: 320 },
    { country: "Russia", count: 210 },
    { country: "Brazil", count: 180 },
    { country: "United States", count: 150 },
    { country: "Iran", count: 90 },
  ],
  last_updated: now,
};

export const MOCK_TRENDS: TrendSummary = {
  period: "1h",
  trends: [
    { timestamp: new Date(Date.now() - 3000000).toISOString(), requests_total: 1000, threats_total: 100, attack_percentage: 10 },
    { timestamp: new Date(Date.now() - 2000000).toISOString(), requests_total: 1200, threats_total: 150, attack_percentage: 12.5 },
    { timestamp: new Date(Date.now() - 1000000).toISOString(), requests_total: 1500, threats_total: 300, attack_percentage: 20 },
    { timestamp: now, requests_total: 1100, threats_total: 120, attack_percentage: 10.9 },
  ],
  peak_attack_time: new Date(Date.now() - 1000000).toISOString(),
  total_threats: 670,
  avg_attack_percentage: 13.35,
};
