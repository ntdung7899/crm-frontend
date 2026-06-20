"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastProvider";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import type { LoaiBoToan } from "@/services/finance/types";
import { useLedgerApi } from "../_hooks/useLedgerApi";

const LOAI_LABEL: Record<LoaiBoToan, string> = {
  phieu_thu: "Phiếu thu",
  phieu_chi: "Phiếu chi",
  don_hang: "Đơn hàng",
  dieu_chinh: "Điều chỉnh",
};

const TAI_KHOAN_OPTIONS = [
  { value: "111", label: "111 - Tiền mặt" },
  { value: "112", label: "112 - Tiền gửi ngân hàng" },
  { value: "131", label: "131 - Phải thu khách hàng" },
  { value: "141", label: "141 - Tạm ứng" },
  { value: "156", label: "156 - Hàng hóa" },
  { value: "331", label: "331 - Phải trả người bán" },
  { value: "511", label: "511 - Doanh thu" },
  { value: "642", label: "642 - Chi phí quản lý" },
];

export default function SoCaiPage() {
  const { items: soCai } = useLedgerApi();
  const toast = useToast();
  const searchParams = useSearchParams();
  const [taiKhoan, setTaiKhoan] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [loai, setLoai] = useState("");

  useEffect(() => {
    const tk = searchParams.get("tai-khoan");
    if (tk) setTaiKhoan(tk);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return soCai.filter((b) => {
      if (taiKhoan && b.taiKhoanNo !== taiKhoan && b.taiKhoanCo !== taiKhoan) {
        return false;
      }
      if (loai && b.loai !== loai) return false;
      if (tuNgay && new Date(b.ngayChungTu) < new Date(tuNgay)) return false;
      if (denNgay && new Date(b.ngayChungTu) > new Date(denNgay)) return false;
      return true;
    });
  }, [soCai, taiKhoan, loai, tuNgay, denNgay]);

  const totals = filtered.reduce(
    (acc, b) => {
      acc.no += b.soTien;
      acc.co += b.soTien;
      return acc;
    },
    { no: 0, co: 0 },
  );
  const balanced = totals.no === totals.co;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="w-56">
          <Select
            value={taiKhoan}
            onChange={(e) => setTaiKhoan(e.target.value)}
            options={TAI_KHOAN_OPTIONS}
            placeholder="Tất cả tài khoản"
          />
        </div>
        <Input
          type="date"
          value={tuNgay}
          onChange={(e) => setTuNgay(e.target.value)}
          className="max-w-[180px]"
          placeholder="Từ ngày"
        />
        <Input
          type="date"
          value={denNgay}
          onChange={(e) => setDenNgay(e.target.value)}
          className="max-w-[180px]"
        />
        <div className="w-44">
          <Select
            value={loai}
            onChange={(e) => setLoai(e.target.value)}
            options={Object.entries(LOAI_LABEL).map(([v, l]) => ({ value: v, label: l }))}
            placeholder="Tất cả loại CT"
          />
        </div>
        <Button
          variant="outline"
          className="ml-auto"
          onClick={() => toast.info("Coming soon", "Tính năng xuất Excel đang phát triển")}
        >
          Xuất Excel
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Ngày ghi sổ</th>
              <th className="text-left px-4 py-3 font-medium">Ngày CT</th>
              <th className="text-left px-4 py-3 font-medium">Số CT</th>
              <th className="text-left px-4 py-3 font-medium">Loại</th>
              <th className="text-left px-4 py-3 font-medium">Diễn giải</th>
              <th className="text-left px-4 py-3 font-medium">TK Nợ</th>
              <th className="text-left px-4 py-3 font-medium">TK Có</th>
              <th className="text-right px-4 py-3 font-medium">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  Chưa có bút toán
                </td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{formatDateVNDateOnly(b.ngayGhiSo)}</td>
                <td className="px-4 py-3">{formatDateVNDateOnly(b.ngayChungTu)}</td>
                <td className="px-4 py-3 font-medium text-primary-700">{b.soChungTu}</td>
                <td className="px-4 py-3 text-gray-600">{LOAI_LABEL[b.loai as LoaiBoToan]}</td>
                <td className="px-4 py-3">{b.dienGiai}</td>
                <td className="px-4 py-3">{b.taiKhoanNo}</td>
                <td className="px-4 py-3">{b.taiKhoanCo}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatVND(b.soTien)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td colSpan={5} className="px-4 py-3">
                Tổng phát sinh{" "}
                <Badge variant={balanced ? "success" : "danger"}>
                  {balanced ? "Cân đối ✓" : "Lệch ✗"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">{formatVND(totals.no)}</td>
              <td className="px-4 py-3 text-right">{formatVND(totals.co)}</td>
              <td className="px-4 py-3 text-right">{formatVND(totals.no)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
