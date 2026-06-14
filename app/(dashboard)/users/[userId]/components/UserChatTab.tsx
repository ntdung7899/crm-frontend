"use client";

import { useEffect, useRef, KeyboardEvent } from "react";
import { FiSend } from "react-icons/fi";
import { useUserChatTab } from "../hooks/useUserChatTab";
import { ChatMessage } from "@/services/chatService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface UserChatTabProps {
  userId: string;   // peerId — the user we're chatting with
  userName: string; // display name of the peer
}

function formatTime(iso: string): string {
  try {
    return format(new Date(iso), "HH:mm dd/MM/yyyy", { locale: vi });
  } catch {
    return iso;
  }
}

function MessageBubble({
  msg,
  isMine,
}: {
  msg: ChatMessage;
  isMine: boolean;
}) {
  const isOptimistic = msg.id.startsWith("optimistic-");
  return (
    <div
      className={`flex w-full ${isMine ? "justify-end" : "justify-start"} mb-2`}
    >
      <div className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
            isMine
              ? "bg-primary-600 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-800 rounded-bl-sm"
          } ${isOptimistic ? "opacity-70" : ""}`}
        >
          {msg.message ?? ""}
        </div>
        <span className="text-xs text-gray-400 mt-1 px-1">
          {formatTime(msg.created_at)}
          {isOptimistic && (
            <span className="ml-1 italic">Đang gửi…</span>
          )}
        </span>
      </div>
    </div>
  );
}

export function UserChatTab({ userId, userName }: UserChatTabProps) {
  const {
    messages,
    isLoading,
    isSending,
    inputText,
    setInputText,
    sendMessage,
    currentUserId,
  } = useUserChatTab({ peerId: userId });

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
          {userName.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{userName || "Người dùng"}</p>
          <p className="text-xs text-gray-400">Chat nội bộ</p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMine={msg.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-gray-100 px-4 py-3 bg-white">
        <div className="flex items-end gap-3">
          <textarea
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition max-h-32 min-h-[42px]"
            rows={1}
            placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending || isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isSending || isLoading}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            title="Gửi tin nhắn"
          >
            <FiSend size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
