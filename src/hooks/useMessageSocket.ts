import { useEffect, useRef, useState } from "react";
import { getMessagesWebSocketUrl } from "@/lib/api";

export interface MessageNewPayload {
  type: "message.new";
  message: {
    id: number;
    sender: number;
    receiver: number;
    message: string;
    created_at: string;
    [key: string]: unknown;
  };
}

/**
 * Subscribe to real-time message events via WebSocket.
 * When the server sends a "message.new" event, onNewMessage is called with the message payload.
 * Returns { connected } so callers can e.g. disable polling while socket is open.
 */
export function useMessageSocket(onNewMessage: (payload: MessageNewPayload["message"]) => void) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onNewMessageRef = useRef(onNewMessage);
  onNewMessageRef.current = onNewMessage;

  useEffect(() => {
    const url = getMessagesWebSocketUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MessageNewPayload;
        if (data?.type === "message.new" && data.message) {
          onNewMessageRef.current(data.message);
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      wsRef.current = null;
      ws.close();
      setConnected(false);
    };
  }, []);

  return { connected };
}
