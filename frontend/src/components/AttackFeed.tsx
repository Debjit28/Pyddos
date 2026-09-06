import type { AttackArc } from "@/types/threat";

interface Props {
  arcs: AttackArc[];
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 90) return "text-red-500 bg-red-500/10 border-red-500/30";
  if (confidence >= 80) return "text-orange-500 bg-orange-500/10 border-orange-500/30";
  return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
}

export function AttackFeed({ arcs }: Props) {
  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-4 shrink-0">LIVE ATTACK FEED</h3>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {arcs.map((arc) => (
          <div
            key={arc.id}
            className="flex flex-col p-2.5 rounded border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-colors animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-mono text-xs text-slate-200">{arc.ip}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${getConfidenceColor(arc.confidence)}`}>
                {arc.confidence}%
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span className="truncate max-w-[150px]" title={`${arc.src_city}, ${arc.src_country}`}>
                {arc.src_city || arc.src_country || "Unknown Origin"}
              </span>
              <span className="text-slate-600 font-mono">
                {new Date(arc.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
          </div>
        ))}
        {arcs.length === 0 && (
          <div className="text-center text-xs text-slate-500 py-8 font-mono">
            Waiting for attack telemetry...
          </div>
        )}
      </div>
    </div>
  );
}
