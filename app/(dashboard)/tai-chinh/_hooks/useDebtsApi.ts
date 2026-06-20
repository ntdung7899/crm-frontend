"use client";

import { useCallback, useEffect, useState } from "react";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { financeService } from "@/services/finance/financeService";
import { mapDebtsToCongNo } from "@/services/finance/apiMappers";
import type { DebtSummary } from "@/services/finance/apiTypes";
import type { KhachHangCongNo } from "@/services/finance/types";

export function useDebtsApi() {
    const [items, setItems] = useState<KhachHangCongNo[]>([]);
    const [summary, setSummary] = useState<DebtSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toastRef = useStableToastRef();

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [debts, sum] = await Promise.all([
                financeService.getDebts({ limit: 500 }),
                financeService.getDebtSummary().catch(() => null),
            ]);
            setItems(mapDebtsToCongNo(debts.items ?? []));
            setSummary(sum);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Không thể tải công nợ.";
            setError(message);
            toastRef.current.error("Tải công nợ thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void load();
    }, [load]);

    return { items, summary, isLoading, error, reload: load };
}
