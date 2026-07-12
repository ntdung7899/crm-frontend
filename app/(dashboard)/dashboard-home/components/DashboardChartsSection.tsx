"use client";

import { useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { FiCalendar } from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import type { GrowthItem } from "@/types/reports";
import type { LeaderboardItem } from "../hooks/useDashboardPage";

type DashboardChartsSectionProps = {
    growthData: GrowthItem[];
    monthlyGrowthData: GrowthItem[];
    last30DaysData: GrowthItem[];
    lastMonthData: GrowthItem[];
    customRangeData: GrowthItem[];
    leaderboard: LeaderboardItem[];
};

const RANK_BADGE = [
    "bg-amber-100 text-amber-700",
    "bg-gray-200 text-gray-600",
    "bg-orange-100 text-orange-700",
];

export function DashboardChartsSection({ 
    growthData, 
    monthlyGrowthData, 
    last30DaysData,
    lastMonthData,
    customRangeData,
    leaderboard 
}: DashboardChartsSectionProps) {
    const [range, setRange] = useState<string>("7_days");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const rangeLabel = useMemo(() => {
        switch (range) {
            case "7_days": return "7 ngày gần nhất";
            case "30_days": return "30 ngày gần nhất";
            case "this_month": return "Tháng này";
            case "last_month": return "Tháng trước";
            case "custom": return "Tuỳ chỉnh khoảng ngày";
            default: return "7 ngày gần nhất";
        }
    }, [range]);

    const data = useMemo(() => {
        let start = new Date();
        let end = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (range === "7_days") {
            start.setDate(end.getDate() - 6);
        } else if (range === "30_days") {
            start.setDate(end.getDate() - 29);
        } else if (range === "this_month") {
            start = new Date(end.getFullYear(), end.getMonth(), 1);
        } else if (range === "last_month") {
            start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
            end = new Date(end.getFullYear(), end.getMonth(), 0);
        } else if (range === "custom") {
            if (!fromDate || !toDate) return [];
            start = new Date(fromDate);
            end = new Date(toDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];
        
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const generated = [];
        const weeks = Math.ceil(diffDays / 7);
        
        if (diffDays <= 10) {
            for (let i = 0; i < diffDays; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                generated.push({
                    label: `${d.getDate()}/${d.getMonth()+1}`,
                    customers: 20 + ((d.getDate() * 3) % 25),
                    converted: 5 + ((d.getDate() * 2) % 10),
                });
            }
        } else if (weeks <= 10) {
            for (let i = 1; i <= weeks; i++) {
                generated.push({
                    label: `Tuần ${i}`,
                    customers: 100 + ((i * 20) % 60),
                    converted: 30 + ((i * 10) % 25),
                });
            }
        } else {
            const months = Math.ceil(diffDays / 30);
            for (let i = 1; i <= months; i++) {
                generated.push({
                    label: `Tháng ${i}`,
                    customers: 400 + ((i * 50) % 150),
                    converted: 120 + ((i * 30) % 80),
                });
            }
        }
        return generated;
    }, [range, fromDate, toDate]);

    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Growth bar chart */}
            <Card className="p-5 lg:col-span-2">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Tăng trưởng khách hàng</h3>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {rangeLabel}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-[180px]">
                                <Select
                                    value={range !== "custom" ? range : ""}
                                    onChange={(e) => setRange(e.target.value)}
                                    options={[
                                        { value: "7_days", label: "7 ngày gần nhất" },
                                        { value: "30_days", label: "30 ngày gần nhất" },
                                        { value: "this_month", label: "Tháng này" },
                                        { value: "last_month", label: "Tháng trước" },
                                    ]}
                                    size="sm"
                                    className="bg-white shadow-sm"
                                    placeholder="Chọn khoảng thời gian"
                                />
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={`h-8 gap-2 bg-white text-xs font-medium shadow-sm transition-colors ${range === "custom" ? "border-primary-500 text-primary-700" : "text-gray-700"}`}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Tuỳ chỉnh ngày
                                <FiCalendar className="text-primary-500" />
                            </Button>
                        </div>
                        <div className="hidden items-center gap-4 text-xs text-gray-500 sm:flex">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-primary-600" />
                                Khách hàng mới
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-green-600" />
                                Đã chuyển đổi
                            </span>
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: "rgba(37,99,235,0.05)" }}
                            contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                        />
                        <Bar dataKey="customers" name="Khách hàng mới" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={22} />
                        <Bar dataKey="converted" name="Đã chuyển đổi" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Leaderboard */}
            <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Bảng xếp hạng</h3>
                    <span className="text-xs text-gray-400">Tuần này</span>
                </div>
                <div className="space-y-1">
                    {leaderboard.map((item) => (
                        <div key={item.name} className="flex items-center gap-3 rounded-lg px-1 py-2">
                            <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${RANK_BADGE[item.rank - 1] ?? "bg-gray-100 text-gray-500"}`}
                            >
                                {item.rank}
                            </span>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                                {item.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-400">Tỷ lệ phản hồi {item.responseRate}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{item.closedJobs}</p>
                                <p className="text-xs text-gray-400">đã chốt</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Custom Date Range Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Tuỳ chỉnh khoảng ngày"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Huỷ</Button>
                        <Button variant="primary" onClick={() => {
                            if (fromDate || toDate) {
                                setRange("custom");
                            }
                            setIsModalOpen(false);
                        }}>Áp dụng</Button>
                    </>
                }
            >
                <div className="flex items-center gap-4 py-2">
                    <Input 
                        type="date" 
                        label="Từ ngày" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                    <Input 
                        type="date" 
                        label="Đến ngày" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
}
