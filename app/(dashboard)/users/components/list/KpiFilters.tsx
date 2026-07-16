import { useState, useRef, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";

interface KpiFiltersProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;

    appliedPeriodType: string;
    appliedPeriodValue: number;
    appliedYear: number;
    appliedStatusFilter: string;

    draftPeriodType: string;
    setDraftPeriodType: (val: string) => void;
    draftPeriodValue: number;
    setDraftPeriodValue: (val: number) => void;
    draftYear: number;
    setDraftYear: (val: number) => void;
    draftStatusFilter: string;
    setDraftStatusFilter: (val: string) => void;

    setAppliedPeriodType: (val: string) => void;
    setAppliedPeriodValue: (val: number) => void;
    setAppliedYear: (val: number) => void;
    setAppliedStatusFilter: (val: string) => void;
}

export function KpiFilters({
    searchQuery, setSearchQuery,
    appliedPeriodType, appliedPeriodValue, appliedYear, appliedStatusFilter,
    draftPeriodType, setDraftPeriodType,
    draftPeriodValue, setDraftPeriodValue,
    draftYear, setDraftYear,
    draftStatusFilter, setDraftStatusFilter,
    setAppliedPeriodType, setAppliedPeriodValue, setAppliedYear, setAppliedStatusFilter
}: KpiFiltersProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        if (isFilterOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFilterOpen]);

    return (
        <>
            <div className="relative w-full md:w-64 border-gray-200">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm kiếm nhân sự..."
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
            </div>

            <div className="relative" ref={filterRef}>
                <button 
                    onClick={() => {
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
                )}
            </div>
        </>
    );
}
