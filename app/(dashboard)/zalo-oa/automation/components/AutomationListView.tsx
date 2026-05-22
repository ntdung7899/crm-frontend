"use client";

import { FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch, FiPlay, FiPause } from "react-icons/fi";
import type { UseMarketingAutomationReturn } from "../_hooks/useMarketingAutomation";

interface Props {
  hook: UseMarketingAutomationReturn;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: "Đang hoạt động", cls: "bg-green-100 text-green-700" },
  inactive: { label: "Tạm dừng", cls: "bg-gray-100 text-gray-600" },
  draft: { label: "Nháp", cls: "bg-yellow-100 text-yellow-700" },
};

const FILTER_TABS = [
  { id: "all" as const, label: "Tất cả" },
  { id: "active" as const, label: "Đang hoạt động" },
  { id: "inactive" as const, label: "Tạm dừng" },
  { id: "draft" as const, label: "Nháp" },
];

export function AutomationListView({ hook }: Props) {
  const {
    filteredFlows, search, setSearch,
    trangThaiFilter, setTrangThaiFilter,
    isLoading, error,
    setShowTemplatePicker,
    onDelete, onToggleStatus, onEdit,
  } = hook;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Marketing Automation</h2>
          <p className="text-sm text-gray-500">Tự động hoá quy trình chăm sóc khách hàng qua Zalo OA</p>
        </div>
        <button
          onClick={() => setShowTemplatePicker(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Tạo mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTrangThaiFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trangThaiFilter === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm automation..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Tên automation</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Trigger</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Lượt chạy</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Tỉ lệ thành công</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Cập nhật</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(isLoading || filteredFlows.length === 0) && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{isLoading ? "Đang tải automation..." : "Chưa có automation nào"}</span>
                  </div>
                </td>
              </tr>
            )}
            {filteredFlows.map((flow) => {
              const status = STATUS_LABELS[flow.trangThai];
              return (
                <tr key={flow.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{flow.name}</div>
                    <div className="text-xs text-gray-400">Tạo bởi {flow.nguoiTao}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{flow.trigger}</td>
                  <td className="px-4 py-3 text-right font-medium">{flow.soLuotChay.toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${flow.tiLeThanhCong >= 70 ? "text-green-600" : flow.tiLeThanhCong >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                      {flow.tiLeThanhCong}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{flow.ngayCapNhat}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(flow)}
                        title="Xem / Sửa"
                        className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(flow)}
                        title="Chỉnh sửa"
                        className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(flow.id)}
                        title={flow.trangThai === "active" ? "Tạm dừng" : "Kích hoạt"}
                        className="p-1.5 text-gray-400 hover:text-yellow-600 rounded"
                      >
                        {flow.trangThai === "active" ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDelete(flow.id)}
                        title="Xoá"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
