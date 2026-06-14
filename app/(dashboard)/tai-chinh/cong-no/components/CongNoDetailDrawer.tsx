"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import { useToast } from "@/components/ui/ToastProvider";
import type { KhachHangCongNo } from "@/services/finance/types";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import { FiX, FiDownload, FiPrinter, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Props {
  kh: KhachHangCongNo | null;
  onClose: () => void;
}

const TABS = [
  { id: "chi-tiet", label: "Chi tiết công nợ" },
  { id: "don-hang", label: "Đơn hàng" },
  { id: "lich-su", label: "Lịch sử" },
];

const EMPTY_STATE = (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <svg className="w-16 h-16 mb-3 text-primary-300" fill="none" viewBox="0 0 64 64">
      <rect x="8" y="12" width="36" height="44" rx="3" fill="#e0e7ff" />
      <rect x="12" y="20" width="24" height="3" rx="1.5" fill="#a5b4fc" />
      <rect x="12" y="27" width="18" height="3" rx="1.5" fill="#a5b4fc" />
      <rect x="12" y="34" width="22" height="3" rx="1.5" fill="#a5b4fc" />
      <circle cx="46" cy="46" r="12" fill="#6366f1" />
      <circle cx="46" cy="46" r="8" fill="white" />
      <path d="M42 46 l2.5 2.5 L51 42" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <p className="text-sm">Chưa có dữ liệu</p>
  </div>
);

export function CongNoDetailDrawer({ kh, onClose }: Props) {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();
  const [tab, setTab] = useState("chi-tiet");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");

  if (!kh) return null;

  const phieuThuLQ = state.phieuThu.filter((p) => p.khachHangId === kh.id);
  const phieuChiLQ = state.phieuChi.filter(
    (p) => p.doiTuongId === kh.id && p.doiTuongLoai === "khach_hang",
  );

  const filtered = [...phieuThuLQ, ...phieuChiLQ]
    .filter((p) => {
      if (tuNgay && new Date(p.ngayYeuCau) < new Date(tuNgay)) return false;
      if (denNgay && new Date(p.ngayYeuCau) > new Date(denNgay)) return false;
      return true;
    })
    .sort((a, b) => +new Date(b.ngayYeuCau) - +new Date(a.ngayYeuCau));

  const lichSu = [...phieuThuLQ, ...phieuChiLQ].sort(
    (a, b) => +new Date(b.ngayYeuCau) - +new Date(a.ngayYeuCau),
  );

  const tongPhatSinhNo = phieuChiLQ.reduce((s, p) => s + p.soTien, 0);
  const tongPhatSinhCo = phieuThuLQ.reduce((s, p) => s + p.soTien, 0);
  const duCuoiKy = kh.phaiThu - kh.phaiTra;

  const onTinhLai = () => {
    store.recalcCongNo();
    toast.success("Đã tính lại công nợ");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Breadcrumb / back row */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          <FiChevronLeft className="w-4 h-4" />
          Công nợ
        </button>
        <span className="text-gray-300">›</span>
        <span className="text-sm text-gray-900 font-medium">Chi tiết công nợ</span>
      </div>

      {/* Content */}
      <div>
        {/* Header row: customer info + KPI cards */}
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Khách hàng:</p>
            <p className="text-primary-600 font-semibold">{kh.ten}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {kh.maSoThue ?? "—"} · <span className="text-orange-500">(Chưa cập nhật)</span>
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            {[
              { label: "1. Công nợ hiện tại:", value: kh.phaiThu - kh.phaiTra },
              { label: "2. Công nợ phải thu:", value: kh.phaiThu },
              { label: "3. Công nợ phải trả:", value: kh.phaiTra },
            ].map((c) => (
              <div key={c.label} className="border border-gray-200 rounded-lg px-5 py-3 min-w-[160px] text-center">
                <p className="text-xs text-gray-600 mb-1">{c.label}</p>
                <p className="text-base font-bold text-orange-500">
                  {c.value.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs + action */}
        <div className="flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex gap-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-3 px-5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button onClick={onTinhLai} size="sm">Tính lại công nợ</Button>
        </div>

        {/* Tab: Chi tiết công nợ */}
        {tab === "chi-tiet" && (
          <div className="px-6 py-4">
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
                placeholder="Ngày bắt đầu"
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <input
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
                placeholder="Ngày kết thúc"
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <Button size="sm" onClick={() => {}}>Tìm kiếm</Button>
              <button className="ml-auto border border-gray-300 rounded-md p-1.5 hover:bg-gray-50">
                <FiPrinter className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700 w-8">#</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700">Ngày chứng từ</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700">Số chứng từ</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-700">Diễn giải</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-700">Phát sinh nợ</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-700">Phát sinh có</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Dư đầu kỳ row */}
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2.5"></td>
                    <td className="px-4 py-2.5"></td>
                    <td className="px-4 py-2.5"></td>
                    <td className="px-4 py-2.5 font-semibold text-gray-700">Dư đầu kỳ</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-orange-500">
                      {(0).toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5"></td>
                  </tr>

                  {filtered.length === 0 ? EMPTY_STATE : filtered.map((p, i) => {
                    const isThu = "khachHangId" in p && (p as { khachHangId?: string }).khachHangId === kh.id;
                    return (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{i + 1}</td>
                        <td className="px-4 py-2.5">{formatDateVNDateOnly(p.ngayYeuCau)}</td>
                        <td className="px-4 py-2.5 font-medium text-primary-600">{p.soChungTu}</td>
                        <td className="px-4 py-2.5 text-gray-600">
                          {isThu ? "Thu tiền" : "Chi tiền"} — {p.noiDung}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {!isThu ? (
                            <span className="text-orange-500">
                              {p.soTien.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isThu ? (
                            <span className="text-orange-500">
                              {p.soTien.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer totals */}
                <tfoot className="border-t border-gray-200 bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-semibold text-gray-700">
                      Tổng phát sinh
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-orange-500">
                      {tongPhatSinhNo.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-orange-500">
                      {tongPhatSinhCo.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                      Dư cuối kỳ
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-orange-500">
                      {duCuoiKy.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Đơn hàng */}
        {tab === "don-hang" && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Mã đơn hàng"
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400">
                <option>Đơn hàng bán</option>
                <option>Đơn hàng mua</option>
              </select>
              <Button size="sm">Tìm kiếm</Button>
              <button className="ml-auto border border-gray-300 rounded-md p-1.5 hover:bg-gray-50">
                <FiDownload className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["#", "Đơn hàng", "Loại", "Thời gian", "Trạng thái", "Giá trị", "Đã thanh toán", "Còn lại", "Ngày tuổi công nợ", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-700 first:w-8">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={10}>{EMPTY_STATE}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Lịch sử */}
        {tab === "lich-su" && (
          <div className="px-6 py-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Ngày thay đổi", "Người thay đổi", "Công nợ trước", "Công nợ sau", "Diễn giải"].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lichSu.length === 0 ? (
                    <tr><td colSpan={5}>{EMPTY_STATE}</td></tr>
                  ) : lichSu.map((p, i) => {
                    const nguoi = state.nguoiDung.find((u) => u.id === p.nguoiTao);
                    const isThu = "khachHangId" in p;
                    return (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2.5">{formatDateVNDateOnly(p.ngayYeuCau)}</td>
                        <td className="px-4 py-2.5 text-gray-600">{nguoi?.ten ?? "—"}</td>
                        <td className="px-4 py-2.5 text-orange-500">
                          {kh.phaiThu.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2.5 text-orange-500">
                          {(kh.phaiThu - (isThu ? p.soTien : -p.soTien)).toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{isThu ? "Thu tiền" : "Chi tiền"} — {p.noiDung}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center gap-2 px-6 py-3 border-t border-gray-200 bg-white mt-4">
        <button className="border border-gray-300 rounded-md p-1.5 hover:bg-gray-50 disabled:opacity-40" disabled>
          <FiChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button className="border border-gray-300 rounded-md p-1.5 hover:bg-gray-50 disabled:opacity-40" disabled>
          <FiChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
