"use client";

import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { DashboardChartsSection } from "./dashboard-home/components/DashboardChartsSection";
import { DashboardKpiGrid } from "./dashboard-home/components/DashboardKpiGrid";
import { DashboardRecentLists } from "./dashboard-home/components/DashboardRecentLists";
import { useDashboardPage } from "./dashboard-home/hooks/useDashboardPage";

export default function DashboardPage() {
    const {
        isLoading,
        greeting,
        todayLabel,
        kpiCards,
        growthData,
        monthlyGrowthData,
        last30DaysData,
        lastMonthData,
        customRangeData,
        leaderboard,
        recentCustomers,
        upcomingTasks,
    } = useDashboardPage();

    return (
        <div className="space-y-5 p-6">
            {/* Greeting + action */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {isLoading
                            ? "Đang tải dữ liệu..."
                            : `Đây là tình hình kinh doanh của đội nhóm hôm nay, ${todayLabel}.`}
                    </p>
                </div>
                <Link
                    href="/customers/new"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
                >
                    <FiPlus className="h-4 w-4" />
                    Thêm khách hàng
                </Link>
            </div>

            <DashboardKpiGrid cards={kpiCards} />

            <DashboardChartsSection 
                growthData={growthData} 
                monthlyGrowthData={monthlyGrowthData} 
                last30DaysData={last30DaysData}
                lastMonthData={lastMonthData}
                customRangeData={customRangeData}
                leaderboard={leaderboard} 
            />

            <DashboardRecentLists recentCustomers={recentCustomers} upcomingTasks={upcomingTasks} />
        </div>
    );
}
