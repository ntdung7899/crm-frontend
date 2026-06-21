import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { JobApiRow, StatusApiRow } from "@/types/api";
import {
    FiEdit2,
    FiUser,
    FiUsers,
    FiCalendar,
    FiAlignLeft,
    FiMessageSquare,
    FiClipboard,
    FiShoppingBag,
} from "react-icons/fi";
import { getFormTimeFromApi } from "../utils/tasksHelpers";
import { ordersService } from "@/services/orders";
import { formatVND } from "@/lib/utils";

type TaskDetailModalProps = {
    isOpen: boolean;
    selectedJob: JobApiRow | null;
    statuses: StatusApiRow[];
    getPerformerLabel: (job: JobApiRow) => string;
    getCustomerLabel: (job: JobApiRow) => string;
    getUserNameById: (id: string | null | undefined) => string | null;
    onClose: () => void;
    onEdit: (job: JobApiRow) => void;
};

function resolveStatus(job: JobApiRow, statuses: StatusApiRow[]) {
    if (job.status) return job.status;
    if (!job.status_id) return null;
    return statuses.find((s) => s.id === job.status_id) ?? null;
}

function StatusBadge({ name }: { name: string }) {
    const lower = name.toLowerCase();
    let cls = "bg-gray-100 text-gray-600";
    if (lower.includes("chờ") || lower.includes("pending")) cls = "bg-amber-100 text-amber-700";
    else if (lower.includes("đang") || lower.includes("progress")) cls = "bg-blue-100 text-blue-700";
    else if (lower.includes("hoàn") || lower.includes("done") || lower.includes("complete")) cls = "bg-green-100 text-green-700";
    else if (lower.includes("huỷ") || lower.includes("cancel")) cls = "bg-red-100 text-red-600";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
            {name}
        </span>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                <div className="mt-0.5 text-sm font-medium text-gray-800">{value}</div>
            </div>
        </div>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
            <div className="flex-1 border-t border-gray-100" />
        </div>
    );
}

