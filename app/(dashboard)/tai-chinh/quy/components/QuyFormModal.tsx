"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Quy, TrangThaiQuy } from "@/services/finance/types";
import type { QuyFormInput } from "@/services/finance/apiMappers";
import type { FinanceUser } from "../../_hooks/useFinanceUsers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: Quy | null;
  users: FinanceUser[];
  quyList: Quy[];
  isSaving: boolean;
  onSubmit: (form: QuyFormInput) => Promise<boolean>;
}

export function QuyFormModal({ isOpen, onClose, editing, users, quyList, isSaving, onSubmit }: Props) {
  const [ten, setTen] = useState("");
  const [maQuy, setMaQuy] = useState("");
  const [nganSach, setNganSach] = useState("");
  const [quyLienKet, setQuyLienKet] = useState("");
  const [taiKhoanQuy, setTaiKhoanQuy] = useState("");
  const [taiKhoanDoiUng, setTaiKhoanDoiUng] = useState("");
  const [taiKhoanThue, setTaiKhoanThue] = useState("");
  const [suDungQuyTrinh, setSuDungQuyTrinh] = useState(false);
  const [soDauKy, setSoDauKy] = useState(0);
  const [ngayChotDauKy, setNgayChotDauKy] = useState("");
  const [nguoiQuanLy, setNguoiQuanLy] = useState("");
  const [thuQuy, setThuQuy] = useState("");
  const [nguoiDuyet, setNguoiDuyet] = useState("");
  const [nguoiThamGia, setNguoiThamGia] = useState<string[]>([]);
  const [moTa, setMoTa] = useState("");
  const [trangThai, setTrangThai] = useState<TrangThaiQuy>("active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setTen(editing.ten);
      setMaQuy(editing.maQuy ?? "");
      setTaiKhoanQuy(editing.taiKhoanQuy ?? "");
      setTaiKhoanDoiUng(editing.taiKhoanDoiUng ?? "");
      setTaiKhoanThue(editing.taiKhoanThue ?? "");
      setSuDungQuyTrinh(editing.suDungQuyTrinh ?? false);
      setSoDauKy(editing.duDauKy ?? 0);
      setNgayChotDauKy(editing.ngayChotDauKy ?? "");
      setNguoiQuanLy(editing.nguoiQuanLy ?? "");
      setThuQuy(editing.thuQuy ?? "");
      setNguoiDuyet(editing.nguoiDuyet ?? "");
      setNguoiThamGia(editing.nguoiThamGia ?? []);
      setMoTa(editing.moTa ?? "");
      setTrangThai(editing.trangThai);
    } else {
      setTen(""); setMaQuy(""); setNganSach(""); setQuyLienKet("");
      setTaiKhoanQuy(""); setTaiKhoanDoiUng(""); setTaiKhoanThue("");
      setSuDungQuyTrinh(false); setSoDauKy(0); setNgayChotDauKy("");
      setNguoiQuanLy(users[0]?.id ?? "");
      setThuQuy(""); setNguoiDuyet(""); setNguoiThamGia([]);
      setMoTa(""); setTrangThai("active");
    }
    setErrors({});
  }, [isOpen, editing, users]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ten.trim()) e.ten = "Vui lòng nhập tên quỹ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const ok = await onSubmit({
      ten,
      maQuy: maQuy || undefined,
      loai: "tien_mat",
      duDauKy: soDauKy,
      nguoiQuanLy,
      thuQuy: thuQuy || undefined,
      nguoiDuyet: nguoiDuyet || undefined,
      taiKhoanQuy: taiKhoanQuy || undefined,
      taiKhoanThue: taiKhoanThue || undefined,
      moTa: moTa || undefined,
      trangThai,
    });
    if (ok) onClose();
  };

  const toggleThamGia = (id: string) => {
    setNguoiThamGia((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeThamGia = (id: string) => {
    setNguoiThamGia((prev) => prev.filter((x) => x !== id));
  };

  const userOptions = users.map((u) => ({ value: u.id, label: u.ten }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông tin quỹ"
      size="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Quay lại</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm mới"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        {/* Row 1: Tên quỹ + Mã quỹ */}
        <Input
          label="Tên quỹ (*)"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          error={errors.ten}
          placeholder=""
        />
        <Input
          label="Mã quỹ"
          value={maQuy}
          onChange={(e) => setMaQuy(e.target.value)}
          placeholder=""
        />

        {/* Row 2: Ngân sách + Quỹ */}
        <Select
          label="Ngân sách"
          value={nganSach}
          onChange={(e) => setNganSach(e.target.value)}
          options={[]}
          placeholder="Vui lòng chọn"
        />
        <Select
          label="Quỹ"
          value={quyLienKet}
          onChange={(e) => setQuyLienKet(e.target.value)}
          options={quyList.filter((q) => !editing || q.id !== editing.id).map((q) => ({ value: q.id, label: q.ten }))}
          placeholder="Vui lòng chọn"
        />

        {/* Row 3: Tài khoản quỹ + Tài khoản đối ứng */}
        <Select
          label="Tài khoản quỹ"
          value={taiKhoanQuy}
          onChange={(e) => setTaiKhoanQuy(e.target.value)}
          options={[
            { value: "111", label: "111 - Tiền mặt" },
            { value: "112", label: "112 - Tiền gửi ngân hàng" },
          ]}
          placeholder="Vui lòng chọn"
        />
        <Select
          label="Tài khoản đối ứng"
          value={taiKhoanDoiUng}
          onChange={(e) => setTaiKhoanDoiUng(e.target.value)}
          options={[
            { value: "131", label: "131 - Phải thu khách hàng" },
            { value: "331", label: "331 - Phải trả nhà cung cấp" },
          ]}
          placeholder="Vui lòng chọn"
        />

        {/* Row 4: Tài khoản thuế + Sử dụng quy trình duyệt */}
        <Select
          label="Tài khoản thuế"
          value={taiKhoanThue}
          onChange={(e) => setTaiKhoanThue(e.target.value)}
          options={[
            { value: "3331", label: "3331 - Thuế GTGT" },
            { value: "3334", label: "3334 - Thuế TNCN" },
          ]}
          placeholder="Vui lòng chọn"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sử dụng quy trình duyệt Quỹ</label>
          <div className="flex items-center gap-5 mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
              <input
                type="radio"
                checked={suDungQuyTrinh}
                onChange={() => setSuDungQuyTrinh(true)}
                className="accent-primary-600 w-4 h-4"
              />
              Có
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
              <input
                type="radio"
                checked={!suDungQuyTrinh}
                onChange={() => setSuDungQuyTrinh(false)}
                className="accent-primary-600 w-4 h-4"
              />
              Không
            </label>
          </div>
        </div>

        {/* Row 5: Số dư đầu kỳ + Ngày chốt số dư đầu kỳ */}
        <Input
          label="Số dư đầu kỳ"
          type="number"
          value={soDauKy}
          onChange={(e) => setSoDauKy(Number(e.target.value))}
          placeholder="0.00"
        />
        <Input
          label="Ngày chốt số dư đầu kỳ"
          type="date"
          value={ngayChotDauKy}
          onChange={(e) => setNgayChotDauKy(e.target.value)}
        />

        {/* Người quản lý */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            Người quản lý <span className="text-red-500">(*)</span>
          </label>
          <p className="text-xs text-orange-500 mb-1">
            1. Là người có thể lập quỹ này.<br />
            2. Duyệt Yêu cầu Thu, Yêu cầu Chi.
          </p>
          <Select
            value={nguoiQuanLy}
            onChange={(e) => setNguoiQuanLy(e.target.value)}
            options={userOptions}
            placeholder="Chọn nhân viên"
            error={errors.nguoiQuanLy}
          />
        </div>

        {/* Thủ quỹ */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            Thủ quỹ <span className="text-red-500">(*)</span>
          </label>
          <p className="text-xs text-orange-500 mb-1">
            1. Xác nhận Yêu cầu Thu.<br />
            2. Xác nhận Yêu cầu Chi. Nếu thủ quỹ không Thu, hoặc không Chi, số tiền trong quỹ không thay đổi.
          </p>
          <Select
            value={thuQuy}
            onChange={(e) => setThuQuy(e.target.value)}
            options={userOptions}
            placeholder="Chọn nhân viên"
          />
        </div>

        {/* Người duyệt */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-0.5">Người duyệt</label>
          <p className="text-xs text-orange-500 mb-1">
            1. Xác nhận Yêu cầu Thu.<br />
            2. Xác nhận Yêu cầu Chi.
          </p>
          <Select
            value={nguoiDuyet}
            onChange={(e) => setNguoiDuyet(e.target.value)}
            options={userOptions}
            placeholder="Chọn nhân viên"
          />
        </div>

        {/* Người tham gia */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Người tham gia</label>
          {/* Selected chips */}
          {nguoiThamGia.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2 border border-gray-200 rounded-lg p-2 min-h-[44px]">
              {nguoiThamGia.map((id) => {
                const u = users.find((x) => x.id === id);
                if (!u) return null;
                const initials = u.ten.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase();
                return (
                  <span key={id} className="inline-flex items-center gap-1 bg-gray-100 rounded-full pl-1 pr-2 py-0.5 text-xs text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center">
                      {initials}
                    </span>
                    {u.ten}
                    <button
                      type="button"
                      onClick={() => removeThamGia(id)}
                      className="ml-0.5 text-gray-400 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {/* Dropdown to add */}
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500"
            value=""
            onChange={(e) => { if (e.target.value) toggleThamGia(e.target.value); }}
          >
            <option value="">Chọn nhân viên để thêm...</option>
            {users
              .filter((u) => !nguoiThamGia.includes(u.id))
              .map((u) => (
                <option key={u.id} value={u.id}>{u.ten}</option>
              ))}
          </select>
        </div>

        {/* Mô tả */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Tài liệu đính kèm */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tài liệu đính kèm</label>
          <label className="flex items-center gap-3 w-fit border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Kéo thả tệp tại đây</span>
            <input type="file" className="hidden" multiple />
          </label>
        </div>
      </div>
    </Modal>
  );
}
