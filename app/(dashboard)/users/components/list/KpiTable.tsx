import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { KPI } from "@/types/kpi";

interface KpiTableProps {
    kpis: KPI[];
    onSort?: (key: keyof KPI) => void;
    sortConfig?: { key: keyof KPI, direction: 'asc' | 'desc' } | null;
}

export function KpiTable({ kpis, onSort, sortConfig }: KpiTableProps) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
            case "OVERACHIEVED":
                return "bg-purple-50 text-purple-700 ring-purple-600/20";
            case "FAILED":
                return "bg-red-50 text-red-700 ring-red-600/20";
            default:
                return "bg-sky-50 text-sky-700 ring-sky-600/20";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "COMPLETED": return "Đạt";
            case "OVERACHIEVED": return "Vượt";
            case "FAILED": return "Không đạt";
            default: return "Đang thực hiện";
        }
    };

    const getProgressBarColor = (percentage: number, status: string) => {
        if (status === "FAILED") return "bg-red-500";
        if (percentage >= 100) return "bg-emerald-500";
        if (percentage >= 120) return "bg-purple-500";
        if (percentage < 50) return "bg-orange-500";
        return "bg-sky-500";
    };

    const SortableHeader = ({ label, sortKey, align = "left" }: { label: string; sortKey: keyof KPI; align?: "left" | "right" | "center" }) => {
        const isActive = sortConfig?.key === sortKey;
        return (
            <th 
                className={`px-6 py-4 font-semibold cursor-pointer select-none hover:bg-gray-100 transition-colors ${
                    align === "right" ? "text-right whitespace-nowrap" : ""
                }`}
                onClick={() => onSort?.(sortKey)}
            >
                <div className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
                    {label}
                    {isActive ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-primary-600" /> : <ArrowDown className="h-4 w-4 text-primary-600" />
                    ) : (
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                    )}
                </div>
            </th>
        );
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                    <tr>
                        <SortableHeader label="Tên KPI" sortKey="kpi_name" />
                        <SortableHeader label="Nhân sự" sortKey="user_full_name" />
                        <th className="px-6 py-4 font-semibold">Chu kỳ</th>
                        <SortableHeader label="Mục tiêu" sortKey="target_value" align="right" />
                        <SortableHeader label="Thực tế" sortKey="current_value" align="right" />
                        <th className="px-6 py-4 font-semibold">Phân loại</th>
                        <SortableHeader label="Tiến độ" sortKey="completion_percentage" />
                        <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {kpis.map((kpi) => (
                        <tr key={kpi.id} className="transition-colors hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{kpi.kpi_name}</div>
                                {kpi.description && (
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{kpi.description}</div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{kpi.user_full_name}</div>
                                <div className="text-xs text-gray-500">{kpi.user_role}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                    {kpi.period_type === "MONTHLY" ? `Tháng ${kpi.period}` : 
                                     kpi.period_type === "QUARTERLY" ? `Quý ${kpi.period}` : `Năm`} / {kpi.year}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium">
                                {kpi.target_value.toLocaleString("vi-VN")} <span className="text-xs text-gray-500">{kpi.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                {kpi.current_value.toLocaleString("vi-VN")}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                    kpi.kpi_type === 'AUTOMATIC' 
                                        ? 'bg-blue-50 text-blue-700 ring-blue-600/20' 
                                        : 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                }`}>
                                    {kpi.kpi_type === 'AUTOMATIC' ? 'Tự động' : 'Thủ công'}
                                </span>
                                {kpi.related_module && (
                                    <div className="text-xs text-gray-500 mt-1 uppercase">{kpi.related_module}</div>
                                )}
                            </td>
                            <td className="px-6 py-4 w-48">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(kpi.completion_percentage, kpi.status)}`}
                                            style={{ width: `${Math.min(100, kpi.completion_percentage)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium w-9 text-right">{kpi.completion_percentage}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyles(kpi.status)}`}>
                                    {getStatusLabel(kpi.status)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
