"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { customersService } from "@/services/customers";
import { jobsService } from "@/services/jobs";
import { ordersService } from "@/services/orders";
import { productsService } from "@/services/products";
import { statusesService } from "@/services/statuses";
import { usersService } from "@/services/users";
import {
    AdminUserApiRow,
    CreateJobPayload,
    CustomerApiRow,
    JobTimeRange,
    ProductApiRow,
    StatusApiRow,
} from "@/types/api";
import { emptyFormData, JobFormData } from "../types";
import {
    buildCustomerLabel,
    getFormTimeFromApi,
    hasWorkerPermission,
    loadSubJobsForJob,
    normalizeJobStatuses,
    saveSubJobsForJob,
    toDateTimeLocal,
} from "../utils/tasksHelpers";

export function useTaskForm(jobId?: string) {
    const router = useRouter();
    const toastRef = useStableToastRef();
    const isEditing = Boolean(jobId);

    const [adminUsers, setAdminUsers] = useState<AdminUserApiRow[]>([]);
    const [customers, setCustomers] = useState<CustomerApiRow[]>([]);
    const [statuses, setStatuses] = useState<StatusApiRow[]>([]);
    const [products, setProducts] = useState<ProductApiRow[]>([]);
    const [formData, setFormData] = useState<JobFormData>(emptyFormData);
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let disposed = false;
        (async () => {
            setIsLoading(true);
            try {
                const [adminRes, custRes, prodRes] = await Promise.all([
                    usersService.getAdminUsers({ pageSize: "500" }),
                    customersService.getCustomers({ pageSize: "500" }),
                    productsService.getProducts({ pageSize: "500" }).catch(() => null),
                ]);
                let statusRes;
                try {
                    statusRes = await statusesService.getStatuses({ pageSize: "500", filters: JSON.stringify({ type: "job" }) });
                } catch {
                    statusRes = await statusesService.getStatuses({ pageSize: "500" });
                }
                if (disposed) return;
                setAdminUsers((adminRes.responseData?.rows ?? []).filter(hasWorkerPermission));
                setCustomers(custRes.responseData?.rows ?? []);
                setStatuses(normalizeJobStatuses(statusRes.responseData?.rows ?? []));
                setProducts(prodRes?.responseData?.rows ?? []);

                if (jobId) {
                    const job = (await jobsService.getJob(jobId)).responseData;
                    if (job && !disposed) {
                        const jt = getFormTimeFromApi(job.job_time);
                        const base: JobFormData = {
                            job_name: job.job_name,
                            content: job.content,
                            note: job.note ?? "",
                            job_time: { start: toDateTimeLocal(jt.start), end: toDateTimeLocal(jt.end) },
                            performer_uuid: job.performer?.id ?? job.performer_uuid ?? "",
                            customer_uuid: job.customer?.id ?? job.customer_uuid ?? "",
                            status_id: job.status?.id ?? job.status_id ?? "",
                            sub_jobs: loadSubJobsForJob(job.id),
                            attach_order: false,
                            order_discount: 0,
                            order_note: "",
                            order_items: [],
                        };
                        try {
                            const order = (await ordersService.getOrders({ job_id: jobId, pageSize: "1" })).responseData?.rows?.[0];
                            if (order) {
                                setEditingOrderId(order.id);
                                base.attach_order = true;
                                base.order_discount = Number(order.discount_amount ?? 0);
                                base.order_note = order.note ?? "";
                                base.order_items = (order.order_items ?? []).map((it) => ({
                                    id: it.id,
                                    product_id: it.product_id ?? undefined,
                                    product_name: it.product_name,
                                    product_code: it.product_code ?? undefined,
                                    quantity: it.quantity,
                                    unit_price: Number(it.unit_price),
                                    discount_amount: Number(it.discount_amount),
                                }));
                            }
                        } catch {
                            // bỏ qua nếu không có đơn hàng
                        }
                        if (!disposed) setFormData(base);
                    }
                }
            } catch (e) {
                toastRef.current.error("Tải dữ liệu thất bại", e instanceof Error ? e.message : "Vui lòng thử lại.");
            } finally {
                if (!disposed) setIsLoading(false);
            }
        })();
        return () => { disposed = true; };
    }, [jobId, toastRef]);

    const performerOptions = useMemo(() => adminUsers.map((u) => ({ value: u.id, label: u.full_name || u.email })), [adminUsers]);
    const customerOptions = useMemo(() => customers.map((c) => ({ value: c.id, label: buildCustomerLabel(c) })), [customers]);
    const statusOptions = useMemo(() => statuses.map((s) => ({ value: s.id, label: s.name })), [statuses]);

    const save = useCallback(async () => {
        if (!formData.job_name.trim() || !formData.content.trim()) {
            toastRef.current.error("Thiếu thông tin", "Vui lòng nhập tên và nội dung công việc.");
            return;
        }

        const buildTime = (): JobTimeRange[] => {
            const t: JobTimeRange = {};
            if (formData.job_time.start) t.start = formData.job_time.start;
            if (formData.job_time.end) t.end = formData.job_time.end;
            return Object.keys(t).length ? [t] : [];
        };
        const validItems = formData.order_items.filter((it) => it.product_name.trim());
        const orderBody = {
            discount_amount: formData.order_discount || undefined,
            note: formData.order_note.trim() || undefined,
            status: "pending" as const,
            items: validItems.map((it) => ({
                product_id: it.product_id || undefined,
                product_name: it.product_name.trim(),
                product_code: it.product_code || undefined,
                quantity: it.quantity,
                unit_price: it.unit_price,
                discount_amount: it.discount_amount || undefined,
            })),
        };
        const hasOrder = formData.attach_order && validItems.length > 0;

        setIsSaving(true);
        try {
            if (jobId) {
                await jobsService.updateJob(jobId, {
                    job_name: formData.job_name,
                    content: formData.content,
                    note: formData.note.trim() || undefined,
                    job_time: buildTime(),
                    performer_uuid: formData.performer_uuid || undefined,
                    customer_uuid: formData.customer_uuid || undefined,
                    status_id: formData.status_id || undefined,
                });
                saveSubJobsForJob(jobId, formData.sub_jobs);
                try {
                    if (hasOrder) {
                        if (editingOrderId) await ordersService.updateOrder(editingOrderId, orderBody);
                        else await ordersService.createOrder({ job_id: jobId, customer_uuid: formData.customer_uuid || undefined, ...orderBody });
                    } else if (editingOrderId) {
                        await ordersService.deleteOrder(editingOrderId);
                    }
                } catch (oe) {
                    toastRef.current.warning("Đơn hàng chưa lưu", oe instanceof Error ? oe.message : "Không thể cập nhật đơn hàng kèm theo.");
                }
                toastRef.current.success("Cập nhật thành công", `Công việc "${formData.job_name}" đã được cập nhật.`);
            } else {
                const payload: CreateJobPayload[] = [{
                    job_name: formData.job_name,
                    content: formData.content,
                    note: formData.note.trim() || undefined,
                    job_time: buildTime(),
                    performer_uuid: formData.performer_uuid || undefined,
                    customer_uuid: formData.customer_uuid || undefined,
                    ...(hasOrder ? { order: orderBody } : {}),
                }];
                const created = (await jobsService.createJobs(payload)).responseData?.[0];
                if (created && formData.sub_jobs.length > 0) saveSubJobsForJob(created.id, formData.sub_jobs);
                toastRef.current.success("Tạo thành công", `Công việc "${formData.job_name}" đã được tạo.`);
            }
            router.push("/tasks");
        } catch (e) {
            toastRef.current.error("Lưu thất bại", e instanceof Error ? e.message : "Không thể lưu công việc.");
        } finally {
            setIsSaving(false);
        }
    }, [editingOrderId, formData, jobId, router, toastRef]);

    return {
        isEditing,
        isLoading,
        isSaving,
        formData,
        setFormData,
        performerOptions,
        customerOptions,
        statusOptions,
        products,
        save,
        cancel: () => router.push("/tasks"),
    };
}
