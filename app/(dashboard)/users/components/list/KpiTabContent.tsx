import { Download, RefreshCw, Plus, BarChart2 } from "lucide-react";
import { useState } from "react";
import { TablePagination } from "@/components/ui/TablePagination";
import { KpiTable } from "./KpiTable";
import { CreateKpiModal } from "./CreateKpiModal";
import { UpdateKpiModal } from "./UpdateKpiModal";
import { KpiCharts } from "./KpiCharts";
import { KpiFilters } from "./KpiFilters";
import { useKpiTab } from "../../hooks/useKpiTab";

interface KpiTabContentProps {
    onKpisLoaded?: (count: number) => void;
}

export function KpiTabContent({ onKpisLoaded }: KpiTabContentProps) {
    const kpiTabState = useKpiTab(onKpisLoaded);

    return (
        <div>
            <KpiCharts kpis={kpiTabState.filteredKpis} isPeriodOver={kpiTabState.isPeriodOver} />
            
            <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 p-5">
                <KpiFilters
                    searchQuery={kpiTabState.searchQuery}
                    setSearchQuery={kpiTabState.setSearchQuery}
                    appliedPeriodType={kpiTabState.appliedPeriodType}
                    appliedPeriodValue={kpiTabState.appliedPeriodValue}
                    appliedYear={kpiTabState.appliedYear}
                    appliedStatusFilter={kpiTabState.appliedStatusFilter}
                    draftPeriodType={kpiTabState.draftPeriodType}
                    setDraftPeriodType={kpiTabState.setDraftPeriodType}
                    draftPeriodValue={kpiTabState.draftPeriodValue}
                    setDraftPeriodValue={kpiTabState.setDraftPeriodValue}
                    draftYear={kpiTabState.draftYear}
                    setDraftYear={kpiTabState.setDraftYear}
                    draftStatusFilter={kpiTabState.draftStatusFilter}
                    setDraftStatusFilter={kpiTabState.setDraftStatusFilter}
                    setAppliedPeriodType={kpiTabState.setAppliedPeriodType}
                    setAppliedPeriodValue={kpiTabState.setAppliedPeriodValue}
                    setAppliedYear={kpiTabState.setAppliedYear}
                    setAppliedStatusFilter={kpiTabState.setAppliedStatusFilter}
                />
                
                {!kpiTabState.isWorkerRole && (
                    <button
                        onClick={() => kpiTabState.setViewMode(kpiTabState.viewMode === 'team' ? 'my' : 'team')}
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${kpiTabState.viewMode === 'my' ? 'border-primary-200 bg-primary-100 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <BarChart2 className="h-4 w-4" />
                        {kpiTabState.viewMode === 'my' ? 'Xem KPI Nhóm' : 'KPI của tôi'}
                    </button>
                )}

                <div className="flex gap-2 items-center w-full md:w-auto ml-auto">
                    {!kpiTabState.isWorkerRole && (
                        <button 
                            onClick={() => kpiTabState.setIsCreateModalOpen(true)} 
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                        >
                            <Plus className="h-4 w-4" />
                            Áp KPI
                        </button>
                    )}

                    <button 
                        onClick={kpiTabState.handleExport}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4" />
                        Xuất file
                    </button>
                    <button 
                        onClick={kpiTabState.fetchKpis}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${kpiTabState.isLoading ? 'animate-spin text-primary-600' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="min-h-[400px] relative">
                {kpiTabState.isLoading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                )}
                <KpiTable
                    kpis={kpiTabState.pagedKpis}
                    onSort={kpiTabState.handleSort}
                    sortConfig={kpiTabState.sortConfig}
                    isPeriodOver={kpiTabState.isPeriodOver}
                    onEditTarget={(kpi) => {
                        kpiTabState.setEditingKpiMember(kpi);
                        kpiTabState.setIsUpdateModalOpen(true);
                    }}
                    canEditTarget={kpiTabState.canEditKpiTarget}
                />
            </div>

            <TablePagination
                currentPage={kpiTabState.currentPage}
                pageSize={kpiTabState.pageSize}
                totalCount={kpiTabState.filteredKpis.length}
                onPageChange={kpiTabState.setCurrentPage}
                onPageSizeChange={(size) => {
                    kpiTabState.setPageSize(size);
                    kpiTabState.setCurrentPage(1);
                }}
            />

            <CreateKpiModal
                isOpen={kpiTabState.isCreateModalOpen}
                onClose={() => kpiTabState.setIsCreateModalOpen(false)}
                onSuccess={kpiTabState.fetchKpis}
                initialPeriodType={kpiTabState.appliedPeriodType as any}
                initialPeriodValue={kpiTabState.appliedPeriodValue}
                initialYear={kpiTabState.appliedYear}
                teamMembers={kpiTabState.kpis.filter(member => kpiTabState.canEditKpiTarget(member.user_id))}
            />

            <UpdateKpiModal
                isOpen={kpiTabState.isUpdateModalOpen}
                onClose={() => kpiTabState.setIsUpdateModalOpen(false)}
                onSuccess={kpiTabState.fetchKpis}
                kpiMember={kpiTabState.editingKpiMember}
                periodType={kpiTabState.appliedPeriodType as any}
                periodValue={kpiTabState.appliedPeriodValue}
                year={kpiTabState.appliedYear}
            />
        </div>
    );
}
