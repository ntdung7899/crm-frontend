"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { NGUON_THU_LABEL, type NguonThu, type Quy, type KhachHangCongNo } from "@/services/finance/types";
import type { PhieuFormInput } from "@/services/finance/apiMappers";
import { formatDateForInput } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quyList: Quy[];
  counterparties: KhachHangCongNo[];
  isSaving: boolean;
  onSubmit: (form: PhieuFormInput) => Promise<boolean>;
}

export function PhieuThuFormModal({ isOpen, onClose, quyList, counterparties, isSaving, onSubmit }: Props) {
  const [noiDung, setNoiDung] = useState("");
  const [ngayYeuCau, setNgayYeuCau] = useState(formatDateForInput(new Date()));
  const [quyId, setQuyId] = useState("");
  const [hinhThuc, setHinhThuc] = useState<"tien_mat" | "chuyen_khoan" | "khac">("tien_mat");
  const [moTa, setMoTa] = useState("");
  const [nguon, setNguon] = useState<NguonThu>("tu_nhap");
  const [khachHangId, setKhachHangId] = useState("");
  const [soTien, setSoTien] = useState(0);
  const [nguoiNopTien, setNguoiNopTien] = useState("");
  const [tkNo, setTkNo] = useState("");
  const [tkCo, setTkCo] = useState("");
  const [showHachToan, setShowHachToan] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setNoiDung("");
    setNgayYeuCau(formatDateForInput(new Date()));
    setQuyId(quyList[0]?.id ?? "");
    setHinhThuc("tien_mat");
    setMoTa("");
    setNguon("tu_nhap");
    setKhachHangId("");
    setSoTien(0);
    setNguoiNopTien("");
    setTkNo("");
    setTkCo("");
    setShowHachToan(false);
    setErrors({});
  }, [isOpen, quyList]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!noiDung.trim()) e.noiDung = "Vui lòng nhập nội dung";
    if (!ngayYeuCau) e.ngayYeuCau = "Vui lòng chọn ngày";
    if (!quyId) e.quyId = "Vui lòng chọn quỹ";
    if (soTien <= 0) e.soTien = "Số tiền phải lớn hơn 0";
    if (nguon === "thu_khach_hang" && !khachHangId) e.khachHangId = "Vui lòng chọn khách hàng";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const ok = await onSubmit({
      noiDung,
      quyId,
      soTien,
      ngayChungTu: ngayYeuCau ? ngayYeuCau.slice(0, 10) : undefined,
      moTa: moTa || undefined,
      khachHangId: khachHangId || undefined,
      taiKhoanNo: showHachToan && tkNo ? tkNo : undefined,
      taiKhoanCo: showHachToan && tkCo ? tkCo : undefined,
    });
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo phiếu thu"
      size="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Quay lại</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? "Đang lưu..." : "Thêm mới"}</Button>
        </>
      }
    >
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-5">
        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">Thông tin phiếu</span>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <Input label="Nội dung thu (*)" value={noiDung} onChange={(e) => setNoiDung(e.target.value)} error={errors.noiDung} placeholder="Nhập nội dung thu" />
        <Input label="Ngày yêu cầu (*)" type="datetime-local" value={ngayYeuCau} onChange={(e) => setNgayYeuCau(e.target.value)} error={errors.ngayYeuCau} />

        <Select label="Quỹ (*)" value={quyId} onChange={(e) => setQuyId(e.target.value)} options={quyList.map((q) => ({ value: q.id, label: q.ten }))} error={errors.quyId} />
        <Input label="Ngày chứng từ" value={ngayYeuCau ? ngayYeuCau.slice(0, 10) : ""} disabled className="bg-gray-50 text-gray-500" onChange={() => {}} />

        <Select label="Hình thức thanh toán" value={hinhThuc} onChange={(e) => setHinhThuc(e.target.value as typeof hinhThuc)} options={[{ value: "tien_mat", label: "Tiền mặt" }, { value: "chuyen_khoan", label: "Chuyển khoản" }, { value: "khac", label: "Khác" }]} />
        <Input label="Số chứng từ" value="(Tự động)" disabled className="bg-gray-50 text-gray-500" onChange={() => {}} />

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} rows={2} placeholder="Nhập mô tả thêm (tuỳ chọn)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn <span className="text-red-500">(*)</span></label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(NGUON_THU_LABEL) as [NguonThu, string][]).map(([v, l]) => (
              <label key={v} className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="radio" name="nguon" checked={nguon === v} onChange={() => setNguon(v)} className="accent-primary-600 w-4 h-4" />
                <span className="text-sm text-gray-700">{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khách hàng nộp tiền{nguon === "thu_khach_hang" && <span className="text-red-500 ml-0.5">(*)</span>}
          </label>
          <Select
            value={khachHangId}
            onChange={(e) => setKhachHangId(e.target.value)}
            options={counterparties.map((kh) => ({ value: kh.id, label: `${kh.ten}${kh.phaiThu > 0 ? ` (Nợ ${kh.phaiThu.toLocaleString("vi-VN")} ₫)` : ""}` }))}
            placeholder="Chọn khách hàng"
            error={errors.khachHangId}
          />
        </div>

        <Input label="Số tiền (*)" type="number" value={soTien} onChange={(e) => setSoTien(Number(e.target.value))} error={errors.soTien} placeholder="0.00" />
        <Input label="Người nộp tiền" value={nguoiNopTien} onChange={(e) => setNguoiNopTien(e.target.value)} placeholder="Nhập tên người nộp" />

        <div className="col-span-2 border-t border-gray-100 pt-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Thông tin hạch toán</p>
          <button type="button" onClick={() => setShowHachToan(!showHachToan)} className="text-sm text-primary-600 hover:underline">
            {showHachToan ? "− Ẩn hạch toán" : "+ Thêm hạch toán"}
          </button>
          {showHachToan && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Input label="Tài khoản Nợ" value={tkNo} onChange={(e) => setTkNo(e.target.value)} placeholder="VD: 111" />
              <Input label="Tài khoản Có" value={tkCo} onChange={(e) => setTkCo(e.target.value)} placeholder="VD: 131" />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
