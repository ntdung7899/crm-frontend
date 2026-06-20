"use client";

import Link from "next/link";
import { FiArrowLeft, FiPlus, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { formatVND } from "@/lib/utils";
import { useTaskForm } from "../hooks/useTaskForm";
import { JobOrderItemForm } from "../types";
import { SubJobTimeline } from "./SubJobTimeline";

function Card({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
                {icon && <span className="text-primary-600">{icon}</span>}
                <div>
                    <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </div>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
            {children}
        </div>
    );
}

const selectClass = "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

export function TaskFormView({ jobId }: { jobId?: string }) {
    const { isEditing, isLoading, isSaving, formData, setFormData, performerOptions, customerOptions, statusOptions, products, save, cancel } = useTaskForm(jobId);

    if (isLoading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    }

    const items = formData.order_items;
    const setItems = (next: JobOrderItemForm[]) => setFormData({ ...formData, order_items: next });
    const addItem = () => setItems([...items, { id: Math.random().toString(36).slice(2, 8), product_name: "", quantity: 1, unit_price: 0, discount_amount: 0 }]);
    const updateItem = (id: string, patch: Partial<JobOrderItemForm>) => setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));
    const pickProduct = (id: string, productId: string) => {
        const p = products.find((x) => x.id === productId);
        updateItem(id, { product_id: productId || undefined, product_name: p?.name ?? "", product_code: p?.code ?? undefined, unit_price: Number(p?.price ?? 0) });
    };
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const total = subtotal - (formData.order_discount || 0);

    return (
        <div className="mx-auto max-w-4xl space-y-5 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/tasks" className="mb-1 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
                        <FiArrowLeft className="h-4 w-4" /> Danh sách công việc
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Chỉnh sửa công việc" : "Tạo công việc mới"}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={cancel} disabled={isSaving}>Hủy</Button>
                    <Button onClick={() => void save()} disabled={isSaving}>{isSaving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}</Button>
                </div>
            </div>

            {/* Thông tin công việc */}
            <Card title="Thông tin công việc">
                <div className="space-y-4">
                    <Field label="Tên công việc" required>
                        <Input value={formData.job_name} onChange={(e) => setFormData({ ...formData, job_name: e.target.value })} placeholder="Nhập tên công việc" />
                    </Field>
                    <Field label="Nội dung" required>
                        <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} placeholder="Nhập nội dung công việc" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Thời gian bắt đầu">
                            <Input type="datetime-local" value={formData.job_time.start ?? ""} onChange={(e) => setFormData({ ...formData, job_time: { ...formData.job_time, start: e.target.value } })} />
                        </Field>
                        <Field label="Thời gian kết thúc">
                            <Input type="datetime-local" value={formData.job_time.end ?? ""} onChange={(e) => setFormData({ ...formData, job_time: { ...formData.job_time, end: e.target.value } })} />
                        </Field>
                        <Field label="Người thực hiện">
                            <select value={formData.performer_uuid} onChange={(e) => setFormData({ ...formData, performer_uuid: e.target.value })} className={selectClass}>
                                <option value="">Không chọn</option>
                                {performerOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Khách hàng">
                            <select value={formData.customer_uuid} onChange={(e) => setFormData({ ...formData, customer_uuid: e.target.value })} className={selectClass}>
                                <option value="">Không chọn</option>
                                {customerOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </Field>
                        {isEditing && (
                            <Field label="Trạng thái">
                                <select value={formData.status_id} onChange={(e) => setFormData({ ...formData, status_id: e.target.value })} className={selectClass}>
                                    {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                        )}
                        <Field label="Ghi chú">
                            <Input value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Ghi chú (nếu có)" />
                        </Field>
                    </div>
                </div>
            </Card>

            {/* Đơn hàng kèm theo */}
            <Card title="Đơn hàng kèm theo" subtitle="Mỗi công việc gắn tối đa một đơn hàng" icon={<FiShoppingCart className="h-4 w-4" />}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={formData.attach_order} onChange={(e) => setFormData({ ...formData, attach_order: e.target.checked })} className="h-4 w-4 accent-primary-600" />
                    {isEditing ? "Đơn hàng kèm theo công việc này" : "Tạo đơn hàng cùng công việc"}
                </label>

                {formData.attach_order && (
                    <div className="mt-4 space-y-3">
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium">Sản phẩm</th>
                                        <th className="w-20 px-3 py-2 text-right font-medium">SL</th>
                                        <th className="w-32 px-3 py-2 text-right font-medium">Đơn giá</th>
                                        <th className="w-28 px-3 py-2 text-right font-medium">Giảm</th>
                                        <th className="w-32 px-3 py-2 text-right font-medium">Thành tiền</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr><td colSpan={6} className="px-3 py-4 text-center text-gray-400">Chưa có sản phẩm</td></tr>
                                    ) : (
                                        items.map((it) => (
                                            <tr key={it.id} className="border-t border-gray-100 align-top">
                                                <td className="px-3 py-2">
                                                    <select value={it.product_id ?? ""} onChange={(e) => pickProduct(it.id, e.target.value)} className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm">
                                                        <option value="">— Nhập tay —</option>
                                                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.code ? ` (${p.code})` : ""}</option>)}
                                                    </select>
                                                    {!it.product_id && <Input value={it.product_name} onChange={(e) => updateItem(it.id, { product_name: e.target.value })} placeholder="Tên sản phẩm" className="mt-1" />}
                                                </td>
                                                <td className="px-3 py-2"><Input type="number" value={it.quantity} onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })} className="text-right" /></td>
                                                <td className="px-3 py-2"><Input type="number" value={it.unit_price} onChange={(e) => updateItem(it.id, { unit_price: Number(e.target.value) })} className="text-right" /></td>
                                                <td className="px-3 py-2"><Input type="number" value={it.discount_amount} onChange={(e) => updateItem(it.id, { discount_amount: Number(e.target.value) })} className="text-right" /></td>
                                                <td className="px-3 py-2 text-right font-medium text-gray-700">{formatVND(it.quantity * it.unit_price - it.discount_amount)}</td>
                                                <td className="px-3 py-2 text-center"><button type="button" onClick={() => removeItem(it.id)} className="text-gray-400 hover:text-red-500"><FiTrash2 className="h-4 w-4" /></button></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
                            <FiPlus className="h-4 w-4" /> Thêm sản phẩm
                        </button>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Giảm giá đơn hàng">
                                <Input type="number" value={formData.order_discount} onChange={(e) => setFormData({ ...formData, order_discount: Number(e.target.value) })} />
                            </Field>
                            <Field label="Ghi chú đơn hàng">
                                <Input value={formData.order_note} onChange={(e) => setFormData({ ...formData, order_note: e.target.value })} />
                            </Field>
                        </div>

                        <div className="ml-auto w-64 space-y-1 rounded-lg bg-gray-50 p-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Tạm tính</span><span>{formatVND(subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Giảm giá</span><span>-{formatVND(formData.order_discount || 0)}</span></div>
                            <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold"><span>Tổng đơn hàng</span><span className="text-primary-700">{formatVND(total)}</span></div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Công việc con */}
            <Card title="Công việc con" subtitle="Chia nhỏ công việc thành các bước thực hiện">
                <SubJobTimeline subJobs={formData.sub_jobs} onChange={(next) => setFormData({ ...formData, sub_jobs: next })} userOptions={performerOptions} />
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancel} disabled={isSaving}>Hủy</Button>
                <Button onClick={() => void save()} disabled={isSaving}>{isSaving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}</Button>
            </div>
        </div>
    );
}
