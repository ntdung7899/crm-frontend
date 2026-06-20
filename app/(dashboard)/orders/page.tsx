"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import { ordersService } from "@/services/orders";
import type { OrderApiRow } from "@/types/api";
import { OrderDetailModal } from "./components/OrderDetailModal";

const STATUS: Record<OrderApiRow["status"], { label: string; variant: "warning" | "info" | "success" | "danger" }> = {
    pending: { label: "Chờ xử lý", variant: "warning" },
    processing: { label: "Đang xử lý", variant: "info" },
    completed: { label: "Hoàn thành", variant: "success" },
    cancelled: { label: "Đã hủy", variant: "danger" },
};

export default function OrdersPage() {
    const toast = useToast();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [items, setItems] = useState<OrderApiRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [detail, setDetail] = useState<OrderApiRow | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await ordersService.getOrders({ pageSize: "200" });
            setItems(res.responseData?.rows ?? []);
        } catch (e) {
            toast.error("Tải đơn hàng thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => { void load(); }, [load]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter((o) => {
            if (q && !o.order_code.toLowerCase().includes(q)) return false;
            if (statusFilter && o.status !== statusFilter) return false;
            return true;
        });
    }, [items, search, statusFilter]);

    const handleDelete = (o: OrderApiRow) => {
        requestDeleteConfirmation({
            title: "Xóa đơn hàng",
            description: `Bạn có chắc chắn muốn xóa đơn "${o.order_code}"?`,
            onConfirm: async () => {
                try {
                    await ordersService.deleteOrder(o.id);
                    toast.success("Đã xóa đơn hàng");
                    await load();
                } catch (e) {
                    toast.error("Xóa thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                }
            },
        });
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
                <Input placeholder="Mã đơn hàng" value={search} onChange={(e) => setSearch(e.target.value)} className="ml-2 max-w-xs" />
                <div className="w-44">
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label }))} placeholder="Tất cả trạng thái" />
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                            <th className="px-4 py-3 text-left font-medium">Ngày</th>
                            <th className="px-4 py-3 text-left font-medium">Khách hàng</th>
                            <th className="px-4 py-3 text-right font-medium">SL SP</th>
                            <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                            <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="py-10"><div className="flex justify-center"><Spinner /></div></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="py-8 text-center text-gray-500">Chưa có đơn hàng</td></tr>
                        ) : (
                            filtered.map((o) => (
                                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-primary-700">{o.order_code}</td>
                                    <td className="px-4 py-3">{o.created_at ? formatDateVNDateOnly(o.created_at) : "-"}</td>
                                    <td className="px-4 py-3 text-gray-600">{o.customer_uu?.full_name ?? "-"}</td>
                                    <td className="px-4 py-3 text-right">{o.order_items?.length ?? 0}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-orange-600">{formatVND(Number(o.total_amount))}</td>
                                    <td className="px-4 py-3"><Badge variant={STATUS[o.status].variant}>{STATUS[o.status].label}</Badge></td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setDetail(o)} className="mr-2 text-gray-500 hover:text-primary-600" title="Xem"><FiEye className="inline h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(o)} className="text-gray-500 hover:text-red-600" title="Xóa"><FiTrash2 className="inline h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <OrderDetailModal order={detail} onClose={() => setDetail(null)} />
            <DeleteConfirmationDialog />
        </div>
    );
}
