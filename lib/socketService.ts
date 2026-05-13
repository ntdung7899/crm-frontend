import { io, Socket } from "socket.io-client";

// ─────────────────────────────────────────────────────────────────────
// Socket singleton — chỉ tạo 1 instance duy nhất cho toàn app.
// Theo tài liệu backend: auth qua JWT, backend tự join tất cả OA active,
// không cần subscribe thủ công.
// ─────────────────────────────────────────────────────────────────────

let socket: Socket | null = null;

export interface ZaloNewMessage {
  oa_id: string;
  sender_id: string;
  event_name: string;
  direction: "inbound" | "outbound";
  message_text: string | null;
  message_id: string;
  attachments: unknown[] | null;
  zalo_timestamp: number | null;
  sent_by: string | null;
}

export function connectSocket(jwtToken: string): Socket {
  if (socket?.connected) return socket;

  // Nếu đã có instance nhưng chưa connected (e.g. bị disconnect) thì reconnect
  if (socket) {
    socket.connect();
    return socket;
  }

  // NEXT_PUBLIC_API_URL = "https://gateway.dev.meu-solutions.com/crm-backend"
  // socket.io-client chỉ dùng origin làm host, bỏ phần pathname → phải tách thủ công:
  //   origin  = "https://gateway.dev.meu-solutions.com"
  //   path    = "/crm-backend/socket.io"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const parsedUrl = new URL(apiUrl);
  const socketOrigin = parsedUrl.origin; // "https://gateway.dev.meu-solutions.com"
  const socketPath =
    (parsedUrl.pathname.replace(/\/$/, "") || "") + "/socket.io"; // "/crm-backend/socket.io"
  console.log("[Socket] Connecting to:", socketOrigin + socketPath);
  socket = io(socketOrigin, {
    auth: { token: jwtToken },
    path: socketPath,
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket!.id);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connect error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.warn("[Socket] Disconnected:", reason);
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
