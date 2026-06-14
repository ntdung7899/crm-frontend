"use client";

import { FiTrash2 } from "react-icons/fi";
import type { AutoConfig } from "@/types/zalo-oa";

interface ZaloAutoConfigPanelProps {
    autoConfigs: AutoConfig[];
    onOpenConfigForm: () => void;
    onDeleteConfig: (configId: string) => void;
}

export function ZaloAutoConfigPanel({
    autoConfigs,
    onOpenConfigForm,
    onDeleteConfig,
}: ZaloAutoConfigPanelProps) {
    return (
        <div className="flex-1 overflow-auto p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">Cấu hình tự động</h2>
                <button
                    onClick={onOpenConfigForm}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Thêm cấu hình
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left">
                            <th className="px-4 py-3 font-medium text-gray-600 w-10">#</th>
                            <th className="px-4 py-3 font-medium text-gray-600">OA áp dụng</th>
                            <th className="px-4 py-3 font-medium text-gray-600">Người tạo</th>
                            <th className="px-4 py-3 font-medium text-gray-600">Ngày tạo</th>
                            <th className="px-4 py-3 font-medium text-gray-600 w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {autoConfigs.map((cfg, idx) => (
                            <tr
                                key={cfg.id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{cfg.oaName}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                                            {cfg.createdBy.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-primary-600 leading-tight">
                                                {cfg.createdBy}
                                            </p>
                                            <p className="text-[10px] text-gray-500 leading-tight">
                                                {cfg.createdByRole}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{cfg.createdAt}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => onDeleteConfig(cfg.id)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Xóa"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {autoConfigs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                                    Chưa có cấu hình nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
