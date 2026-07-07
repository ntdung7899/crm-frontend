import { useMemo, useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, RefreshCw, Search, Plus, Filter, X } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { TeamKpiMember } from "@/types/kpi";
import { KpiTable } from "./KpiTable";
import { CreateKpiModal } from "./CreateKpiModal";
import { KpiCharts } from "./KpiCharts";
import { kpiService } from "@/services/kpis";

const DEFAULT_PAGE_SIZE = 10;

interface KpiTabContentProps {
    onKpisLoaded?: (count: number) => void;
}

export function KpiTabContent({ onKpisLoaded }: KpiTabContentProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

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
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [kpis, setKpis] = useState<TeamKpiMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchKpis = async () => {
        setIsLoading(true);
        try {
            const res = await kpiService.getTeamKpis(appliedYear, appliedPeriodType, appliedPeriodValue);
            if (res.status === "success" && res.responseData?.team) {
                setKpis(res.responseData.team);
                onKpisLoaded?.(res.responseData.team.length);
            } else {
                setKpis([]);
                onKpisLoaded?.(0);
            }
        } catch (error) {
            console.error("Failed to fetch KPIs:", error);
            setKpis([]);
            onKpisLoaded?.(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKpis();
    }, [appliedYear, appliedPeriodType, appliedPeriodValue]);

    const filteredKpis = useMemo(() => {

        let result = kpis.filter((kpi) => {
            const matchesSearch = kpi.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                kpi.email.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Lọc theo trạng thái
            let matchesStatus = true;
            if (appliedStatusFilter !== "ALL") {
                const averageRate = kpi.achievement ? (kpi.achievement.revenue_rate + kpi.achievement.new_customers_rate + kpi.achievement.jobs_completed_rate) / 3 : 0;
                let status = "IN_PROGRESS";
                if (!kpi.target) status = "NO_KPI";
                else if (averageRate >= 120) status = "OVERACHIEVED";
                else if (averageRate >= 100) status = "COMPLETED";
                else if (averageRate < 50) status = "FAILED";
                
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
                        if (!kpi.target) return 0; // Chưa có KPI
                        const avg = kpi.achievement ? (kpi.achievement.revenue_rate + kpi.achievement.new_customers_rate + kpi.achievement.jobs_completed_rate) / 3 : 0;
                        if (avg >= 120) return 4; // Vượt
                        if (avg >= 100) return 3; // Đạt
                        if (avg < 50) return 1; // Không đạt
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
    }, [kpis, searchQuery, sortConfig, appliedStatusFilter, appliedPeriodType, appliedPeriodValue, appliedYear]);

    const handleExport = async () => {
        if (filteredKpis.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh_sach_KPI');

        // Khai báo cột
        worksheet.columns = [
            { header: 'Nhân sự', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'MT Doanh thu', key: 'target_revenue', width: 20 },
            { header: 'TT Doanh thu', key: 'actual_revenue', width: 20 },
            { header: 'MT Khách hàng', key: 'target_customers', width: 20 },
            { header: 'TT Khách hàng', key: 'actual_customers', width: 20 },
            { header: 'MT Công việc', key: 'target_jobs', width: 20 },
            { header: 'TT Công việc', key: 'actual_jobs', width: 20 },
            { header: 'Tiến độ TB (%)', key: 'progress', width: 15 },
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
                else if (averageRate < 50) statusLabel = 'Không đạt';
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

    return (
        <div>
            <KpiCharts kpis={filteredKpis} />
            
            <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 p-5">
                <div className="relative w-full md:w-64 border-gray-200">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Tìm kiếm nhân sự..."
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                </div>

                <div className="relative">
                    <button 
                        onClick={() => {
                            // Sync draft with applied when opening
                            if (!isFilterOpen) {
                                setDraftPeriodType(appliedPeriodType);
                                setDraftPeriodValue(appliedPeriodValue);
                                setDraftYear(appliedYear);
                                setDraftStatusFilter(appliedStatusFilter);
                            }
                            setIsFilterOpen(!isFilterOpen);
                        }}
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                            isFilterOpen || appliedPeriodType !== 'month' || appliedStatusFilter !== 'ALL' 
                                ? 'border-primary-200 bg-primary-50 text-primary-700' 
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Filter className="h-4 w-4" />
                        Bộ lọc
                        {(appliedPeriodType !== 'month' || appliedStatusFilter !== 'ALL') && (
                            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] text-primary-700">
                                !
                            </span>
                        )}
                    </button>

                    {isFilterOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setIsFilterOpen(false)}
                            />
                            <div className="absolute left-0 top-12 z-20 w-80 rounded-xl border border-gray-100 bg-white p-5 shadow-xl">
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900">Bộ lọc KPI</h4>
                                    <button 
                                        onClick={() => setIsFilterOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Loại chu kỳ</label>
                                        <select 
                                            value={draftPeriodType}
                                            onChange={(e) => {
                                                setDraftPeriodType(e.target.value);
                                                setDraftPeriodValue(1);
                                            }}
                                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400"
                                        >
                                            <option value="month">Theo tháng</option>
                                            <option value="quarter">Theo quý</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-700">Kỳ</label>
                                            <select 
                                                value={draftPeriodValue}
                                                onChange={(e) => setDraftPeriodValue(Number(e.target.value))}
                                                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400"
                                            >
                                                {draftPeriodType === "month" 
                                                    ? Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)
                                                    : Array.from({length: 4}, (_, i) => <option key={i+1} value={i+1}>Quý {i+1}</option>)
                                                }
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-700">Năm</label>
                                            <select 
                                                value={draftYear}
                                                onChange={(e) => setDraftYear(Number(e.target.value))}
                                                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400"
                                            >
                                                <option value={2026}>2026</option>
                                                <option value={2025}>2025</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Trạng thái</label>
                                        <select 
                                            value={draftStatusFilter}
                                            onChange={(e) => setDraftStatusFilter(e.target.value)}
                                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400"
                                        >
                                            <option value="ALL">Tất cả trạng thái</option>
                                            <option value="IN_PROGRESS">Đang thực hiện</option>
                                            <option value="COMPLETED">Đạt</option>
                                            <option value="OVERACHIEVED">Vượt</option>
                                            <option value="FAILED">Không đạt</option>
                                            <option value="NO_KPI">Chưa có KPI</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 pt-2">
                                        <button 
                                            onClick={() => {
                                                setAppliedPeriodType(draftPeriodType);
                                                setAppliedPeriodValue(draftPeriodValue);
                                                setAppliedYear(draftYear);
                                                setAppliedStatusFilter(draftStatusFilter);
                                                setIsFilterOpen(false);
                                            }}
                                            className="w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-sm"
                                        >
                                            Áp dụng bộ lọc
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const defaultMonth = new Date().getMonth() + 1;
                                                const defaultYear = new Date().getFullYear();
                                                
                                                // Reset draft states
                                                setDraftPeriodType("month");
                                                setDraftPeriodValue(defaultMonth);
                                                setDraftYear(defaultYear);
                                                setDraftStatusFilter("ALL");

                                                // Reset applied states
                                                setAppliedPeriodType("month");
                                                setAppliedPeriodValue(defaultMonth);
                                                setAppliedYear(defaultYear);
                                                setAppliedStatusFilter("ALL");

                                                setIsFilterOpen(false);
                                            }}
                                            className="w-full rounded-lg bg-gray-50 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                                        >
                                            Đặt lại bộ lọc
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-2 items-center w-full md:w-auto ml-auto">
                    <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
                        <Plus className="h-4 w-4" />
                        Áp KPI
                    </button>

                    <button 
                        onClick={handleExport}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4" />
                        Xuất file
                    </button>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="min-h-[400px] relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                )}
                <KpiTable
                    kpis={pagedKpis}
                    onSort={(key) => {
                        if (sortConfig?.key === key) {
                            setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
                        } else {
                            setSortConfig({ key, direction: 'asc' });
                        }
                    }}
                    sortConfig={sortConfig}
                />
            </div>

            <TablePagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={filteredKpis.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
            />

            <CreateKpiModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchKpis}
                initialPeriodType={appliedPeriodType as any}
                initialPeriodValue={appliedPeriodValue}
                initialYear={appliedYear}
                teamMembers={kpis}
            />
        </div>
    );
}
