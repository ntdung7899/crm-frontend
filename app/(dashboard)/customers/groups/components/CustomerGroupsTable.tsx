"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { formatDateVN } from "@/lib/utils";
import { GroupItem, UserOption } from "../hooks/useCustomerGroupsPage";

type CustomerGroupsTableProps = {
    groups: GroupItem[];
    isLoading: boolean;
    userOptions: UserOption[];
    groupOwnerByTagId: Record<string, string>;
    assigningGroupId: string | null;
    onAssignGroupOwner: (groupId: string, userId: string) => void;
    onOpenGroupDetail: (groupId: string) => void;
    onDeleteGroup: (group: GroupItem) => void;
};

const PAGE_SIZE = 10;

export function CustomerGroupsTable({
    groups,
    isLoading,
    userOptions,
    groupOwnerByTagId,
    assigningGroupId,
    onAssignGroupOwner,
    onOpenGroupDetail,
    onDeleteGroup,
}: CustomerGroupsTableProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const pagedGroups = groups.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const ownerNameById = userOptions.reduce<Record<string, string>>((acc, user) => {
        acc[user.id] = user.label;
        return acc;
    }, {});

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                    <thead className="border-b border-gray-100 bg-gray-50/80">
                        <tr>
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tên nhóm</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Mô tả</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Số khách hàng</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Người phụ trách</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ngày tạo</th>
                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pagedGroups.map((group, index) => {
                            const ownerId = groupOwnerByTagId[group.id] || "";
                            const ownerName = ownerId ? ownerNameById[ownerId] || ownerId : "Chưa gán";
                            return (
                                <tr key={group.id} className="transition-colors hover:bg-gray-50/70">
                                    <td className="px-5 py-5">
                                        <p className="font-semibold text-gray-900">{group.name}</p>
                                        <span className="mt-2 inline-flex rounded-md bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600">
                                            ID: {String(index + 1 + (currentPage - 1) * pageSize).padStart(3, "0")}
                                        </span>
                                    </td>
                                    <td className="max-w-[260px] px-5 py-5 text-sm leading-6 text-gray-700">
                                        {getDescription(group)}
                                    </td>
                                    <td className="px-5 py-5 text-sm font-semibold text-gray-900">{group.customerCount}</td>
                                    <td className="px-5 py-5">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
                                                <UserPlus className="h-4 w-4" />
                                                {ownerName}
                                            </span>
                                            <select
                                                value={ownerId}
                                                onChange={(event) => onAssignGroupOwner(group.id, event.target.value)}
                                                disabled={isLoading || assigningGroupId === group.id}
                                                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition hover:bg-gray-50 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                                            >
                                                <option value="">Gán</option>
                                                {userOptions.map((option) => (
                                                    <option key={option.id} value={option.id}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5">
                                        <span className={`inline-flex rounded-md px-3 py-1 text-sm font-semibold ${group.isActive ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"}`}>
                                            {group.isActive ? "Hoạt động" : "Nháp"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 text-sm leading-5 text-gray-700 whitespace-pre-line">
                                        {group.createdAt ? formatDateVN(group.createdAt) : "Chưa cập nhật"}
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className="relative flex items-center justify-end gap-3">
                                            <button onClick={() => onOpenGroupDetail(group.id)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                                                <Users className="h-4 w-4" />
                                                Xem thành viên
                                            </button>
                                            <button onClick={() => setOpenMenuId(openMenuId === group.id ? null : group.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                            {openMenuId === group.id && (
                                                <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                                                    <MenuItem icon={<Pencil className="h-4 w-4" />} label="Sửa nhóm" />
                                                    <MenuItem icon={<UserPlus className="h-4 w-4" />} label="Gán người phụ trách" />
                                                    <button onClick={() => onDeleteGroup(group)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                        Xóa nhóm
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {!isLoading && groups.length === 0 && (
                <div className="p-10 text-center text-sm text-gray-500">Không tìm thấy nhóm phù hợp.</div>
            )}

            <TablePagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={groups.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
            />
        </div>
    );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            {icon}
            {label}
        </button>
    );
}

function getDescription(group: GroupItem) {
    if (group.name.toLowerCase().includes("tiềm năng")) {
        return "Nhóm khách hàng cần chăm sóc và chuyển đổi";
    }

    if (group.name.toLowerCase().includes("test")) {
        return "Nhóm dùng để kiểm thử tính năng";
    }

    return `Nhóm khách hàng ${group.name}`;
}
