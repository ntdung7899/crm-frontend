"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateForInput } from "@/lib/utils";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { financeService } from "@/services/finance/financeService";
import type { BalanceSheetRow } from "@/services/finance/apiTypes";
import { type ReportTabId, type BalanceRow } from "../_type";

function mapRow(r: BalanceSheetRow): BalanceRow {
  return {
    taiKhoan: r.account_code,
    ten: r.account_name,
    duDauNo: r.open_debit,
    duDauCo: r.open_credit,
    psNo: r.period_debit,
    psCo: r.period_credit,
    duCuoiNo: r.close_debit,
    duCuoiCo: r.close_credit,
  };
}

export function useBaoCaoPage() {
  const router = useRouter();
  const toastRef = useStableToastRef();
  const [tab, setTab] = useState<ReportTabId>("b01-dn");
  const [tuNgay, setTuNgay] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return formatDateForInput(d);
  });
  const [denNgay, setDenNgay] = useState(formatDateForInput(new Date()));
  const [taiKhoanFilter, setTaiKhoanFilter] = useState("");
  const [allRows, setAllRows] = useState<BalanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const report = await financeService.getBalanceSheet({ as_of_date: denNgay, from_date: tuNgay });
      setAllRows((report.rows ?? []).map(mapRow));
    } catch (e) {
      setAllRows([]);
      toastRef.current.error("Tải báo cáo thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [tuNgay, denNgay, toastRef]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(
    () => (taiKhoanFilter ? allRows.filter((r) => r.taiKhoan === taiKhoanFilter) : allRows),
    [allRows, taiKhoanFilter],
  );

  const onDrillDown = (taiKhoan: string) => {
    router.push(`/tai-chinh/so-cai?tai-khoan=${taiKhoan}`);
  };

  return {
    tab,
    setTab,
    tuNgay,
    setTuNgay,
    denNgay,
    setDenNgay,
    taiKhoanFilter,
    setTaiKhoanFilter,
    rows,
    isLoading,
    onDrillDown,
  };
}
