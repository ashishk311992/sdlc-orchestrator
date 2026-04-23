import { useEffect, useRef, useState } from "react";
import { getToken } from "./api";

export type StreamEvent = {
  run_id: string;
  type: string;
  payload: Record<string, unknown>;
};

export function useEventStream(onEvent: (ev: StreamEvent) => void): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const handler = useRef(onEvent);
  handler.current = onEvent;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const url = `/api/dashboard/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => {
      try {
        handler.current(JSON.parse(e.data));
      } catch {
        /* ignore malformed */
      }
    };
    return () => es.close();
  }, []);

  return { connected };
}
