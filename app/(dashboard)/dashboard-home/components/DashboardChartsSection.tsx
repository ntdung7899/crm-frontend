"use client";

import { useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import type { GrowthItem } from "@/types/reports";
import type { LeaderboardItem } from "../hooks/useDashboardPage";

type DashboardChartsSectionProps = {
    growthData: GrowthItem[];
    leaderboard: LeaderboardItem[];
};

const RANK_BADGE = [
    "bg-amber-100 text-amber-700",
    "bg-gray-200 text-gray-600",
    "bg-orange-100 text-orange-700",
];

export function DashboardChartsSection({ growthData, leaderboard }: DashboardChartsSectionProps) {
    const [range, setRange] = useState<"week" | "month">("week");

    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Growth bar chart */}
            <Card className="p-5 lg:col-span-2">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Tăng trưởng khách hàng</h3>
                        <p className="mt-0.5 text-xs text-gray-400">7 ngày gần nhất</p>
                    </div>
                    <div className="flex items-center gap-4">
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
                        <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setRange("week")}
                                className={`rounded-md px-3 py-1 transition-colors ${range === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                            >
                                Tuần
                            </button>
                            <button
                                type="button"
                                onClick={() => setRange("month")}
                                className={`rounded-md px-3 py-1 transition-colors ${range === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                            >
                                Tháng
                            </button>
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={growthData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={4}>
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
        </div>
    );
}
