"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import type { PhieuThu } from "@/services/finance/types";
import { FiPlus, FiEye } from "react-icons/fi";
import { PhieuThuFormModal } from "./components/PhieuThuFormModal";
import { PhieuThuDetailModal } from "./components/PhieuThuDetailModal";
import { useVouchersApi } from "../_hooks/useVouchersApi";
import { useQuyApi } from "../_hooks/useQuyApi";
import { useDebtsApi } from "../_hooks/useDebtsApi";

export default function PhieuThuPage() {
  const { items, isLoading, error, isSaving, create } = useVouchersApi("RECEIPT");
  const { items: quyList } = useQuyApi();
  const { items: counterparties } = useDebtsApi();
  const [search, setSearch] = useState("");
  const [quyFilter, setQuyFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<PhieuThu | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (q && !(p.soChungTu.toLowerCase().includes(q) || p.noiDung.toLowerCase().includes(q))) return false;
      if (quyFilter && p.quyId !== quyFilter) return false;
      return true;
    });
  }, [items, search, quyFilter]);

  const total = filtered.reduce((s, p) => s + p.soTien, 0);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Số CT / Nội dung" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="w-48">
          <Select value={quyFilter} onChange={(e) => setQuyFilter(e.target.value)} options={quyList.map((q) => ({ value: q.id, label: q.ten }))} placeholder="Tất cả quỹ" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-600">Tổng: <span className="font-semibold text-primary-700">{formatVND(total)}</span></span>
          <Button onClick={() => setShowForm(true)}>
            <FiPlus className="w-4 h-4 mr-1" /> Tạo phiếu thu
          </Button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Số CT</th>
              <th className="text-left px-4 py-3 font-medium">Ngày</th>
              <th className="text-left px-4 py-3 font-medium">Nội dung</th>
              <th className="text-left px-4 py-3 font-medium">Quỹ</th>
              <th className="text-left px-4 py-3 font-medium">Khách hàng</th>
              <th className="text-right px-4 py-3 font-medium">Số tiền</th>
              <th className="text-right px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-10"><div className="flex justify-center"><Spinner /></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chưa có phiếu thu</td></tr>
            ) : (
              filtered.map((p) => {
                const quy = quyList.find((q) => q.id === p.quyId);
                const kh = counterparties.find((k) => k.id === p.khachHangId);
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary-700">{p.soChungTu}</td>
                    <td className="px-4 py-3">{formatDateVNDateOnly(p.ngayYeuCau)}</td>
                    <td className="px-4 py-3">{p.noiDung}</td>
                    <td className="px-4 py-3 text-gray-600">{quy?.ten ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{kh?.ten ?? "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">{formatVND(p.soTien)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDetail(p)} className="text-gray-500 hover:text-primary-600" title="Xem">
                        <FiEye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PhieuThuFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        quyList={quyList}
        counterparties={counterparties}
        isSaving={isSaving}
        onSubmit={create}
      />
      <PhieuThuDetailModal phieu={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
