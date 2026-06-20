"use client";

import { useCallback, useEffect, useState } from "react";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { financeService } from "@/services/finance/financeService";
import {
    mapFormToCreatePayment,
    mapFormToCreateReceipt,
    mapVoucherToPhieuChi,
    mapVoucherToPhieuThu,
    type PhieuFormInput,
} from "@/services/finance/apiMappers";
import type { PhieuChi, PhieuThu } from "@/services/finance/types";

type VoucherKind = "RECEIPT" | "PAYMENT";

/** Hook danh sách + tạo phiếu thu (RECEIPT) hoặc phiếu chi (PAYMENT). */
export function useVouchersApi<K extends VoucherKind>(kind: K) {
    type Item = K extends "RECEIPT" ? PhieuThu : PhieuChi;
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const toastRef = useStableToastRef();

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await financeService.getVouchers({ voucher_type: kind, limit: 100 });
            const mapped = (data.items ?? []).map((v) =>
                kind === "RECEIPT" ? mapVoucherToPhieuThu(v) : mapVoucherToPhieuChi(v),
            );
            setItems(mapped as Item[]);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Không thể tải danh sách phiếu.";
            setError(message);
            toastRef.current.error("Tải phiếu thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [kind, toastRef]);

    useEffect(() => {
        void load();
    }, [load]);

    const create = useCallback(
        async (form: PhieuFormInput): Promise<boolean> => {
            setIsSaving(true);
            try {
                if (kind === "RECEIPT") {
                    await financeService.createReceipt(mapFormToCreateReceipt(form));
                    toastRef.current.success("Tạo phiếu thu thành công");
                } else {
                    await financeService.createPayment(mapFormToCreatePayment(form));
                    toastRef.current.success("Tạo phiếu chi thành công");
                }
                await load();
                return true;
            } catch (e) {
                toastRef.current.error("Tạo phiếu thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [kind, load, toastRef],
    );

    return { items, isLoading, error, isSaving, reload: load, create };
}
