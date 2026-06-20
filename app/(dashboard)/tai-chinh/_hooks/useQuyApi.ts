"use client";

import { useCallback, useEffect, useState } from "react";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { financeService } from "@/services/finance/financeService";
import { mapFundToQuy, mapQuyFormToCreateFund, type QuyFormInput } from "@/services/finance/apiMappers";
import type { Quy } from "@/services/finance/types";

export function useQuyApi() {
    const [items, setItems] = useState<Quy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const toastRef = useStableToastRef();

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await financeService.getFunds({ limit: 100 });
            setItems((data.items ?? []).map(mapFundToQuy));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Không thể tải danh sách quỹ.";
            setError(message);
            toastRef.current.error("Tải quỹ thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void load();
    }, [load]);

    const create = useCallback(
        async (form: QuyFormInput): Promise<boolean> => {
            setIsSaving(true);
            try {
                await financeService.createFund(mapQuyFormToCreateFund(form));
                toastRef.current.success("Tạo quỹ thành công");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Tạo quỹ thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [load, toastRef],
    );

    const update = useCallback(
        async (id: string, form: QuyFormInput): Promise<boolean> => {
            setIsSaving(true);
            try {
                await financeService.updateFund(id, mapQuyFormToCreateFund(form));
                toastRef.current.success("Cập nhật quỹ thành công");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Cập nhật quỹ thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [load, toastRef],
    );

    const remove = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                await financeService.deleteFund(id);
                toastRef.current.success("Đã xoá quỹ");
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Xoá quỹ thất bại", e instanceof Error ? e.message : "Quỹ có thể đã phát sinh giao dịch.");
                return false;
            }
        },
        [load, toastRef],
    );

    return { items, isLoading, error, isSaving, reload: load, create, update, remove };
}
