import type { ConnectionStatus } from "@/types/threat";

interface Props {
  status: ConnectionStatus;
}

export function ConnectionIndicator({ status }: Props) {
  const colors = {
    connected: "bg-green-500",
    connecting: "bg-yellow-500",
    disconnected: "bg-red-500",
  };

  const labels = {
    connected: "CONNECTED",
    connecting: "CONNECTING",
    disconnected: "OFFLINE",
  };

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="text-slate-400">WS:</span>
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          {status === "connected" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors[status]}`}></span>
        </span>
        <span className={status === "connected" ? "text-green-500" : status === "connecting" ? "text-yellow-500" : "text-red-500"}>
          {labels[status]}
        </span>
      </div>
    </div>
  );
}
