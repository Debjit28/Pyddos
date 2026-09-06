import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTrends } from "@/hooks/useTrends";

export function TrendChart() {
  const { data, loading, period, setPeriod } = useTrends();

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold tracking-widest text-slate-400">DDoS TRAFFIC TRENDS</h3>
        <div className="flex items-center gap-1 bg-slate-900 rounded p-0.5 border border-slate-800">
          {(["1h", "24h", "7d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                period === p 
                  ? "bg-slate-700 text-slate-200" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[120px] relative">
        {loading && !data && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-mono">
            Loading trends...
          </div>
        )}
        
        {data && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trends} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                stroke="#475569"
                fontSize={10}
                tickMargin={8}
                minTickGap={30}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10}
                tickFormatter={(val) => `${val}%`}
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '12px', borderRadius: '6px' }}
                itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                labelFormatter={(label) => new Date(label as string | number).toLocaleString()}
              />
              <Area 
                type="monotone" 
                dataKey="attack_percentage" 
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#threatGradient)" 
                name="Attack %"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {data && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-800/50 pt-3">
          <div className="text-[10px] text-slate-500 font-bold">AVG ATTACK TRAFFIC</div>
          <div className="text-sm font-mono text-red-500 font-bold">{data.avg_attack_percentage.toFixed(2)}%</div>
        </div>
      )}
    </div>
  );
}
