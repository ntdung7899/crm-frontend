"use client";

import { useCallback, useEffect, useState } from "react";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { financeService } from "@/services/finance/financeService";
import { mapLedgerEntryToBoToan } from "@/services/finance/apiMappers";
import type { FinanceLedgerParams } from "@/services/finance/apiTypes";
import type { BoToan } from "@/services/finance/types";

export function useLedgerApi() {
    const [items, setItems] = useState<BoToan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toastRef = useStableToastRef();

    const load = useCallback(
        async (params: FinanceLedgerParams = {}) => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await financeService.getLedgerEntries({ limit: 200, ...params });
                setItems((data.items ?? []).map(mapLedgerEntryToBoToan));
            } catch (e) {
                const message = e instanceof Error ? e.message : "Không thể tải sổ cái.";
                setError(message);
                toastRef.current.error("Tải sổ cái thất bại", message);
            } finally {
                setIsLoading(false);
            }
        },
        [toastRef],
    );

    useEffect(() => {
        void load();
    }, [load]);

    return { items, isLoading, error, reload: load };
}
