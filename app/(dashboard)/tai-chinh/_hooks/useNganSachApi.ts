"use client";

import { useCallback, useEffect, useState } from "react";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { financeService } from "@/services/finance/financeService";
import { mapBudgetToNganSach, mapNganSachFormToCreateBudget, type NganSachFormInput } from "@/services/finance/apiMappers";
import type { NganSach } from "@/services/finance/types";

export function useNganSachApi() {
    const [items, setItems] = useState<NganSach[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const toastRef = useStableToastRef();

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await financeService.getBudgets({ limit: 100 });
            setItems((data.items ?? []).map(mapBudgetToNganSach));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Không thể tải danh sách ngân sách.";
            setError(message);
            toastRef.current.error("Tải ngân sách thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void load();
    }, [load]);

    const create = useCallback(
        async (form: NganSachFormInput): Promise<boolean> => {
            setIsSaving(true);
            try {
                await financeService.createBudget(mapNganSachFormToCreateBudget(form));
                toastRef.current.success("Tạo ngân sách thành công");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Tạo ngân sách thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [load, toastRef],
    );

    return { items, isLoading, error, isSaving, reload: load, create };
}
