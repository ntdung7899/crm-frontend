import Link from "next/link";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import type { RecentCustomer, UpcomingTask } from "../hooks/useDashboardPage";

type DashboardRecentListsProps = {
    recentCustomers: RecentCustomer[];
    upcomingTasks: UpcomingTask[];
};

export function DashboardRecentLists({ recentCustomers, upcomingTasks }: DashboardRecentListsProps) {
    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Khách hàng mới */}
            <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Khách hàng mới</h3>
                    <Link
                        href="/customers"
                        className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                        Xem tất cả <FiArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentCustomers.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">Chưa có khách hàng nào.</p>
                    ) : (
                        recentCustomers.map((c) => (
                            <div key={c.id} className="flex items-center gap-3 py-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                                    {c.name.charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                                    {c.company && <p className="truncate text-xs text-gray-400">{c.company}</p>}
                                </div>
                                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${c.statusClass}`}>
                                    {c.statusLabel}
                                </span>
                                <span className="w-20 shrink-0 text-right text-xs text-gray-400">{c.dateLabel}</span>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Công việc sắp tới */}
            <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">Công việc sắp tới</h3>
                    <span className="text-xs text-gray-400">{upcomingTasks.length} việc</span>
                </div>
                <div className="divide-y divide-gray-100">
                    {upcomingTasks.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">Không có công việc nào.</p>
                    ) : (
                        upcomingTasks.map((t) => (
                            <div key={t.id} className="flex items-center gap-3 py-3">
                                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${t.dotClass}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">{t.title}</p>
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                                        <FiClock className="h-3 w-3" />
                                        {t.timeLabel}
                                    </p>
                                </div>
                                <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${t.badgeClass}`}>
                                    {t.badgeLabel}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
