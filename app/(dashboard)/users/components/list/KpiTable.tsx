import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TeamKpiMember } from "@/types/kpi";

interface KpiTableProps {
    kpis: TeamKpiMember[];
    onSort?: (key: keyof TeamKpiMember | "average_rate") => void;
    sortConfig?: { key: string, direction: 'asc' | 'desc' } | null;
    isPeriodOver?: boolean;
}

export function KpiTable({ kpis, onSort, sortConfig, isPeriodOver = false }: KpiTableProps) {
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

    const calculateAverageRate = (kpi: TeamKpiMember) => {
        if (!kpi.achievement) return 0;
        return (kpi.achievement.revenue_rate + kpi.achievement.new_customers_rate + kpi.achievement.jobs_completed_rate) / 3;
    };

    const calculateStatus = (average: number) => {
        if (average >= 120) return "OVERACHIEVED";
        if (average >= 100) return "COMPLETED";
        if (isPeriodOver) return "FAILED";
        return "IN_PROGRESS";
    };

    const SortableHeader = ({ label, sortKey, align = "left" }: { label: string; sortKey: string; align?: "left" | "right" | "center" }) => {
        const isActive = sortConfig?.key === sortKey;
        return (
            <th 
                className={`px-4 py-4 font-semibold cursor-pointer select-none hover:bg-gray-100 transition-colors ${
                    align === "right" ? "text-right whitespace-nowrap" : ""
                }`}
                onClick={() => onSort?.(sortKey as any)}
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
            <table className="w-full text-left text-sm text-gray-600 min-w-[1000px]">
                <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                    <tr>
                        <SortableHeader label="Nhân sự" sortKey="full_name" />
                        <SortableHeader label="Doanh thu" sortKey="actual_revenue" align="right" />
                        <th className="px-4 py-4 font-semibold text-right">Khách hàng</th>
                        <th className="px-4 py-4 font-semibold text-right">Công việc</th>
                        <SortableHeader label="Tiến độ" sortKey="average_rate" />
                        <SortableHeader label="Trạng thái" sortKey="status" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {kpis.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400 h-[300px] align-middle">
                                Không có dữ liệu nhân sự nào để hiển thị.
                            </td>
                        </tr>
                    ) : (
                        kpis.map((kpi) => {
                            const averageRate = calculateAverageRate(kpi);
                            const status = calculateStatus(averageRate);

                        return (
                        <tr key={kpi.user_id} className="transition-colors hover:bg-gray-50/50">
                            <td className="px-4 py-4">
                                <div className="font-medium text-gray-900">{kpi.full_name}</div>
                                <div className="text-xs text-gray-500">{kpi.email}</div>
                            </td>
                            <td className="px-4 py-4 text-right">
                                {kpi.target ? (
                                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                        <span className="font-medium text-gray-900">{kpi.actual.revenue.toLocaleString("vi-VN")}</span>
                                        <span className="text-xs text-gray-500">/ {Number(kpi.target.target_revenue).toLocaleString("vi-VN")}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">Chưa giao</span>
                                )}
                            </td>
                            <td className="px-4 py-4 text-right">
                                {kpi.target ? (
                                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                        <span className="font-medium text-gray-900">{kpi.actual.new_customers}</span>
                                        <span className="text-xs text-gray-500">/ {kpi.target.target_new_customers}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">Chưa giao</span>
                                )}
                            </td>
                            <td className="px-4 py-4 text-right">
                                {kpi.target ? (
                                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                        <span className="font-medium text-gray-900">{kpi.actual.jobs_completed}</span>
                                        <span className="text-xs text-gray-500">/ {kpi.target.target_jobs_completed}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">Chưa giao</span>
                                )}
                            </td>
                            <td className="px-4 py-4 w-48">
                                {kpi.target ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(averageRate, status)}`}
                                                style={{ width: `${Math.min(100, averageRate)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium w-10 text-right">{averageRate.toFixed(1)}%</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-xs italic">N/A</span>
                                )}
                            </td>
                            <td className="px-4 py-4">
                                {kpi.target ? (
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyles(status)}`}>
                                        {getStatusLabel(status)}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset bg-gray-50 text-gray-600 ring-gray-500/10">
                                        Chưa có KPI
                                    </span>
                                )}
                            </td>
                        </tr>
                        );
                    })
                    )}
                </tbody>
            </table>
        </div>
    );
}
