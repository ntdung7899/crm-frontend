import { apiClient } from "@/lib/api-client";
import type {
    CreateProductPayload,
    CreateProductResponse,
    DeleteProductResponse,
    GetProductResponse,
    GetProductsResponse,
    UpdateProductPayload,
    UpdateProductResponse,
} from "@/types/api";

const PRODUCTS_ENDPOINT = "/api/v1.0/products";

interface GetProductsParams {
    currentPage?: number | string;
    pageSize?: number | string;
    status?: "active" | "inactive";
    keyword?: string;
}

export const productsService = {
    getProducts(params: GetProductsParams = {}): Promise<GetProductsResponse> {
        return apiClient.get<GetProductsResponse>(PRODUCTS_ENDPOINT, params);
    },
    getProduct(id: string): Promise<GetProductResponse> {
        return apiClient.get<GetProductResponse>(`${PRODUCTS_ENDPOINT}/${id}`);
    },
    createProduct(payload: CreateProductPayload): Promise<CreateProductResponse> {
        return apiClient.post<CreateProductResponse>(PRODUCTS_ENDPOINT, payload);
    },
    updateProduct(id: string, payload: UpdateProductPayload): Promise<UpdateProductResponse> {
        return apiClient.put<UpdateProductResponse>(`${PRODUCTS_ENDPOINT}/${id}`, payload);
    },
    deleteProduct(id: string): Promise<DeleteProductResponse> {
        return apiClient.delete<DeleteProductResponse>(`${PRODUCTS_ENDPOINT}/${id}`);
    },
};
