"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Download, RefreshCw, Search, ShieldCheck, UserCheck, UserPlus, Users, UserX } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { UserTable } from "./UserTable";
import { useUsersPage } from "../../hooks/useUsersPage";
import { KpiTabContent } from "./KpiTabContent";

type UserFilter = "all" | "active" | "inactive" | "kpi";

const DEFAULT_PAGE_SIZE = 10;

export function UserListView() {
    const {
        isLoading,
        userRolesByUser,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        filterCounts,
        filteredUsers,
        handleUserClick,
        handleAddUser,
        handleEditUser,
        handleRequestDeleteUser,
        handleExport,
        DeleteConfirmationDialog,
    } = useUsersPage();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchQuery]);

    const pagedUsers = useMemo(
        () => filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [currentPage, filteredUsers, pageSize],
    );

    const roleCounts = useMemo(() => {
        return Object.values(userRolesByUser).reduce(
            (acc, roles) => {
                const normalizedRoles = roles.map((role) => role.toLowerCase());
                if (normalizedRoles.some((role) => role.includes("owner"))) acc.owner += 1;
                if (normalizedRoles.some((role) => role.includes("leader"))) acc.leader += 1;
                if (normalizedRoles.some((role) => role.includes("worker"))) acc.worker += 1;
                return acc;
            },
            { owner: 0, leader: 0, worker: 0 },
        );
    }, [userRolesByUser]);

    if (isLoading) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
                Đang tải danh sách người dùng...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Người dùng</h1>
                    <p className="mt-2 text-sm text-gray-500">Quản lý tài khoản, vai trò và trạng thái hoạt động của người dùng trong hệ thống.</p>
                </div>
                <button onClick={handleAddUser} className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
                    <UserPlus className="h-4 w-4" />
                    Thêm người dùng
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                <StatCard icon={<Users className="h-6 w-6" />} label="Tổng người dùng" value={filterCounts.all || 0} note="Tài khoản" className="bg-primary-50 text-primary-600" />
                <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label="Đang hoạt động" value={filterCounts.active || 0} note="Tài khoản" className="bg-emerald-50 text-emerald-600" />
                <StatCard icon={<UserX className="h-6 w-6" />} label="Ngưng hoạt động" value={filterCounts.inactive || 0} note="Tài khoản" className="bg-orange-50 text-orange-600" />
                <StatCard icon={<ShieldCheck className="h-6 w-6" />} label="Owner" value={roleCounts.owner} note="Tài khoản" className="bg-sky-50 text-sky-600" />
                <StatCard icon={<UserCheck className="h-6 w-6" />} label="Leader" value={roleCounts.leader} note="Tài khoản" className="bg-primary-50 text-primary-600" />
                <StatCard icon={<Users className="h-6 w-6" />} label="Worker" value={roleCounts.worker} note="Tài khoản" className="bg-blue-50 text-blue-600" />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap gap-6 border-b border-gray-100 px-4">
                    <FilterTab id="all" label="Tất cả" count={filterCounts.all || 0} activeFilter={activeFilter} onChange={setActiveFilter} />
                    <FilterTab id="active" label="Đang hoạt động" count={filterCounts.active || 0} activeFilter={activeFilter} onChange={setActiveFilter} />
                    <FilterTab id="inactive" label="Ngưng hoạt động" count={filterCounts.inactive || 0} activeFilter={activeFilter} onChange={setActiveFilter} />
                    <FilterTab id="kpi" label="KPI" count={6} activeFilter={activeFilter} onChange={setActiveFilter} />
                </div>

                {activeFilter === "kpi" ? (
                    <KpiTabContent />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 border-b border-gray-100 p-5 xl:grid-cols-[1fr_320px_320px_auto_auto] xl:items-end">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Tìm tên, email, số điện thoại..."
                                    className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                            <FilterSelect label="Vai trò" options={["Tất cả vai trò", "Owner", "Leader", "Worker"]} />
                            <FilterSelect label="Trạng thái" options={["Tất cả trạng thái", "Đang hoạt động", "Ngưng hoạt động"]} />
                            <button onClick={handleExport} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                                <Download className="h-4 w-4" />
                                Xuất file
                            </button>
                            <button className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50">
                                <RefreshCw className="h-5 w-5" />
                            </button>
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div className="px-6 py-16 text-center text-sm text-gray-400">Không có dữ liệu để hiển thị.</div>
                        ) : (
                            <UserTable
                                users={pagedUsers}
                                userRolesByUser={userRolesByUser}
                                onUserClick={handleUserClick}
                                onUserEdit={handleEditUser}
                                onUserDelete={handleRequestDeleteUser}
                            />
                        )}

                        <TablePagination
                            currentPage={currentPage}
                            pageSize={pageSize}
                            totalCount={filteredUsers.length}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setCurrentPage(1);
                            }}
                        />
                    </>
                )}
            </div>
            <DeleteConfirmationDialog />
        </div>
    );
}

function StatCard({ icon, label, value, note, className }: { icon: React.ReactNode; label: string; value: number; note: string; className: string }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${className}`}>{icon}</span>
            <div className="min-w-0">
                <p className="truncate text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString("vi-VN")}</p>
                <p className="mt-1 text-sm text-gray-500">{note}</p>
            </div>
        </div>
    );
}

function FilterTab({ id, label, count, activeFilter, onChange }: { id: UserFilter; label: string; count: number; activeFilter: UserFilter; onChange: (filter: UserFilter) => void }) {
    const isActive = activeFilter === id;
    const color = id === "inactive" ? "text-orange-600" : id === "active" ? "text-emerald-600" : id === "kpi" ? "text-purple-600" : "text-primary-600";

    return (
        <button onClick={() => onChange(id)} className={`flex items-center gap-2 border-b-2 px-2 py-4 text-sm font-semibold transition ${isActive ? `border-primary-600 ${color}` : "border-transparent text-gray-600 hover:text-gray-900"}`}>
            <span>{label}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">{count}</span>
        </button>
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
