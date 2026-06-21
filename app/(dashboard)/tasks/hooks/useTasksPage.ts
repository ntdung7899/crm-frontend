import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
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
    JobApiRow,
    JobTimeRange,
    ProductApiRow,
    StatusApiRow,
    UpdateJobPayload,
    UserApiRow,
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

export function useTasksPage() {
    const [jobs, setJobs] = useState<JobApiRow[]>([]);
    const [users, setUsers] = useState<UserApiRow[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUserApiRow[]>([]);
    const [customers, setCustomers] = useState<CustomerApiRow[]>([]);
    const [statuses, setStatuses] = useState<StatusApiRow[]>([]);
    const [products, setProducts] = useState<ProductApiRow[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobApiRow | null>(null);
    const [selectedJob, setSelectedJob] = useState<JobApiRow | null>(null);
    const [formData, setFormData] = useState<JobFormData>(emptyFormData);
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const toastRef = useStableToastRef();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await jobsService.getJobs({ pageSize: "200" });
            setJobs(response.responseData?.rows ?? []);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải danh sách công việc.";
            toastRef.current.error("Tải dữ liệu thất bại", msg);
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    const loadReferenceData = useCallback(async () => {
        try {
            const [usersRes, adminUsersRes, customersRes, productsRes] = await Promise.all([
                usersService.getUsers({ pageSize: "500" }),
                usersService.getAdminUsers({ pageSize: "500" }),
                customersService.getCustomers({ pageSize: "500" }),
                productsService.getProducts({ pageSize: "500" }).catch(() => null),
            ]);
            setProducts(productsRes?.responseData?.rows ?? []);

            let statusesRes;
            try {
                statusesRes = await statusesService.getStatuses({
                    pageSize: "500",
                    filters: JSON.stringify({ type: "job" }),
                });
            } catch {
                statusesRes = await statusesService.getStatuses({ pageSize: "500" });
            }

            const adminUserRows = adminUsersRes.responseData?.rows ?? [];

            setUsers(usersRes.responseData?.rows ?? []);
            setAdminUsers(adminUserRows.filter(hasWorkerPermission));
            setCustomers(customersRes.responseData?.rows ?? []);
            setStatuses(normalizeJobStatuses(statusesRes.responseData?.rows ?? []));
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải dữ liệu tham chiếu.";
            toastRef.current.error("Tải dữ liệu thất bại", msg);
        }
    }, [toastRef]);

    useEffect(() => {
        void loadJobs();
        void loadReferenceData();
    }, [loadJobs, loadReferenceData]);

    const filteredJobs = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (!normalizedQuery) {
            return jobs;
        }

        return jobs.filter((job) => {
            const statusName = job.status?.name ?? "";
            const note = job.note ?? "";

            return [job.job_name, job.content, note, statusName].some((fieldValue) =>
                fieldValue.toLowerCase().includes(normalizedQuery),
            );
        });
    }, [jobs, searchQuery]);

    const getUserNameById = useCallback(
        (id: string | null | undefined) => {
            if (!id) return null;
            const user = users.find((item) => item.id === id) || adminUsers.find((item) => item.id === id);
            return user ? user.full_name || user.email : `${id.slice(0, 8)}...`;
        },
        [adminUsers, users],
    );

    const getCustomerNameById = useCallback(
        (id: string | null | undefined) => {
            if (!id) return null;
            const customer = customers.find((item) => item.id === id);
            return customer ? buildCustomerLabel(customer) : `${id.slice(0, 8)}...`;
        },
        [customers],
    );

    const getPerformerLabel = useCallback(
        (job: JobApiRow) => {
            return job.performer?.full_name || job.performer?.email || getUserNameById(job.performer_uuid) || "-";
        },
        [getUserNameById],
    );

    const getCustomerLabel = useCallback(
        (job: JobApiRow) => {
            if (job.customer?.full_name) {
                return job.customer.full_name;
            }

            if (job.customer?.last_name || job.customer?.first_name) {
                return `${job.customer.last_name ?? ""} ${job.customer.first_name ?? ""}`.trim();
            }

            return job.customer?.email || getCustomerNameById(job.customer_uuid) || "-";
        },
        [getCustomerNameById],
    );

    const openCreateForm = useCallback(() => {
        setEditingJob(null);
        setEditingOrderId(null);
        setFormData(emptyFormData);
        setIsFormOpen(true);
    }, []);

    const openEditForm = useCallback((job: JobApiRow) => {
        setEditingJob(job);
        setEditingOrderId(null);
        const jt = getFormTimeFromApi(job.job_time);
        setFormData({
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
        });
        setIsFormOpen(true);

        // Nạp đơn hàng hiện có của job (1-1) để cho sửa
        void ordersService
            .getOrders({ job_id: job.id, pageSize: "1" })
            .then((res) => {
                const order = res.responseData?.rows?.[0];
                if (!order) return;
                setEditingOrderId(order.id);
                setFormData((prev) => ({
                    ...prev,
                    attach_order: true,
                    order_discount: Number(order.discount_amount ?? 0),
                    order_note: order.note ?? "",
                    order_items: (order.order_items ?? []).map((it) => ({
                        id: it.id,
                        product_id: it.product_id ?? undefined,
                        product_name: it.product_name,
                        product_code: it.product_code ?? undefined,
                        quantity: it.quantity,
                        unit_price: Number(it.unit_price),
                        discount_amount: Number(it.discount_amount),
                    })),
                }));
            })
            .catch(() => undefined);
    }, []);

    const openDetail = useCallback((job: JobApiRow) => {
        setSelectedJob(job);
        setIsDetailOpen(true);
    }, []);

    const closeDetail = useCallback(() => {
        setIsDetailOpen(false);
    }, []);

    const closeForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingJob(null);
    }, []);

    const buildPayloadTime = useCallback((): JobTimeRange[] => {
        const time: JobTimeRange = {};
        if (formData.job_time.start) time.start = formData.job_time.start;
        if (formData.job_time.end) time.end = formData.job_time.end;
        return Object.keys(time).length ? [time] : [];
    }, [formData.job_time.end, formData.job_time.start]);

    const handleSaveJob = useCallback(async () => {
        if (!formData.job_name.trim() || !formData.content.trim()) {
            toastRef.current.error("Thiếu thông tin", "Vui lòng nhập tên và nội dung công việc.");
            return;
        }

        try {
            if (editingJob) {
                const payload: UpdateJobPayload = {
                    job_name: formData.job_name,
                    content: formData.content,
                    note: formData.note.trim() || undefined,
                    job_time: buildPayloadTime(),
                    performer_uuid: formData.performer_uuid || undefined,
                    customer_uuid: formData.customer_uuid || undefined,
                    status_id: formData.status_id || undefined,
                };
                const response = await jobsService.updateJob(editingJob.id, payload);
                const updated = response.responseData;
                setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? { ...j, ...updated } : j)));
                saveSubJobsForJob(editingJob.id, formData.sub_jobs);

                // Đơn hàng kèm job (1-1): tạo / cập nhật / xoá
                try {
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
                    if (formData.attach_order && validItems.length > 0) {
                        if (editingOrderId) await ordersService.updateOrder(editingOrderId, orderBody);
                        else await ordersService.createOrder({ job_id: editingJob.id, customer_uuid: formData.customer_uuid || undefined, ...orderBody });
                    } else if (editingOrderId) {
                        await ordersService.deleteOrder(editingOrderId);
                    }
                } catch (orderErr) {
                    toastRef.current.warning("Đơn hàng chưa lưu", orderErr instanceof Error ? orderErr.message : "Không thể cập nhật đơn hàng kèm theo.");
                }

                toastRef.current.success("Cập nhật thành công", `Công việc "${formData.job_name}" đã được cập nhật.`);
            } else {
                const validItems = formData.order_items.filter((it) => it.product_name.trim());
                const payload: CreateJobPayload[] = [
                    {
                        job_name: formData.job_name,
                        content: formData.content,
                        note: formData.note.trim() || undefined,
                        job_time: buildPayloadTime(),
                        performer_uuid: formData.performer_uuid || undefined,
                        customer_uuid: formData.customer_uuid || undefined,
                    },
                ];
                const response = await jobsService.createJobs(payload);
                const created = response.responseData ?? [];
                if (created[0]) {
                    if (formData.sub_jobs.length > 0) {
                        saveSubJobsForJob(created[0].id, formData.sub_jobs);
                    }
                    if (formData.attach_order && validItems.length > 0) {
                        try {
                            const orderBody = {
                                job_id: created[0].id,
                                customer_uuid: formData.customer_uuid || undefined,
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
                            await ordersService.createOrder(orderBody);
                        } catch (orderErr) {
                            toastRef.current.warning("Đơn hàng chưa lưu", orderErr instanceof Error ? orderErr.message : "Không thể tạo đơn hàng kèm theo.");
                        }
                    }
                }
                setJobs((prev) => [...created, ...prev]);
                toastRef.current.success("Tạo thành công", `Công việc "${formData.job_name}" đã được tạo.`);
            }
            setIsFormOpen(false);
            setEditingJob(null);
            setFormData(emptyFormData);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể lưu công việc.";
            toastRef.current.error("Lưu thất bại", msg);
        }
    }, [buildPayloadTime, editingJob, editingOrderId, formData, toastRef]);

    const handleDeleteJob = useCallback(async (job: JobApiRow) => {
        try {
            await jobsService.deleteJob(job.id);
            setJobs((prev) => prev.filter((j) => j.id !== job.id));
            saveSubJobsForJob(job.id, []);
            toastRef.current.success("Xóa thành công", `Công việc "${job.job_name}" đã bị xóa.`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể xóa công việc.";
            toastRef.current.error("Xóa thất bại", msg);
        }
    }, [toastRef]);

    const handleRequestDeleteJob = useCallback(
        (job: JobApiRow) => {
            requestDeleteConfirmation({
                title: "Xóa công việc",
                description: `Bạn có chắc chắn muốn xóa công việc "${job.job_name}"? Hành động này không thể hoàn tác.`,
                onConfirm: async () => {
                    await handleDeleteJob(job);
                },
            });
        },
        [handleDeleteJob, requestDeleteConfirmation],
    );

    const performerOptions = useMemo(
        () => adminUsers.map((u) => ({ value: u.id, label: u.full_name || u.email })),
        [adminUsers],
    );
    const customerOptions = useMemo(
        () =>
            customers.map((customer) => ({
                value: customer.id,
                label: buildCustomerLabel(customer),
            })),
        [customers],
    );
    const statusOptions = useMemo(
        () =>
            statuses.map((status) => ({
                value: status.id,
                label: status.name,
            })),
        [statuses],
    );

    const updateJobStatus = useCallback(async (jobId: string, statusId: string) => {
        try {
            await jobsService.updateJob(jobId, { status_id: statusId });
            const targetStatus = statuses.find((s) => s.id === statusId);
            setJobs((prev) =>
                prev.map((j) => (j.id === jobId ? { ...j, status_id: statusId, status: targetStatus } : j)),
            );
            toastRef.current.success("Cập nhật thành công", "Đã cập nhật trạng thái công việc.");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể cập nhật trạng thái.";
            toastRef.current.error("Lỗi", msg);
        }
    }, [statuses, toastRef]);

    return {
        isLoading,
        searchQuery,
        setSearchQuery,
        filteredJobs,
        statuses,
        isFormOpen,
        isDetailOpen,
        editingJob,
        selectedJob,
        formData,
        setFormData,
        getUserNameById,
        getPerformerLabel,
        getCustomerLabel,
        openCreateForm,
        openEditForm,
        openDetail,
        closeDetail,
        closeForm,
        handleSaveJob,
        handleRequestDeleteJob,
        performerOptions,
        customerOptions,
        statusOptions,
        products,
        DeleteConfirmationDialog,
        updateJobStatus,
    };
}
