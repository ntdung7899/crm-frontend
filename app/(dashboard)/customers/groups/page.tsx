"use client";

import { Briefcase, RefreshCw, Search, UserPlus, Users, UsersRound } from "lucide-react";
import { useCustomerGroupsPage } from "./hooks/useCustomerGroupsPage";
import { CustomerGroupsTable } from "./components/CustomerGroupsTable";

export default function CustomerGroupsPage() {
    const {
        groups,
        filteredGroups,
        isLoading,
        isCreating,
        newGroupName,
        setNewGroupName,
        searchQuery,
        setSearchQuery,
        userOptions,
        groupOwnerByTagId,
        assigningGroupId,
        handleAssignGroupOwner,
        handleCreateGroup,
        handleDeleteGroup,
        openGroupDetail,
        DeleteConfirmationDialog,
    } = useCustomerGroupsPage();

    const totalCustomersInGroups = groups.reduce((total, group) => total + group.customerCount, 0);
    const unassignedGroups = groups.filter((group) => !groupOwnerByTagId[group.id]).length;
    const emptyGroups = groups.filter((group) => group.customerCount === 0).length;

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý nhóm khách hàng</h1>
                    <p className="mt-2 text-sm text-gray-500">Quản lý danh sách nhóm khách hàng, phân công người phụ trách và theo dõi số lượng thành viên.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        value={newGroupName}
                        onChange={(event) => setNewGroupName(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") void handleCreateGroup();
                        }}
                        disabled={isCreating}
                        placeholder="Tên nhóm mới"
                        className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <button onClick={() => void handleCreateGroup()} disabled={isCreating} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60">
                        <UserPlus className="h-4 w-4" />
                        Tạo nhóm mới
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={<UsersRound className="h-7 w-7" />} label="Tổng nhóm" value={groups.length} note="Nhóm" className="bg-violet-50 text-violet-600" />
                <StatCard icon={<Users className="h-7 w-7" />} label="Tổng khách hàng trong nhóm" value={totalCustomersInGroups} note="Khách hàng" className="bg-emerald-50 text-emerald-600" />
                <StatCard icon={<UserPlus className="h-7 w-7" />} label="Nhóm chưa gán phụ trách" value={unassignedGroups} note="Nhóm" className="bg-amber-50 text-amber-600" />
                <StatCard icon={<Briefcase className="h-7 w-7" />} label="Nhóm trống" value={emptyGroups} note="Nhóm" className="bg-sky-50 text-sky-600" />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px_320px_auto] xl:items-end">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Tìm nhanh nhóm khách hàng..."
                            className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                    </div>
                    <FilterSelect label="Người phụ trách" options={["Tất cả", ...userOptions.map((option) => option.label)]} />
                    <FilterSelect label="Trạng thái" options={["Tất cả", "Hoạt động", "Nháp"]} />
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                        <RefreshCw className="h-4 w-4" />
                        Làm mới
                    </button>
                </div>
            </div>

            <CustomerGroupsTable
                groups={filteredGroups}
                isLoading={isLoading}
                userOptions={userOptions}
                groupOwnerByTagId={groupOwnerByTagId}
                assigningGroupId={assigningGroupId}
                onAssignGroupOwner={(groupId, userId) => void handleAssignGroupOwner(groupId, userId)}
                onOpenGroupDetail={openGroupDetail}
                onDeleteGroup={(group) => void handleDeleteGroup(group)}
            />

            {isLoading && <p className="text-sm text-gray-500">Đang tải danh sách nhóm khách hàng...</p>}
            <DeleteConfirmationDialog />
        </div>
    );
}

function StatCard({ icon, label, value, note, className }: { icon: React.ReactNode; label: string; value: number; note: string; className: string }) {
    return (
        <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${className}`}>{icon}</span>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{value.toLocaleString("vi-VN")}</p>
                <p className="mt-1 text-sm text-gray-500">{note}</p>
            </div>
        </div>
    );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
            <select className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-500 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
                {options.map((option) => <option key={option}>{option}</option>)}
            </select>
        </label>
    );
}
