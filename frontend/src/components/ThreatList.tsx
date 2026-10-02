import { useEffect, useRef } from "react";
import { getThreatLevel } from "@/utils/threat";
import type { AttackArc } from "@/types/threat";

interface Props {
  arcs: AttackArc[];
  selectedAttack: AttackArc | null;
  onSelect: (arc: AttackArc) => void;
}

export function ThreatList({ arcs, selectedAttack, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected row into view
  useEffect(() => {
    if (selectedRef.current && listRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedAttack?.id]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 shrink-0">
        <h3 className="text-xs font-bold tracking-widest text-slate-400">
          ACTIVE THREATS
        </h3>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-500">
          {arcs.length}
        </span>
      </div>

      {/* Scrollable list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar"
      >
        {arcs.length === 0 && (
          <div className="flex items-center justify-center py-12 text-xs font-mono text-slate-600">
            No active threats
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {arcs.map((arc) => {
            const threat = getThreatLevel(arc.confidence);
            const isSelected = selectedAttack?.id === arc.id;

            return (
              <div
                key={arc.id}
                ref={isSelected ? selectedRef : undefined}
                onClick={() => onSelect(arc)}
                className={`
                  group relative cursor-pointer rounded-md border px-3 py-2 transition-all duration-150
                  ${
                    isSelected
                      ? "border-l-2 bg-slate-800/70 shadow-lg"
                      : "border-transparent hover:border-slate-700/50 hover:bg-slate-900/80"
                  }
                `}
                style={
                  isSelected
                    ? { borderLeftColor: threat.color }
                    : undefined
                }
              >
                {/* Row 1: IP + severity badge */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-xs ${
                      isSelected ? "text-slate-100" : "text-slate-300"
                    }`}
                  >
                    {arc.ip}
                  </span>
                  <span
                    className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${threat.tailwindText} ${threat.tailwindBg} ${threat.tailwindBorder}`}
                  >
                    {threat.label}
                  </span>
                </div>

                {/* Row 2: confidence + location */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 truncate max-w-[120px]">
                    {arc.src_city
                      ? `${arc.src_city}, ${arc.src_country}`
                      : arc.src_country || "Unknown"}
                  </span>
                  <span
                    className={`font-mono font-bold ${threat.tailwindText}`}
                  >
                    {arc.confidence}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
