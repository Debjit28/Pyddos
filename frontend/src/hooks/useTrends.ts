import { useState, useEffect } from "react";
import type { TrendSummary, TrendPeriod } from "@/types/threat";
import { fetchHttpTrends } from "@/services/api";

const REFRESH_INTERVAL_MS = 60000;

export function useTrends() {
  const [period, setPeriod] = useState<TrendPeriod>("1h");
  const [data, setData] = useState<TrendSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      setLoading(true);
      try {
        const result = await fetchHttpTrends(period);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch trends"));
          console.error(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [period]);

  return { data, loading, error, period, setPeriod };
}
