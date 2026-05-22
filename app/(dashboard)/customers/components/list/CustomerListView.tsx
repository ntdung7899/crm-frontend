"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown, Download, Plus, Search, Star, Upload, UserCheck, UserPlus, Users } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { useCustomersPage } from "../../hooks/useCustomersPage";
import { ImportModal } from "../import-export/ImportModal";
import { CustomerTable } from "./CustomerTable";

interface CustomerListViewProps {
    onCountChange?: (count: number) => void;
}

const DEFAULT_PAGE_SIZE = 10;

export function CustomerListView({ onCountChange }: CustomerListViewProps) {
    const {
        isLoading,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        groupFilters,
        filterCounts,
        filteredCustomers,
        handleCustomerClick,
        handleAddCustomer,
        handleEditCustomer,
        handleRequestDeleteCustomer,
        handleExport,
        handleImport,
        DeleteConfirmationDialog,
    } = useCustomersPage(onCountChange);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchQuery]);

    const pagedCustomers = useMemo(
        () => filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, filteredCustomers, pageSize],
    );

    const totalCustomers = filterCounts.all || filteredCustomers.length;
    const todayCustomers = filteredCustomers.filter((customer) => {
        const createdAt = customer.createdDate;
        const today = new Date();
        return createdAt.toDateString() === today.toDateString();
    }).length;
    const unassignedCustomers = filteredCustomers.filter((customer) => !customer.assignee?.trim()).length;
    const potentialCustomers = filteredCustomers.filter((customer) => customer.groups?.some((group) => group.toLowerCase().includes("tiềm năng"))).length;
    const potentialPercent = totalCustomers > 0 ? Math.round((potentialCustomers / totalCustomers) * 100) : 0;

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
                Đang tải danh sách khách hàng...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={<Users className="h-7 w-7" />} label="Tổng khách hàng" value={totalCustomers} note="Tất cả thời gian" gradient="from-indigo-500 to-violet-600" />
                <StatCard icon={<UserPlus className="h-7 w-7" />} label="Khách hàng mới hôm nay" value={todayCustomers} note={new Date().toLocaleDateString("vi-VN")} gradient="from-emerald-400 to-green-600" />
                <StatCard icon={<UserCheck className="h-7 w-7" />} label="Chưa phân công" value={unassignedCustomers} note="Chưa có người phụ trách" gradient="from-orange-400 to-orange-600" />
                <StatCard icon={<Star className="h-7 w-7" />} label="Khách hàng tiềm năng" value={potentialCustomers} note={`${potentialPercent}% tổng khách hàng`} gradient="from-sky-400 to-blue-600" />
            </div>

            <div className="space-y-4">
                <div>
                    <p className="mb-2 text-sm text-gray-600">Nhóm khách hàng:</p>
                    <div className="flex flex-wrap items-center gap-3">
                        {groupFilters.map((filter) => {
                            const isActive = activeFilter === filter.id;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${isActive ? "border-primary-200 bg-white text-primary-700 shadow-sm ring-1 ring-primary-100" : "border-gray-200 bg-white text-gray-700 hover:border-primary-200"}`}
                                >
                                    <span>{filter.label}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"}`}>
                                        {filterCounts[filter.id] || 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative flex-1 xl:max-w-[520px]">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Tìm tên, số điện thoại, mã khách hàng..."
                            className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm text-gray-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <FilterButton label="Nhóm khách hàng" />
                        <FilterButton label="Giới tính" />
                        <FilterButton label="Ngày tạo" icon={<Calendar className="h-4 w-4" />} />
                        <button onClick={handleExport} className="flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                            <Download className="h-4 w-4" />
                            Xuất
                        </button>
                        <button onClick={() => setIsImportModalOpen(true)} className="flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                            <Upload className="h-4 w-4" />
                            Nhập
                        </button>
                        <button onClick={handleAddCustomer} className="flex h-12 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
                            <Plus className="h-4 w-4" />
                            Thêm khách hàng
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {filteredCustomers.length === 0 ? (
                    <div className="px-6 py-16 text-center text-sm text-gray-400">Không có dữ liệu để hiển thị.</div>
                ) : (
                    <CustomerTable
                        customers={pagedCustomers}
                        onCustomerClick={handleCustomerClick}
                        onCustomerEdit={handleEditCustomer}
                        onCustomerDelete={handleRequestDeleteCustomer}
                    />
                )}
                <TablePagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalCount={filteredCustomers.length}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            </div>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />
            <DeleteConfirmationDialog />
        </div>
    );
}

function StatCard({ icon, label, value, note, gradient }: { icon: React.ReactNode; label: string; value: number; note: string; gradient: string }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString("vi-VN")}</p>
                <p className="mt-0.5 text-sm text-gray-500">{note}</p>
            </div>
        </div>
    );
}

function FilterButton({ label, icon }: { label: string; icon?: React.ReactNode }) {
    return (
        <button className="flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            {icon}
            <span>{label}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
    );
}
