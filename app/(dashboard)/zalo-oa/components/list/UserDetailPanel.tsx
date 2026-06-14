"use client";

import Image from "next/image";
import { useState } from "react";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import type { ZaloConversation } from "@/types/zalo-oa";

interface UserDetailPanelProps {
  conversation: ZaloConversation;
  oaName: string;
  accessToken: string;
  onUpdated: (patch: Partial<ZaloConversation>) => void;
}

interface EditForm {
  user_alias: string;
  name: string;
  phone: string;
}

export function UserDetailPanel({ conversation, oaName, accessToken, onUpdated }: UserDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    user_alias: conversation.name,
    name: conversation.name,
    phone: String(conversation.customerPhone || ""),
  });
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const openEdit = () => {
    setForm({
      user_alias: conversation.name,
      name: conversation.name,
      phone: String(conversation.customerPhone || ""),
    });
    setSaveResult(null);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/zalo/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-oa-access-token": accessToken,
        },
        body: JSON.stringify({
          user_id: conversation.id,
          user_alias: form.user_alias || undefined,
          shared_info: {
            name: form.name || undefined,
            phone: form.phone || undefined,
          },
        }),
      });
      const json = await res.json();
      if (json.error === 0) {
        setSaveResult({ ok: true, msg: "Cập nhật thành công" });
        setEditing(false);
        onUpdated({
          name: form.user_alias || form.name || conversation.name,
          customerPhone: form.phone || conversation.customerPhone,
        });
      } else {
        setSaveResult({ ok: false, msg: json.message || "Cập nhật thất bại" });
      }
    } catch {
      setSaveResult({ ok: false, msg: "Lỗi kết nối" });
    } finally {
      setSaving(false);
    }
  };

  const phoneDisplay = (() => {
    const p = conversation.customerPhone;
    if (!p || p === "0" || Number(p) === 0) return null;
    return String(p);
  })();

  return (
    <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
      {/* User header */}
      <div className="flex flex-col items-center gap-2 px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="relative h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden flex-shrink-0">
          {conversation.avatar ? (
            <Image
              src={conversation.avatar}
              alt={conversation.name}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-white text-xl font-semibold select-none">
              {conversation.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{conversation.name}</p>
          <p className="text-xs text-gray-500">{oaName}</p>
        </div>
      </div>

      {/* Info section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thông tin</p>
          <button
            onClick={() => { editing ? setEditing(false) : openEdit(); }}
            className="p-1 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title={editing ? "Huỷ chỉnh sửa" : "Chỉnh sửa"}
          >
            {editing ? <FiX className="w-3.5 h-3.5" /> : <FiEdit2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {editing ? (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Tên hiển thị</label>
              <input
                value={form.user_alias}
                onChange={(e) => setForm((f) => ({ ...f, user_alias: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Họ tên</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="84xxxxxxxxx"
                className="w-full text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
              />
            </div>
            {saveResult && (
              <p className={`text-xs font-medium ${saveResult.ok ? "text-green-600" : "text-red-500"}`}>
                {saveResult.msg}
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <FiSave className="w-3.5 h-3.5" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        ) : (
          <dl className="space-y-2">
            <div className="flex gap-2 text-sm">
              <dt className="text-gray-500 w-28 flex-shrink-0">Họ Tên:</dt>
              <dd className="text-gray-800 font-medium truncate">{conversation.name}</dd>
            </div>
            <div className="flex gap-2 text-sm">
              <dt className="text-gray-500 w-28 flex-shrink-0">Số điện thoại:</dt>
              <dd className="text-gray-800 font-medium">{phoneDisplay || "—"}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Tags section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nhãn</p>
        {conversation.tags && conversation.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {conversation.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Chưa có nhãn</p>
        )}
      </div>

      {/* User ID (for reference) */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Zalo ID</p>
        <p className="text-xs text-gray-400 font-mono break-all">{conversation.id}</p>
      </div>
    </div>
  );
}
