import { Header } from "@/components/Header";
import { GlobeView } from "@/components/GlobeView";
import { AttackOverview } from "@/components/AttackOverview";
import { TrendChart } from "@/components/TrendChart";
import { AttackFeed } from "@/components/AttackFeed";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { DataMode } from "@/types/threat";
import { MOCK_ARCS, MOCK_STATS } from "@/data/mockData";

const DATA_MODE: DataMode = (import.meta.env.VITE_DATA_MODE as DataMode) || "demo";

export default function App() {
  const { arcs, stats, status } = useWebSocket();
  
  // Fallback to mock data if disconnected and in demo mode, or while initially loading in demo mode
  const displayArcs = (status === "disconnected" && DATA_MODE === "demo") || (arcs.length === 0 && DATA_MODE === "demo") ? MOCK_ARCS : arcs;
  const displayStats = (status === "disconnected" && DATA_MODE === "demo") || (!stats && DATA_MODE === "demo") ? MOCK_STATS : stats;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#020617] text-slate-200 selection:bg-cyan-500/30">
      <Header stats={displayStats} connectionStatus={status} dataMode={DATA_MODE} />
      
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left pane: Globe (Hero) */}
        <section className="flex-1 rounded-xl relative">
          <GlobeView arcs={displayArcs} />
        </section>

        {/* Right pane: Sidebar */}
        <aside className="w-[380px] flex flex-col gap-4 overflow-hidden shrink-0">
          <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl shrink-0">
            <AttackOverview stats={displayStats} />
          </div>
          
          <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl h-[35%] shrink-0">
            <TrendChart />
          </div>
          
          <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl flex-1 overflow-hidden">
            <AttackFeed arcs={displayArcs} />
          </div>
        </aside>
      </main>
    </div>
  );
}
