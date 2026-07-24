import { ReactNode, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import { kpiService } from "@/services/kpis";
import { TeamKpiMember } from "@/types/kpi";

interface CreateKpiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialPeriodType?: "month" | "quarter";
    initialPeriodValue?: number;
    initialYear?: number;
    teamMembers?: TeamKpiMember[];
}

function RequiredLabel({ children }: { children: ReactNode }) {
    return (
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {children} <span className="text-red-500">*</span>
        </label>
    );
}

export function CreateKpiModal({
    isOpen,
    onClose,
    onSuccess,
    initialPeriodType = "month",
    initialPeriodValue = new Date().getMonth() + 1,
    initialYear = new Date().getFullYear(),
    teamMembers = []
}: CreateKpiModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const [userId, setUserId] = useState("");
    const [periodType, setPeriodType] = useState<"month" | "quarter">(initialPeriodType);
    const [periodValue, setPeriodValue] = useState<number>(initialPeriodValue);
    const [year, setYear] = useState<number>(initialYear);
    const [targetRevenue, setTargetRevenue] = useState<number>(0);
    const [targetNewCustomers, setTargetNewCustomers] = useState<number>(0);
    const [targetJobsCompleted, setTargetJobsCompleted] = useState<number>(0);
    const [note, setNote] = useState("");

    useEffect(() => {
        if (isOpen) {
            setUserId("");
            setPeriodType(initialPeriodType);
            setPeriodValue(initialPeriodValue);
            setYear(initialYear);
            setTargetRevenue(0);
            setTargetNewCustomers(0);
            setTargetJobsCompleted(0);
            setNote("");
        }
    }, [isOpen, initialPeriodType, initialPeriodValue, initialYear]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                user_id: userId,
                period_type: periodType,
                period_value: periodValue,
                year,
                target_revenue: targetRevenue,
                target_new_customers: targetNewCustomers,
                target_jobs_completed: targetJobsCompleted,
                note
            };
            const res = await kpiService.createKpiTarget(payload);
            if (res.status === "success") {
                toast.success("Thành công", "Giao mục tiêu KPI thành công.");
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
            <Button onClick={handleSubmit} disabled={isLoading} type="submit" form="create-kpi-form">
                {isLoading ? "Đang xử lý..." : "Lưu KPI"}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Giao mục tiêu KPI"
            size="lg"
            footer={footer}
        >
            <form id="create-kpi-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <RequiredLabel>Nhân sự thực hiện</RequiredLabel>
                        <select
                            required
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">-- Chọn nhân sự --</option>
                            {teamMembers.map(user => (
                                <option key={user.user_id} value={user.user_id}>{user.full_name} ({user.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <RequiredLabel>Chu kỳ</RequiredLabel>
                        <select
                            required
                            value={periodType}
                            onChange={(e) => setPeriodType(e.target.value as "month" | "quarter")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="month">Hàng tháng</option>
                            <option value="quarter">Hàng quý</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <RequiredLabel>Tháng / Quý</RequiredLabel>
                        <Input
                            type="number"
                            min="1"
                            max="12"
                            required
                            placeholder="Tháng hoặc Quý (VD: 7)"
                            value={periodValue}
                            onChange={(e) => setPeriodValue(Number(e.target.value))}
                        />
                    </div>

                    <div className="col-span-1">
                        <RequiredLabel>Năm</RequiredLabel>
                        <Input
                            type="number"
                            min="2020"
                            max="2100"
                            required
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>

                    <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Thiết lập chỉ tiêu</h4>
                    </div>

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
