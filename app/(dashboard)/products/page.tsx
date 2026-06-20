"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { formatVND } from "@/lib/utils";
import { productsService } from "@/services/products";
import { resolveMediaUrl } from "../newsfeed/utils/postMappers";
import type { CreateProductPayload, ProductApiRow, UpdateProductPayload } from "@/types/api";
import { ProductFormModal } from "./components/ProductFormModal";

export default function ProductsPage() {
    const toast = useToast();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();
    const [items, setItems] = useState<ProductApiRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<ProductApiRow | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await productsService.getProducts({ pageSize: "200" });
            setItems(res.responseData?.rows ?? []);
        } catch (e) {
            toast.error("Tải sản phẩm thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => { void load(); }, [load]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter((p) => {
            if (q && !(p.name.toLowerCase().includes(q) || (p.code ?? "").toLowerCase().includes(q))) return false;
            if (statusFilter && p.status !== statusFilter) return false;
            return true;
        });
    }, [items, search, statusFilter]);

    const handleSubmit = async (payload: CreateProductPayload | UpdateProductPayload): Promise<boolean> => {
        setIsSaving(true);
        try {
            if (editing) {
                await productsService.updateProduct(editing.id, payload as UpdateProductPayload);
                toast.success("Cập nhật sản phẩm thành công");
            } else {
                await productsService.createProduct(payload as CreateProductPayload);
                toast.success("Thêm sản phẩm thành công");
            }
            await load();
            return true;
        } catch (e) {
            toast.error("Lưu sản phẩm thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (p: ProductApiRow) => {
        requestDeleteConfirmation({
            title: "Xóa sản phẩm",
            description: `Bạn có chắc chắn muốn xóa "${p.name}"?`,
            onConfirm: async () => {
                try {
                    await productsService.deleteProduct(p.id);
                    toast.success("Đã xóa sản phẩm");
                    await load();
                } catch (e) {
                    toast.error("Xóa thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
                }
            },
        });
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                <Input placeholder="Tên / Mã sản phẩm" value={search} onChange={(e) => setSearch(e.target.value)} className="ml-2 max-w-xs" />
                <div className="w-44">
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "active", label: "Đang bán" }, { value: "inactive", label: "Ngừng bán" }]} placeholder="Tất cả trạng thái" />
                </div>
                <Button className="ml-auto" onClick={() => { setEditing(null); setShowForm(true); }}>
                    <FiPlus className="mr-1 h-4 w-4" /> Thêm sản phẩm
                </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                            <th className="px-4 py-3 text-left font-medium">Mã</th>
                            <th className="px-4 py-3 text-right font-medium">Giá bán</th>
                            <th className="px-4 py-3 text-right font-medium">Giá gốc</th>
                            <th className="px-4 py-3 text-right font-medium">Tồn kho</th>
                            <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="py-10"><div className="flex justify-center"><Spinner /></div></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="py-8 text-center text-gray-500">Chưa có sản phẩm</td></tr>
                        ) : (
                            filtered.map((p) => (
                                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                {p.thumbnail_url && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={resolveMediaUrl(p.thumbnail_url)} alt={p.name} className="h-full w-full object-cover" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{p.code ?? "-"}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-primary-700">{formatVND(Number(p.price))}</td>
                                    <td className="px-4 py-3 text-right text-gray-400 line-through">{p.original_price ? formatVND(Number(p.original_price)) : "-"}</td>
                                    <td className="px-4 py-3 text-right">{p.stock_quantity}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={p.status === "active" ? "success" : "default"}>{p.status === "active" ? "Đang bán" : "Ngừng bán"}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => { setEditing(p); setShowForm(true); }} className="mr-2 text-gray-500 hover:text-primary-600" title="Sửa"><FiEdit2 className="inline h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(p)} className="text-gray-500 hover:text-red-600" title="Xóa"><FiTrash2 className="inline h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ProductFormModal isOpen={showForm} onClose={() => setShowForm(false)} editing={editing} isSaving={isSaving} onSubmit={handleSubmit} />
            <DeleteConfirmationDialog />
        </div>
    );
}
