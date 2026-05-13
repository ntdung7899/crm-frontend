import type { ZaloChatMessage } from "@/types/zalo-oa";

const STORAGE_KEY = "crm.zalo.messages.v1";

type Store = Record<string, ZaloChatMessage[]>;

const readStore = (): Store => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as Store) : {};
  } catch {
    return {};
  }
};

const writeStore = (store: Store) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
};

const normalizeMessage = (msg: ZaloChatMessage): ZaloChatMessage => ({
  ...msg,
  messageType: msg.messageType ?? "text",
  sendStatus: msg.sendStatus ?? "sent",
});

export const loadMessages = (conversationId: string): ZaloChatMessage[] => {
  const store = readStore();
  return (store[conversationId] ?? []).map(normalizeMessage);
};

export const saveMessages = (conversationId: string, messages: ZaloChatMessage[]): void => {
  const store = readStore();
  if (messages.length === 0) {
    delete store[conversationId];
  } else {
    store[conversationId] = messages;
  }
  writeStore(store);
};

export const appendMessage = (
  conversationId: string,
  message: ZaloChatMessage,
): ZaloChatMessage[] => {
  const current = loadMessages(conversationId);
  // Dedup theo zaloMessageId hoặc id để tránh duplicate khi StrictMode / socket reconnect
  const key = message.zaloMessageId || message.id;
  const isDuplicate = current.some(
    (m) => (m.zaloMessageId && m.zaloMessageId === message.zaloMessageId) || m.id === key,
  );
  if (isDuplicate) return current;
  const next = [...current, message];
  saveMessages(conversationId, next);
  return next;
};

export const updateMessage = (
  conversationId: string,
  messageId: string,
  patch: Partial<ZaloChatMessage>,
): ZaloChatMessage[] => {
  const current = loadMessages(conversationId);
  const next = current.map((m) => (m.id === messageId ? { ...m, ...patch } : m));
  saveMessages(conversationId, next);
  return next;
};

export const removeMessage = (
  conversationId: string,
  messageId: string,
): ZaloChatMessage[] => {
  const current = loadMessages(conversationId);
  const next = current.filter((m) => m.id !== messageId);
  saveMessages(conversationId, next);
  return next;
};

/**
 * Merge messages fetched từ Zalo API với tin local.
 * - Dedupe theo `zaloMessageId` (ưu tiên) hoặc `id`.
 * - Giữ tin local pending/failed (chưa gửi xong) — không bị overwrite.
 * - Sắp theo timestamp (giữ thứ tự đã có nếu timestamp giống nhau).
 */
export const mergeFetched = (
  conversationId: string,
  fetched: ZaloChatMessage[],
): ZaloChatMessage[] => {
  const local = loadMessages(conversationId);

  const fetchedKeys = new Set<string>();
  for (const m of fetched) {
    if (m.zaloMessageId) fetchedKeys.add(m.zaloMessageId);
  }

  // Giữ lại tin local mà:
  //  - đang pending/failed (chưa có zaloMessageId)
  //  - HOẶC đã sent nhưng zaloMessageId không nằm trong fetched (chưa lên server)
  const localToKeep = local.filter((m) => {
    if (m.sendStatus === "pending" || m.sendStatus === "failed") return true;
    if (m.zaloMessageId && fetchedKeys.has(m.zaloMessageId)) return false;
    return true;
  });

  const seen = new Set<string>();
  const merged: ZaloChatMessage[] = [];
  for (const m of [...fetched, ...localToKeep]) {
    const key = m.zaloMessageId || m.id;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(normalizeMessage(m));
  }

  saveMessages(conversationId, merged);
  return merged;
};
