import { apiClient } from "@/lib/api-client";
import type {
    CreateOrderPayload,
    CreateOrderResponse,
    DeleteOrderResponse,
    GetOrderResponse,
    GetOrdersResponse,
    UpdateOrderPayload,
    UpdateOrderResponse,
} from "@/types/api";

const ORDERS_ENDPOINT = "/api/v1.0/orders";

interface GetOrdersParams {
    currentPage?: number | string;
    pageSize?: number | string;
    status?: "pending" | "processing" | "completed" | "cancelled";
    keyword?: string;
    job_id?: string;
}

export const ordersService = {
    getOrders(params: GetOrdersParams = {}): Promise<GetOrdersResponse> {
        return apiClient.get<GetOrdersResponse>(ORDERS_ENDPOINT, params);
    },
    getOrder(id: string): Promise<GetOrderResponse> {
        return apiClient.get<GetOrderResponse>(`${ORDERS_ENDPOINT}/${id}`);
    },
    createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
        return apiClient.post<CreateOrderResponse>(ORDERS_ENDPOINT, payload);
    },
    updateOrder(id: string, payload: UpdateOrderPayload): Promise<UpdateOrderResponse> {
        return apiClient.put<UpdateOrderResponse>(`${ORDERS_ENDPOINT}/${id}`, payload);
    },
    deleteOrder(id: string): Promise<DeleteOrderResponse> {
        return apiClient.delete<DeleteOrderResponse>(`${ORDERS_ENDPOINT}/${id}`);
    },
};
