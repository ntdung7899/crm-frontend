import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatVND(amount: number): string {
  if (!Number.isFinite(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " ₫";
}

export function formatVNDShort(amount: number): string {
  if (!Number.isFinite(amount)) return "0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return sign + (abs / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  }
  if (abs >= 1_000_000) {
    return sign + (abs / 1_000_000).toFixed(1).replace(/\.0$/, "") + " triệu";
  }
  if (abs >= 1_000) {
    return sign + (abs / 1_000).toFixed(0) + "k";
  }
  return sign + abs.toString();
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDateVN(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}\n${hours}:${minutes}`;
}

export function formatDateVNDateOnly(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const PERMISSION_DISPLAY_NAME_MAP: Record<string, string> = {
  "SITE LEADER": "Leader",
  "SITE_WORKER": "Worker",
  "SITE WORKER": "Worker",
  "SITE_OWNER": "Owner",
  "SITE OWNER": "Owner",
};

export function formatPermissionName(permissionName?: string | null): string {
  const normalized = (permissionName || "").trim();
  if (!normalized) {
    return "";
  }

  return PERMISSION_DISPLAY_NAME_MAP[normalized.toUpperCase()] || normalized;
}

export function normalizeWhitespace(value?: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function normalizeLoose(value?: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function formatDateToApi(date?: Date): string | undefined {
  if (!date) {
    return undefined;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export type StatusVariant = "default" | "success" | "warning" | "danger" | "info";

export function getStatusVariantFromName(statusName?: string | null): StatusVariant {
  const normalized = (statusName || "").toLowerCase();

  if (
    normalized.includes("hoàn thành") ||
    normalized.includes("thành công") ||
    normalized.includes("xong")
  ) {
    return "success";
  }

  if (
    normalized.includes("hủy") ||
    normalized.includes("từ chối") ||
    normalized.includes("thất bại")
  ) {
    return "danger";
  }

  if (
    normalized.includes("chờ") ||
    normalized.includes("chưa") ||
    normalized.includes("mới")
  ) {
    return "warning";
  }

  if (
    normalized.includes("đang") ||
    normalized.includes("thực hiện") ||
    normalized.includes("xử lý")
  ) {
    return "info";
  }

  return "default";
}
