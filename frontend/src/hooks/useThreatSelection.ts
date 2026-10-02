import { useState, useMemo, useCallback, useEffect } from "react";
import type { AttackArc } from "@/types/threat";

export interface ThreatSelection {
  selectedIndex: number | null;
  selectedAttack: AttackArc | null;
  selectByIndex: (index: number) => void;
  selectById: (id: string) => void;
  selectNext: () => void;
  selectPrev: () => void;
  clearSelection: () => void;
}

export function useThreatSelection(arcs: AttackArc[]): ThreatSelection {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Clamp or clear selection when arcs change
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      if (arcs.length === 0) return null;
      // Try to maintain selection by ID
      return prev < arcs.length ? prev : arcs.length - 1;
    });
  }, [arcs]);

  const selectedAttack = useMemo(() => {
    if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= arcs.length) {
      return null;
    }
    return arcs[selectedIndex];
  }, [arcs, selectedIndex]);

  const selectByIndex = useCallback(
    (index: number) => {
      if (arcs.length === 0) return;
      const clamped = Math.max(0, Math.min(index, arcs.length - 1));
      setSelectedIndex(clamped);
    },
    [arcs.length],
  );

  const selectById = useCallback(
    (id: string) => {
      const idx = arcs.findIndex((a) => a.id === id);
      if (idx !== -1) {
        setSelectedIndex(idx);
      }
    },
    [arcs],
  );

  const selectNext = useCallback(() => {
    if (arcs.length === 0) return;
    setSelectedIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % arcs.length;
    });
  }, [arcs.length]);

  const selectPrev = useCallback(() => {
    if (arcs.length === 0) return;
    setSelectedIndex((prev) => {
      if (prev === null) return arcs.length - 1;
      return (prev - 1 + arcs.length) % arcs.length;
    });
  }, [arcs.length]);

  const clearSelection = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  return {
    selectedIndex,
    selectedAttack,
    selectByIndex,
    selectById,
    selectNext,
    selectPrev,
    clearSelection,
  };
}
