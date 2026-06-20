"use client";

import { useEffect, useState } from "react";
import { usersService } from "@/services/users";

export interface FinanceUser {
    id: string;
    ten: string;
}

/** Danh sách người dùng thật (thay cho nguoiDung trong store cũ) để chọn người quản lý/duyệt. */
export function useFinanceUsers() {
    const [users, setUsers] = useState<FinanceUser[]>([]);
    const [byId, setById] = useState<Record<string, string>>({});

    useEffect(() => {
        let disposed = false;
        usersService
            .getUsers({ currentPage: "1", pageSize: "500" })
            .then((res) => {
                if (disposed) return;
                const list: FinanceUser[] = (res.responseData?.rows ?? []).map((u) => ({
                    id: u.id,
                    ten: u.full_name || u.email || u.id,
                }));
                setUsers(list);
                setById(list.reduce<Record<string, string>>((acc, u) => ((acc[u.id] = u.ten), acc), {}));
            })
            .catch(() => {
                if (!disposed) {
                    setUsers([]);
                    setById({});
                }
            });
        return () => {
            disposed = true;
        };
    }, []);

    return { users, byId };
}
