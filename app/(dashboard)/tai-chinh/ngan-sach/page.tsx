"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import type { TrangThaiNganSach } from "@/services/finance/types";
import { FiPlus } from "react-icons/fi";
import { NganSachFormModal } from "./components/NganSachFormModal";
import { useNganSachApi } from "../_hooks/useNganSachApi";
import { useFinanceUsers } from "../_hooks/useFinanceUsers";

const STATUS_LABEL: Record<TrangThaiNganSach, { label: string; variant: "success" | "warning" | "default" }> = {
  active: { label: "Đang sử dụng", variant: "success" },
  expired: { label: "Hết hạn", variant: "warning" },
  inactive: { label: "Ngưng", variant: "default" },
};

export default function NganSachPage() {
  const { items, isLoading, error, isSaving, create } = useNganSachApi();
  const { users, byId } = useFinanceUsers();
  const [search, setSearch] = useState("");
  const [trangThai, setTrangThai] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      if (q && !n.ten.toLowerCase().includes(q)) return false;
      if (trangThai && n.trangThai !== trangThai) return false;
      return true;
    });
  }, [items, search, trangThai]);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Tên ngân sách"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="w-48">
          <Select
            value={trangThai}
            onChange={(e) => setTrangThai(e.target.value)}
            options={[
              { value: "active", label: "Đang sử dụng" },
              { value: "expired", label: "Hết hạn" },
              { value: "inactive", label: "Ngưng" },
            ]}
            placeholder="Tất cả trạng thái"
          />
        </div>
        <Button className="ml-auto" onClick={() => setShowForm(true)}>
          <FiPlus className="w-4 h-4 mr-1" /> Thêm mới
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Tên ngân sách</th>
              <th className="text-right px-4 py-3 font-medium">Số tiền</th>
              <th className="text-right px-4 py-3 font-medium">Đã sử dụng</th>
              <th className="text-right px-4 py-3 font-medium">Còn lại</th>
              <th className="text-left px-4 py-3 font-medium">Người quản lý</th>
              <th className="text-left px-4 py-3 font-medium">Thời gian</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-10">
                  <div className="flex justify-center"><Spinner /></div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">Chưa có ngân sách</td>
              </tr>
            ) : (
              filtered.map((n, i) => {
                const conLai = n.soTien - n.daSuDung;
                const status = STATUS_LABEL[n.trangThai];
                return (
                  <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-primary-700">{n.ten}</td>
                    <td className="px-4 py-3 text-right">{formatVND(n.soTien)}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{formatVND(n.daSuDung)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${conLai < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatVND(conLai)}
                    </td>
                    <td className="px-4 py-3">{byId[n.nguoiQuanLy] ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {formatDateVNDateOnly(n.ngayBatDau)} → {formatDateVNDateOnly(n.ngayKetThuc)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <NganSachFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        users={users}
        isSaving={isSaving}
        onCreate={create}
      />
    </div>
  );
}
