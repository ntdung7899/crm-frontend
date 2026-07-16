import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { formatPermissionName } from "@/lib/utils";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { usersService } from "@/services/users";
import { UserProfile } from "@/types/user";
import { mapApiRowToProfile } from "../utils/userListMappers";

const PAGE_SIZE = "500";

export function useUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [userRolesByUser, setUserRolesByUser] = useState<Record<string, string[]>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive" | "kpi">("all");
    const [isLoading, setIsLoading] = useState(true);
    const toastRef = useStableToastRef();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersRes = await usersService.getAdminUsers({ pageSize: PAGE_SIZE });
            const rows = usersRes.responseData?.rows ?? [];

            const rolesMap: Record<string, string[]> = {};
            for (const row of rows) {
                rolesMap[row.id] = (row.user_permisions ?? []).map((up) => formatPermissionName(up.permision.name));
            }

            setUsers(rows.map(mapApiRowToProfile));
            setUserRolesByUser(rolesMap);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải danh sách người dùng.";
            toastRef.current.error("Tải dữ liệu thất bại", msg);
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const filterCounts = useMemo(() => {
        return {
            all: users.length,
            active: users.filter((u) => u.is_active && !u.is_delete).length,
            inactive: users.filter((u) => !u.is_active && !u.is_delete).length,
        };
    }, [users]);

    const filteredUsers = useMemo(() => {
        let filtered = users;

        if (activeFilter === "active") {
            filtered = filtered.filter((u) => u.is_active && !u.is_delete);
        } else if (activeFilter === "inactive") {
            filtered = filtered.filter((u) => !u.is_active && !u.is_delete);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.full_name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query) ||
                    (user.phone && user.phone.includes(query)),
            );
        }

        return filtered;
    }, [users, activeFilter, searchQuery]);

    const handleUserClick = useCallback(
        (user: UserProfile) => {
            router.push(`/users/${user.id}?tab=detail`);
        },
        [router],
    );

    const handleAddUser = useCallback(() => {
        router.push("/users/new");
    }, [router]);

    const handleEditUser = useCallback(
        (user: UserProfile) => {
            router.push(`/users/${user.id}?tab=detail&mode=edit`);
        },
        [router],
    );

    const handleDeleteUser = useCallback(async (user: UserProfile) => {
        try {
            await usersService.deleteUser(user.id);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            toastRef.current.success("Xóa thành công", `Người dùng "${user.full_name}" đã bị xóa.`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể xóa người dùng.";
            toastRef.current.error("Xóa thất bại", msg);
        }
    }, [toastRef]);

    const handleRequestDeleteUser = useCallback(
        (user: UserProfile) => {
            requestDeleteConfirmation({
                title: "Xóa người dùng",
                description: `Bạn có chắc chắn muốn xóa người dùng "${user.full_name}"? Hành động này không thể hoàn tác.`,
                onConfirm: async () => {
                    await handleDeleteUser(user);
                },
            });
        },
        [handleDeleteUser, requestDeleteConfirmation],
    );

    const handleExport = useCallback(async () => {
        try {
            const blob = await usersService.exportUsers();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `users-${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toastRef.current.success("Xuất file thành công", "Đã xuất danh sách người dùng");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể xuất file.";
            toastRef.current.error("Xuất file thất bại", msg);
        }
    }, [toastRef]);

    return {
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
    };
}
