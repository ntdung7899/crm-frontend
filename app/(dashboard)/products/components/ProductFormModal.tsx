"use client";

import { useEffect, useRef, useState } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { filesService } from "@/services/files";
import { resolveMediaUrl } from "@/app/(dashboard)/newsfeed/utils/postMappers";
import type { CreateProductPayload, ProductApiRow, UpdateProductPayload } from "@/types/api";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editing: ProductApiRow | null;
    isSaving: boolean;
    onSubmit: (payload: CreateProductPayload | UpdateProductPayload) => Promise<boolean>;
}

export function ProductFormModal({ isOpen, onClose, editing, isSaving, onSubmit }: Props) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [price, setPrice] = useState(0);
    const [originalPrice, setOriginalPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [status, setStatus] = useState<"active" | "inactive">("active");
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setName(editing?.name ?? "");
        setCode(editing?.code ?? "");
        setPrice(Number(editing?.price ?? 0));
        setOriginalPrice(Number(editing?.original_price ?? 0));
        setStock(editing?.stock_quantity ?? 0);
        setDescription(editing?.description ?? "");
        setThumbnail(editing?.thumbnail_url ?? "");
        setStatus(editing?.status ?? "active");
        setErrors({});
    }, [isOpen, editing]);

    const upload = async (file: File) => {
        setUploading(true);
        try {
            const res = await filesService.uploadFile(file);
            if (res?.responseData?.original) setThumbnail(res.responseData.original);
        } finally {
            setUploading(false);
        }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Vui lòng nhập tên sản phẩm";
        if (price < 0) e.price = "Giá không hợp lệ";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const ok = await onSubmit({
            name: name.trim(),
            code: code.trim() || undefined,
            price,
            original_price: originalPrice || undefined,
            stock_quantity: stock,
            description: description.trim() || undefined,
            thumbnail_url: thumbnail || null,
            ...(editing ? { status } : {}),
        });
        if (ok) onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
            size="xl"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={isSaving || uploading}>{isSaving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm mới"}</Button>
                </>
            }
        >
            <div className="grid grid-cols-2 gap-4">
                <Input label="Tên sản phẩm (*)" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
                <Input label="Mã sản phẩm" value={code} onChange={(e) => setCode(e.target.value)} />
                <Input label="Giá bán (*)" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} error={errors.price} />
                <Input label="Giá gốc" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} />
                <Input label="Tồn kho" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
                {editing && (
                    <Select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")} options={[{ value: "active", label: "Đang bán" }, { value: "inactive", label: "Ngừng bán" }]} />
                )}
                <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh đại diện</label>
                    {thumbnail ? (
                        <div className="relative w-40 overflow-hidden rounded-lg border border-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resolveMediaUrl(thumbnail)} alt="thumb" className="h-32 w-full object-cover" />
                            <button type="button" onClick={() => setThumbnail("")} className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500 shadow hover:bg-red-50">
                                <FiTrash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div onClick={() => inputRef.current?.click()} className="flex h-32 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-primary-300">
                            {uploading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" /> : <FiUploadCloud className="h-6 w-6 text-gray-400" />}
                            <span className="text-xs text-gray-500">Tải ảnh lên</span>
                        </div>
                    )}
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
                </div>
            </div>
        </Modal>
    );
}
