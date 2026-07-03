import { useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, RefreshCw, Search, ChevronDown, Plus } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { mockKPIs } from "@/mock-data/kpis";
import { KPI, KPIStatus } from "@/types/kpi";
import { KpiTable } from "./KpiTable";
import { CreateKpiModal } from "./CreateKpiModal";
import { KpiCharts } from "./KpiCharts";

const DEFAULT_PAGE_SIZE = 10;

export function KpiTabContent() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [periodFilter, setPeriodFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortConfig, setSortConfig] = useState<{ key: keyof KPI, direction: 'asc' | 'desc' } | null>(null);

    const kpis = mockKPIs;

    const filteredKpis = useMemo(() => {
        let result = kpis.filter((kpi) => {
            const matchesSearch = kpi.kpi_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                kpi.user_full_name.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesPeriod = periodFilter === "ALL" || kpi.period_type === periodFilter;
            const matchesStatus = statusFilter === "ALL" || kpi.status === statusFilter;

            return matchesSearch && matchesPeriod && matchesStatus;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
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
    }, [kpis, searchQuery, periodFilter, statusFilter, sortConfig]);

    const handleExport = async () => {
        if (filteredKpis.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh_sach_KPI');

        // Khai báo cột
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Tên KPI', key: 'name', width: 30 },
            { header: 'Mô tả', key: 'desc', width: 40 },
            { header: 'Nhân sự', key: 'user', width: 25 },
            { header: 'Vai trò', key: 'role', width: 15 },
            { header: 'Phân loại', key: 'type', width: 15 },
            { header: 'Module', key: 'module', width: 15 },
            { header: 'Mục tiêu', key: 'target', width: 15 },
            { header: 'Thực tế', key: 'actual', width: 15 },
            { header: 'Đơn vị', key: 'unit', width: 12 },
            { header: 'Tiến độ (%)', key: 'progress', width: 15 },
            { header: 'Trạng thái', key: 'status', width: 20 },
            { header: 'Chu kỳ', key: 'period', width: 15 },
            { header: 'Năm', key: 'year', width: 10 }
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
            worksheet.addRow({
                id: kpi.id,
                name: kpi.kpi_name,
                desc: kpi.description || "",
                user: kpi.user_full_name,
                role: kpi.user_role,
                type: kpi.kpi_type === "AUTOMATIC" ? "Tự động" : "Thủ công",
                module: kpi.related_module || "",
                target: kpi.target_value,
                actual: kpi.current_value,
                unit: kpi.unit,
                progress: kpi.completion_percentage,
                status: kpi.status === "COMPLETED" ? "Đạt" : kpi.status === "OVERACHIEVED" ? "Vượt" : kpi.status === "FAILED" ? "Không đạt" : "Đang thực hiện",
                period: kpi.period_type === "MONTHLY" ? `Tháng ${kpi.period}` : kpi.period_type === "QUARTERLY" ? `Quý ${kpi.period}` : `Năm`,
                year: kpi.year
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

        // Căn giữa các cột
        ['id', 'role', 'type', 'module', 'unit', 'progress', 'status', 'period', 'year'].forEach(key => {
            worksheet.getColumn(key).alignment = { vertical: 'middle', horizontal: 'center' };
        });
        
        // Căn phải và định dạng số cho cột Giá trị
        ['target', 'actual'].forEach(key => {
            worksheet.getColumn(key).alignment = { vertical: 'middle', horizontal: 'right' };
            worksheet.getColumn(key).numFmt = '#,##0';
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `KPI_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const pagedKpis = useMemo(
        () => filteredKpis.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, filteredKpis, pageSize]
    );

    return (
        <div>
            <KpiCharts kpis={filteredKpis} />
            
            <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5 xl:grid-cols-[1fr_200px_200px_auto_auto_auto] xl:items-end">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Tìm kiếm chỉ tiêu, nhân sự..."
                        className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                </div>
                <FilterSelect 
                    label="Chu kỳ" 
                    value={periodFilter}
                    onChange={setPeriodFilter}
                    options={[
                        { label: "Tất cả chu kỳ", value: "ALL" },
                        { label: "Tháng", value: "MONTHLY" },
                        { label: "Quý", value: "QUARTERLY" },
                        { label: "Năm", value: "YEARLY" }
                    ]} 
                />
                <FilterSelect 
                    label="Trạng thái" 
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { label: "Tất cả trạng thái", value: "ALL" },
                        { label: "Đang thực hiện", value: "IN_PROGRESS" },
                        { label: "Đạt", value: "COMPLETED" },
                        { label: "Vượt chỉ tiêu", value: "OVERACHIEVED" },
                        { label: "Không đạt", value: "FAILED" }
                    ]} 
                />

                <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
                    <Plus className="h-4 w-4" />
                    Áp KPI
                </button>

                <button 
                    onClick={handleExport}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                    <Download className="h-4 w-4" />
                    Xuất file
                </button>
                <button className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50">
                    <RefreshCw className="h-5 w-5" />
                </button>
            </div>

            {filteredKpis.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-gray-400">Không có dữ liệu KPI nào để hiển thị.</div>
            ) : (
                <KpiTable 
                    kpis={pagedKpis} 
                    onSort={(key) => {
                        setSortConfig(current => {
                            if (current?.key === key) {
                                if (current.direction === 'asc') return { key, direction: 'desc' };
                                return null;
                            }
                            return { key, direction: 'asc' };
                        });
                    }}
                    sortConfig={sortConfig}
                />
            )}

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
            />
        </div>
    );
}

interface FilterOption {
    label: string;
    value: string;
}

function FilterSelect({ label, options, value, onChange }: { label: string; options: FilterOption[]; value: string; onChange: (val: string) => void }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
            <div className="relative">
                <select 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-600 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
        </label>
    );
}
