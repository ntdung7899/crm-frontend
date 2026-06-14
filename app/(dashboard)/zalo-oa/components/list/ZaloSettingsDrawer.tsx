"use client";

import Image from "next/image";
import { useState } from "react";
import { FiCheckCircle, FiChevronRight, FiRefreshCw, FiTrash2, FiUsers } from "react-icons/fi";
import type { OaConnection } from "@/types/zalo-oa";
import { ZaloOaAddModal } from "../forms/ZaloOaAddModal";

interface ZaloSettingsDrawerProps {
    settingsOpen: boolean;
    onClose: () => void;
    connections: OaConnection[];
    onAddConnection: (connection: OaConnection) => void;
    onRemoveConnection: (id: string) => void;
}

export function ZaloSettingsDrawer({ settingsOpen, onClose, connections, onAddConnection, onRemoveConnection }: ZaloSettingsDrawerProps) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div
                className={`absolute inset-y-0 right-0 w-[380px] bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 z-20 ${settingsOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <button
                    onClick={onClose}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-primary-600 z-30 transition-colors"
                >
                    <FiChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-gray-900">Cài đặt ZaloOA</h3>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                        Thêm mới
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-0">
                    {connections.map((conn) => (
                        <div
                            key={conn.id}
                            className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                        >
                            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                                {conn.avatar ? (
                                    <Image
                                        src={conn.avatar}
                                        alt={conn.oaName}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span>{conn.oaName.charAt(0)}</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {conn.oaName}
                                    </p>
                                    {conn.isVerified && (
                                        <FiCheckCircle
                                            className="h-3.5 w-3.5 text-blue-500 flex-shrink-0"
                                            title="Đã xác thực"
                                        />
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-500 truncate">
                                    ID: {conn.oaOfficialId}
                                    {conn.oaAlias ? ` • @${conn.oaAlias}` : ""}
                                </p>
                                <div className="mt-1 flex items-center gap-2 flex-wrap text-[10px]">
                                    {typeof conn.followers === "number" && conn.followers > 0 && (
                                        <span className="inline-flex items-center gap-0.5 text-gray-500">
                                            <FiUsers className="h-2.5 w-2.5" />
                                            {conn.followers.toLocaleString("vi-VN")}
                                        </span>
                                    )}
                                    {conn.categoryName && (
                                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                            {conn.categoryName}
                                        </span>
                                    )}
                                    {conn.packageName && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                                            {conn.packageName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 transition-colors"
                                    title="Kết nối lại"
                                >
                                    <FiRefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onRemoveConnection(conn.id)}
                                    className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                                    title="Xoá kết nối"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ZaloOaAddModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConnected={(connection) => {
                    onAddConnection(connection);
                    setModalOpen(false);
                }}
            />
        </>
    );
}
