import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEV_CAPTURED_OAUTH,
  fetchConversations,
  fetchMessages,
  fetchOaInfo,
  sendFileMessage,
  sendImageMessage,
  sendQuoteMessage,
  sendTextMessage,
  ZaloApiError,
} from "@/lib/zalo-oa";
import {
  appendMessage as appendStoredMessage,
  loadMessages as loadStoredMessages,
  mergeFetched as mergeFetchedMessages,
  updateMessage as updateStoredMessage,
} from "@/lib/zaloMessageStore";
import {
  connectSocket,
  disconnectSocket,
  type ZaloNewMessage,
} from "@/lib/socketService";
import { getAccessToken } from "@/lib/auth-session";
import type {
  OaConnection,
  ZaloConversation,
  ZaloChatMessage,
  AutoConfig,
  AutoConfigFormState,
} from "@/types/zalo-oa";

export type ActiveTab = "tuong-tac" | "cau-hinh";
export type PeriodPreset = "TODAY" | "YESTERDAY" | "L7D" | "L30D" | "CUSTOM";

const fmtDate = (d: Date) =>
  `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, "0")}_${String(d.getDate()).padStart(2, "0")}`;

function buildZaloPeriod(preset: PeriodPreset, customDays: number): string {
  if (preset !== "CUSTOM") return preset;
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - customDays);
  return `${fmtDate(from)}:${fmtDate(today)}`;
}

const initialConfigForm: AutoConfigFormState = {
  oaId: "",
  showCrmUsername: false,
  autoCreateOpportunity: false,
};

const CONNECTIONS_STORAGE_KEY = "crm.zaloOa.connections.v1";

const buildDevSeedConnection = (): OaConnection => ({
  id: `oa-${DEV_CAPTURED_OAUTH.oaId}`,
  oaName: DEV_CAPTURED_OAUTH.oaName,
  oaOfficialId: DEV_CAPTURED_OAUTH.oaId,
  owner: "owner",
  followers: 0,
  syncedCustomers: 0,
  isActive: true,
  lastSyncAt: new Date().toLocaleString("vi-VN", { hour12: false }),
  status: "connected",
  tokenExpiredAt: new Date(Date.now() + 90000 * 1000).toISOString(),
  accessToken: process.env.NEXT_PUBLIC_ZALO_DEV_ACCESS_TOKEN || undefined,
});

const loadConnectionsFromStorage = (): OaConnection[] => {
  if (typeof window === "undefined") return [];
  let stored: OaConnection[] | null = null;
  try {
    const raw = window.localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) stored = parsed as OaConnection[];
    }
  } catch {
    // ignore parse errors
  }

  const devToken = process.env.NEXT_PUBLIC_ZALO_DEV_ACCESS_TOKEN || undefined;

  if (stored && stored.length > 0) {
    // Patch dev seed connection with env token if stored version is missing it
    if (devToken) {
      return stored.map((c) =>
        c.oaOfficialId === DEV_CAPTURED_OAUTH.oaId && !c.accessToken
          ? { ...c, accessToken: devToken }
          : c,
      );
    }
    return stored;
  }

  // Dev seed: nếu chưa có OA nào ở local (hoặc localStorage rỗng/[]),
  // mồi 1 OA từ captured OAuth để test luồng mà không cần popup Zalo.
  if (process.env.NODE_ENV !== "production") {
    return [buildDevSeedConnection()];
  }
  return [];
};

const saveConnectionsToStorage = (connections: OaConnection[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CONNECTIONS_STORAGE_KEY,
      JSON.stringify(connections),
    );
  } catch {
    // ignore quota
  }
};

