/**
 * Live chat WebSocket + REST hook.
 * Connects when authenticated; exposes partners, messages, send, openConversation.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';

export interface ChatPartner {
  id: number;
  username: string;
  role: string;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  sender_username: string;
  sender_role: string;
  receiver_id: number;
  message: string;
  created_at: string;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export function useLiveChat() {
  const { user, isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [currentOtherUserId, setCurrentOtherUserId] = useState<number | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  const pendingOpenOtherIdRef = useRef<number | null>(null);

  const currentUserId = user?.id != null ? Number(user.id) : null;
  const currentUserIdRef = useRef<number | null>(currentUserId);
  currentUserIdRef.current = currentUserId;

  const getConversationKey = useCallback((otherId: number) => {
    if (currentUserId == null) return '';
    const lo = Math.min(currentUserId, otherId);
    const hi = Math.max(currentUserId, otherId);
    return `${lo}_${hi}`;
  }, [currentUserId]);

  const fetchPartners = useCallback(async () => {
    try {
      const data = await apiClient.getChatPartners();
      setPartners(data.partners ?? []);
    } catch {
      setPartners([]);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setConnectionStatus('idle');
      setPartners([]);
      setMessagesByConversation({});
      setCurrentOtherUserId(null);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      currentRoomRef.current = null;
      return;
    }
    fetchPartners();
  }, [isAuthenticated, user?.id, fetchPartners]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const token = apiClient.getToken();
    if (!token) return;

    const wsBase = apiClient.getWsBaseUrl();
    const url = `${wsBase}/ws/chat/?token=${encodeURIComponent(token)}`;
    setConnectionStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      wsRef.current = null;
      currentRoomRef.current = null;
    };
    ws.onerror = () => setConnectionStatus('error');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_history' && Array.isArray(data.messages)) {
          const otherId = pendingOpenOtherIdRef.current ?? currentOtherUserId;
          const uid = currentUserIdRef.current;
          if (otherId != null && uid != null) {
            const lo = Math.min(uid, otherId);
            const hi = Math.max(uid, otherId);
            const key = `${lo}_${hi}`;
            setMessagesByConversation((prev) => ({ ...prev, [key]: data.messages }));
          }
          pendingOpenOtherIdRef.current = null;
        } else if (data.type === 'chat_message') {
          const msg: ChatMessage = {
            id: data.id,
            sender_id: data.sender_id,
            sender_username: data.sender_username,
            sender_role: data.sender_role,
            receiver_id: data.receiver_id,
            message: data.message,
            created_at: data.created_at,
          };
          const uid = currentUserIdRef.current;
          const otherId = uid != null && msg.sender_id === uid ? msg.receiver_id : msg.sender_id;
          const key = uid != null ? `${Math.min(uid, otherId)}_${Math.max(uid, otherId)}` : '';
          if (!key) return;
          setMessagesByConversation((prev) => ({
            ...prev,
            [key]: [...(prev[key] ?? []), msg],
          }));
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      currentRoomRef.current = null;
    };
  }, [isAuthenticated, user?.id, getConversationKey]);

  const openConversation = useCallback(
    (otherUserId: number) => {
      setCurrentOtherUserId(otherUserId);
      pendingOpenOtherIdRef.current = otherUserId;
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'open_conversation', other_user_id: otherUserId }));
        currentRoomRef.current = getConversationKey(otherUserId);
        setMessagesByConversation((prev) => {
          const key = getConversationKey(otherUserId);
          if (prev[key]) return prev;
          return { ...prev, [key]: [] };
        });
      }
    },
    [getConversationKey]
  );

  const sendMessage = useCallback(
    (receiverId: number, text: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ type: 'chat_message', receiver_id: receiverId, message: text.trim() }));
    },
    []
  );

  const currentMessages = currentOtherUserId != null ? messagesByConversation[getConversationKey(currentOtherUserId)] ?? [] : [];

  return {
    connectionStatus,
    partners,
    currentOtherUserId,
    currentMessages,
    openConversation,
    sendMessage,
    currentUserId,
    fetchPartners,
  };
}
