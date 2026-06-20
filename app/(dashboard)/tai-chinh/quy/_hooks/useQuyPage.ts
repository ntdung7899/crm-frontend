"use client";

import { useMemo, useState } from "react";
import type { Quy, PhieuThu, PhieuChi } from "@/services/finance/types";
import type { QuyFormInput, PhieuFormInput } from "@/services/finance/apiMappers";
import { useQuyApi } from "../../_hooks/useQuyApi";
import { useFinanceUsers } from "../../_hooks/useFinanceUsers";
import { useVouchersApi } from "../../_hooks/useVouchersApi";
import { useDebtsApi } from "../../_hooks/useDebtsApi";
import { useYccpApi } from "../../_hooks/useYccpApi";
import { useLedgerApi } from "../../_hooks/useLedgerApi";

export const SUB_TABS = [
  { id: "quan-ly", label: "Quản lý quỹ" },
  { id: "phieu-thu", label: "Phiếu thu" },
  { id: "phieu-chi", label: "Phiếu chi" },
  { id: "hach-toan", label: "Hạch toán quỹ" },
];

export function useQuyPage() {
  const quyApi = useQuyApi();
  const { users } = useFinanceUsers();
  const phieuThuApi = useVouchersApi("RECEIPT");
  const phieuChiApi = useVouchersApi("PAYMENT");
  const debtsApi = useDebtsApi();
  const yccpApi = useYccpApi();
  const ledgerApi = useLedgerApi();

  const [activeTab, setActiveTab] = useState("quan-ly");

  // Quản lý quỹ
  const [search, setSearch] = useState("");
  const [trangThaiFilter, setTrangThaiFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Quy | null>(null);

  // Phiếu thu / chi
  const [showThuForm, setShowThuForm] = useState(false);
  const [detailThu, setDetailThu] = useState<PhieuThu | null>(null);
  const [showChiForm, setShowChiForm] = useState(false);
  const [detailChi, setDetailChi] = useState<PhieuChi | null>(null);

  const filteredQuy = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quyApi.items.filter((quy) => {
      if (q && !quy.ten.toLowerCase().includes(q)) return false;
      if (trangThaiFilter && quy.trangThai !== trangThaiFilter) return false;
      return true;
    });
  }, [quyApi.items, search, trangThaiFilter]);

  const totalBalance = quyApi.items.reduce((s, q) => s + q.soDu, 0);

  const onCreateQuy = () => { setEditing(null); setShowForm(true); };
  const onEditQuy = (quy: Quy) => { setEditing(quy); setShowForm(true); };
  const onDeleteQuy = (quy: Quy) => {
    if (!confirm(`Xóa quỹ "${quy.ten}"?`)) return;
    void quyApi.remove(quy.id);
  };
  const submitQuy = async (form: QuyFormInput): Promise<boolean> =>
    editing ? quyApi.update(editing.id, form) : quyApi.create(form);

  const submitThu = async (form: PhieuFormInput): Promise<boolean> => {
    const ok = await phieuThuApi.create(form);
    if (ok) void quyApi.reload();
    return ok;
  };
  const submitChi = async (form: PhieuFormInput): Promise<boolean> => {
    const ok = await phieuChiApi.create(form);
    if (ok) void quyApi.reload();
    return ok;
  };

  return {
    users,
    quyList: quyApi.items,
    counterparties: debtsApi.items,
    yccpList: yccpApi.items,
    soCai: ledgerApi.items,
    isSavingQuy: quyApi.isSaving,
    isSavingThu: phieuThuApi.isSaving,
    isSavingChi: phieuChiApi.isSaving,
    submitQuy, submitThu, submitChi,
    activeTab, setActiveTab,
    search, setSearch,
    trangThaiFilter, setTrangThaiFilter,
    showForm, setShowForm,
    editing,
    filteredQuy,
    totalBalance,
    phieuThu: phieuThuApi.items,
    phieuChi: phieuChiApi.items,
    onCreateQuy, onEditQuy, onDeleteQuy,
    showThuForm, setShowThuForm,
    detailThu, setDetailThu,
    onCreateThu: () => setShowThuForm(true),
    onViewThu: (p: PhieuThu) => setDetailThu(p),
    showChiForm, setShowChiForm,
    detailChi, setDetailChi,
    onCreateChi: () => setShowChiForm(true),
    onViewChi: (p: PhieuChi) => setDetailChi(p),
  };
}
