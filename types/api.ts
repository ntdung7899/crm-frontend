import { Contact, Company, Deal, Task } from "./index";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterParams {
  search?: string;
  status?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type ApiResponse<T> =
  | {
    success: true;
    data: T;
  }
  | {
    success: false;
    error: string;
    message: string;
  };

export interface ContactsFilters
  extends FilterParams, SortParams, PaginationParams {
  companyId?: string;
}

export interface CompaniesFilters
  extends FilterParams, SortParams, PaginationParams {
  industry?: string;
  size?: string;
}

export interface DealsFilters
  extends FilterParams, SortParams, PaginationParams {
  stage?: string;
  ownerId?: string;
  minValue?: number;
  maxValue?: number;
}

export interface TasksFilters
  extends FilterParams, SortParams, PaginationParams {
  assignedTo?: string;
  priority?: string;
  relatedToType?: string;
  relatedToId?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface UpdatePasswordPayload {
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  expiresIn: string;
  refreshToken: string;
}

export interface RefreshAccessTokenPayload {
  refreshToken: string;
}

export interface RefreshAccessTokenData {
  accessToken: string;
  expiresIn: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterUserResponse {
  id: string;
  is_active: boolean;
  is_delete: boolean;
  full_name: string;
  email: string;
  phone: string;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  avatar: string | null;
  birthday: string | null;
}

export interface PermissionInfo {
  id: string;
  name: string;
  code: string;
  description: string;
  group_code: string;
}

export interface UserPermissionData {
  id: string;
  user_id: string;
  permision_id: string;
  updated_at: string | null;
  updated_by: string | null;
  permision: PermissionInfo;
}

export interface MyInfoResponseData {
  id: string;
  email: string;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  full_name: string;
  phone: string;
  avatar: string | null;
  is_active: boolean;
  birthday: string | null;
  is_delete: boolean;
  user_permisions?: UserPermissionData[];
}

export interface NotificationApiRow {
  id: string;
  title: string;
  content: string;
  category: string;
  sub_category: string | null;
  belongs_to_user_id: string;
  has_user_read: boolean;
  sent_time: string | null;
  has_noti_sent: boolean;
  expired_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotificationsResponseData {
  count: number;
  rows: NotificationApiRow[];
  totalPages: number;
  currentPage: number;
}

export interface ApiEnvelope<T> {
  message: string;
  message_en: string;
  responseData: T;
  status: string;
  timeStamp: string;
  violations: Record<string, string[]> | null;
}

// ── OTP / Forgot Password ──────────────────────────────────────────
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

// ── Paginated list helpers ─────────────────────────────────────────
export interface PaginatedParams {
  currentPage?: string;
  pageSize?: string;
  filters?: string;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaginatedRows<T> {
  count: number;
  rows: T[];
  totalPages: number;
  currentPage: number;
}

// ── Users ──────────────────────────────────────────────────────────
export interface UserApiRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar: string | null;
  birthday: string | null;
  is_active: boolean;
  is_delete: boolean;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  tags?: string[];
}

export interface AdminUserPermissionApiRow {
  id: string;
  permision: {
    id: string;
    name: string;
  };
}

export interface AdminUserApiRow extends UserApiRow {
  user_permisions: AdminUserPermissionApiRow[];
}

export interface CreateUserPayload {
  email: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  birthday?: string;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  birthday?: string;
  is_active?: boolean;
}

export interface CustomerApiRow {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  company_establish_date: string | null;
  description: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  gender: string | null;
  day_of_birth: string | null;
  major: string | null;
  id_no: string | null;
  id_issued_by: string | null;
  id_issued_date: string | null;
  id_issued_place: string | null;
  type: string;
  tax_code: string | null;
  note: string | null;
  full_name: string | null;
  assigned_user_id?: string | null;
  assigned_users?: Array<{
    id: string;
    full_name: string;
  }>;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  is_active: boolean;
  is_delete: boolean;
  customer_source_id: string | null;
  tags?: string[];
  /** Tài liệu đính kèm. BE có thể trả về 1 object hoặc mảng. */
  file?: CustomerFileRef[] | CustomerFileRef | null;
}

/** Tham chiếu file đính kèm của khách hàng (lưu qua PUT /customers/:id). */
export interface CustomerFileRef {
  url: string;
  name: string;
}

export interface CreateCustomerPayload {
  first_name: string;
  last_name: string;
  description: string;
  type: string;
  company_name?: string;
  company_establish_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  gender?: string;
  day_of_birth?: string;
  major?: string;
  id_no?: string;
  id_issued_by?: string;
  id_issued_date?: string;
  id_issued_place?: string;
  tax_code?: string;
  note?: string;
  full_name?: string;
  assigned_user_id?: string;
  created_at?: string;
  is_active?: boolean;
}

export interface UpdateCustomerPayload {
  first_name?: string;
  last_name?: string;
  description?: string;
  type?: string;
  company_name?: string;
  company_establish_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  gender?: string;
  day_of_birth?: string;
  major?: string;
  id_no?: string;
  id_issued_by?: string;
  id_issued_date?: string;
  id_issued_place?: string;
  tax_code?: string;
  note?: string;
  full_name?: string;
  assigned_user_id?: string | null;
  is_active?: boolean;
  /** Danh sách tài liệu đính kèm. */
  file?: CustomerFileRef[];
}

export interface CustomerAssignedUserCustomerRef {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
}

export interface CustomerAssignedUserRef {
  id: string;
  full_name: string;
}

export interface CustomerAssignedUserApiRow {
  id: string;
  customer_id: string;
  assigned_user_id: string;
  created_at: string | null;
  created_by: string | null;
  customer?: CustomerAssignedUserCustomerRef | null;
  assigned_user?: CustomerAssignedUserRef | null;
}

export interface SetCustomerAssignedUsersPayload {
  customer_id: string;
  assigned_user_ids: string[];
}

export interface UpdateCustomerAssignedUserPayload {
  customer_id?: string;
  assigned_user_id?: string;
}

export interface ExportCustomersPayload {
  start_date?: string;
  end_date?: string;
  assigned_user_id?: string;
  type?: string;
  is_active?: boolean;
}

export interface CustomerImportError {
  row: number;
  email?: string;
  message: string;
}

export interface ImportCustomersResult {
  totalRows: number;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  errors: CustomerImportError[];
  expectedColumns: string[];
}

export interface CustomerCountPayload {
  start_date?: string;
  end_date?: string;
  permision_name?: string;
  tag_name?: string;
}

export interface CustomerTagStatItem {
  tag_name: string;
  count: number;
}

export interface ExportUsersPayload {
  start_date?: string;
  end_date?: string;
  permission_id?: string;
}

export interface ImportUsersResult {
  created: number;
  updated: number;
  errors: string[];
}

export interface CreateAdminPayload {
  email: string;
  full_name?: string;
  phone?: string;
  password: string;
}

export interface CreateAdminUserRow {
  id: string;
  user_id: string;
  permision_id: string;
  updated_at: string | null;
  updated_by: string | null;
}

export type CreateAdminUsersResponse = ApiEnvelope<CreateAdminUserRow[]>;

// ── Tags ───────────────────────────────────────────────────────────
export interface TagApiRow {
  id: string;
  name: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: string | null;
  created_by: string | null;
}

export interface CreateTagPayload {
  name: string;
}

export interface UpdateTagPayload {
  name?: string;
  is_active?: boolean;
}

// ── Customer Tags ──────────────────────────────────────────────────
export interface CustomerTagApiRow {
  id: string;
  customer_id: string;
  tag_id: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: string | null;
  created_by: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface CreateCustomerTagPayload {
  customer_id: string;
  tag_id: string;
}

export interface UpdateCustomerTagPayload {
  customer_id?: string;
  tag_id?: string;
  is_active?: boolean;
}

// ── User Tags ──────────────────────────────────────────────────────
export interface UserTagApiRow {
  id: string;
  user_id: string;
  tag_id: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: string | null;
}

export interface CreateUserTagPayload {
  user_id: string;
  tag_id: string;
}

export interface UpdateUserTagPayload {
  user_id?: string;
  tag_id?: string;
  is_active?: boolean;
}

// ── Permissions ────────────────────────────────────────────────────
export interface PermissionApiRow {
  id: string;
  name: string;
  code: string;
  description: string;
  group_code: string;
}

export interface JobTimeRange {
  start?: string;
  end?: string;
}

export interface CreatePermissionPayload {
  name: string;
  code: string;
  description?: string;
  group_code?: string;
}

export interface UpdatePermissionPayload {
  name?: string;
  code?: string;
  description?: string;
  group_code?: string;
}

// ── Status ────────────────────────────────────────────────────────
export interface StatusApiRow {
  id: string;
  name: string;
  code: string;
  type: string;
  description: string | null;
  is_active?: boolean;
  is_delete?: boolean;
  created_at?: string | null;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
}

// ── Jobs ───────────────────────────────────────────────────────────
export interface JobPerformerRef {
  id: string;
  full_name: string | null;
  email: string | null;
}

export interface JobCustomerRef {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface JobApiRow {
  id: string;
  job_name: string;
  job_time: JobTimeRange[] | JobTimeRange | null;
  content: string;
  note: string | null;
  progress: number | null;
  performer_uuid?: string | null;
  customer_uuid?: string | null;
  status_id?: string | null;
  performer?: JobPerformerRef | null;
  customer?: JobCustomerRef | null;
  status?: StatusApiRow | null;
  created_by: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateJobPayload {
  job_name: string;
  job_time: JobTimeRange[] | JobTimeRange;
  content: string;
  note?: string;
  progress?: number;
  performer_uuid?: string;
  customer_uuid?: string;
  /** Tạo đơn hàng kèm job (quan hệ 1-1). job_id tự gắn từ job vừa tạo. */
  order?: {
    customer_uuid?: string;
    discount_amount?: number;
    note?: string;
    status?: OrderApiRow["status"];
    items?: OrderItemPayload[];
  };
}

export interface UpdateJobPayload {
  job_name?: string;
  job_time?: JobTimeRange[] | JobTimeRange;
  content?: string;
  note?: string;
  progress?: number;
  performer_uuid?: string;
  customer_uuid?: string;
  status_id?: string;
}

// ── User History ───────────────────────────────────────────────────
export interface UserHistoryApiRow {
  id: string;
  user_id: string;
  title: string;
  note: string;
  created_at: string | null;
  created_by: string | null;
  user?: { full_name: string };
}

export interface CreateUserHistoryPayload {
  user_id: string;
  title: string;
  note: string;
}

export interface UpdateUserHistoryPayload {
  title?: string;
  note?: string;
}

// ── Files ──────────────────────────────────────────────────────────
export interface FilesListResponse {
  images: string[];
  videos: string[];
  files: string[];
}

export interface FileUploadResponse {
  fileName: string;
  contentType?: string;
  /** Đường dẫn tương đối của file đã upload, ví dụ "/images/file-xxx.png" */
  original: string;
}

// ── Newsfeed / Posts ────────────────────────────────────────────────
export interface PostsEnvelope<T> {
  status: string;
  responseData: T;
  message?: string;
  message_en?: string;
  timeStamp?: string;
  violations?: Record<string, string[]> | null;
}

export interface PostRows<T> {
  rows: T[];
  count: number;
}

export interface PostAuthorApiRow {
  id: string;
  full_name: string;
  avatar: string | null;
}

export type ReactionTypeApi = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

export interface PostInteractionApiRow {
  id: string;
  post_id?: string;
  user_id: string;
  interaction_type: "REACTION" | "COMMENT";
  reaction_type?: ReactionTypeApi | null;
  content?: string | null;
  parent_comment_id?: string | null;
  status?: string;
  created_at: string | null;
  updated_at?: string | null;
  user?: PostAuthorApiRow | null;
}

export interface PostApiRow {
  id: string;
  title: string | null;
  content: string;
  thumbnail_url: string | null;
  media_urls: string[] | null;
  status: "active" | "inactive";
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  created_by_user?: PostAuthorApiRow | null;
  post_interactions?: PostInteractionApiRow[];
  view_permission_ids?: string[] | null;
}

export interface CreatePostPayload {
  title?: string;
  content: string;
  view_permission_ids?: string[];
  thumbnail_url?: string | null;
  media_urls?: string[];
}

export interface UpdatePostPayload {
  title?: string;
  content?: string;
  thumbnail_url?: string | null;
  media_urls?: string[];
  status?: "active" | "inactive";
  view_permission_ids?: string[];
}

export interface CreatePostInteractionPayload {
  interaction_type: "REACTION" | "COMMENT";
  /** Bắt buộc khi interaction_type = "REACTION" */
  reaction_type?: ReactionTypeApi;
  /** Bắt buộc khi interaction_type = "COMMENT" */
  content?: string;
  /** ID comment cha khi trả lời bình luận */
  parent_comment_id?: string;
}

export interface DeletePostInteractionPayload {
  interaction_id?: string;
}

export interface UpdatePostInteractionPayload {
  interaction_id: string;
  reaction_type?: ReactionTypeApi;
  content?: string;
}

// ── Products ────────────────────────────────────────────────────────
export interface ProductApiRow {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  content: string | null;
  thumbnail_url: string | null;
  media_urls: string[] | null;
  price: number | string;
  original_price: number | string | null;
  stock_quantity: number;
  status: "active" | "inactive";
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  created_by_user?: PostAuthorApiRow | null;
}

export interface CreateProductPayload {
  name: string;
  code?: string;
  description?: string;
  content?: string;
  thumbnail_url?: string | null;
  media_urls?: string[];
  price: number;
  original_price?: number;
  stock_quantity?: number;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  status?: "active" | "inactive";
}

export type GetProductsResponse = ApiEnvelope<PaginatedRows<ProductApiRow>>;
export type GetProductResponse = ApiEnvelope<ProductApiRow>;
export type CreateProductResponse = ApiEnvelope<ProductApiRow>;
export type UpdateProductResponse = ApiEnvelope<ProductApiRow>;
export type DeleteProductResponse = ApiEnvelope<null>;

// ── Orders ──────────────────────────────────────────────────────────
export interface OrderItemApiRow {
  id: string;
  order_id?: string;
  product_id: string | null;
  product_name: string;
  product_code: string | null;
  quantity: number;
  unit_price: number | string;
  discount_amount: number | string;
  total_price: number | string;
  note?: string | null;
  product?: { id: string; name: string; code: string | null; thumbnail_url: string | null } | null;
}

export interface OrderApiRow {
  id: string;
  order_code: string;
  job_id: string | null;
  customer_uuid: string | null;
  subtotal_amount: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  status: "pending" | "processing" | "completed" | "cancelled";
  note: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at?: string | null;
  customer_uu?: { id: string; full_name: string | null; phone: string | null; email?: string | null } | null;
  created_by_user?: PostAuthorApiRow | null;
  order_items?: OrderItemApiRow[];
}

export interface OrderItemPayload {
  product_id?: string;
  product_name: string;
  product_code?: string;
  quantity?: number;
  unit_price?: number;
  discount_amount?: number;
  note?: string;
}

export interface CreateOrderPayload {
  job_id: string;
  customer_uuid?: string;
  discount_amount?: number;
  note?: string;
  status?: OrderApiRow["status"];
  items?: OrderItemPayload[];
}

export interface UpdateOrderPayload {
  customer_uuid?: string;
  discount_amount?: number;
  note?: string;
  status?: OrderApiRow["status"];
  items?: OrderItemPayload[];
}

export type GetOrdersResponse = ApiEnvelope<PaginatedRows<OrderApiRow>>;
export type GetOrderResponse = ApiEnvelope<OrderApiRow>;
export type CreateOrderResponse = ApiEnvelope<OrderApiRow>;
export type UpdateOrderResponse = ApiEnvelope<OrderApiRow>;
export type DeleteOrderResponse = ApiEnvelope<null>;

// ── Logs ───────────────────────────────────────────────────────────
export interface LogsResponse {
  apis: Record<string, Record<string, string>>;
  sourceGroup: Record<string, Record<string, string>>;
}

// ── Create Notification ────────────────────────────────────────────
export interface CreateNotificationPayload {
  title: string;
  content: string;
  category?: string;
  sub_category?: string;
  belongs_to_user_id?: string | null;
  expired_at?: string;
}

// ── Response type aliases ──────────────────────────────────────────
export type LoginResponse = ApiEnvelope<AuthTokenResponse>;
export type RegisterResponse = ApiEnvelope<RegisterUserResponse>;
export type VerifyOtpResponse = ApiEnvelope<AuthTokenResponse>;
export type ResendOtpResponse = ApiEnvelope<null>;
export type ForgotPasswordResponse = ApiEnvelope<Record<string, never>>;
export type LogoutResponse = ApiEnvelope<number>;
export type RefreshAccessTokenResponse = ApiEnvelope<RefreshAccessTokenData>;
export type GetMyInfoResponse = ApiEnvelope<MyInfoResponseData>;
export type UpdatePasswordResponse = ApiEnvelope<Record<string, never>>;
export type GetUsersResponse = ApiEnvelope<PaginatedRows<UserApiRow>>;
export type GetAdminUsersResponse = ApiEnvelope<PaginatedRows<AdminUserApiRow>>;
export type GetUserResponse = ApiEnvelope<UserApiRow>;
export type CreateUsersResponse = ApiEnvelope<UserApiRow[]>;
export type UpdateUserResponse = ApiEnvelope<UserApiRow>;
export type DeleteUserResponse = ApiEnvelope<null>;
export type GetCustomersResponse = ApiEnvelope<PaginatedRows<UserApiRow>>;
export type GetCustomerListResponse = ApiEnvelope<PaginatedRows<CustomerApiRow>>;
export type GetCustomerResponse = ApiEnvelope<CustomerApiRow>;
export type CreateCustomerResponse = ApiEnvelope<CustomerApiRow>;
export type UpdateCustomerResponse = ApiEnvelope<CustomerApiRow>;
export type DeleteCustomerResponse = ApiEnvelope<unknown>;
export type ImportCustomersResponse = ApiEnvelope<ImportCustomersResult>;
export type CustomerCountResponse = ApiEnvelope<{ count: number }>;
export type CustomerTagStatResponse = ApiEnvelope<CustomerTagStatItem[]>;
export type ImportUsersResponse = ApiEnvelope<ImportUsersResult>;
export type GetTagsResponse = ApiEnvelope<PaginatedRows<TagApiRow>>;
export type GetTagResponse = ApiEnvelope<TagApiRow>;
export type CreateTagResponse = ApiEnvelope<TagApiRow>;
export type UpdateTagResponse = ApiEnvelope<TagApiRow>;
export type DeleteTagResponse = ApiEnvelope<null>;
export type GetCustomerTagsResponse = ApiEnvelope<PaginatedRows<CustomerTagApiRow>>;
export type GetCustomerTagResponse = ApiEnvelope<CustomerTagApiRow>;
export type CreateCustomerTagsResponse = ApiEnvelope<CustomerTagApiRow[]>;
export type UpdateCustomerTagResponse = ApiEnvelope<CustomerTagApiRow>;
export type DeleteCustomerTagResponse = ApiEnvelope<null>;
export type GetCustomerAssignedUsersResponse = ApiEnvelope<PaginatedRows<CustomerAssignedUserApiRow>>;
export type GetCustomerAssignedUserResponse = ApiEnvelope<CustomerAssignedUserApiRow>;
export type SetCustomerAssignedUsersResponse = ApiEnvelope<CustomerAssignedUserApiRow[]>;
export type UpdateCustomerAssignedUserResponse = ApiEnvelope<CustomerAssignedUserApiRow>;
export type DeleteCustomerAssignedUserResponse = ApiEnvelope<null>;
export type GetUserTagsResponse = ApiEnvelope<PaginatedRows<UserTagApiRow>>;
export type GetUserTagResponse = ApiEnvelope<UserTagApiRow>;
export type CreateUserTagsResponse = ApiEnvelope<UserTagApiRow[]>;
export type UpdateUserTagResponse = ApiEnvelope<UserTagApiRow>;
export type DeleteUserTagResponse = ApiEnvelope<null>;
export type GetPermissionsResponse = ApiEnvelope<PaginatedRows<PermissionApiRow>>;
export type GetPermissionResponse = ApiEnvelope<PermissionApiRow>;
export type CreatePermissionsResponse = ApiEnvelope<PermissionApiRow[]>;
export type UpdatePermissionResponse = ApiEnvelope<PermissionApiRow>;
export type GetStatusesResponse = ApiEnvelope<PaginatedRows<StatusApiRow>>;
export type GetStatusResponse = ApiEnvelope<StatusApiRow>;
export type GetNotificationsResponse = ApiEnvelope<NotificationsResponseData>;
export type CreateNotificationsResponse = ApiEnvelope<NotificationApiRow[]>;
export type MarkAllNotificationsAsReadResponse = ApiEnvelope<number[]>;
export type MarkNotificationAsReadResponse = ApiEnvelope<NotificationApiRow>;
export type GetJobsResponse = ApiEnvelope<PaginatedRows<JobApiRow>>;
export type GetJobResponse = ApiEnvelope<JobApiRow>;
export type CreateJobsResponse = ApiEnvelope<JobApiRow[]>;
export type UpdateJobResponse = ApiEnvelope<JobApiRow>;
export type DeleteJobResponse = ApiEnvelope<null>;
export type BulkUpdateJobResponse = ApiEnvelope<number>;
export type BulkDeleteJobResponse = ApiEnvelope<number>;
export type GetUserHistoriesResponse = ApiEnvelope<PaginatedRows<UserHistoryApiRow>>;
export type GetUserHistoryResponse = ApiEnvelope<UserHistoryApiRow>;
export type CreateUserHistoriesResponse = ApiEnvelope<UserHistoryApiRow[]>;
export type UpdateUserHistoryResponse = ApiEnvelope<UserHistoryApiRow>;
export type DeleteUserHistoryResponse = ApiEnvelope<null>;
export type BulkUpdateUserHistoryResponse = ApiEnvelope<number>;
export type GetFilesResponse = ApiEnvelope<FilesListResponse>;
export type UploadFileResponse = ApiEnvelope<FileUploadResponse>;
export type DeleteFileResponse = ApiEnvelope<null>;
export type GetPostsResponse = PostsEnvelope<PostRows<PostApiRow>>;
export type GetPostResponse = PostsEnvelope<PostApiRow>;
export type CreatePostResponse = PostsEnvelope<PostApiRow>;
export type UpdatePostResponse = PostsEnvelope<PostApiRow>;
export type DeletePostResponse = PostsEnvelope<null>;
export type GetPostInteractionsResponse = PostsEnvelope<PostRows<PostInteractionApiRow>>;
export type CreatePostInteractionResponse = PostsEnvelope<PostInteractionApiRow>;
export type UpdatePostInteractionResponse = PostsEnvelope<PostInteractionApiRow>;
export type DeletePostInteractionResponse = PostsEnvelope<null>;
export type GetLogsResponse = ApiEnvelope<LogsResponse>;
