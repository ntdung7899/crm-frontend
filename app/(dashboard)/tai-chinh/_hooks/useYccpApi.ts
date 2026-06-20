"use client";

import { useCallback, useEffect, useState } from "react";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { financeService } from "@/services/finance/financeService";
import {
    mapExpenseRequestToYCCP,
    mapYccpFormToCreateRequest,
    type YccpFormInput,
} from "@/services/finance/apiMappers";
import type { CompleteExpenseRequestPayload } from "@/services/finance/apiTypes";
import type { YeuCauChiPhi } from "@/services/finance/types";

export function useYccpApi() {
    const [items, setItems] = useState<YeuCauChiPhi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const toastRef = useStableToastRef();

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await financeService.getExpenseRequests({ limit: 100 });
            setItems((data.items ?? []).map(mapExpenseRequestToYCCP));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Không thể tải yêu cầu chi phí.";
            setError(message);
            toastRef.current.error("Tải yêu cầu chi phí thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void load();
    }, [load]);

    const create = useCallback(
        async (form: YccpFormInput): Promise<boolean> => {
            setIsSaving(true);
            try {
                await financeService.createExpenseRequest(mapYccpFormToCreateRequest(form));
                toastRef.current.success("Tạo yêu cầu chi phí thành công");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Tạo yêu cầu thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [load, toastRef],
    );

    const approve = useCallback(
        async (id: string, note?: string): Promise<boolean> => {
            try {
                await financeService.approveExpenseRequest(id, { note });
                toastRef.current.success("Duyệt yêu cầu thành công");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Duyệt thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            }
        },
        [load, toastRef],
    );

    const reject = useCallback(
        async (id: string, note?: string): Promise<boolean> => {
            try {
                await financeService.rejectExpenseRequest(id, { note });
                toastRef.current.success("Đã từ chối yêu cầu");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Từ chối thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            }
        },
        [load, toastRef],
    );

    const complete = useCallback(
        async (id: string, payload: CompleteExpenseRequestPayload): Promise<boolean> => {
            try {
                await financeService.completeExpenseRequest(id, payload);
                toastRef.current.success("Xuất quỹ thành công");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Xuất quỹ thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            }
        },
        [load, toastRef],
    );

    const cancel = useCallback(
        async (id: string, note?: string): Promise<boolean> => {
            try {
                await financeService.cancelExpenseRequest(id, note);
                toastRef.current.success("Đã huỷ yêu cầu");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Huỷ thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            }
        },
        [load, toastRef],
    );

    return { items, isLoading, error, isSaving, reload: load, create, approve, reject, complete, cancel };
}
