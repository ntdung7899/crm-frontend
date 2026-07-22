import { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { TeamKpiMember } from "@/types/kpi";
import { kpiService } from "@/services/kpis";
import { getCurrentUserSession } from "@/lib/auth-session";
import { usersService } from "@/services/users";
import { useCallback } from "react";

type KpiRole = "admin" | "owner" | "leader" | "worker";

const normalizeRoleText = (value?: string | null) =>
    (value || "").trim().toLowerCase().replace(/[_-]+/g, " ");

const getRoleFromPermissionTexts = (roles: Array<string | null | undefined>): KpiRole => {
    const normalizedRoles = roles.map(normalizeRoleText);

    if (normalizedRoles.some((role) =>
        role === "admin" ||
        role === "site admin" ||
        role === "admin onsite" ||
        role.includes("site admin") ||
        role.includes("admin onsite")
    )) {
        return "admin";
    }

    if (normalizedRoles.some((role) => role === "owner" || role === "site owner" || role.includes("owner"))) {
        return "owner";
    }

    if (normalizedRoles.some((role) => role === "leader" || role === "site leader" || role.includes("leader"))) {
        return "leader";
    }

    return "worker";
};

const getCurrentUserKpiRole = (): KpiRole => {
    const user = getCurrentUserSession();
    const roles = user?.user_permisions?.flatMap((permission) => [
        permission.permision?.name,
        permission.permision?.code,
    ]) || [];

    return getRoleFromPermissionTexts(roles);
};

export function useKpiTab(onKpisLoaded?: (count: number) => void) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingKpiMember, setEditingKpiMember] = useState<TeamKpiMember | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const [currentUserRole] = useState<KpiRole>(() => {
        if (typeof window === 'undefined') return "worker";
        return getCurrentUserKpiRole();
    });
    const isWorkerRole = currentUserRole === "worker";

    const [viewMode, setViewMode] = useState<'team' | 'my'>(isWorkerRole ? 'my' : 'team');

    const [userRolesByUser, setUserRolesByUser] = useState<Record<string, KpiRole>>({});
    useEffect(() => {
        if (!isWorkerRole) {
            usersService.getAdminUsers({ pageSize: "1000" }).then(res => {
                const rows = res.responseData?.rows || [];
                const rolesMap: Record<string, KpiRole> = {};
                for (const r of rows) {
                    rolesMap[r.id] = getRoleFromPermissionTexts(
                        (r.user_permisions || []).flatMap(up => [
                            up.permision?.name,
                            (up.permision as { code?: string })?.code,
                        ]),
                    );
                }
                const currentUser = getCurrentUserSession();
                if (currentUser?.id) {
                    rolesMap[currentUser.id] = currentUserRole;
                }
                setUserRolesByUser(rolesMap);
            }).catch(console.error);
        }
    }, [currentUserRole, isWorkerRole]);

    const canEditKpiTarget = useCallback((targetUserId: string) => {
        if (isWorkerRole) return false;
        
        const currentUser = getCurrentUserSession();
        const myId = currentUser?.id || "";
        const targetRole = userRolesByUser[targetUserId] || "worker";

        if (currentUserRole === "admin") return true;

        if (currentUserRole === "owner") {
            if (targetUserId === myId) return true; // Can edit own
            if (targetRole === "admin" || targetRole === "owner") return false; // Cannot edit admin/other owner
            return true; // Can edit leader and worker
        }
        
        if (currentUserRole === "leader") {
            if (targetUserId === myId) return false; // Leader cannot edit own
            if (targetRole === "worker") return true; // Can edit worker returned by team API
        }

        return false;
    }, [currentUserRole, isWorkerRole, userRolesByUser]);

    const canViewKpi = useCallback((targetUserId: string) => {
        const currentUser = getCurrentUserSession();
        const myId = currentUser?.id || "";
        
        if (isWorkerRole) return targetUserId === myId;
        if (targetUserId === myId) return true; // Everyone can see themselves

        const hasRolesLoaded = Object.keys(userRolesByUser).length > 0;
        if (!hasRolesLoaded) return false; // Hide until roles are loaded to prevent flash

        const targetRole = userRolesByUser[targetUserId] || "worker";

        if (currentUserRole === "admin") return true;
        if (currentUserRole === "owner") return targetRole === "leader" || targetRole === "worker";
        if (currentUserRole === "leader") return targetRole === "worker";

        return false;
    }, [currentUserRole, isWorkerRole, userRolesByUser]);

    // Filter states (Applied)
    const [appliedYear, setAppliedYear] = useState(new Date().getFullYear());
    const [appliedPeriodType, setAppliedPeriodType] = useState("month");
    const [appliedPeriodValue, setAppliedPeriodValue] = useState(new Date().getMonth() + 1);
    const [appliedStatusFilter, setAppliedStatusFilter] = useState("ALL");

    // Filter states (Draft for UI)
    const [draftYear, setDraftYear] = useState(new Date().getFullYear());
    const [draftPeriodType, setDraftPeriodType] = useState("month");
    const [draftPeriodValue, setDraftPeriodValue] = useState(new Date().getMonth() + 1);
    const [draftStatusFilter, setDraftStatusFilter] = useState("ALL");

    const [kpis, setKpis] = useState<TeamKpiMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchKpis = async () => {
        setIsLoading(true);
        try {
            if (viewMode === 'team') {
                const res = await kpiService.getTeamKpis(appliedYear, appliedPeriodType, appliedPeriodValue);
                if (res.status === "success" && res.responseData?.team) {
                    setKpis(res.responseData.team);
                } else {
                    setKpis([]);
                }
            } else {
                const res = await kpiService.getMyKpiSummary(appliedYear, appliedPeriodType, appliedPeriodValue);
                if (res.status === "success" && res.responseData) {
                    const data = Array.isArray(res.responseData) ? res.responseData : (res.responseData.rows || res.responseData.data || [res.responseData]);
                    
                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const currentMonth = now.getMonth() + 1;
                    const currentQuarter = Math.ceil(currentMonth / 3);

                    const mapped = data.map((item: any, idx: number) => {
                        const period = item.period || {};
                        const pType = period.type || "month";
                        const pValue = period.value || 1;
                        const pYear = period.year || currentYear;
                        const typeLabel = pType === "quarter" ? "Quý" : "Tháng";
                        
                        let isRowPeriodOver = false;
                        if (pYear < currentYear) isRowPeriodOver = true;
                        else if (pYear === currentYear) {
                            if (pType === "month" && pValue < currentMonth) isRowPeriodOver = true;
                            if (pType === "quarter" && pValue < currentQuarter) isRowPeriodOver = true;
                        }

                        const t = item.target || {};
                        const targetRev = Number(t.target_revenue || 0);
                        const targetCus = Number(t.target_new_customers || 0);
                        const targetJob = Number(t.target_jobs_completed || 0);

                        const a = item.actual || {};
                        const actualRev = Number(a.revenue || 0);
                        const actualCus = Number(a.new_customers || 0);
                        const actualJob = Number(a.jobs_completed || 0);

                        return {
                            user_id: item.user_id || item.id || String(idx),
                            full_name: `${typeLabel} ${pValue} / ${pYear}`,
                            email: "KPI Cá nhân",
                            avatar: null,
                            target: item.target ? {
                                target_id: t.target_id || t.id,
                                target_revenue: targetRev,
                                target_new_customers: targetCus,
                                target_jobs_completed: targetJob,
                            } : null,
                            actual: {
                                revenue: actualRev,
                                new_customers: actualCus,
                                jobs_completed: actualJob
                            },
                            achievement: item.achievement || {
                                revenue_rate: targetRev ? (actualRev / targetRev) * 100 : 0,
                                new_customers_rate: targetCus ? (actualCus / targetCus) * 100 : 0,
                                jobs_completed_rate: targetJob ? (actualJob / targetJob) * 100 : 0
                            },
                            is_period_over: isRowPeriodOver
                        }
                    });

                    setKpis(mapped);
                } else {
                    setKpis([]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch KPIs:", error);
            setKpis([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKpis();
    }, [appliedYear, appliedPeriodType, appliedPeriodValue, viewMode]);

    const isPeriodOver = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentQuarter = Math.ceil(currentMonth / 3);

        if (appliedYear < currentYear) return true;
        if (appliedYear > currentYear) return false;

        if (appliedPeriodType === "month") {
            return appliedPeriodValue < currentMonth;
        }
        if (appliedPeriodType === "quarter") {
            return appliedPeriodValue < currentQuarter;
        }
        return false;
    }, [appliedPeriodType, appliedPeriodValue, appliedYear]);

    const filteredKpis = useMemo(() => {
        let result = kpis.filter((kpi) => {
            if (viewMode === 'team' && !canViewKpi(kpi.user_id)) return false;
            if (!kpi.target) return false;

            const matchesSearch = kpi.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                kpi.email.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Lọc theo trạng thái
            let matchesStatus = true;
            if (appliedStatusFilter !== "ALL") {
                const averageRate = kpi.achievement ? (kpi.achievement.revenue_rate + kpi.achievement.new_customers_rate + kpi.achievement.jobs_completed_rate) / 3 : 0;
                let status = "IN_PROGRESS";
                const isOver = (kpi as any).is_period_over !== undefined ? (kpi as any).is_period_over : isPeriodOver;
                if (!kpi.target) status = "NO_KPI";
                else if (averageRate >= 120) status = "OVERACHIEVED";
                else if (averageRate >= 100) status = "COMPLETED";
                else if (isOver) status = "FAILED";
                else status = "IN_PROGRESS";
                
                matchesStatus = status === appliedStatusFilter;
            }

            return matchesSearch && matchesStatus;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (sortConfig.key === 'average_rate') {
                    aValue = a.achievement ? (a.achievement.revenue_rate + a.achievement.new_customers_rate + a.achievement.jobs_completed_rate) / 3 : -1;
                    bValue = b.achievement ? (b.achievement.revenue_rate + b.achievement.new_customers_rate + b.achievement.jobs_completed_rate) / 3 : -1;
                } else if (sortConfig.key === 'actual_revenue') {
                    aValue = a.target ? a.actual?.revenue || 0 : -1;
                    bValue = b.target ? b.actual?.revenue || 0 : -1;
                } else if (sortConfig.key === 'status') {
                    const getStatusScore = (kpi: any) => {
                        const isOver = kpi.is_period_over !== undefined ? kpi.is_period_over : isPeriodOver;
                        if (!kpi.target) return 0; // Chưa có KPI
                        const avg = kpi.achievement ? (kpi.achievement.revenue_rate + kpi.achievement.new_customers_rate + kpi.achievement.jobs_completed_rate) / 3 : 0;
                        if (avg >= 120) return 4; // Vượt
                        if (avg >= 100) return 3; // Đạt
                        if (isOver) return 1; // Không đạt
                        return 2; // Đang thực hiện
                    };
                    aValue = getStatusScore(a);
                    bValue = getStatusScore(b);
                } else {
                    aValue = (a as any)[sortConfig.key];
                    bValue = (b as any)[sortConfig.key];
                }
                
                if (aValue === bValue) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;
                
                let comparison = 0;
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    comparison = aValue.localeCompare(bValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    comparison = aValue - bValue;
                } else {
                    comparison = String(aValue).localeCompare(String(bValue));
                }
                
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [kpis, searchQuery, sortConfig, appliedStatusFilter, appliedPeriodType, appliedPeriodValue, appliedYear, isPeriodOver, canViewKpi, viewMode]);

    const handleExport = async () => {
        if (filteredKpis.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh_sach_KPI');

        // Khai báo cột
        worksheet.columns = [
            { header: 'Nhân sự', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Doanh thu (target)', key: 'target_revenue', width: 20 },
            { header: 'Doanh thu (reality)', key: 'actual_revenue', width: 20 },
            { header: 'Khách hàng (target)', key: 'target_customers', width: 20 },
            { header: 'Khách hàng (reality)', key: 'actual_customers', width: 20 },
            { header: 'Công việc (target)', key: 'target_jobs', width: 20 },
            { header: 'Công việc (reality)', key: 'actual_jobs', width: 20 },
            { header: 'Tiến độ (TB) (%)', key: 'progress', width: 15 },
            { header: 'Trạng thái', key: 'status', width: 20 }
        ];

        // Style dòng tiêu đề
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' } // Primary Blue
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Đổ dữ liệu
        filteredKpis.forEach(kpi => {
            const averageRate = kpi.achievement ? (kpi.achievement.revenue_rate + kpi.achievement.new_customers_rate + kpi.achievement.jobs_completed_rate) / 3 : 0;
            let statusLabel = 'Chưa có KPI';
            if (kpi.target) {
                if (averageRate >= 120) statusLabel = 'Vượt';
                else if (averageRate >= 100) statusLabel = 'Đạt';
                else if (isPeriodOver) statusLabel = 'Không đạt';
                else statusLabel = 'Đang thực hiện';
            }

            worksheet.addRow({
                name: kpi.full_name,
                email: kpi.email,
                target_revenue: kpi.target ? Number(kpi.target.target_revenue) : 0,
                actual_revenue: kpi.target ? kpi.actual.revenue : 0,
                target_customers: kpi.target ? kpi.target.target_new_customers : 0,
                actual_customers: kpi.target ? kpi.actual.new_customers : 0,
                target_jobs: kpi.target ? kpi.target.target_jobs_completed : 0,
                actual_jobs: kpi.target ? kpi.actual.jobs_completed : 0,
                progress: kpi.target ? averageRate.toFixed(2) : 0,
                status: statusLabel
            });
        });

        // Kẻ viền (border) cho toàn bộ ô
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        
        ['target_revenue', 'actual_revenue', 'target_customers', 'actual_customers', 'target_jobs', 'actual_jobs'].forEach(key => {
            worksheet.getColumn(key).alignment = { vertical: 'middle', horizontal: 'right' };
            worksheet.getColumn(key).numFmt = '#,##0';
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `KPI_Team_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const pagedKpis = useMemo(
        () => filteredKpis.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, filteredKpis, pageSize]
    );

    useEffect(() => {
        if (onKpisLoaded) {
            onKpisLoaded(pagedKpis.length);
        }
    }, [onKpisLoaded, pagedKpis.length]);

    const handleSort = (key: keyof TeamKpiMember | "average_rate" | string) => {
        if (sortConfig?.key === key) {
            setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
        } else {
            setSortConfig({ key, direction: 'asc' });
        }
    };

    return {
        kpis,
        filteredKpis,
        pagedKpis,
        isLoading,
        isPeriodOver,
        fetchKpis,
        handleExport,
        
        viewMode,
        setViewMode,
        isWorkerRole,
        
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        
        sortConfig,
        handleSort,
        
        searchQuery,
        setSearchQuery,
        
        appliedYear,
        setAppliedYear,
        appliedPeriodType,
        setAppliedPeriodType,
        appliedPeriodValue,
        setAppliedPeriodValue,
        appliedStatusFilter,
        setAppliedStatusFilter,
        
        draftYear,
        setDraftYear,
        draftPeriodType,
        setDraftPeriodType,
        draftPeriodValue,
        setDraftPeriodValue,
        draftStatusFilter,
        setDraftStatusFilter,
        
        isCreateModalOpen,
        setIsCreateModalOpen,

        editingKpiMember,
        setEditingKpiMember,
        isUpdateModalOpen,
        setIsUpdateModalOpen,
        canEditKpiTarget,
        userRolesByUser
    };
}
