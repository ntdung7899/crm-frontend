"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LOAI_YCCP_LABEL, type LoaiYCCP, type NoiDungChi } from "@/services/finance/types";
import type { YccpFormInput } from "@/services/finance/apiMappers";
import type { FinanceUser } from "../../_hooks/useFinanceUsers";
import { formatDateForInput, formatVND } from "@/lib/utils";
import { FiTrash2, FiPlus } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: FinanceUser[];
  isSaving: boolean;
  onCreate: (form: YccpFormInput) => Promise<boolean>;
}

export function YccpFormModal({ isOpen, onClose, users, isSaving, onCreate }: Props) {
  const [loai, setLoai] = useState<LoaiYCCP>("thanh_toan");
  const [noiDung, setNoiDung] = useState("");
  const [lyDo, setLyDo] = useState("");
  const [nguoiYeuCau, setNguoiYeuCau] = useState("");
  const [nguoiPheDuyet, setNguoiPheDuyet] = useState("");
  const [ngayYeuCau, setNgayYeuCau] = useState(formatDateForInput(new Date()));
  const [items, setItems] = useState<NoiDungChi[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setLoai("thanh_toan");
    setNoiDung("");
    setLyDo("");
    setNguoiYeuCau(users[0]?.id ?? "");
    setNguoiPheDuyet("");
    setNgayYeuCau(formatDateForInput(new Date()));
    setItems([]);
    setErrors({});
  }, [isOpen, users]);

  const tongTien = items.reduce((s, i) => s + i.soTien, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!noiDung.trim()) e.noiDung = "Vui lòng nhập nội dung";
    if (!lyDo.trim()) e.lyDo = "Vui lòng nhập lý do";
    if (tongTien <= 0) e.items = "Vui lòng thêm ít nhất một dòng nội dung chi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const ok = await onCreate({
      loai,
      noiDung,
      soTien: tongTien,
      ngayYeuCau,
      lyDo: lyDo || undefined,
      danhSachNoiDung: items.map((i) => ({ noiDung: i.noiDung, soTien: i.soTien })),
    });
    if (ok) onClose();
  };

  const addItem = () => setItems([...items, { id: Math.random().toString(36).slice(2, 8), noiDung: "", soTien: 0 }]);
  const updateItem = (id: string, patch: Partial<NoiDungChi>) => setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const userOptions = users.map((u) => ({ value: u.id, label: u.ten }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo yêu cầu chi phí"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? "Đang lưu..." : "Thêm mới"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn đề nghị chi phí</label>
          <div className="flex gap-4">
            {(Object.entries(LOAI_YCCP_LABEL) as [LoaiYCCP, string][]).map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="loai-yccp" checked={loai === v} onChange={() => setLoai(v)} />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Người yêu cầu" value={nguoiYeuCau} onChange={(e) => setNguoiYeuCau(e.target.value)} options={userOptions} />
          <Select label="Người phê duyệt" value={nguoiPheDuyet} onChange={(e) => setNguoiPheDuyet(e.target.value)} options={userOptions} placeholder="Chọn người duyệt" />
          <Input label="Ngày yêu cầu (*)" type="date" value={ngayYeuCau} onChange={(e) => setNgayYeuCau(e.target.value)} />
          <div />
          <div className="col-span-2">
            <Input label="Nội dung yêu cầu (*)" value={noiDung} onChange={(e) => setNoiDung(e.target.value)} error={errors.noiDung} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do yêu cầu (*)</label>
            <textarea value={lyDo} onChange={(e) => setLyDo(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {errors.lyDo && <p className="mt-1 text-sm text-red-600">{errors.lyDo}</p>}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Danh sách nội dung chi</h3>
            <span className="text-sm font-semibold text-orange-600">Tổng: {formatVND(tongTien)}</span>
          </div>
          {items.length === 0 && <p className="text-sm text-gray-500 mb-2">Chưa có dòng nào.</p>}
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-2 items-center">
                <Input placeholder="Nội dung" value={item.noiDung} onChange={(e) => updateItem(item.id, { noiDung: e.target.value })} className="flex-1" />
                <Input placeholder="Số tiền" type="number" value={item.soTien} onChange={(e) => updateItem(item.id, { soTien: Number(e.target.value) })} className="w-40" />
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-3 text-sm text-primary-600 hover:underline flex items-center gap-1">
            <FiPlus className="w-4 h-4" /> Thêm nội dung chi
          </button>
          {errors.items && <p className="mt-1 text-sm text-red-600">{errors.items}</p>}
        </div>
      </div>
    </Modal>
  );
}
