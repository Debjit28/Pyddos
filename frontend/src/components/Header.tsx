import { Activity, ShieldAlert, Globe2, Server } from "lucide-react";
import { ConnectionIndicator } from "./ConnectionStatus";
import type { AttackStats, ConnectionStatus, DataMode } from "@/types/threat";

interface Props {
  stats: AttackStats | null;
  connectionStatus: ConnectionStatus;
  dataMode: DataMode;
}

export function Header({ stats, connectionStatus, dataMode }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-500" />
          <h1 className="text-lg font-bold tracking-tight text-slate-100">
            ThreatPulse
          </h1>
        </div>
        <div className="hidden h-4 w-px bg-slate-800 sm:block"></div>
        <span className="hidden text-xs font-medium text-slate-400 sm:block tracking-widest">
          DDoS THREAT INTELLIGENCE
        </span>
        {dataMode === "demo" && (
          <span className="ml-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-500 tracking-wider">
            DEMO MODE
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Server className="h-3.5 w-3.5" />
              <span>TRACKED IPs</span>
            </div>
            <span className="font-mono text-sm font-medium text-slate-200">
              {stats?.total_ips.toLocaleString() ?? "---"}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>HIGH THREATS</span>
            </div>
            <span className="font-mono text-sm font-medium text-orange-400">
              {stats?.high_confidence.toLocaleString() ?? "---"}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Globe2 className="h-3.5 w-3.5" />
              <span>COUNTRIES</span>
            </div>
            <span className="font-mono text-sm font-medium text-cyan-400">
              {stats?.countries_affected.toLocaleString() ?? "---"}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
        
        <ConnectionIndicator status={connectionStatus} />
      </div>
    </header>
  );
}
