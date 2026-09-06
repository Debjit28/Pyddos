import type { AttackStats } from "@/types/threat";

interface Props {
  stats: AttackStats | null;
}

export function AttackOverview({ stats }: Props) {
  if (!stats) {
    return (
      <div className="flex h-full flex-col justify-center items-center text-slate-500 p-8">
        <span className="animate-pulse text-xs font-mono">Loading telemetry...</span>
      </div>
    );
  }

  const maxCount = Math.max(...stats.top_countries.map((c) => c.count), 1);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-4">ATTACK OVERVIEW</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-900/50 p-3 border border-slate-800">
            <div className="text-[10px] text-slate-500 mb-1 font-bold">TOTAL IPs</div>
            <div className="text-xl font-mono text-slate-200">{stats.total_ips.toLocaleString()}</div>
          </div>
          <div className="rounded-lg bg-slate-900/50 p-3 border border-red-900/30">
            <div className="text-[10px] text-red-500/80 mb-1 font-bold">CRITICAL</div>
            <div className="text-xl font-mono text-red-500">{stats.high_confidence.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-3">TOP SOURCES</h3>
        <div className="flex flex-col gap-3">
          {stats.top_countries.map((c) => (
            <div key={c.country} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">{c.country}</span>
                <span className="text-cyan-500">{c.count.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${(c.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-3">PROTOCOL BREAKDOWN (L3)</h3>
        <div className="flex flex-col gap-2">
          {/* Placeholder data until backend L3 endpoint is fully specified */}
          <div className="flex justify-between items-center text-xs font-mono border border-slate-800 rounded p-2 bg-slate-900/30">
            <span className="text-slate-400">UDP</span>
            <span className="text-slate-500">awaiting data</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono border border-slate-800 rounded p-2 bg-slate-900/30">
            <span className="text-slate-400">TCP</span>
            <span className="text-slate-500">awaiting data</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono border border-slate-800 rounded p-2 bg-slate-900/30">
            <span className="text-slate-400">ICMP</span>
            <span className="text-slate-500">awaiting data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
