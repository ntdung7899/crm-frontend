import { apiClient } from "@/lib/api-client";
import {
    GetMyInfoResponse,
    GetUsersResponse,
    GetAdminUsersResponse,
    GetUserResponse,
    CreateUsersResponse,
    UpdateUserResponse,
    DeleteUserResponse,
    GetCustomersResponse,
    CustomerCountResponse,
    CustomerCountPayload,
    CustomerTagStatResponse,
    CustomerTagStatItem,
    ImportUsersResponse,
    ExportUsersPayload,
    CreateUserPayload,
    UpdateUserPayload,
    CreateAdminPayload,
    CreateAdminUsersResponse,
    PaginatedParams,
    RequestDeleteOtpPayload,
    RequestDeleteOtpResponse,
    ConfirmDeleteUserPayload,
    ConfirmDeleteUserResponse,
} from "@/types/api";

const USERS_ENDPOINT = "/api/v1.0/users";
const USERS_MY_INFO_ENDPOINT = "/api/v1.0/users/getMyInfo";
const USERS_CUSTOMER_ENDPOINT = "/api/v1.0/users/customer";
const USERS_CUSTOMER_COUNT_ENDPOINT = "/api/v1.0/users/customerCount";
const USERS_CUSTOMER_TAG_STAT_ENDPOINT = "/api/v1.0/users/customerTagStatistic";
const USERS_EXPORT_ENDPOINT = "/api/v1.0/users/export";
const USERS_IMPORT_ENDPOINT = "/api/v1.0/users/import";
const USERS_ADMIN_ENDPOINT = "/api/v1.0/users/my_emloyee";
const USERS_REQUEST_DELETE_OTP_ENDPOINT = "/api/v1.0/users/requestDeleteOTP";
const USERS_CONFIRM_DELETE_ENDPOINT = "/api/v1.0/users/confirmDeleteUser";

export const usersService = {
    async getMyInfo(): Promise<GetMyInfoResponse> {
        return apiClient.get<GetMyInfoResponse>(USERS_MY_INFO_ENDPOINT);
    },

    async getUsers(params?: PaginatedParams): Promise<GetUsersResponse> {
        return apiClient.get<GetUsersResponse>(USERS_ENDPOINT, params);
    },

    async getUser(id: string): Promise<GetUserResponse> {
        return apiClient.get<GetUserResponse>(`${USERS_ENDPOINT}/${id}`);
    },

    async createUsers(users: CreateUserPayload[]): Promise<CreateUsersResponse> {
        return apiClient.post<CreateUsersResponse>(USERS_ENDPOINT, users);
    },

    async updateUser(id: string, data: UpdateUserPayload): Promise<UpdateUserResponse> {
        return apiClient.put<UpdateUserResponse>(`${USERS_ENDPOINT}/${id}`, data);
    },

    async deleteUser(id: string): Promise<DeleteUserResponse> {
        return apiClient.delete<DeleteUserResponse>(`${USERS_ENDPOINT}/${id}`);
    },

    async getCustomers(params?: PaginatedParams): Promise<GetCustomersResponse> {
        return apiClient.get<GetCustomersResponse>(USERS_CUSTOMER_ENDPOINT, params);
    },

    async getCustomerCount(payload?: CustomerCountPayload): Promise<CustomerCountResponse> {
        return apiClient.post<CustomerCountResponse>(USERS_CUSTOMER_COUNT_ENDPOINT, payload);
    },

    async getCustomerTagStatistic(payload?: CustomerCountPayload): Promise<CustomerTagStatResponse> {
        return apiClient.post<CustomerTagStatResponse>(USERS_CUSTOMER_TAG_STAT_ENDPOINT, payload);
    },

    async exportUsers(payload?: ExportUsersPayload): Promise<Blob> {
        return apiClient.downloadBlob(USERS_EXPORT_ENDPOINT, payload);
    },

    async importUsers(file: File): Promise<ImportUsersResponse> {
        return apiClient.upload<ImportUsersResponse>(USERS_IMPORT_ENDPOINT, file);
    },

    async getAdminUsers(params?: PaginatedParams): Promise<GetAdminUsersResponse> {
        return apiClient.get<GetAdminUsersResponse>(USERS_ADMIN_ENDPOINT, params);
    },

    async createAdminUsers(users: CreateAdminPayload[], code: string): Promise<CreateAdminUsersResponse> {
        return apiClient.post<CreateAdminUsersResponse>(`${USERS_ADMIN_ENDPOINT}?code=${encodeURIComponent(code)}`, users);
    },

    async requestDeleteOtp(payload: RequestDeleteOtpPayload): Promise<RequestDeleteOtpResponse> {
        return apiClient.post<RequestDeleteOtpResponse>(USERS_REQUEST_DELETE_OTP_ENDPOINT, payload);
    },

    async confirmDeleteUser(payload: ConfirmDeleteUserPayload): Promise<ConfirmDeleteUserResponse> {
        return apiClient.post<ConfirmDeleteUserResponse>(USERS_CONFIRM_DELETE_ENDPOINT, payload);
    },
};
