import { useState, useEffect, useRef } from "react";
import type { AttackArc, AttackStats, ConnectionStatus, WsMessage } from "@/types/threat";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://127.0.0.1:8000/ws";
const MAX_ARCS = 200;
const PING_INTERVAL_MS = 25000; // 25 seconds
const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

export function useWebSocket() {
  const [arcs, setArcs] = useState<AttackArc[]>([]);
  const [stats, setStats] = useState<AttackStats | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);
  
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    let pingInterval: number | null = null;
    let isMounted = true;

    const cleanup = () => {
      if (pingInterval !== null) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    };

    const connect = () => {
      if (!isMounted) return;
      
      cleanup();
      setStatus("connecting");
      
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        if (!isMounted) return;
        setStatus("connected");
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
        
        pingInterval = window.setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data) as WsMessage;
          switch (msg.type) {
            case "init":
              setArcs(msg.data.arcs);
              setStats(msg.data.stats);
              break;
            case "new_arc":
              setArcs((prev) => [msg.data, ...prev].slice(0, MAX_ARCS));
              break;
            case "stats_refresh":
              setStats(msg.data);
              break;
            case "pong":
              break;
          }
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setStatus("disconnected");
        cleanup();
        
        reconnectTimeout = window.setTimeout(() => {
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, MAX_RECONNECT_DELAY_MS);
          connect();
        }, reconnectDelayRef.current);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error", error);
      };
    };

    connect();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  return { arcs, stats, status };
}
