"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import {
  LOAI_YCCP_LABEL,
  TRANG_THAI_YCCP_LABEL,
  type YeuCauChiPhi,
  type TrangThaiYCCP,
  type LoaiYCCP,
  type Quy,
} from "@/services/finance/types";
import { formatVND, formatDateVNDateOnly, formatDateVN } from "@/lib/utils";

interface Props {
  yccp: YeuCauChiPhi | null;
  onClose: () => void;
  usersById: Record<string, string>;
  quyList: Quy[];
  onApprove: (id: string, note?: string) => Promise<boolean>;
  onReject: (id: string, note?: string) => Promise<boolean>;
  onCancel: (id: string, note?: string) => Promise<boolean>;
  onComplete: (id: string, payload: { fund_id: string; note?: string }) => Promise<boolean>;
}

export function YccpDetailModal({ yccp, onClose, usersById, quyList, onApprove, onReject, onCancel, onComplete }: Props) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [fundId, setFundId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setShowRejectInput(false);
    setRejectReason("");
    setFundId(quyList[0]?.id ?? "");
  }, [yccp, quyList]);

  if (!yccp) return null;

  const canApprove = yccp.trangThai === "cho_xac_nhan";
  const canCancel = !["hoan_thanh", "tu_choi", "huy"].includes(yccp.trangThai);
  const canComplete = yccp.trangThai === "cho_xuat_quy";

  const run = async (action: () => Promise<boolean>) => {
    setBusy(true);
    const ok = await action();
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={!!yccp}
      onClose={onClose}
      title={`Yêu cầu chi phí ${yccp.maYeuCau}`}
      size="xl"
      footer={
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onClose} disabled={busy}>Đóng</Button>
          {canCancel && <Button variant="outline" onClick={() => run(() => onCancel(yccp.id))} disabled={busy}>Hủy yêu cầu</Button>}
          {canApprove && (
            <>
              <Button variant="danger" onClick={() => setShowRejectInput((v) => !v)} disabled={busy}>Từ chối</Button>
              <Button onClick={() => run(() => onApprove(yccp.id))} disabled={busy}>Phê duyệt</Button>
            </>
          )}
          {canComplete && (
            <Button onClick={() => run(() => onComplete(yccp.id, { fund_id: fundId }))} disabled={busy || !fundId}>Xuất quỹ</Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="info">{LOAI_YCCP_LABEL[yccp.loai as LoaiYCCP]}</Badge>
          <Badge>{TRANG_THAI_YCCP_LABEL[yccp.trangThai as TrangThaiYCCP]}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Field label="Mã yêu cầu" value={yccp.maYeuCau} />
          <Field label="Ngày yêu cầu" value={formatDateVNDateOnly(yccp.ngayYeuCau)} />
          <Field label="Người yêu cầu" value={usersById[yccp.nguoiYeuCauId] ?? "-"} />
          <Field label="Người phê duyệt" value={usersById[yccp.nguoiPheDuyetId] ?? "-"} />
          <Field label="Nội dung" value={yccp.noiDung} className="col-span-2" />
          <Field label="Lý do" value={yccp.lyDo} className="col-span-2" />
          <Field label="Tổng số tiền" value={<span className="text-lg font-bold text-orange-600">{formatVND(yccp.soTien)}</span>} />
          <Field label="Đã cấp" value={formatVND(yccp.daCap)} />
        </dl>

        <div>
          <h3 className="font-semibold text-sm mb-2">Danh sách nội dung chi</h3>
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Nội dung</th>
                <th className="text-right px-3 py-2">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {yccp.danhSachNoiDung.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{item.noiDung}</td>
                  <td className="px-3 py-2 text-right">{formatVND(item.soTien)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {yccp.lichSu.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Lịch sử xử lý</h3>
            <ol className="space-y-2">
              {yccp.lichSu.map((l, i) => (
                <li key={i} className="text-sm flex items-start gap-3 border-l-2 border-primary-300 pl-3">
                  <div className="flex-1">
                    <div className="font-medium">{l.hanhDong}</div>
                    <div className="text-xs text-gray-500">{usersById[l.nguoi] ?? l.nguoi} · {l.thoiGian ? formatDateVN(l.thoiGian) : ""}</div>
                    {l.ghiChu && <div className="text-xs text-gray-600 mt-1">{l.ghiChu}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {canComplete && (
          <div className="border-t border-gray-200 pt-3">
            <Select label="Quỹ xuất tiền" value={fundId} onChange={(e) => setFundId(e.target.value)} options={quyList.map((q) => ({ value: q.id, label: q.ten }))} placeholder="Chọn quỹ" />
          </div>
        )}

        {showRejectInput && (
          <div className="border-t border-gray-200 pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <div className="mt-2 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowRejectInput(false)} disabled={busy}>Hủy</Button>
              <Button variant="danger" size="sm" onClick={() => run(() => onReject(yccp.id, rejectReason))} disabled={busy}>Xác nhận từ chối</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Field({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-gray-500 text-xs">{label}</dt>
      <dd className="text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}
