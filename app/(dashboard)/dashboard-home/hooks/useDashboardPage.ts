import { useCallback, useEffect, useMemo, useState } from "react";
import { FiBell, FiBriefcase, FiTrendingUp, FiUsers } from "react-icons/fi";
import { growthData, performanceData } from "@/mock-data/reports";
import { jobsService } from "@/services/jobs";
import { notificationsService } from "@/services/notifications";
import { usersService } from "@/services/users";
import { customersService } from "@/services/customers";
import { getCurrentUserSession } from "@/lib/auth-session";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import type { CustomerApiRow, JobApiRow, JobTimeRange } from "@/types/api";

export type TrendDirection = "up" | "down";

export interface RecentCustomer {
    id: string;
    name: string;
    company: string;
    statusLabel: string;
    statusClass: string;
    dateLabel: string;
}

export interface UpcomingTask {
    id: string;
    title: string;
    timeLabel: string;
    badgeLabel: string;
    badgeClass: string;
    dotClass: string;
}

export interface LeaderboardItem {
    rank: number;
    name: string;
    responseRate: number;
    closedJobs: number;
}

// ── Helpers ──────────────────────────────────────────────────────────
function getGreetingPrefix(hour: number): string {
    if (hour < 11) return "Chào buổi sáng";
    if (hour < 13) return "Chào buổi trưa";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
}

function getFirstName(fullName: string): string {
    const tokens = fullName.trim().split(/\s+/).filter(Boolean);
    if (tokens.length <= 1) return fullName.trim() || "bạn";
    return tokens.slice(1).join(" ");
}

function formatTodayLabel(date: Date): string {
    const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(date);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalized}, ${dd}/${mm}/${date.getFullYear()}`;
}

function customerName(row: CustomerApiRow): string {
    return (
        row.full_name ||
        `${row.last_name || ""} ${row.first_name || ""}`.trim() ||
        row.email ||
        "Khách hàng"
    );
}

function formatShortDate(value?: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${date.getFullYear()}`;
}

function firstJobStart(jobTime: JobApiRow["job_time"]): string | undefined {
    if (!jobTime) return undefined;
    const range: JobTimeRange | undefined = Array.isArray(jobTime) ? jobTime[0] : jobTime;
    return range?.start ?? undefined;
}

function formatTaskTime(value?: string): string {
    if (!value) return "Chưa đặt lịch";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa đặt lịch";
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return isToday ? `Hôm nay, ${hh}:${mi}` : `${dd}/${mm}, ${hh}:${mi}`;
}

function taskBadge(progress: number | null): { label: string; badgeClass: string; dotClass: string } {
    if ((progress ?? 0) >= 100) {
        return { label: "Hoàn thành", badgeClass: "bg-green-50 text-green-600", dotClass: "bg-green-500" };
    }
    if ((progress ?? 0) > 0) {
        return { label: "Đang xử lý", badgeClass: "bg-amber-50 text-amber-600", dotClass: "bg-amber-500" };
    }
    return { label: "Chờ xử lý", badgeClass: "bg-primary-50 text-primary-600", dotClass: "bg-primary-500" };
}