export function useZaloOaPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tuong-tac");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatComposerValue, setChatComposerValue] = useState("");
  const [conversations, setConversations] = useState<ZaloConversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, ZaloChatMessage[]>
  >({});
  const [connections, setConnections] = useState<OaConnection[]>([]);
  const [autoConfigs, setAutoConfigs] = useState<AutoConfig[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("L30D");
  const [customDays, setCustomDays] = useState(90);
  const zaloPeriod = useMemo(
    () => buildZaloPeriod(periodPreset, customDays),
    [periodPreset, customDays],
  );

  useEffect(() => {
    setConnections(loadConnectionsFromStorage());
  }, []);

  useEffect(() => {
    saveConnectionsToStorage(connections);
  }, [connections]);

  // ─── Socket.IO: nhận tin nhắn realtime từ user gửi vào OA ───────────
  useEffect(() => {
    const jwt = getAccessToken();
    // console.log("jwt", jwt);
    if (!jwt) return;
    console.log("jwt", jwt);
    const socket = connectSocket(jwt);

    const handleNewMessage = (msg: ZaloNewMessage) => {
      // Chỉ xử lý tin inbound (user gửi cho OA)
      if (msg.direction !== "inbound") return;

      const nowTime = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // sender_id là userId Zalo — cũng là conversationId của chúng ta
      const conversationId = msg.sender_id;

      const newMsg: ZaloChatMessage = {
        id: msg.message_id || `ws-${Date.now()}`,
        conversationId,
        sender: "customer",
        content: msg.message_text ?? "",
        timestamp: msg.zalo_timestamp
          ? new Date(msg.zalo_timestamp).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : nowTime,
        messageType: "text",
        sendStatus: "sent",
        zaloMessageId: msg.message_id,
      };

      // appendStoredMessage đã dedup theo zaloMessageId / id
      appendStoredMessage(conversationId, newMsg);

      setMessagesByConversation((prev) => {
        const current = prev[conversationId] || [];
        // Tránh duplicate nếu đã có message_id này
        if (current.some((m) => m.zaloMessageId === msg.message_id)) {
          return prev;
        }
        return { ...prev, [conversationId]: [...current, newMsg] };
      });

      // Cập nhật preview conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: msg.message_text ?? "[Tin nhắn mới]",
                timestamp: nowTime,
                unreadCount: (c.unreadCount || 0) + 1,
              }
            : c,
        ),
      );
    };

    socket.on("zalo:new_message", handleNewMessage);

    return () => {
      socket.off("zalo:new_message", handleNewMessage);
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enrich connections với OA info từ Zalo (getoa) — chỉ chạy 1 lần / OA
  const enrichedOaIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const targets = connections.filter(
      (c) => c.accessToken && !enrichedOaIds.current.has(c.id),
    );
    if (targets.length === 0) return;

    let cancelled = false;
    targets.forEach(async (conn) => {
      enrichedOaIds.current.add(conn.id);
      const info = await fetchOaInfo(conn.accessToken!);
      if (cancelled || !info) return;

      setConnections((prev) =>
        prev.map((c) =>
          c.id === conn.id
            ? {
                ...c,
                oaName: info.name || c.oaName,
                oaOfficialId: info.oaid || c.oaOfficialId,
                avatar: info.avatar || c.avatar,
                cover: info.cover || c.cover,
                description: info.description || c.description,
                categoryName: info.cate_name || c.categoryName,
                packageName: info.package_name || c.packageName,
                oaAlias: info.oa_alias || c.oaAlias,
                isVerified:
                  typeof info.is_verified === "boolean"
                    ? info.is_verified
                    : c.isVerified,
                followers:
                  typeof info.num_follower === "number"
                    ? info.num_follower
                    : c.followers,
              }
            : c,
        ),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [connections]);

  // Load conversations from Zalo API for all active connected OAs
  useEffect(() => {
    const activeOas = connections.filter((c) => c.isActive && c.accessToken);
    if (activeOas.length === 0) return;

    let cancelled = false;
    setIsLoadingConversations(true);

    Promise.all(
      activeOas.map((oa) =>
        fetchConversations(oa.accessToken!, oa.id, zaloPeriod).catch((err) => {
          console.error(`[Zalo] fetch conversations for OA ${oa.oaName}:`, err);
          return [] as ZaloConversation[];
        }),
      ),
    ).then((results) => {
      if (!cancelled) {
        setConversations(results.flat());
        setIsLoadingConversations(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [connections, zaloPeriod]);

  const [configForm, setConfigForm] =
    useState<AutoConfigFormState>(initialConfigForm);
  const [selectedOaFilter, setSelectedOaFilter] = useState("all");

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConvId,
      ) || null,
    [conversations, selectedConvId],
  );

  const selectedOaName = useMemo(() => {
    if (!selectedConversation) {
      return "";
    }

    return (
      connections.find(
        (connection) => connection.id === selectedConversation.oaId,
      )?.oaName || ""
    );
  }, [connections, selectedConversation]);

  const selectedMessages = useMemo(() => {
    if (!selectedConvId) {
      return [];
    }

    return messagesByConversation[selectedConvId] || [];
  }, [messagesByConversation, selectedConvId]);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) => {
        const matchedByOa =
          selectedOaFilter === "all" || c.oaId === selectedOaFilter;
        const matchedByName = c.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchedByOa && matchedByName;
      }),
    [conversations, searchQuery, selectedOaFilter],
  );

  useEffect(() => {
    if (!selectedConvId || selectedOaFilter === "all") {
      return;
    }

    const selected = conversations.find(
      (conversation) => conversation.id === selectedConvId,
    );
    if (selected && selected.oaId !== selectedOaFilter) {
      setSelectedConvId(null);
      setChatComposerValue("");
    }
  }, [conversations, selectedConvId, selectedOaFilter]);

  // Track which conversations have had their messages fetched (avoids re-fetching)
  const fetchedConvIds = useRef<Set<string>>(new Set());

  // Load messages from Zalo API when a conversation is selected
  // Merge với localStorage để giữ tin pending/failed khi reload.
  useEffect(() => {
    if (!selectedConvId) return;

    // Lần đầu mở conversation: hydrate từ localStorage ngay để hiển thị nhanh
    if (!fetchedConvIds.current.has(selectedConvId)) {
      const cached = loadStoredMessages(selectedConvId);
      if (cached.length > 0) {
        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConvId]: cached,
        }));
      }
    }

    if (fetchedConvIds.current.has(selectedConvId)) return;

    const conv = conversations.find((c) => c.id === selectedConvId);
    if (!conv) return;

    const oa = connections.find((c) => c.id === conv.oaId);
    if (!oa?.accessToken) return;

    fetchedConvIds.current.add(selectedConvId);

    fetchMessages(oa.accessToken, selectedConvId)
      .then((messages) => {
        const merged = mergeFetchedMessages(selectedConvId, messages);
        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConvId]: merged,
        }));
      })
      .catch((err) => {
        console.error(`[Zalo] fetch messages for conv ${selectedConvId}:`, err);
        fetchedConvIds.current.delete(selectedConvId);
      });
  }, [selectedConvId, conversations, connections]);

  // Quote / reply state
  const [replyingTo, setReplyingTo] = useState<ZaloChatMessage | null>(null);

  const handleAddConfig = () => {
    if (!configForm.oaId) {
      return;
    }

    const oa = connections.find((c) => c.id === configForm.oaId);
    if (!oa) {
      return;
    }

    const newConfig: AutoConfig = {
      id: `ac-${Date.now()}`,
      oaName: oa.oaName,
      createdBy: "Admin CRM",
      createdByRole: "Quản trị viên hệ thống",
      createdAt: new Date().toLocaleString("vi-VN", { hour12: false }),
    };
    setAutoConfigs((prev) => [newConfig, ...prev]);
    setConfigForm(initialConfigForm);
    setConfigFormOpen(false);
  };

  const openSettings = () => {
    setConfigFormOpen(false);
    setSettingsOpen(true);
  };

  const handleAddConnection = (connection: OaConnection) => {
    setConnections((prev) => {
      const exists = prev.some(
        (c) => c.oaOfficialId === connection.oaOfficialId,
      );
      if (exists) {
        return prev.map((c) =>
          c.oaOfficialId === connection.oaOfficialId
            ? { ...c, ...connection }
            : c,
        );
      }
      return [connection, ...prev];
    });
  };

  const handleRemoveConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateConversation = (
    id: string,
    patch: Partial<ZaloConversation>,
  ) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const openConfigForm = () => {
    setSettingsOpen(false);
    setConfigFormOpen(true);
  };

  // ────────────────────────────────────────────────────────────────
  // Gửi tin nhắn (text / image / file / quote) — theo tài liệu Zalo API.
  // Optimistic UI: insert pending → patch sent/failed sau khi nhận response.
  // ────────────────────────────────────────────────────────────────

  const getOaForConversation = useCallback(
    (conversationId: string): OaConnection | null => {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return null;
      return connections.find((c) => c.id === conv.oaId) || null;
    },
    [conversations, connections],
  );

  const upsertMessageInState = useCallback(
    (conversationId: string, message: ZaloChatMessage) => {
      setMessagesByConversation((prev) => {
        const current = prev[conversationId] || [];
        const existsIdx = current.findIndex((m) => m.id === message.id);
        const next =
          existsIdx >= 0
            ? current.map((m, i) => (i === existsIdx ? message : m))
            : [...current, message];
        return { ...prev, [conversationId]: next };
      });
    },
    [],
  );

  const patchMessageInState = useCallback(
    (
      conversationId: string,
      messageId: string,
      patch: Partial<ZaloChatMessage>,
    ) => {
      setMessagesByConversation((prev) => {
        const current = prev[conversationId] || [];
        const next = current.map((m) =>
          m.id === messageId ? { ...m, ...patch } : m,
        );
        return { ...prev, [conversationId]: next };
      });
      updateStoredMessage(conversationId, messageId, patch);
    },
    [],
  );

  const updateConversationPreview = useCallback(
    (conversationId: string, lastMessage: string) => {
      const nowTime = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage, timestamp: nowTime, unreadCount: 0 }
            : c,
        ),
      );
    },
    [],
  );

  const buildOptimisticMessage = useCallback(
    (
      conversationId: string,
      params: {
        content: string;
        messageType: NonNullable<ZaloChatMessage["messageType"]>;
        attachmentUrl?: string;
        attachmentName?: string;
        attachmentSize?: number;
        quote?: ZaloChatMessage | null;
      },
    ): ZaloChatMessage => {
      const nowTime = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const msg: ZaloChatMessage = {
        id: `local-${conversationId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        conversationId,
        sender: "agent",
        content: params.content,
        timestamp: nowTime,
        messageType: params.messageType,
        sendStatus: "pending",
        attachmentUrl: params.attachmentUrl,
        attachmentName: params.attachmentName,
        attachmentSize: params.attachmentSize,
      };
      if (params.quote) {
        msg.quoteMessageId = params.quote.zaloMessageId || params.quote.id;
        msg.quotePreview = {
          sender: params.quote.sender,
          content: params.quote.content,
          messageType: params.quote.messageType,
        };
      }
      return msg;
    },
    [],
  );

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const performSend = useCallback(
    async (
      conversationId: string,
      optimistic: ZaloChatMessage,
      send: () => Promise<{
        msgId: string;
        sentAt: string;
        attachmentUrl?: string;
        attachmentName?: string;
      }>,
    ) => {
      // Insert optimistic
      upsertMessageInState(conversationId, optimistic);
      appendStoredMessage(conversationId, optimistic);
      updateConversationPreview(
        conversationId,
        optimistic.content ||
          (optimistic.messageType === "image"
            ? "[Hình ảnh]"
            : optimistic.messageType === "file"
              ? "[Tệp đính kèm]"
              : ""),
      );

      try {
        const result = await send();
        patchMessageInState(conversationId, optimistic.id, {
          sendStatus: "sent",
          zaloMessageId: result.msgId,
          attachmentUrl: result.attachmentUrl ?? optimistic.attachmentUrl,
          attachmentName: result.attachmentName ?? optimistic.attachmentName,
          errorMessage: undefined,
        });
      } catch (err) {
        const errorMessage =
          err instanceof ZaloApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Gửi tin thất bại.";
        console.error("[Zalo Send] failed:", err);
        patchMessageInState(conversationId, optimistic.id, {
          sendStatus: "failed",
          errorMessage,
        });
      }
    },
    [patchMessageInState, updateConversationPreview, upsertMessageInState],
  );

  const handleSendText = useCallback(async () => {
    const text = chatComposerValue.trim();
    if (!selectedConvId || !text) return;

    const oa = getOaForConversation(selectedConvId);
    if (!oa?.accessToken) {
      console.warn("[Zalo Send] OA chưa kết nối hoặc thiếu access token");
      return;
    }

    const quote = replyingTo;
    const optimistic = buildOptimisticMessage(selectedConvId, {
      content: text,
      messageType: quote ? "quote" : "text",
      quote,
    });

    setChatComposerValue("");
    setReplyingTo(null);

    await performSend(selectedConvId, optimistic, () =>
      quote
        ? sendQuoteMessage({
            accessToken: oa.accessToken!,
            userId: selectedConvId,
            text,
            quoteMessageId: quote.zaloMessageId || quote.id,
          })
        : sendTextMessage({
            accessToken: oa.accessToken!,
            userId: selectedConvId,
            text,
          }),
    );
  }, [
    chatComposerValue,
    selectedConvId,
    replyingTo,
    getOaForConversation,
    buildOptimisticMessage,
    performSend,
  ]);

  const handleSendImage = useCallback(
    async (file: File, caption?: string) => {
      if (!selectedConvId) return;
      const oa = getOaForConversation(selectedConvId);
      if (!oa?.accessToken) return;
      if (file.size > 5 * 1024 * 1024) {
        console.warn("[Zalo Send] ảnh > 5MB");
        return;
      }

      const localUrl = await fileToDataUrl(file);
      const optimistic = buildOptimisticMessage(selectedConvId, {
        content: caption?.trim() || "",
        messageType: "image",
        attachmentUrl: localUrl,
        attachmentName: file.name,
        attachmentSize: file.size,
      });

      await performSend(selectedConvId, optimistic, () =>
        sendImageMessage({
          accessToken: oa.accessToken!,
          userId: selectedConvId,
          file,
          text: caption,
        }),
      );
    },
    [selectedConvId, getOaForConversation, buildOptimisticMessage, performSend],
  );

  const handleSendFile = useCallback(
    async (file: File, caption?: string) => {
      if (!selectedConvId) return;
      const oa = getOaForConversation(selectedConvId);
      if (!oa?.accessToken) return;
      if (file.size > 25 * 1024 * 1024) {
        console.warn("[Zalo Send] file > 25MB");
        return;
      }

      const optimistic = buildOptimisticMessage(selectedConvId, {
        content: caption?.trim() || "",
        messageType: "file",
        attachmentName: file.name,
        attachmentSize: file.size,
      });

      await performSend(selectedConvId, optimistic, () =>
        sendFileMessage({
          accessToken: oa.accessToken!,
          userId: selectedConvId,
          file,
          text: caption,
        }),
      );
    },
    [selectedConvId, getOaForConversation, buildOptimisticMessage, performSend],
  );

  const handleRetryMessage = useCallback(
    async (messageId: string) => {
      if (!selectedConvId) return;
      const messages = messagesByConversation[selectedConvId] || [];
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.sendStatus !== "failed") return;

      const oa = getOaForConversation(selectedConvId);
      if (!oa?.accessToken) return;

      // Reset về pending
      patchMessageInState(selectedConvId, messageId, {
        sendStatus: "pending",
        errorMessage: undefined,
      });

      const replay = async () => {
        if (message.messageType === "quote" && message.quoteMessageId) {
          return sendQuoteMessage({
            accessToken: oa.accessToken!,
            userId: selectedConvId,
            text: message.content,
            quoteMessageId: message.quoteMessageId,
          });
        }
        if (message.messageType === "image" || message.messageType === "file") {
          // Không thể retry ảnh/file vì File object không persist được
          // → báo lỗi rõ ràng
          throw new Error(
            "Không thể gửi lại tin có file đính kèm. Vui lòng chọn lại file và gửi.",
          );
        }
        return sendTextMessage({
          accessToken: oa.accessToken!,
          userId: selectedConvId,
          text: message.content,
        });
      };

      try {
        const result = await replay();
        patchMessageInState(selectedConvId, messageId, {
          sendStatus: "sent",
          zaloMessageId: result.msgId,
          errorMessage: undefined,
        });
      } catch (err) {
        const errorMessage =
          err instanceof ZaloApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Gửi lại thất bại.";
        patchMessageInState(selectedConvId, messageId, {
          sendStatus: "failed",
          errorMessage,
        });
      }
    },
    [
      selectedConvId,
      messagesByConversation,
      getOaForConversation,
      patchMessageInState,
    ],
  );

  const handleStartQuote = useCallback((message: ZaloChatMessage) => {
    setReplyingTo(message);
  }, []);

  const handleCancelQuote = useCallback(() => {
    setReplyingTo(null);
  }, []);

  return {
    activeTab,
    setActiveTab,
    selectedConvId,
    setSelectedConvId,
    settingsOpen,
    setSettingsOpen,
    configFormOpen,
    setConfigFormOpen,
    searchQuery,
    setSearchQuery,
    chatComposerValue,
    setChatComposerValue,
    connections,
    autoConfigs,
    setAutoConfigs,
    configForm,
    setConfigForm,
    selectedOaFilter,
    setSelectedOaFilter,
    selectedConversation,
    selectedOaName,
    selectedMessages,
    filteredConversations,
    isLoadingConversations,
    handleAddConfig,
    handleAddConnection,
    handleRemoveConnection,
    handleUpdateConversation,
    periodPreset,
    setPeriodPreset,
    customDays,
    setCustomDays,
    openSettings,
    openConfigForm,
    handleSendText,
    handleSendImage,
    handleSendFile,
    handleRetryMessage,
    replyingTo,
    handleStartQuote,
    handleCancelQuote,
  };
}
