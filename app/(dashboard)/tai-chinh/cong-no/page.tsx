"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/ToastProvider";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import type { KhachHangCongNo } from "@/services/finance/types";
import { CongNoDetailDrawer } from "./components/CongNoDetailDrawer";
import { useDebtsApi } from "../_hooks/useDebtsApi";
import { useFinanceUsers } from "../_hooks/useFinanceUsers";

const SUB_TABS = [
  { id: "tong-quan", label: "Công nợ" },
  { id: "phai-thu", label: "Công Nợ Phải Thu" },
  { id: "phai-tra", label: "Công Nợ Phải Trả" },
  { id: "thong-ke", label: "Thống kê công nợ" },
  { id: "du-doan", label: "Dự đoán công nợ" },
  { id: "chi-tiet", label: "Công nợ chi tiết" },
];

function ageInDays(iso?: string): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export default function CongNoPage() {
  const { items: congNo, reload } = useDebtsApi();
  const { users } = useFinanceUsers();
  const toast = useToast();
  const [tab, setTab] = useState("tong-quan");
  const [search, setSearch] = useState("");
  const [maSoThue, setMaSoThue] = useState("");
  const [phuTrach, setPhuTrach] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState<KhachHangCongNo | null>(null);

  const list = useMemo(() => {
    let data = [...congNo];
    if (tab === "phai-thu") data = data.filter((kh) => kh.phaiThu > 0);
    if (tab === "phai-tra") data = data.filter((kh) => kh.phaiTra > 0);

    const q = search.trim().toLowerCase();
    if (q) data = data.filter((kh) => kh.ten.toLowerCase().includes(q));
    if (maSoThue) data = data.filter((kh) => kh.maSoThue?.includes(maSoThue));
    if (phuTrach) data = data.filter((kh) => kh.nguoiPhuTrach === phuTrach);
    if (statusFilter === "con-no") data = data.filter((kh) => kh.phaiThu - kh.phaiTra > 0);
    if (statusFilter === "qua-han")
      data = data.filter((kh) => kh.phaiThu - kh.phaiTra > 0 && ageInDays(kh.ngayCapNhat) > 30);
    if (statusFilter === "am") data = data.filter((kh) => kh.phaiThu - kh.phaiTra < 0);

    // Sort by tuổi nợ DESC
    data.sort((a, b) => ageInDays(b.ngayCapNhat) - ageInDays(a.ngayCapNhat));
    return data;
  }, [congNo, tab, search, maSoThue, phuTrach, statusFilter]);

  const totals = useMemo(() => {
    return list.reduce(
      (acc, kh) => ({
        phaiThu: acc.phaiThu + kh.phaiThu,
        phaiTra: acc.phaiTra + kh.phaiTra,
        hienTai: acc.hienTai + (kh.phaiThu - kh.phaiTra),
      }),
      { phaiThu: 0, phaiTra: 0, hienTai: 0 },
    );
  }, [list]);

  if (detail) {
    return (
      <div className="p-6">
        <CongNoDetailDrawer kh={detail} onClose={() => setDetail(null)} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap py-2 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === "tong-quan" || tab === "phai-thu" || tab === "phai-tra") && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <Input
              placeholder="Tên công ty"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder="Mã số thuế"
              value={maSoThue}
              onChange={(e) => setMaSoThue(e.target.value)}
              className="max-w-xs"
            />
            <div className="w-48">
              <Select
                value={phuTrach}
                onChange={(e) => setPhuTrach(e.target.value)}
                options={users.map((u) => ({ value: u.id, label: u.ten }))}
                placeholder="Người phụ trách"
              />
            </div>
            <div className="w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "con-no", label: "Còn nợ" },
                  { value: "qua-han", label: "Quá hạn" },
                  { value: "am", label: "Công nợ âm" },
                ]}
                placeholder="Tất cả"
              />
            </div>
            <Button
              className="ml-auto"
              variant="outline"
              onClick={() => {
                void reload();
                toast.success("Đã tải lại công nợ");
              }}
            >
              Tính lại công nợ
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Tên công ty</th>
                  <th className="text-left px-4 py-3 font-medium">Mã số thuế</th>
                  <th className="text-right px-4 py-3 font-medium">Công nợ phải thu</th>
                  <th className="text-right px-4 py-3 font-medium">Công nợ phải trả</th>
                  <th className="text-right px-4 py-3 font-medium">Công nợ hiện tại</th>
                  <th className="text-right px-4 py-3 font-medium">Tuổi nợ</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
                {list.map((kh, i) => {
                  const hienTai = kh.phaiThu - kh.phaiTra;
                  const tuoiNo = ageInDays(kh.ngayCapNhat);
                  return (
                    <tr
                      key={kh.id}
                      onClick={() => setDetail(kh)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-primary-700">{kh.ten}</td>
                      <td className="px-4 py-3 text-gray-600">{kh.maSoThue ?? "-"}</td>
                      <td className="px-4 py-3 text-right text-orange-600 font-semibold">
                        {formatVND(kh.phaiThu)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatVND(kh.phaiTra)}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${hienTai < 0 ? "text-red-600" : "text-orange-600"}`}>
                        {formatVND(hienTai)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{tuoiNo}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={3} className="px-4 py-3">Tổng cộng</td>
                  <td className="px-4 py-3 text-right">{formatVND(totals.phaiThu)}</td>
                  <td className="px-4 py-3 text-right">{formatVND(totals.phaiTra)}</td>
                  <td className="px-4 py-3 text-right">{formatVND(totals.hienTai)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {tab === "thong-ke" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <p>Thống kê công nợ theo nhóm khách hàng / thời gian (đang phát triển).</p>
        </div>
      )}
      {tab === "du-doan" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <p>Dự đoán công nợ rủi ro (đang phát triển).</p>
        </div>
      )}
      {tab === "chi-tiet" && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <p>Chọn khách hàng từ tab &ldquo;Công nợ&rdquo; để xem chi tiết phát sinh.</p>
        </div>
      )}

    </div>
  );
}