export function useDashboardPage() {
    const [userCount, setUserCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [jobCount, setJobCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toastRef = useStableToastRef();

    const [currentUser] = useState(() => getCurrentUserSession());

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, customerCountRes, jobsRes, notifs, customersRes] = await Promise.all([
                usersService.getUsers({ pageSize: "1" }),
                usersService.getCustomerCount(),
                jobsService.getJobs({ pageSize: "5" }),
                notificationsService.getMyNotifications(),
                customersService.getCustomers({ pageSize: "5" }),
            ]);

            setUserCount(usersRes.responseData?.count ?? 0);
            setCustomerCount(customerCountRes.responseData?.count ?? 0);
            setJobCount(jobsRes.responseData?.count ?? 0);
            setNotificationCount(notifs.filter((n) => !n.has_user_read).length);

            const customerRows = customersRes.responseData?.rows ?? [];
            setRecentCustomers(
                customerRows.slice(0, 4).map((row) => ({
                    id: row.id,
                    name: customerName(row),
                    company: row.company_name || row.website || "",
                    statusLabel: row.is_active === false ? "Ngưng hoạt động" : "Hoạt động",
                    statusClass:
                        row.is_active === false ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-600",
                    dateLabel: formatShortDate(row.created_at),
                })),
            );

            const jobRows = jobsRes.responseData?.rows ?? [];
            setUpcomingTasks(
                jobRows.slice(0, 4).map((row) => {
                    const badge = taskBadge(row.progress);
                    return {
                        id: row.id,
                        title: row.job_name,
                        timeLabel: formatTaskTime(firstJobStart(row.job_time)),
                        badgeLabel: row.status?.name || badge.label,
                        badgeClass: badge.badgeClass,
                        dotClass: badge.dotClass,
                    };
                }),
            );
        } catch {
            toastRef.current.warning("Dữ liệu chưa đầy đủ", "Không thể tải đầy đủ số liệu dashboard.");
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    const greeting = useMemo(() => {
        const name = getFirstName(currentUser?.full_name || "");
        return `${getGreetingPrefix(new Date().getHours())}, ${name}`;
    }, [currentUser]);

    const todayLabel = useMemo(() => formatTodayLabel(new Date()), []);

    const totalWeeklyCustomers = useMemo(() => growthData.reduce((acc, d) => acc + d.customers, 0), []);
    const totalWeeklyConverted = useMemo(() => growthData.reduce((acc, d) => acc + d.converted, 0), []);
    const conversionRate =
        totalWeeklyCustomers > 0 ? Math.round((totalWeeklyConverted / totalWeeklyCustomers) * 100) : 0;

    const leaderboard = useMemo<LeaderboardItem[]>(
        () =>
            [...performanceData]
                .sort((a, b) => b.closedJobs - a.closedJobs)
                .map((item, index) => ({
                    rank: index + 1,
                    name: item.name,
                    responseRate: item.responseRate,
                    closedJobs: item.closedJobs,
                })),
        [],
    );

    const kpiCards = useMemo(
        () => [
            {
                title: "Tổng khách hàng",
                value: customerCount.toLocaleString("vi-VN"),
                icon: FiUsers,
                color: "text-primary-600",
                bgColor: "bg-primary-50",
                trendDirection: "up" as TrendDirection,
                trendValue: "12%",
                trendNote: "so với tháng trước",
            },
            {
                title: "Tổng công việc",
                value: jobCount.toLocaleString("vi-VN"),
                icon: FiBriefcase,
                color: "text-primary-600",
                bgColor: "bg-primary-50",
                trendDirection: "up" as TrendDirection,
                trendValue: "5%",
                trendNote: "tất cả trạng thái",
            },
            {
                title: "Tỷ lệ chuyển đổi",
                value: `${conversionRate}%`,
                icon: FiTrendingUp,
                color: "text-green-600",
                bgColor: "bg-green-50",
                trendDirection: "up" as TrendDirection,
                trendValue: "3%",
                trendNote: `${totalWeeklyConverted}/${totalWeeklyCustomers} tuần này`,
            },
            {
                title: "Thông báo chưa đọc",
                value: notificationCount.toLocaleString("vi-VN"),
                icon: FiBell,
                color: "text-red-600",
                bgColor: "bg-red-50",
                trendDirection: "down" as TrendDirection,
                trendValue: String(Math.min(notificationCount, 2)),
                trendNote: "cần xử lý",
            },
        ],
        [conversionRate, customerCount, jobCount, notificationCount, totalWeeklyConverted, totalWeeklyCustomers],
    );

    return {
        isLoading,
        greeting,
        todayLabel,
        kpiCards,
        growthData,
        leaderboard,
        recentCustomers,
        upcomingTasks,
        userCount,
    };
}
