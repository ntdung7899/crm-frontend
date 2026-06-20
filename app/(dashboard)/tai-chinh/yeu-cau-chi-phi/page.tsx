"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import {
  LOAI_YCCP_LABEL,
  TRANG_THAI_YCCP_LABEL,
  type YeuCauChiPhi,
  type TrangThaiYCCP,
  type LoaiYCCP,
} from "@/services/finance/types";
import { FiPlus, FiEye } from "react-icons/fi";
import { YccpFormModal } from "./components/YccpFormModal";
import { YccpDetailModal } from "./components/YccpDetailModal";
import { useYccpApi } from "../_hooks/useYccpApi";
import { useFinanceUsers } from "../_hooks/useFinanceUsers";
import { useQuyApi } from "../_hooks/useQuyApi";

const STATUS_VARIANT: Record<TrangThaiYCCP, "success" | "warning" | "danger" | "info" | "default"> = {
  nhap: "default",
  cho_xac_nhan: "warning",
  dang_xu_ly: "info",
  cho_xuat_quy: "warning",
  da_xuat_quy: "info",
  hoan_thanh: "success",
  tu_choi: "danger",
  huy: "default",
};

export default function YccpPage() {
  const yccpApi = useYccpApi();
  const { users, byId } = useFinanceUsers();
  const { items: quyList } = useQuyApi();
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<YeuCauChiPhi | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return yccpApi.items.filter((y) => {
      if (q && !(y.maYeuCau.toLowerCase().includes(q) || y.noiDung.toLowerCase().includes(q))) return false;
      if (loaiFilter && y.loai !== loaiFilter) return false;
      if (statusFilter && y.trangThai !== statusFilter) return false;
      return true;
    });
  }, [yccpApi.items, search, loaiFilter, statusFilter]);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Mã / Nội dung" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="w-44">
          <Select value={loaiFilter} onChange={(e) => setLoaiFilter(e.target.value)} options={Object.entries(LOAI_YCCP_LABEL).map(([v, l]) => ({ value: v, label: l }))} placeholder="Tất cả loại" />
        </div>
        <div className="w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={Object.entries(TRANG_THAI_YCCP_LABEL).map(([v, l]) => ({ value: v, label: l }))} placeholder="Tất cả trạng thái" />
        </div>
        <Button className="ml-auto" onClick={() => setShowForm(true)}>
          <FiPlus className="w-4 h-4 mr-1" /> Tạo yêu cầu
        </Button>
      </div>

      {yccpApi.error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{yccpApi.error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Mã</th>
              <th className="text-left px-4 py-3 font-medium">Ngày</th>
              <th className="text-left px-4 py-3 font-medium">Nội dung</th>
              <th className="text-left px-4 py-3 font-medium">Loại</th>
              <th className="text-left px-4 py-3 font-medium">Người yêu cầu</th>
              <th className="text-left px-4 py-3 font-medium">Người duyệt</th>
              <th className="text-right px-4 py-3 font-medium">Số tiền</th>
              <th className="text-right px-4 py-3 font-medium">Đã cấp</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-right px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {yccpApi.isLoading ? (
              <tr><td colSpan={10} className="py-10"><div className="flex justify-center"><Spinner /></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-500">Chưa có yêu cầu chi phí</td></tr>
            ) : (
              filtered.map((y) => (
                <tr key={y.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-primary-700">{y.maYeuCau}</td>
                  <td className="px-4 py-3">{formatDateVNDateOnly(y.ngayYeuCau)}</td>
                  <td className="px-4 py-3">{y.noiDung}</td>
                  <td className="px-4 py-3 text-gray-600">{LOAI_YCCP_LABEL[y.loai as LoaiYCCP]}</td>
                  <td className="px-4 py-3 text-gray-600">{byId[y.nguoiYeuCauId] ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{byId[y.nguoiPheDuyetId] ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600">{formatVND(y.soTien)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatVND(y.daCap)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[y.trangThai as TrangThaiYCCP]}>{TRANG_THAI_YCCP_LABEL[y.trangThai as TrangThaiYCCP]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDetail(y)} className="text-gray-500 hover:text-primary-600" title="Xem chi tiết">
                      <FiEye className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <YccpFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        users={users}
        isSaving={yccpApi.isSaving}
        onCreate={yccpApi.create}
      />
      <YccpDetailModal
        yccp={detail}
        onClose={() => setDetail(null)}
        usersById={byId}
        quyList={quyList}
        onApprove={yccpApi.approve}
        onReject={yccpApi.reject}
        onCancel={yccpApi.cancel}
        onComplete={yccpApi.complete}
      />
    </div>
  );
}
