import { apiClient } from "@/lib/api-client";

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  message_type: string;
  file_url: string | null;
  is_read: boolean;
  status: string;
  created_at: string;
}

export interface ConversationSummary {
  other_user_id: string;
  last_message: string | null;
  last_message_type: string;
  last_message_at: string;
  unread_count: number;
}

export interface SendMessagePayload {
  senderId: string;
  receiverId: string;
  message: string;
  messageType?: string;
}

export interface UpdateMessagePayload {
  isRead?: boolean;
  readAt?: string;
  status?: string;
}

export interface ChatMessagesListResponse {
  responseData: ConversationSummary[];
}

export interface ChatConversationResponse {
  responseData: ChatMessage[];
}

export interface SendMessageResponse {
  responseData: ChatMessage;
}

export const chatService = {
  getConversations: (): Promise<ChatMessagesListResponse> =>
    apiClient.get<ChatMessagesListResponse>("/api/v1.0/chat_messages"),

  getConversation: (peerId: string): Promise<ChatConversationResponse> =>
    apiClient.get<ChatConversationResponse>(`/api/v1.0/chat_messages/${peerId}`),

  sendMessage: (body: SendMessagePayload): Promise<SendMessageResponse> =>
    apiClient.post<SendMessageResponse>("/api/v1.0/chat_messages", {
      messageType: "text",
      ...body,
    }),

  updateMessage: (
    messageId: string,
    body: UpdateMessagePayload,
  ): Promise<unknown> =>
    apiClient.put(`/api/v1.0/chat_messages/${messageId}`, body),
};
