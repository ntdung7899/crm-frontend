"use client";

import { useCallback, useEffect, useState } from "react";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { financeService } from "@/services/finance/financeService";
import type { FinanceDashboard, FinanceDashboardParams } from "@/services/finance/apiTypes";

export function useFinanceDashboardApi(initial: FinanceDashboardParams = { period: "this_month" }) {
    const [data, setData] = useState<FinanceDashboard | null>(null);
    const [params, setParams] = useState<FinanceDashboardParams>(initial);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toastRef = useStableToastRef();

    const load = useCallback(
        async (p: FinanceDashboardParams) => {
            setIsLoading(true);
            setError(null);
            try {
                setData(await financeService.getDashboard(p));
            } catch (e) {
                const message = e instanceof Error ? e.message : "Không thể tải tổng quan tài chính.";
                setError(message);
                toastRef.current.error("Tải tổng quan thất bại", message);
            } finally {
                setIsLoading(false);
            }
        },
        [toastRef],
    );

    useEffect(() => {
        void load(params);
    }, [load, params]);

    return { data, isLoading, error, params, setParams, reload: () => load(params) };
}
