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
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function useMessageSocket(onNewMessage: (payload: MessageNewPayload["message"]) => void) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const onNewMessageRef = useRef(onNewMessage);
  onNewMessageRef.current = onNewMessage;

  useEffect(() => {
    const url = getMessagesWebSocketUrl();
    if (!url) return;

    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        attemptRef.current = 0;
      };
      ws.onclose = () => {
        wsRef.current = null;
        setConnected(false);
        if (attemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          attemptRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
      ws.onerror = () => {
        setConnected(false);
      };
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
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      const current = wsRef.current;
      wsRef.current = null;
      if (current) current.close();
      setConnected(false);
    };
  }, []);

  return { connected };
}
