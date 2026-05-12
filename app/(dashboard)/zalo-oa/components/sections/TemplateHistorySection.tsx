"use client";

import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/Card";
import { clearTemplateMessages } from "@/lib/zaloTemplateMessageStore";
import { apiClient } from "@/lib/api-client";
import type { OaConnection, ZbsTemplateMessageRecord } from "@/types/zalo-oa";

const CONNECTIONS_STORAGE_KEY = "crm.zaloOa.connections.v1";

const loadStoredConnections = (): OaConnection[] => {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(CONNECTIONS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as OaConnection[]) : [];
    } catch {
        return [];
    }
};

const STATUS_BADGE: Record<
    ZbsTemplateMessageRecord["status"],
    { label: string; className: string }
> = {
    pending: { label: "Đang gửi", className: "bg-gray-100 text-gray-600" },
    sent_to_zalo: { label: "Đã gửi", className: "bg-blue-100 text-blue-700" },
    delivered: { label: "Đã nhận", className: "bg-emerald-100 text-emerald-700" },
    failed: { label: "Thất bại", className: "bg-red-100 text-red-700" },
};

const PAGE_SIZE = 20;

export function TemplateHistorySection() {
    const [records, setRecords] = useState<ZbsTemplateMessageRecord[]>([]);
    const [connections, setConnections] = useState<OaConnection[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | ZbsTemplateMessageRecord["status"]>("all");
    const [oaFilter, setOaFilter] = useState<string>("all");
    const [modeFilter, setModeFilter] = useState<"all" | "development" | "production">("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [page, setPage] = useState(1);

    const refresh = async () => {
        setConnections(loadStoredConnections());
        setLoading(true);
        try {
            const res = await apiClient.get<{
                responseData: {
                    rows: {
                        id?: string;
                        channel?: string;
                        oa_official_id?: string;
                        template_id?: string;
                        template_code?: string;
                        template_name?: string;
                        phone?: string;
                        mode?: "development" | "production";
                        template_data?: Record<string, string>;
                        status?: string;
                        sent?: number;
                        failed?: number;
                        created_at?: string;
                        updated_at?: string;
                    }[];
                };
            }>("/api/v1.0/marketing");
            const rows = res.responseData?.rows ?? [];
            const mapped: ZbsTemplateMessageRecord[] = rows.map((row) => ({
                id: row.id,
                oaId: row.channel ?? "",
                oaOfficialId: row.oa_official_id,
                templateId: row.template_id ?? "",
                templateCode: row.template_code,
                templateName: row.template_name,
                phone: row.phone ?? "",
                normalizedPhone: row.phone ?? "",
                trackingId: row.id ?? "",
                mode: (row.mode ?? "production") as ZbsTemplateMessageRecord["mode"],
                templateData: row.template_data ?? {},
                status: (
                    row.status === "completed"
                        ? row.failed === 1 ? "failed" : "sent_to_zalo"
                        : row.status === "failed" ? "failed" : "pending"
                ) as ZbsTemplateMessageRecord["status"],
                createdAt: row.created_at ?? new Date().toISOString(),
                updatedAt: row.updated_at ?? new Date().toISOString(),
            }));
            // Mới nhất lên đầu
            setRecords(mapped.reverse());
        } catch (err) {
            console.error("[TemplateHistory] Load thất bại:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const oaNameById = useMemo(
        () =>
            connections.reduce<Record<string, string>>((acc, c) => {
                acc[c.id] = c.oaName;
                return acc;
            }, {}),
        [connections],
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return records.filter((r) => {
            if (statusFilter !== "all" && r.status !== statusFilter) return false;
            if (oaFilter !== "all" && r.oaId !== oaFilter) return false;
            if (modeFilter !== "all" && r.mode !== modeFilter) return false;
            if (fromDate && r.createdAt < new Date(fromDate).toISOString()) return false;
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                if (r.createdAt > end.toISOString()) return false;
            }
            if (!q) return true;
            return (
                r.phone.toLowerCase().includes(q) ||
                r.trackingId.toLowerCase().includes(q) ||
                (r.msgId || "").toLowerCase().includes(q) ||
                (r.templateName || "").toLowerCase().includes(q) ||
                r.templateId.toLowerCase().includes(q)
            );
        });
    }, [records, search, statusFilter, oaFilter, modeFilter, fromDate, toDate]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [page, totalPages]);

    const paginated = useMemo(
        () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [filtered, page],
    );

    const stats = useMemo(() => {
        let sent = 0;
        let failed = 0;
        let delivered = 0;
        for (const r of filtered) {
            if (r.status === "sent_to_zalo") sent += 1;
            else if (r.status === "delivered") {
                delivered += 1;
                sent += 1;
            } else if (r.status === "failed") failed += 1;
        }
        return { total: filtered.length, sent, failed, delivered };
    }, [filtered]);

    const handleExportCsv = () => {
        if (filtered.length === 0) return;
        const headers = [
            "createdAt",
            "oa",
            "templateName",
            "templateId",
            "phone",
            "trackingId",
            "msgId",
            "status",
            "mode",
            "errorCode",
            "errorMessage",
            "templateData",
        ];
        const rows = filtered.map((r) =>
            [
                r.createdAt,
                oaNameById[r.oaId] || r.oaId,
                r.templateName || "",
                r.templateId,
                r.phone,
                r.trackingId,
                r.msgId || "",
                r.status,
                r.mode,
                r.errorCode || "",
                (r.errorMessage || "").replace(/"/g, '""'),
                JSON.stringify(r.templateData).replace(/"/g, '""'),
            ]
                .map((v) => `"${String(v)}"`)
                .join(","),
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `zalo-template-history-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        if (!confirm("Xoá toàn bộ lịch sử gửi template? Không thể khôi phục.")) return;
        clearTemplateMessages();
        refresh();
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-gray-800">Lịch sử gửi template</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Toàn bộ tin template đã gửi qua Zalo (lưu cục bộ).
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs disabled:opacity-50"
                    >
                        <FiRefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Làm mới
                    </button>
                    <button
                        type="button"
                        onClick={handleExportCsv}
                        disabled={filtered.length === 0}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-xs"
                    >
                        <FiDownload className="h-3 w-3" /> Xuất CSV
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={records.length === 0}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg text-xs"
                    >
                        <FiTrash2 className="h-3 w-3" /> Xoá lịch sử
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="py-3">
                        <p className="text-xs text-gray-500">Tổng tin</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">
                            {stats.total.toLocaleString("vi-VN")}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3">
                        <p className="text-xs text-gray-500">Đã gửi (sent_to_zalo)</p>
                        <p className="mt-1 text-lg font-bold text-blue-700">{stats.sent}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3">
                        <p className="text-xs text-gray-500">Đã nhận (delivered)</p>
                        <p className="mt-1 text-lg font-bold text-emerald-700">
                            {stats.delivered}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3">
                        <p className="text-xs text-gray-500">Lỗi</p>
                        <p className="mt-1 text-lg font-bold text-red-600">{stats.failed}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800">Bộ lọc</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Phone / tracking / msg_id / template..."
                            className="lg:col-span-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-white"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as typeof statusFilter);
                                setPage(1);
                            }}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-white"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Đang gửi</option>
                            <option value="sent_to_zalo">Đã gửi</option>
                            <option value="delivered">Đã nhận</option>
                            <option value="failed">Thất bại</option>
                        </select>
                        <select
                            value={modeFilter}
                            onChange={(e) => {
                                setModeFilter(e.target.value as typeof modeFilter);
                                setPage(1);
                            }}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-white"
                        >
                            <option value="all">Tất cả mode</option>
                            <option value="development">🧪 Development</option>
                            <option value="production">🚀 Production</option>
                        </select>
                        <select
                            value={oaFilter}
                            onChange={(e) => {
                                setOaFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-white"
                        >
                            <option value="all">Tất cả OA</option>
                            {connections.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.oaName}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                setPage(1);
                            }}
                            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-white"
                            placeholder="Từ ngày"
                            title="Từ ngày"
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value);
                                setPage(1);
                            }}
                            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-white"
                            placeholder="Đến ngày"
                            title="Đến ngày"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                <th className="px-3 py-2 font-medium text-gray-600">Thời gian</th>
                                <th className="px-3 py-2 font-medium text-gray-600">OA</th>
                                <th className="px-3 py-2 font-medium text-gray-600">Template</th>
                                <th className="px-3 py-2 font-medium text-gray-600">Phone</th>
                                <th className="px-3 py-2 font-medium text-gray-600">Tracking</th>
                                <th className="px-3 py-2 font-medium text-gray-600">Mode</th>
                                <th className="px-3 py-2 font-medium text-gray-600">Trạng thái</th>
                                <th className="px-3 py-2 font-medium text-gray-600">msg_id / Lỗi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((r) => (
                                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 align-top">
                                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                                        {new Date(r.createdAt).toLocaleString("vi-VN", {
                                            hour12: false,
                                        })}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                        {oaNameById[r.oaId] || r.oaId}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">
                                        <p className="font-medium">{r.templateName || r.templateId}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{r.templateId}</p>
                                    </td>
                                    <td className="px-3 py-2 font-mono text-gray-700">{r.phone}</td>
                                    <td className="px-3 py-2 font-mono text-[10px] text-gray-500 break-all max-w-[140px]">
                                        {r.trackingId}
                                    </td>
                                    <td className="px-3 py-2">
                                        {r.mode === "production" ? (
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                                                🚀 Prod
                                            </span>
                                        ) : (
                                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
                                                🧪 Dev
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_BADGE[r.status].className}`}
                                        >
                                            {STATUS_BADGE[r.status].label}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-600 max-w-[200px]">
                                        {r.msgId && (
                                            <p className="font-mono text-[10px] truncate" title={r.msgId}>
                                                {r.msgId}
                                            </p>
                                        )}
                                        {r.errorMessage && (
                                            <p className="text-red-600 text-[10px]" title={r.errorMessage}>
                                                {r.errorCode ? `[${r.errorCode}] ` : ""}
                                                {r.errorMessage}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-3 py-8 text-center text-gray-400">
                                        {records.length === 0
                                            ? "Chưa có tin template nào được gửi."
                                            : "Không có kết quả khớp bộ lọc."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                        <span className="text-[11px] text-gray-500">
                            Trang {page} / {totalPages} • {filtered.length} kết quả
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                            >
                                «
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                            >
                                ‹ Trước
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Sau ›
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage(totalPages)}
                                disabled={page >= totalPages}
                                className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