export function TaskDetailModal({
    isOpen,
    selectedJob,
    statuses,
    getPerformerLabel,
    getCustomerLabel,
    getUserNameById,
    onClose,
    onEdit,
}: TaskDetailModalProps) {
    const [order, setOrder] = useState<any | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);

    useEffect(() => {
        if (!isOpen || !selectedJob?.id) {
            setOrder(null);
            return;
        }
        let active = true;
        setLoadingOrder(true);
        ordersService.getOrders({ job_id: selectedJob.id, pageSize: "1" })
            .then((res) => {
                if (active) {
                    setOrder(res.responseData?.rows?.[0] || null);
                }
            })
            .catch(() => {
                if (active) setOrder(null);
            })
            .finally(() => {
                if (active) setLoadingOrder(false);
            });
        return () => { active = false; };
    }, [isOpen, selectedJob?.id]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết công việc"
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Đóng</Button>
                    {selectedJob && (
                        <Button
                            variant="primary"
                            onClick={() => { onClose(); onEdit(selectedJob); }}
                        >
                            <FiEdit2 className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    )}
                </>
            }
        >
            {selectedJob && (() => {
                const jt = getFormTimeFromApi(selectedJob.job_time);
                const status = resolveStatus(selectedJob, statuses);
                const startStr = jt.start ? new Date(jt.start).toLocaleString("vi-VN") : null;
                const endStr = jt.end ? new Date(jt.end).toLocaleString("vi-VN") : null;

                return (
                    <div className="space-y-5">
                        {/* Title + status */}
                        <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Tên công việc</p>
                                <p className="text-base font-semibold text-gray-900 leading-snug">
                                    {selectedJob.job_name}
                                </p>
                            </div>
                            {status && <StatusBadge name={status.name} />}
                        </div>

                        {/* Content & Note */}
                        <div className="space-y-3">
                            <SectionDivider label="Nội dung" />
                            <InfoRow
                                icon={<FiAlignLeft className="h-4 w-4" />}
                                label="Nội dung"
                                value={
                                    <p className="whitespace-pre-wrap text-gray-700">
                                        {selectedJob.content || <span className="text-gray-400 italic">Chưa có</span>}
                                    </p>
                                }
                            />
                            {selectedJob.note && (
                                <InfoRow
                                    icon={<FiMessageSquare className="h-4 w-4" />}
                                    label="Ghi chú"
                                    value={<p className="whitespace-pre-wrap text-gray-700">{selectedJob.note}</p>}
                                />
                            )}
                        </div>

                        {/* Time */}
                        <div className="space-y-3">
                            <SectionDivider label="Thời gian" />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow
                                    icon={<FiCalendar className="h-4 w-4" />}
                                    label="Bắt đầu"
                                    value={startStr ?? <span className="text-gray-400 italic">Chưa đặt</span>}
                                />
                                <InfoRow
                                    icon={<FiCalendar className="h-4 w-4" />}
                                    label="Kết thúc"
                                    value={endStr ?? <span className="text-gray-400 italic">Chưa đặt</span>}
                                />
                            </div>
                        </div>

                        {/* Assignee & Customer */}
                        <div className="space-y-3">
                            <SectionDivider label="Phân công" />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow
                                    icon={<FiUsers className="h-4 w-4" />}
                                    label="Người thực hiện"
                                    value={getPerformerLabel(selectedJob) || <span className="text-gray-400 italic">Chưa gán</span>}
                                />
                                <InfoRow
                                    icon={<FiUser className="h-4 w-4" />}
                                    label="Khách hàng"
                                    value={getCustomerLabel(selectedJob) || <span className="text-gray-400 italic">Chưa gán</span>}
                                />
                            </div>
                        </div>

                        {/* Attached Order */}
                        {loadingOrder ? (
                            <div className="space-y-3">
                                <SectionDivider label="Đơn hàng" />
                                <div className="text-xs text-gray-500 italic px-1">Đang tải thông tin đơn hàng...</div>
                            </div>
                        ) : order ? (
                            <div className="space-y-3">
                                <SectionDivider label="Đơn hàng đính kèm" />
                                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                            <FiShoppingBag className="w-4 h-4 text-primary-500" />
                                            Mã đơn: {order.order_code || `${order.id.slice(0, 8)}...`}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            order.status === "completed"
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100/60"
                                                : order.status === "processing"
                                                ? "bg-blue-50 text-blue-600 border border-blue-100/60"
                                                : order.status === "cancelled"
                                                ? "bg-rose-50 text-rose-600 border border-rose-100/60"
                                                : "bg-amber-50 text-amber-600 border border-amber-100/60"
                                        }`}>
                                            {order.status === "completed"
                                                ? "Hoàn thành"
                                                : order.status === "processing"
                                                ? "Đang xử lý"
                                                : order.status === "cancelled"
                                                ? "Đã hủy"
                                                : "Chờ xử lý"}
                                        </span>
                                    </div>

                                    {/* Items List */}
                                    {order.order_items && order.order_items.length > 0 && (
                                        <div className="border border-slate-200/50 rounded-lg overflow-hidden bg-white">
                                            <table className="min-w-full divide-y divide-slate-100 text-xs">
                                                <thead className="bg-slate-100/80 font-bold text-slate-500">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Sản phẩm</th>
                                                        <th className="px-3 py-2 text-center w-16">SL</th>
                                                        <th className="px-3 py-2 text-right w-24">Đơn giá</th>
                                                        <th className="px-3 py-2 text-right w-28">Tổng cộng</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                                    {order.order_items.map((item: any) => {
                                                        const itemTotal = Number(item.unit_price) * Number(item.quantity) - Number(item.discount_amount || 0);
                                                        return (
                                                            <tr key={item.id}>
                                                                <td className="px-3 py-2 font-medium">
                                                                    <div>{item.product_name}</div>
                                                                    {item.product_code && (
                                                                        <div className="text-[10px] text-gray-400 font-normal">{item.product_code}</div>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-center font-bold">{item.quantity}</td>
                                                                <td className="px-3 py-2 text-right font-medium">{formatVND(Number(item.unit_price))}</td>
                                                                <td className="px-3 py-2 text-right font-black text-slate-800">{formatVND(itemTotal)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Subtotal / Discount / Total */}
                                    <div className="flex flex-col items-end gap-1.5 pt-2 border-t border-slate-200/60 text-xs">
                                        <div className="flex justify-between w-full max-w-[240px] text-gray-500">
                                            <span>Tạm tính:</span>
                                            <span className="font-medium">{formatVND(Number(order.subtotal_amount))}</span>
                                        </div>
                                        {Number(order.discount_amount) > 0 && (
                                            <div className="flex justify-between w-full max-w-[240px] text-rose-600">
                                                <span>Giảm giá:</span>
                                                <span className="font-semibold">-{formatVND(Number(order.discount_amount))}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between w-full max-w-[240px] font-black text-slate-800 text-sm border-t border-dashed border-slate-200 pt-1.5 mt-0.5">
                                            <span>Tổng tiền:</span>
                                            <span className="text-primary-600">{formatVND(Number(order.total_amount))}</span>
                                        </div>
                                    </div>

                                    {order.note && (
                                        <div className="text-[11px] text-gray-500 border-t border-slate-100 pt-2 font-medium">
                                            <span className="font-bold text-gray-600">Ghi chú đơn:</span> {order.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {/* Meta */}
                        {selectedJob.created_by && (
                            <div className="space-y-3">
                                <SectionDivider label="Thông tin khác" />
                                <InfoRow
                                    icon={<FiClipboard className="h-4 w-4" />}
                                    label="Người tạo"
                                    value={getUserNameById(selectedJob.created_by) ?? selectedJob.created_by}
                                />
                            </div>
                        )}
                    </div>
                );
            })()}
        </Modal>
    );
}
