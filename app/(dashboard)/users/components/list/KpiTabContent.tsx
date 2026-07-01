import { useMemo, useState } from "react";
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

    const kpis = mockKPIs;

    const filteredKpis = useMemo(() => {
        return kpis.filter((kpi) => {
            const matchesSearch = kpi.kpi_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                kpi.user_full_name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [kpis, searchQuery]);

    const pagedKpis = useMemo(
        () => filteredKpis.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, filteredKpis, pageSize]
    );

    return (
        <div>
            <KpiCharts kpis={kpis} />
            
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
                <FilterSelect label="Chu kỳ" options={["Tất cả chu kỳ", "Tháng này", "Quý này", "Năm nay"]} />
                <FilterSelect label="Trạng thái" options={["Tất cả trạng thái", "Đang thực hiện", "Đạt", "Vượt chỉ tiêu", "Không đạt"]} />

                <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
                    <Plus className="h-4 w-4" />
                    Áp KPI
                </button>

                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
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
                <KpiTable kpis={pagedKpis} />
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

function FilterSelect({ label, options }: { label: string; options: string[] }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
            <div className="relative">
                <select className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-600 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
                    {options.map((option) => <option key={option}>{option}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
        </label>
    );
}
