"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentUserSession,
  getAccessToken,
} from "@/lib/auth-session";
import {
  connectSocket,
  onChatMessage,
  offChatMessage,
  ChatSocketMessage,
} from "@/lib/socketService";
import {
  chatService,
  ChatMessage,
} from "@/services/chatService";

interface UseUserChatTabOptions {
  peerId: string;
}

interface UseUserChatTabReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  inputText: string;
  setInputText: (v: string) => void;
  sendMessage: () => Promise<void>;
  currentUserId: string | null;
}

export function useUserChatTab({
  peerId,
}: UseUserChatTabOptions): UseUserChatTabReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputText, setInputText] = useState("");

  const currentUserId = getCurrentUserSession()?.id ?? null;

  // ── Fetch conversation history on mount ──────────────────────────────
  useEffect(() => {
    if (!peerId) return;

    let cancelled = false;
    setIsLoading(true);

    chatService
      .getConversation(peerId)
      .then((res) => {
        if (!cancelled) {
          setMessages(res.responseData ?? []);
        }
      })
      .catch((err) => {
        console.error("[useUserChatTab] fetch conversation error:", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [peerId]);

  // ── Socket: listen for incoming messages from this peer ──────────────
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    // Ensure socket is connected (singleton — won't duplicate if already up)
    connectSocket(token);

    const handler = (msg: ChatSocketMessage) => {
      if (msg.sender_id !== peerId) return;

      // Convert ChatSocketMessage → ChatMessage shape
      const newMsg: ChatMessage = {
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        message: msg.message,
        message_type: msg.message_type,
        file_url: msg.file_url,
        is_read: false,
        status: msg.status,
        created_at: msg.created_at,
      };

      setMessages((prev) => [...prev, newMsg]);
    };

    onChatMessage(handler);

    return () => {
      offChatMessage(handler);
    };
  }, [peerId]);

  // ── Send message with optimistic UI ─────────────────────────────────
  const optimisticIdRef = useRef(0);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !currentUserId || isSending) return;

    const optimisticId = `optimistic-${++optimisticIdRef.current}`;

    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      sender_id: currentUserId,
      receiver_id: peerId,
      message: text,
      message_type: "text",
      file_url: null,
      is_read: false,
      status: "sending",
      created_at: new Date().toISOString(),
    };

    // Optimistic append
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const res = await chatService.sendMessage({
        senderId: currentUserId,
        receiverId: peerId,
        message: text,
        messageType: "text",
      });

      // Replace optimistic message with confirmed one from API
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? res.responseData : m)),
      );
    } catch (err) {
      console.error("[useUserChatTab] send error:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      // Restore text so user can retry
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  }, [inputText, currentUserId, peerId, isSending]);

  return {
    messages,
    isLoading,
    isSending,
    inputText,
    setInputText,
    sendMessage,
    currentUserId,
  };
}
