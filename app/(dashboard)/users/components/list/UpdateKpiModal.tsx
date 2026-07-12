import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import { kpiService } from "@/services/kpis";
import { KpiTarget, TeamKpiMember } from "@/types/kpi";

interface UpdateKpiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    kpiMember: TeamKpiMember | null;
    periodType?: "month" | "quarter";
    periodValue?: number;
    year?: number;
}

export function UpdateKpiModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    kpiMember,
    periodType = "month",
    periodValue = new Date().getMonth() + 1,
    year = new Date().getFullYear()
}: UpdateKpiModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const [targetRevenue, setTargetRevenue] = useState<number>(0);
    const [targetNewCustomers, setTargetNewCustomers] = useState<number>(0);
    const [targetJobsCompleted, setTargetJobsCompleted] = useState<number>(0);
    const [note, setNote] = useState("");

    useEffect(() => {
        if (isOpen && kpiMember && kpiMember.target) {
            setTargetRevenue(Number(kpiMember.target.target_revenue || 0));
            setTargetNewCustomers(Number(kpiMember.target.target_new_customers || 0));
            setTargetJobsCompleted(Number(kpiMember.target.target_jobs_completed || 0));
            setNote(kpiMember.target.note || "");
        }
    }, [isOpen, kpiMember]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updateId = kpiMember?.target?.target_id;
        if (!updateId) {
            toast.error("Thất bại", "Không tìm thấy ID mục tiêu.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                target_revenue: targetRevenue,
                target_new_customers: targetNewCustomers,
                target_jobs_completed: targetJobsCompleted,
                note
            };
            const res = await kpiService.updateKpiTarget(updateId, payload);
            if (res.status === "success") {
                toast.success("Thành công", "Cập nhật mục tiêu KPI thành công.");
                onSuccess?.();
                onClose();
            } else {
                toast.error("Thất bại", res.message || "Đã xảy ra lỗi.");
            }
        } catch (error: any) {
            toast.error("Thất bại", error.message || "Đã xảy ra lỗi hệ thống.");
        } finally {
            setIsLoading(false);
        }
    };

    const footer = (
        <>
            <Button variant="outline" onClick={onClose} disabled={isLoading} type="button">
                Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} type="submit" form="update-kpi-form">
                {isLoading ? "Đang xử lý..." : "Cập nhật KPI"}
            </Button>
        </>
    );

    if (!kpiMember) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Chỉnh sửa mục tiêu KPI - ${kpiMember.full_name}`}
            size="lg"
            footer={footer}
        >
            <form id="update-kpi-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu Doanh thu (VNĐ)</label>
                        <Input 
                            type="number" 
                            min="0" 
                            placeholder="VD: 50000000"
                            value={targetRevenue || ""}
                            onChange={(e) => setTargetRevenue(Number(e.target.value))}
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu Khách hàng mới</label>
                        <Input 
                            type="number" 
                            min="0" 
                            placeholder="Số lượng khách hàng"
                            value={targetNewCustomers || ""}
                            onChange={(e) => setTargetNewCustomers(Number(e.target.value))}
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu Công việc hoàn thành</label>
                        <Input 
                            type="number" 
                            min="0" 
                            placeholder="Số lượng công việc"
                            value={targetJobsCompleted || ""}
                            onChange={(e) => setTargetJobsCompleted(Number(e.target.value))}
                        />
                    </div>

                    <div className="col-span-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea 
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                            rows={3} 
                            placeholder="Ghi chú thêm về mục tiêu đợt này..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
