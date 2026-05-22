"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Copy, Eye, Info, MoreVertical, RefreshCw, Search, Send, XCircle } from "lucide-react";
import { FiDownload, FiTrash2 } from "react-icons/fi";
import { TablePagination } from "@/components/ui/TablePagination";
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
    { label: string; className: string; dotColor: string }
> = {
    pending: { label: "Đang xử lý", className: "bg-amber-50 text-amber-600", dotColor: "bg-amber-500" },
    sent_to_zalo: { label: "Đã gửi", className: "bg-blue-50 text-blue-600", dotColor: "bg-blue-500" },
    delivered: { label: "Đã nhận", className: "bg-emerald-50 text-emerald-600", dotColor: "bg-emerald-500" },
    failed: { label: "Lỗi", className: "bg-red-50 text-red-600", dotColor: "bg-red-500" },
};

const PAGE_SIZE = 10;

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
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

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

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, oaFilter, modeFilter, fromDate, toDate]);

    const paginated = useMemo(
        () => filtered.slice((page - 1) * pageSize, page * pageSize),
        [filtered, page, pageSize],
    );

    const stats = useMemo(() => {
        let sent = 0;
        let failed = 0;
        let delivered = 0;
        for (const r of records) {
            if (r.status === "sent_to_zalo") sent += 1;
            else if (r.status === "delivered") {
                delivered += 1;
                sent += 1;
            } else if (r.status === "failed") failed += 1;
        }
        return { total: records.length, sent, failed, delivered };
    }, [records]);

    const handleExportCsv = () => {
        if (filtered.length === 0) return;
        const headers = [
            "createdAt", "oa", "templateName", "templateId", "phone",
            "trackingId", "msgId", "status", "mode", "errorCode",
            "errorMessage", "templateData",
        ];
        const csvRows = filtered.map((r) =>
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
        const csv = [headers.join(","), ...csvRows].join("\n");
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

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setModeFilter("all");
        setOaFilter("all");
        setFromDate("");
        setToDate("");
    };

    const shortTrackingId = (id: string) => {
        if (id.length <= 16) return id;
        return `${id.slice(0, 8)}...${id.slice(-5)}`;
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Lịch sử gửi template</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Theo dõi toàn bộ tin nhắn template đã gửi qua Zalo OA, trạng thái gửi, lỗi và tracking.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="inline-flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Làm mới
                    </button>
                    <button
                        onClick={handleExportCsv}
                        disabled={filtered.length === 0}
                        className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                    >
                        <FiDownload className="h-4 w-4" />
                        Xuất CSV
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>
                        {showMoreMenu && (
                            <div className="absolute right-0 top-14 z-20 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                                <button
                                    onClick={() => { setShowMoreMenu(false); refresh(); }}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Đồng bộ template
                                </button>
                                <button
                                    onClick={() => { setShowMoreMenu(false); handleClear(); }}
                                    disabled={records.length === 0}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                                >
                                    <FiTrash2 className="h-4 w-4" />
                                    Xóa lịch sử
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<Send className="h-6 w-6" />}
                    label="Tổng tin"
                    value={stats.total}
                    note="Tổng số template đã gửi"
                    className="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    icon={<Send className="h-6 w-6" />}
                    label="Đã gửi"
                    value={stats.sent}
                    note="Tin đã gửi sang Zalo"
                    className="bg-blue-50 text-blue-600"
                />
                <StatCard
                    icon={<CheckCircle2 className="h-6 w-6" />}
                    label="Đã nhận"
                    value={stats.delivered}
                    note="Tin đã được khách nhận"
                    className="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    icon={<XCircle className="h-6 w-6" />}
                    label="Lỗi"
                    value={stats.failed}
                    note="Tin gửi thất bại"
                    className="bg-red-50 text-red-600"
                />
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_200px_200px_200px] xl:items-end">
                    <div>
                        <span className="mb-2 block text-sm font-semibold text-gray-700">Tìm kiếm</span>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm số điện thoại, tracking, mã tin, template..."
                                className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                    </div>
                    <FilterSelect
                        label="Trạng thái"
                        value={statusFilter}
                        onChange={(v) => setStatusFilter(v as typeof statusFilter)}
                        options={[
                            { value: "all", label: "Tất cả trạng thái" },
                            { value: "pending", label: "Đang xử lý" },
                            { value: "sent_to_zalo", label: "Đã gửi" },
                            { value: "delivered", label: "Đã nhận" },
                            { value: "failed", label: "Lỗi" },
                        ]}
                    />
                    <FilterSelect
                        label="Chế độ"
                        value={modeFilter}
                        onChange={(v) => setModeFilter(v as typeof modeFilter)}
                        options={[
                            { value: "all", label: "Tất cả chế độ" },
                            { value: "development", label: "Development" },
                            { value: "production", label: "Production" },
                        ]}
                    />
                    <FilterSelect
                        label="OA"
                        value={oaFilter}
                        onChange={(v) => setOaFilter(v)}
                        options={[
                            { value: "all", label: "Tất cả OA" },
                            ...connections.map((c) => ({ value: c.id, label: c.oaName })),
                        ]}
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-end">
                    <div>
                        <span className="mb-2 block text-sm font-semibold text-gray-700">Khoảng ngày gửi</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                            />
                            <span className="text-gray-400">~</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                    </div>
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Lọc dữ liệu
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h2 className="text-base font-bold text-gray-900">
                        Danh sách lịch sử gửi ({filtered.length})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                        <thead className="border-b border-gray-100 bg-gray-50/80">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Thời gian</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">OA / Kênh</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Template</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Người nhận</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <span className="flex items-center gap-1">Tracking <Info className="h-3.5 w-3.5 text-gray-400" /></span>
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Chế độ</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Mã tin / Lỗi</th>
                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginated.map((r) => {
                                const badge = STATUS_BADGE[r.status];
                                const oaName = oaNameById[r.oaId] || r.oaId;
                                const time = new Date(r.createdAt);
                                const timeStr = time.toLocaleTimeString("vi-VN", { hour12: false });
                                const dateStr = time.toLocaleDateString("vi-VN");

                                return (
                                    <tr key={r.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-900">{timeStr}</p>
                                            <p className="text-xs text-gray-400">{dateStr}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">Z</div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{oaName}</p>
                                                    <p className="text-xs text-gray-400">Zalo OA</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-900">{r.templateName || "—"}</p>
                                            {r.templateCode && <p className="text-xs text-gray-400">{r.templateCode}</p>}
                                            <p className="text-[11px] text-gray-400">ID: {r.templateId}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-mono text-gray-900">{r.phone}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-mono text-gray-600" title={r.trackingId}>
                                                    {shortTrackingId(r.trackingId)}
                                                </span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(r.trackingId)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="Sao chép"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${r.mode === "production" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                                {r.mode === "production" ? "Prod" : "Dev"}
                                            </span>
                                            <p className="mt-0.5 text-[11px] text-gray-400">
                                                {r.mode === "production" ? "Gửi thật" : "Test mode"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                                                <span className={`h-2 w-2 rounded-full ${badge.dotColor}`} />
                                                {badge.label}
                                            </span>
                                            {r.status === "sent_to_zalo" && (
                                                <p className="mt-0.5 text-[11px] text-gray-400">100%</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {r.msgId ? (
                                                <p className="text-xs font-mono text-gray-600 truncate max-w-[140px]" title={r.msgId}>{r.msgId}</p>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                            {r.errorMessage && (
                                                <p className="mt-0.5 text-xs text-red-500 truncate max-w-[180px]" title={r.errorMessage}>
                                                    {r.errorCode ? `[${r.errorCode}] ` : ""}{r.errorMessage}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end">
                                                <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50" title="Xem chi tiết">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center text-sm text-gray-400">
                                        {records.length === 0
                                            ? "Chưa có tin template nào được gửi."
                                            : "Không có kết quả khớp bộ lọc."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <TablePagination
                    currentPage={page}
                    pageSize={pageSize}
                    totalCount={filtered.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
            </div>

            {/* Status legend */}
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Chú thích trạng thái</span>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <strong>Đã gửi:</strong> Tin đã được gửi sang Zalo
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <strong>Đã nhận:</strong> Khách hàng đã nhận được tin
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <strong>Đang xử lý:</strong> Tin đang được gửi
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <strong>Lỗi:</strong> Gửi thất bại
                    </span>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, note, className }: { icon: React.ReactNode; label: string; value: number; note: string; className: string }) {
    return (
        <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${className}`}>{icon}</span>
            <div className="min-w-0">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString("vi-VN")}</p>
                <p className="mt-1 text-sm text-gray-400">{note}</p>
            </div>
        </div>
    );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-600 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
        </label>
    );
}
