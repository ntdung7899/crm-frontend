"use client";

import { useEffect, useRef, useState } from "react";
import {
    FiDownload,
    FiFile,
    FiPaperclip,
    FiPlus,
    FiTrash2,
    FiUpload,
    FiX,
} from "react-icons/fi";
import { customersService } from "@/services/customers";
import { filesService } from "@/services/files";
import { useToast } from "@/components/ui/ToastProvider";
import type { CustomerFileRef } from "@/types/api";
import {
    CustomerNote,
    generateId,
    isImageFile,
    loadCustomerMedia,
    normalizeCustomerFiles,
    resolveFileUrl,
    saveCustomerMedia,
} from "../utils/customerMedia";

interface CustomerMediaTabProps {
    customerId: string;
}

export function CustomerMediaTab({ customerId }: CustomerMediaTabProps) {
    const toast = useToast();
    const [files, setFiles] = useState<CustomerFileRef[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [notes, setNotes] = useState<CustomerNote[]>([]);
    const [draftNote, setDraftNote] = useState("");

    // Load file đính kèm từ customer + ghi chú local
    useEffect(() => {
        if (!customerId) return;
        setNotes(loadCustomerMedia(customerId).notes);

        let disposed = false;
        setIsLoadingFiles(true);
        customersService
            .getCustomer(customerId)
            .then((res) => {
                if (!disposed) setFiles(normalizeCustomerFiles(res.responseData?.file));
            })
            .catch(() => {
                if (!disposed) setFiles([]);
            })
            .finally(() => {
                if (!disposed) setIsLoadingFiles(false);
            });

        return () => {
            disposed = true;
        };
    }, [customerId]);

    // Lưu danh sách file vào khách hàng qua PUT /customers/:id
    const persistFiles = async (next: CustomerFileRef[]) => {
        const previous = files;
        setFiles(next);
        try {
            await customersService.updateCustomer(customerId, { file: next });
        } catch (error) {
            setFiles(previous);
            toast.error("Lưu tài liệu thất bại", error instanceof Error ? error.message : "Vui lòng thử lại.");
            throw error;
        }
    };

    // Upload qua fileService rồi gắn vào customer.file
    const handleUpload = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        setIsUploading(true);
        try {
            const uploaded: CustomerFileRef[] = [];
            for (const file of Array.from(fileList)) {
                const res = await filesService.uploadFile(file);
                const url = res?.responseData?.original;
                if (url) uploaded.push({ url, name: file.name });
            }
            if (uploaded.length === 0) {
                toast.error("Tải lên thất bại", "Không nhận được đường dẫn file từ máy chủ.");
                return;
            }
            await persistFiles([...files, ...uploaded]);
            toast.success("Đã tải lên", `${uploaded.length} tài liệu đã được lưu cho khách hàng.`);
        } catch {
            // lỗi đã toast trong persistFiles / hoặc upload
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = async (url: string) => {
        try {
            await persistFiles(files.filter((f) => f.url !== url));
            toast.success("Đã xoá", "Tài liệu đã được gỡ khỏi khách hàng.");
        } catch {
            // đã toast
        }
    };

    // ── Ghi chú (local) ──
    const persistNotes = (next: CustomerNote[]) => {
        setNotes(next);
        const current = loadCustomerMedia(customerId);
        saveCustomerMedia(customerId, { ...current, notes: next });
    };

    const addNote = () => {
        const content = draftNote.trim();
        if (!content) return;
        persistNotes([{ id: generateId("note"), content, createdAt: new Date().toISOString() }, ...notes]);
        setDraftNote("");
    };

    const removeNote = (id: string) => persistNotes(notes.filter((n) => n.id !== id));

    return (
        <div className="space-y-6">
            {/* Tài liệu khách hàng */}
            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-primary-600"><FiPaperclip className="h-4 w-4" /></span>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">Tài liệu khách hàng</h3>
                            <p className="text-xs text-gray-500">Hình ảnh công việc, hoá đơn, chứng từ... đính kèm cho khách hàng.</p>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500">{files.length} tệp</span>
                </div>

                <div className="space-y-3 p-4">
                    <UploadZone isUploading={isUploading} onSelect={handleUpload} />

                    {isLoadingFiles ? (
                        <p className="py-4 text-center text-xs text-gray-400">Đang tải tài liệu...</p>
                    ) : files.length === 0 ? (
                        <p className="py-4 text-center text-xs text-gray-400">Chưa có tài liệu nào.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {files.map((file) => {
                                const fullUrl = resolveFileUrl(file.url);
                                const image = isImageFile(file.name || file.url);
                                return (
                                    <div key={file.url} className="group overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        <div className="relative aspect-square bg-gray-100">
                                            {image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={fullUrl}
                                                    alt={file.name}
                                                    onClick={() => setPreviewUrl(fullUrl)}
                                                    className="absolute inset-0 h-full w-full cursor-zoom-in object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <a
                                                    href={fullUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary-600"
                                                >
                                                    <FiFile className="h-8 w-8" />
                                                    <span className="text-[10px]">Mở tệp</span>
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(file.url)}
                                                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
                                                title="Xoá tệp"
                                            >
                                                <FiTrash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between gap-1 p-2">
                                            <span className="truncate text-xs text-gray-700" title={file.name}>{file.name}</span>
                                            <a
                                                href={fullUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="shrink-0 text-gray-400 hover:text-primary-600"
                                                title="Tải xuống"
                                            >
                                                <FiDownload className="h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Ghi chú khách hàng */}
            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">Ghi chú khách hàng</h3>
                        <p className="text-xs text-gray-500">Lưu thông tin nhắc nhở, lịch sử trao đổi, lưu ý đặc biệt.</p>
                    </div>
                    <span className="text-xs text-gray-500">{notes.length} ghi chú</span>
                </div>

                <div className="space-y-3 p-4">
                    <div className="flex items-start gap-2">
                        <textarea
                            value={draftNote}
                            onChange={(e) => setDraftNote(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    addNote();
                                }
                            }}
                            placeholder="Nhập ghi chú cho khách hàng... (Ctrl+Enter để lưu nhanh)"
                            rows={3}
                            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        />
                        <button
                            type="button"
                            onClick={addNote}
                            disabled={!draftNote.trim()}
                            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FiPlus className="h-3.5 w-3.5" />
                            Lưu
                        </button>
                    </div>

                    {notes.length === 0 ? (
                        <p className="py-6 text-center text-xs text-gray-400">Chưa có ghi chú nào.</p>
                    ) : (
                        <div className="space-y-2">
                            {notes.map((note) => (
                                <div key={note.id} className="group rounded-lg border border-gray-100 bg-gray-50/40 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="flex-1 whitespace-pre-line text-sm text-gray-700">{note.content}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeNote(note.id)}
                                            className="flex-shrink-0 text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                                            title="Xóa ghi chú"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-400">
                                        {new Date(note.createdAt).toLocaleString("vi-VN", { hour12: false })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {previewUrl && <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
        </div>
    );
}

function UploadZone({ isUploading, onSelect }: { isUploading: boolean; onSelect: (files: FileList | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                onSelect(e.dataTransfer.files);
            }}
            onClick={() => !isUploading && inputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed py-4 text-center transition-colors ${
                isDragging ? "border-primary-400 bg-primary-50" : "border-gray-300 bg-gray-50/50 hover:border-primary-300"
            } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
            {isUploading ? (
                <span className="mx-auto mb-1 block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
            ) : (
                <FiUpload className="mx-auto mb-1 h-5 w-5 text-gray-400" />
            )}
            <p className="text-xs text-gray-600">
                {isUploading ? (
                    "Đang tải lên..."
                ) : (
                    <>
                        Kéo thả hoặc <span className="font-medium text-primary-600">chọn tệp để tải lên</span>
                    </>
                )}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">Ảnh, PDF, tài liệu — có thể chọn nhiều tệp</p>
            <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                multiple
                onChange={(e) => {
                    onSelect(e.target.files);
                    e.target.value = "";
                }}
                className="hidden"
            />
        </div>
    );
}

function ImagePreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10"
                title="Đóng"
            >
                <FiX className="h-5 w-5" />
            </button>
            <div className="relative max-h-[90vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Xem trước" className="h-auto max-h-[85vh] w-full rounded-lg object-contain" />
            </div>
        </div>
    );
}
