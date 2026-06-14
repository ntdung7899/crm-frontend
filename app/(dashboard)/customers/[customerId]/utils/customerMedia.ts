import type { CustomerFileRef } from "@/types/api";

export interface CustomerImage {
    id: string;
    dataUrl: string;
    caption: string;
    uploadedAt: string;
}

export interface CustomerNote {
    id: string;
    content: string;
    createdAt: string;
}

export interface CustomerMediaStore {
    workImages: CustomerImage[];
    invoiceImages: CustomerImage[];
    notes: CustomerNote[];
}

const STORAGE_KEY = "crm.customers.media.v1";

const emptyStore = (): CustomerMediaStore => ({
    workImages: [],
    invoiceImages: [],
    notes: [],
});

const readAll = (): Record<string, CustomerMediaStore> => {
    if (typeof window === "undefined") return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed ? parsed : {};
    } catch {
        return {};
    }
};

const writeAll = (data: Record<string, CustomerMediaStore>) => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // ignore quota
    }
};

export const loadCustomerMedia = (customerId: string): CustomerMediaStore => {
    const all = readAll();
    return all[customerId] ?? emptyStore();
};

export const saveCustomerMedia = (customerId: string, media: CustomerMediaStore): void => {
    const all = readAll();
    const isEmpty =
        media.workImages.length === 0 &&
        media.invoiceImages.length === 0 &&
        media.notes.length === 0;
    if (isEmpty) {
        delete all[customerId];
    } else {
        all[customerId] = media;
    }
    writeAll(all);
};

export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};

export const generateId = (prefix: string): string =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── File đính kèm khách hàng (lưu qua PUT /customers/:id, field `file`) ──

/** Chuẩn hoá field `file` (object | array | null) từ BE về mảng. */
export const normalizeCustomerFiles = (
    file: CustomerFileRef[] | CustomerFileRef | null | undefined,
): CustomerFileRef[] => {
    if (!file) return [];
    const list = Array.isArray(file) ? file : [file];
    return list.filter((f): f is CustomerFileRef => Boolean(f && f.url));
};

/** Ghép đường dẫn tương đối (vd "/files/x.pdf") với NEXT_PUBLIC_API_URL. */
export const resolveFileUrl = (url?: string | null): string => {
    if (!url) return "";
    if (/^(https?:|blob:|data:)/i.test(url)) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (!baseUrl) return url;
    return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

export const isImageFile = (nameOrUrl: string): boolean =>
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(nameOrUrl);
