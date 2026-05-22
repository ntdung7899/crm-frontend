"use client";

import { UserProfile } from "@/types/user";
import { formatDateVN } from "@/lib/utils";
import { Eye, KeyRound, Lock, MoreVertical, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

interface UserTableProps {
    users: UserProfile[];
    userRolesByUser?: Record<string, string[]>;
    onUserClick?: (user: UserProfile) => void;
    onUserEdit?: (user: UserProfile) => void;
    onUserDelete?: (user: UserProfile) => void;
}

type SortField = keyof UserProfile | null;
type SortDirection = "asc" | "desc";

export function UserTable({ users, userRolesByUser = {}, onUserClick, onUserEdit, onUserDelete }: UserTableProps) {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
                <thead className="border-b border-gray-100 bg-gray-50/80">
                    <tr>
                        <TableHeader label="Người dùng" field="full_name" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <TableHeader label="Email" field="email" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <TableHeader label="Số điện thoại" field="phone" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Vai trò</th>
                        <TableHeader label="Trạng thái" field="is_active" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Lần đăng nhập gần nhất</th>
                        <TableHeader label="Ngày tạo" field="created_at" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sortedUsers.map((user) => {
                        const primaryRole = getPrimaryRole(userRolesByUser[user.id]);
                        return (
                            <tr key={user.id} className="transition-colors hover:bg-gray-50/70">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                                            {getInitials(user.full_name)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-gray-900">{user.full_name}</p>
                                                <RoleBadge role={primaryRole} />
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-700">{user.email}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{user.phone || "-"}</td>
                                <td className="px-5 py-4"><RoleBadge role={primaryRole} /></td>
                                <td className="px-5 py-4">
                                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${user.is_active && !user.is_delete ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                        <span className="h-2 w-2 rounded-full bg-current" />
                                        {user.is_active && !user.is_delete ? "Hoạt động" : "Ngưng hoạt động"}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-sm leading-5 text-gray-700 whitespace-pre-line">{formatDateVN(user.updated_at)}</td>
                                <td className="px-5 py-4 text-sm leading-5 text-gray-700 whitespace-pre-line">{formatDateVN(user.created_at)}</td>
                                <td className="px-5 py-4">
                                    <div className="relative flex items-center justify-end gap-2">
                                        <IconButton title="Xem chi tiết" onClick={() => onUserClick?.(user)}><Eye className="h-4 w-4" /></IconButton>
                                        <IconButton title="Chỉnh sửa" onClick={() => onUserEdit?.(user)}><Pencil className="h-4 w-4" /></IconButton>
                                        <IconButton title="Thêm thao tác" onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}><MoreVertical className="h-4 w-4" /></IconButton>
                                        {openMenuId === user.id && (
                                            <div className="absolute right-0 top-11 z-20 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                                                <MenuItem icon={<KeyRound className="h-4 w-4" />} label="Đặt lại mật khẩu" />
                                                <MenuItem icon={<Lock className="h-4 w-4" />} label="Khóa tài khoản" />
                                                <MenuItem icon={<ShieldCheck className="h-4 w-4" />} label="Phân quyền" />
                                                <button onClick={() => onUserDelete?.(user)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                    Xóa người dùng
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
    );
}

interface TableHeaderProps {
    label: string;
    field: SortField;
    onSort: (field: SortField) => void;
    sortField: SortField;
    sortDirection: SortDirection;
}

function TableHeader({ label, field, onSort, sortField, sortDirection }: TableHeaderProps) {
    const isSorted = sortField === field;
    return (
        <th className="cursor-pointer px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 transition hover:bg-gray-100" onClick={() => onSort(field)}>
            <div className="flex items-center gap-1">
                <span>{label}</span>
                {isSorted && <span className="text-primary-600">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </div>
        </th>
    );
}

function RoleBadge({ role }: { role: string }) {
    const normalized = role.toLowerCase();
    const className = normalized.includes("owner")
        ? "bg-violet-50 text-violet-600"
        : normalized.includes("leader")
            ? "bg-sky-50 text-sky-600"
            : "bg-blue-50 text-blue-600";

    return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${className}`}>{role}</span>;
}

function IconButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} title={title} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50">
            {children}
        </button>
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

function getPrimaryRole(roles?: string[]) {
    if (!roles || roles.length === 0) return "Worker";
    if (roles.some((role) => role.toLowerCase().includes("owner"))) return "Owner";
    if (roles.some((role) => role.toLowerCase().includes("leader"))) return "Leader";
    return roles[0] || "Worker";
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "ND";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
