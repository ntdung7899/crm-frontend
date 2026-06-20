"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatVND, formatDateVN } from "@/lib/utils";
import type { OrderApiRow } from "@/types/api";

const STATUS: Record<OrderApiRow["status"], { label: string; variant: "warning" | "info" | "success" | "danger" }> = {
    pending: { label: "Chờ xử lý", variant: "warning" },
    processing: { label: "Đang xử lý", variant: "info" },
    completed: { label: "Hoàn thành", variant: "success" },
    cancelled: { label: "Đã hủy", variant: "danger" },
};

export function OrderDetailModal({ order, onClose }: { order: OrderApiRow | null; onClose: () => void }) {
    if (!order) return null;
    const st = STATUS[order.status];
    return (
        <Modal isOpen={!!order} onClose={onClose} title={`Đơn hàng ${order.order_code}`} size="xl">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    {order.created_at && <span className="text-xs text-gray-500">{formatDateVN(order.created_at)}</span>}
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div><dt className="text-xs text-gray-500">Khách hàng</dt><dd className="text-gray-900">{order.customer_uu?.full_name ?? "-"}</dd></div>
                    <div><dt className="text-xs text-gray-500">Người tạo</dt><dd className="text-gray-900">{order.created_by_user?.full_name ?? "-"}</dd></div>
                    {order.note && <div className="col-span-2"><dt className="text-xs text-gray-500">Ghi chú</dt><dd className="text-gray-900">{order.note}</dd></div>}
                </dl>

                <div>
                    <h3 className="mb-2 text-sm font-semibold">Sản phẩm</h3>
                    <table className="w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Tên</th>
                                <th className="px-3 py-2 text-right">SL</th>
                                <th className="px-3 py-2 text-right">Đơn giá</th>
                                <th className="px-3 py-2 text-right">Giảm</th>
                                <th className="px-3 py-2 text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(order.order_items ?? []).map((it) => (
                                <tr key={it.id} className="border-t border-gray-100">
                                    <td className="px-3 py-2">{it.product_name}{it.product_code ? ` (${it.product_code})` : ""}</td>
                                    <td className="px-3 py-2 text-right">{it.quantity}</td>
                                    <td className="px-3 py-2 text-right">{formatVND(Number(it.unit_price))}</td>
                                    <td className="px-3 py-2 text-right">{formatVND(Number(it.discount_amount))}</td>
                                    <td className="px-3 py-2 text-right font-medium">{formatVND(Number(it.total_price))}</td>
                                </tr>
                            ))}
                            {(order.order_items ?? []).length === 0 && (
                                <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400">Không có sản phẩm</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="ml-auto w-64 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Tạm tính</span><span>{formatVND(Number(order.subtotal_amount))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Giảm giá</span><span>-{formatVND(Number(order.discount_amount))}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold"><span>Tổng cộng</span><span className="text-primary-700">{formatVND(Number(order.total_amount))}</span></div>
                </div>
            </div>
        </Modal>
    );
}
