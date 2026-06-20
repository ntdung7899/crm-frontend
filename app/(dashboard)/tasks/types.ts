export type SubJobStatus = "todo" | "in_progress" | "done" | "blocked";

export interface SubJob {
    id: string;
    name: string;
    due_date?: string;
    owner_ids: string[];
    status: SubJobStatus;
}

export interface JobOrderItemForm {
    id: string;
    product_id?: string;
    product_name: string;
    product_code?: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
}

export interface JobFormData {
    job_name: string;
    content: string;
    note: string;
    job_time: { start?: string; end?: string };
    performer_uuid: string;
    customer_uuid: string;
    status_id: string;
    sub_jobs: SubJob[];
    // Đơn hàng kèm job (1-1, chỉ khi tạo mới)
    attach_order: boolean;
    order_discount: number;
    order_note: string;
    order_items: JobOrderItemForm[];
}

export const emptyFormData: JobFormData = {
    job_name: "",
    content: "",
    note: "",
    job_time: {},
    performer_uuid: "",
    customer_uuid: "",
    status_id: "",
    sub_jobs: [],
    attach_order: false,
    order_discount: 0,
    order_note: "",
    order_items: [],
};
