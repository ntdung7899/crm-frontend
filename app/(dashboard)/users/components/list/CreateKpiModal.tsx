import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreateKpiModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateKpiModal({ isOpen, onClose }: CreateKpiModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    const footer = (
        <>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Lưu KPI"}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Áp KPI mới"
            size="lg"
            footer={footer}
        >
            <form id="create-kpi-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên chỉ tiêu *</label>
                        <Input required placeholder="Ví dụ: Doanh số bán hàng..." />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhân sự thực hiện *</label>
                        <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">-- Chọn nhân sự --</option>
                            <option value="u2">Trần Thị Bích (Worker)</option>
                            <option value="u4">Phạm Minh Tuấn (Worker)</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại KPI *</label>
                        <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="MANUAL">Cập nhật thủ công (MANUAL)</option>
                            <option value="AUTOMATIC">Đồng bộ tự động (AUTOMATIC)</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu (Target) *</label>
                        <Input type="number" min="1" required placeholder="0" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                        <Input required placeholder="Ví dụ: VNĐ, Công việc, %" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chu kỳ *</label>
                        <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="MONTHLY">Hàng tháng (Monthly)</option>
                            <option value="QUARTERLY">Hàng quý (Quarterly)</option>
                            <option value="YEARLY">Hàng năm (Yearly)</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ *</label>
                        <Input type="number" min="1" max="12" required placeholder="Tháng / Quý / Năm" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                        <textarea 
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                            rows={3} 
                            placeholder="Mô tả chi tiết chỉ tiêu..."
                        ></textarea>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
