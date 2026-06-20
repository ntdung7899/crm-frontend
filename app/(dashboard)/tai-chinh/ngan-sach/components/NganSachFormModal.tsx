"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { TrangThaiNganSach } from "@/services/finance/types";
import type { NganSachFormInput } from "@/services/finance/apiMappers";
import type { FinanceUser } from "../../_hooks/useFinanceUsers";
import { formatDateForInput } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: FinanceUser[];
  isSaving: boolean;
  onCreate: (form: NganSachFormInput) => Promise<boolean>;
}

export function NganSachFormModal({ isOpen, onClose, users, isSaving, onCreate }: Props) {
  const [ten, setTen] = useState("");
  const [soTien, setSoTien] = useState(0);
  const [ngayBatDau, setNgayBatDau] = useState("");
  const [ngayKetThuc, setNgayKetThuc] = useState("");
  const [nguoiQuanLy, setNguoiQuanLy] = useState("");
  const [moTa, setMoTa] = useState("");
  const [trangThai, setTrangThai] = useState<TrangThaiNganSach>("active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setTen("");
    setSoTien(0);
    setNgayBatDau(formatDateForInput(new Date()));
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    setNgayKetThuc(formatDateForInput(end));
    setNguoiQuanLy(users[0]?.id ?? "");
    setMoTa("");
    setTrangThai("active");
    setErrors({});
  }, [isOpen, users]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ten.trim()) e.ten = "Vui lòng nhập tên ngân sách";
    if (soTien <= 0) e.soTien = "Số tiền phải lớn hơn 0";
    if (!ngayBatDau) e.ngayBatDau = "Vui lòng chọn ngày bắt đầu";
    if (!ngayKetThuc) e.ngayKetThuc = "Vui lòng chọn ngày kết thúc";
    if (ngayBatDau && ngayKetThuc && new Date(ngayKetThuc) <= new Date(ngayBatDau)) {
      e.ngayKetThuc = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    const ok = await onCreate({
      ten,
      soTien,
      ngayBatDau,
      ngayKetThuc,
      nguoiQuanLy,
      moTa: moTa || undefined,
      trangThai,
    });
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm mới ngân sách"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Tạo mới"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Tên ngân sách (*)" value={ten} onChange={(e) => setTen(e.target.value)} error={errors.ten} />
        <Input
          label="Số tiền (*)"
          type="number"
          value={soTien}
          onChange={(e) => setSoTien(Number(e.target.value))}
          error={errors.soTien}
        />
        <Input
          label="Ngày bắt đầu (*)"
          type="date"
          value={ngayBatDau}
          onChange={(e) => setNgayBatDau(e.target.value)}
          error={errors.ngayBatDau}
        />
        <Input
          label="Ngày kết thúc (*)"
          type="date"
          value={ngayKetThuc}
          onChange={(e) => setNgayKetThuc(e.target.value)}
          error={errors.ngayKetThuc}
        />
        <Select
          label="Người quản lý"
          value={nguoiQuanLy}
          onChange={(e) => setNguoiQuanLy(e.target.value)}
          options={users.map((u) => ({ value: u.id, label: u.ten }))}
          placeholder="Chọn người quản lý"
        />
        <Select
          label="Trạng thái"
          value={trangThai}
          onChange={(e) => setTrangThai(e.target.value as TrangThaiNganSach)}
          options={[
            { value: "active", label: "Đang sử dụng" },
            { value: "expired", label: "Hết hạn" },
            { value: "inactive", label: "Ngưng" },
          ]}
        />

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </Modal>
  );
}
