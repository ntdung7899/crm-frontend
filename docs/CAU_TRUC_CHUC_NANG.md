# Cấu trúc & Chức năng — CRM Frontend

> Tài liệu mô tả tỉ mỉ các chức năng hiện có trong project và cách chúng liên kết với nhau.
> Cập nhật: 2026-06-13 · Nhánh: `feature/automation-marketing`

---

## 1. Tổng quan

CRM nội bộ (tiếng Việt) cho doanh nghiệp, xây trên **Next.js 14 App Router**. Ứng dụng gồm:

- Khu **dashboard** (sau đăng nhập): quản lý khách hàng, người dùng, công việc, thông báo, bảng tin, Zalo OA (chat + marketing + automation), tài chính, cài đặt.
- Khu **auth**: đăng nhập, đăng ký, quên mật khẩu (OTP).
- Lớp **BFF** (`app/api/zalo/*`): các Route Handler của Next.js làm proxy tới Zalo Open API (giấu access token, tránh CORS).

### Tech stack

| Hạng mục | Công nghệ |
|---|---|
| Framework | Next.js 14 (App Router, RSC + Client Components) |
| Ngôn ngữ | TypeScript (strict) |
| Style | Tailwind CSS (theme `primary` = xanh dương, xem `tailwind.config.ts`) |
| State cục bộ | React hooks + Zustand + store tự viết (`useSyncExternalStore`) |
| Realtime | `socket.io-client` (chat Zalo OA), OneSignal (push notification) |
| Icon | `react-icons` (Feather) + `lucide-react` |
| Chart | `recharts` |
| Kéo-thả | `@dnd-kit/*` (automation workflow) |
| Excel | `xlsx` (import/export khách hàng, người dùng) |

> **Lưu ý:** `README.md` ở gốc là tài liệu mẫu cũ (nói về contacts/companies/deals) — **không phản ánh** ứng dụng hiện tại. Dùng tài liệu này thay thế.

---

## 2. Kiến trúc phân lớp & luồng dữ liệu

```
┌─────────────────────────────────────────────────────────────┐
│  Pages (app/.../page.tsx)        — route, lắp ráp UI          │
│      │ gọi                                                    │
│  Hooks (use*Page.ts)             — state + logic nghiệp vụ    │
│      │ gọi                                                    │
│  Services (services/*.ts)        — định nghĩa endpoint        │
│      │ gọi                                                    │
│  apiClient (lib/api-client.ts)   — fetch + auth + refresh     │
│      │ HTTP                                                   │
│  Backend CRM  (NEXT_PUBLIC_API_URL)                           │
└─────────────────────────────────────────────────────────────┘
   Mappers (utils/*Mappers.ts): API row ↔ model UI
   Types (types/*.ts): hợp đồng dữ liệu chung
   UI dùng chung (components/ui/*): Button, Modal, Table…
```

### Quy ước lặp lại ở **mọi** module

Mỗi module dạng danh sách tuân theo cùng một khuôn:

1. **`page.tsx`** — thường chỉ render một `*View`/`*Section` (client component).
2. **`hooks/use<Module>Page.ts`** — "bộ não": giữ state (list, filter, search, modal open/close, saving…), gọi service, map dữ liệu, bắn toast, xử lý CRUD optimistic.
3. **`services/<module>.ts`** — khai báo endpoint (`const ENDPOINT = "/api/v1.0/..."`) và các hàm `get/create/update/delete` gọi `apiClient`.
4. **`components/list/*`** — `View` (lắp ráp), `Table`, `Filters`, `Search`.
5. **`components/forms/*`** — `FormModal` (tạo/sửa), `DetailModal` (xem).
6. **`utils/*Mappers.ts`** — chuyển `*ApiRow` (snake_case từ backend) ↔ model UI.

### Định dạng response chuẩn (`ApiEnvelope`)

Backend bọc dữ liệu trong **`responseData`** (không phải `data`):

```jsonc
{ "status": "success", "message": "...", "responseData": { /* dữ liệu thật */ }, "violations": null }
```

Danh sách phân trang thường là `responseData.rows` + `responseData.count`.
👉 Khi đọc response luôn lấy `res.responseData`. (Các type `*Envelope` trong `types/api.ts` mô tả khuôn này.)

### Hạ tầng dùng chung quan trọng

- **`lib/api-client.ts`** — singleton `apiClient` với `get/post/put/patch/delete/upload/downloadBlob`. Tự gắn `Authorization: Bearer`, tự **refresh token** khi gặp 401 (gọi `/auth/genNewAccessToken`, chống gọi trùng bằng `refreshPromise`), tự **redirect về `/auth/login`** nếu refresh thất bại.
- **`hooks/useStableToastRef.ts`** + **`components/ui/ToastProvider`** — toast thông báo thành công/lỗi, dùng ở hầu hết hook.
- **`components/ui/useDeleteConfirmation.tsx`** — dialog xác nhận xoá, trả về `requestDeleteConfirmation` + `DeleteConfirmationDialog` (dùng chung mọi module có xoá).
- **`components/ui/ListPageLayout.tsx`** — layout chuẩn cho trang danh sách (filter + search + bảng + phân trang + loading/empty).

---

## 3. Xác thực & phiên đăng nhập

**File liên quan:** `lib/auth-session.ts`, `lib/api-client.ts`, `services/auth.ts`, `app/(dashboard)/layout.tsx`, `app/auth/*`.

- **`lib/auth-session.ts`** lưu vào `localStorage`: `crm_access_token`, `crm_refresh_token`, `crm_token_expires_in`, `crm_current_user` (thông tin user hiện tại — `MyInfoResponseData`). Cung cấp `getAccessToken / getCurrentUserSession / setAuthSession / clearAuthSession / hasAuthSession`.
- **`app/(dashboard)/layout.tsx`** là **cổng bảo vệ**: nếu `!hasAuthSession()` → `router.replace("/auth/login")`. Đồng thời render `Sidebar` + `Header` + `ToastProvider` + `OneSignalInitializer`. Có màn chặn nếu màn hình < 1024px.
- **`services/auth.ts`** — các endpoint: `login`, `register`, `logout`, `genNewAccessToken`, `updatePassword`, `verifyOTP`, `resendOTP`, `forgotPassword`.
- **Liên kết:** sau login (`app/auth/login/hooks/useLoginForm.ts`) → lưu token + gọi `usersService.getMyInfo()` để cache user → vào dashboard. `Header` đọc `getCurrentUserSession()` để hiện avatar/tên. Nút **Đăng xuất** trong `Sidebar` gọi `authService.logout()` rồi `clearAuthSession()`.

---

## 4. Bản đồ điều hướng (Sidebar)

Định nghĩa tại **`components/layout/Sidebar.tsx`** (`sections`). Sidebar tự mở nhóm con theo route hiện tại và highlight mục active.

| Nhóm | Mục | Route |
|---|---|---|
| — | Bảng điều khiển | `/` |
| KHÁCH HÀNG | Quản lý khách hàng | `/customers` |
| | Quản lý nhóm | `/customers/groups` |
| | Người dùng | `/users` |
| CÔNG VIỆC | Công việc | `/tasks` |
| THÔNG BÁO | Thông báo | `/notifications` |
| BẢNG TIN | Bảng tin | `/newsfeed` |
| ZALO OA | Zalo OA (cha) | `/zalo-oa` |
| | › Marketing | `/zalo-oa/marketing` |
| | › Automation | `/zalo-oa/automation` |
| | › Lịch sử template | `/zalo-oa/template-history` |
| TÀI CHÍNH | Trang chủ / Phiếu thu / Phiếu chi / Quỹ / Ngân sách / Yêu cầu chi phí | `/tai-chinh/*` |
| CÀI ĐẶT | Cài đặt | `/settings` |

> Ngoài ra có route không nằm trên sidebar: `/customers/new`, `/customers/[customerId]`, `/customers/groups/[groupId]`, `/users/new`, `/users/[userId]`, `/zalo-oa/tao-template`, các trang con tài chính `bao-cao`, `so-cai`, `cong-no`.

---

## 5. Các module chức năng

### 5.1. Dashboard — `/`

- **Files:** `app/(dashboard)/page.tsx`, `dashboard-home/hooks/useDashboardPage.ts`, `dashboard-home/components/{DashboardKpiGrid, DashboardChartsSection, DashboardPerformanceTables}.tsx`.
- **Chức năng:** thẻ KPI, biểu đồ tỉ lệ chuyển đổi + cơ cấu khách hàng (pie), bảng hiệu suất Leader/Worker.
- **Liên kết dữ liệu:** `useDashboardPage` **không** dùng `services/dashboard.ts` (file đó là mock cũ) mà tổng hợp từ **`usersService`** — `getCustomerCount`, `getCustomerTagStatistic` (`/api/v1.0/users/customerCount`, `/users/customerTagStatistic`). Tức dashboard phản ánh số liệu khách hàng theo từng nhân sự.
- **Liên kết module:** dùng chung dữ liệu với module Khách hàng & Người dùng (cùng nguồn thống kê).

### 5.2. Khách hàng — `/customers`

- **Files chính:** `customers/page.tsx` → `components/list/CustomerListView.tsx`; hook `hooks/useCustomersPage.ts`; bảng/filter/search trong `components/list/*`.
- **Form & chi tiết:**
  - Tạo nhanh: `components/forms/CustomerFormModal.tsx` (+ `hooks/useCustomerFormModal.ts`, `CustomerEditorForm.tsx`).
  - Trang tạo đầy đủ: `/customers/new` (`new/hooks/useNewCustomerPage.ts`, `utils/newCustomerMappers.ts`).
  - Trang chi tiết: `/customers/[customerId]` (`hooks/useCustomerDetailPage.ts`) với các tab: **Thông tin** (`CustomerDetailSection`), **Công việc** (`CustomerWorkTab`), **Hội thoại** (`CustomerChatTab`), **File phương tiện** (`CustomerMediaTab`).
- **Bộ lọc nâng cao:** `components/filters/{FilterModal, SaveFilterModal, SavedFiltersDropdown}.tsx` — lưu bộ lọc; `mock-data/customer-filters.ts` cấp dữ liệu mẫu cho chip màu.
- **Import/Export:** `components/import-export/{ImportModal, exportUtils}.tsx` — dùng `customersService.importCustomers/exportCustomers` (Excel qua `xlsx`).
- **Services & endpoint:**
  - `services/customers.ts` → `/api/v1.0/customers` (+ `/import`, `/export`).
  - `services/customer-assigned-users.ts` → `/api/v1.0/customer_assigned_user` — **gán nhân sự phụ trách** khách hàng (`syncCustomerAssignedUsers`). UI: `AssigneeSelectorPanel.tsx` + `lib/assignee-utils.ts`.
  - `services/customer-tags.ts` → `/api/v1.0/customer_tags` & `services/tags.ts` → `/api/v1.0/tags` — **gắn nhãn** khách hàng. UI: chọn nhóm `GroupSelectorPanel.tsx`.
  - `services/statuses.ts` → `/api/v1.0/status` — trạng thái khách hàng (mới/đã tiếp cận/đã báo giá…).
- **Liên kết module:** ← **Người dùng** (ai phụ trách); ← **Tags/Statuses**; → **Công việc** (tab công việc của KH); → **Zalo OA** (tab hội thoại); → **Dashboard** (thống kê).

### 5.3. Nhóm khách hàng — `/customers/groups`

- **Files:** `customers/groups/page.tsx` (+ `hooks/useCustomerGroupsPage.ts`, `components/CustomerGroupsTable.tsx`); modal `components/groups/CustomerGroupModal.tsx`.
- **Chi tiết nhóm:** `/customers/groups/[groupId]` (`hooks/useCustomerGroupDetailPage.ts`) — `GroupMembersPanel` (thành viên), `AddableCustomersPanel` (thêm KH vào nhóm), `AssigneeRoleSection` (phân vai trò phụ trách).
- **Liên kết:** nhóm là một dạng **tag** của khách hàng (qua `customer-tags`/`tags`), gắn với **người dùng** phụ trách.

### 5.4. Người dùng (nhân sự) — `/users`

- **Files:** `users/page.tsx` → `components/list/UserListView.tsx`; hook `hooks/useUsersPage.ts`; `UserTable/UserFilters/UserSearch`.
- **Form & chi tiết:** `components/forms/{UserFormModal, UserEditorForm, UserDetailModal}.tsx`; trang tạo `/users/new`; trang chi tiết `/users/[userId]` (`hooks/useUserDetailPage.ts`) với tab: **Thông tin** (`UserDetailSection`), **Công việc** (`UserWorkTab`), **Hoạt động** (`UserActivityTab`), **Chat** (`UserChatTab`).
- **Services & endpoint:** `services/users.ts` → `/api/v1.0/users` (+ `getMyInfo`, `customer`, `customerCount`, `customerTagStatistic`, `export`, `import`, `my_emloyee` cho admin). `services/user-tags.ts` (`/user_tags`), `services/user-history.ts` (`/user_history` — nhật ký hoạt động hiển thị ở `UserActivityTab`). `services/permissions.ts` (`/permisions` — phân quyền).
- **Chat nội bộ (Worker/Leader/Admin):** `UserChatTab` + `hooks/useUserChatTab.ts` dùng **`services/chatService.ts`** (`/api/v1.0/chat_messages`) — nhắn tin 1-1 giữa nhân sự (tham khảo `docs/chat-admin-worker-leader.txt`).
- **Liên kết:** vai trò (Owner/Leader/Worker) chi phối phân quyền & dữ liệu thấy được; là nguồn "người phụ trách" cho Khách hàng và "người thực hiện" cho Công việc; cấp `currentUser` cho toàn app.

### 5.5. Công việc — `/tasks`

- **Files:** `tasks/page.tsx` (+ `hooks/useTasksPage.ts`, `types.ts`, `utils/tasksHelpers.ts`); `components/{TasksTable, TasksSearchBar, TaskFormModal, TaskDetailModal, SubJobTimeline}.tsx`.
- **Services & endpoint:** dùng **`services/jobs.ts`** → `/api/v1.0/job` (CRUD + `bulkUpdateJobs`, `bulkDeleteJobs`). `useTasksPage` còn gọi `customersService`, `usersService`, `statusesService` để map "công việc ↔ khách hàng ↔ người thực hiện ↔ trạng thái".
- **`SubJobTimeline`:** hiển thị công việc con/tiến trình theo dòng thời gian.
- **Liên kết:** ← Khách hàng (công việc gắn KH); ← Người dùng (người thực hiện); ← Statuses. Hiển thị lại trong tab "Công việc" của KH và của User.
- ⚠️ `services/tasks.ts` (kiểu mock cũ) **không dùng** — module này chạy trên `jobs`.

### 5.6. Thông báo — `/notifications`

- **Files:** `notifications/page.tsx` → `components/list/NotificationListView.tsx`; hook `hooks/useNotificationsPage.ts`; `NotificationTable/Filters/Search`; form `components/forms/{NotificationFormModal, NotificationDetailModal}.tsx`.
- **Services & endpoint:** `services/notifications.ts` → `/api/v1.0/notifications` — `getMyNotifications`, `markAsRead`, `markAllAsReadForCurrentUser`, `createNotifications`.
- **Realtime/Push:**
  - **`components/layout/NotificationDropdown.tsx`** (trong `Header`) hiển thị chuông + danh sách rút gọn.
  - **`lib/notifications-realtime.ts`** + **`components/layout/OneSignalInitializer.tsx`** — đăng ký OneSignal Web Push (SDK nạp ở `(dashboard)/layout.tsx`), nhận push khi có thông báo mới.
- **Liên kết:** mọi module có thể tạo thông báo cho người dùng; gắn với `currentUser` để lọc "của tôi".

### 5.7. Bảng tin (Newsfeed kiểu Facebook) — `/newsfeed`

- **Files:** `newsfeed/page.tsx` → `components/feed/FeedView.tsx`; hook `hooks/useNewsfeedPage.ts`; `components/feed/{PostComposer, PostCard, FeedAvatar}.tsx`; form `components/forms/PostFormModal.tsx`; `utils/postMappers.ts`.
- **Chức năng:** feed mạng xã hội — đăng bài (tiêu đề + nội dung + ảnh/video), **thả reaction (hover hiện 6 cảm xúc)**, bình luận & **trả lời bình luận lồng nhau** (`parent_comment_id`), lưu bài (UI), menu "…" gộp quản lý (Sửa / Ẩn-Hiện / Xoá).
- **Upload media:** `PostFormModal` dùng **`services/files.ts`** (`/api/v1.0/files`) — lấy `responseData.original` làm URL; `resolveMediaUrl()` ghép `NEXT_PUBLIC_API_URL`.
- **Services & endpoint:** `services/newsfeed.ts` → `/api/v1.0/posts` (CRUD post) + `/posts/:id/interactions` (like/comment/reply, xoá tương tác). Like & comment đọc trực tiếp từ `post.post_interactions` nhúng sẵn, cập nhật **optimistic**.
- **Liên kết:** dùng `getCurrentUserSession()` cho avatar/quyền; chi tiết hợp đồng API xem **`docs/api_posts.md`** (bản mới nhất — mô hình `REACTION` + `reaction_type` + socket events). `docs/api_newsfeed.md` là bản cũ đã lỗi thời.

### 5.8. Zalo OA — `/zalo-oa`

Module lớn nhất, gồm 3 mảng: **kết nối + chat hội thoại**, **marketing (chiến dịch)**, **automation (workflow)**, **template ZBS**.

- **Trang chính `/zalo-oa`:** `page.tsx` → `components/list/ZaloOaView.tsx`; hook `hooks/useZaloOaPage.ts`.
  - **Kết nối OA:** `OaConnectionList`, `ZaloOaAddModal`, OAuth qua **`lib/zalo-oa.ts`** (`buildZaloOAuthUrl`, `exchangeOaToken`) + callback `app/zalo-oa/callback/page.tsx` & BFF `app/api/zalo/oauth/callback/route.ts`.
  - **Chat hội thoại:** `ZaloSidebar` (danh sách hội thoại), `ConversationRow`, `ChatMessageRow`, `ZaloInteractionPanel`, `UserDetailPanel`, `EmptyState`. **Realtime** qua **`lib/socketService.ts`** (socket.io, auth JWT, backend tự join OA active, event `ZaloNewMessage`) + state **`lib/zaloMessageStore.ts`**.
  - **Cấu hình:** `ZaloSettingsDrawer`, `ZaloConfigFormDrawer`, `ZaloAutoConfigPanel`, `InlineToggle`.
- **Marketing `/zalo-oa/marketing`:** `MarketingSection.tsx` — tạo/chạy **chiến dịch** gửi template hàng loạt; `CampaignRecipientsImport.tsx` (import danh sách nhận từ Excel). Phân tích: `docs/phan_tich_tab_marketing_automation.md`.
- **Automation `/zalo-oa/automation`:** `page.tsx` 2 tab (Automation | Campaigns). Tab Automation:
  - Hook **`_hooks/useMarketingAutomation.ts`** + **`_hooks/automationApi.ts`** → `/api/v1.0/automations` (CRUD + test run). `unwrapApiResponse` xử lý cả `data` lẫn `responseData`.
  - UI: `AutomationListView` (danh sách), `WorkflowBuilder` + `WorkflowCanvas` (dựng luồng kéo-thả `@dnd-kit`), `NodeConfigPanel`, `TemplatePicker`, `AutomationTabBar`. Types: `_types/{api,index}.ts`.
- **Tạo template ZBS `/zalo-oa/tao-template`:** wizard nhiều bước — `_components/{StepBar, BodyEditor, HeaderMediaSection, TemplatePreview, constants, types}.tsx`. Upload media template qua BFF `app/api/zalo/templates/upload-media/route.ts`. State soạn: `lib/zaloTemplateMessageStore.ts`.
- **Lịch sử template `/zalo-oa/template-history`:** `TemplateHistorySection.tsx` — log gửi template.
- **Lớp BFF `app/api/zalo/*`:** Route Handler proxy tới **Zalo Open API** (`https://openapi.zalo.me`), nhận `x-oa-access-token` từ client rồi forward (`conversations`, `messages/{text,image,file,quote}`, `oa/info`, `templates/{create,info,send,upload-media}`, `user/{detail,update}`). Mục đích: giấu token + tránh CORS.
- **Liên kết:** template (mục 5.8 tạo template) được Marketing & Automation tái sử dụng để gửi; hội thoại Zalo hiển thị trong tab "Hội thoại" của Khách hàng. Tài liệu nền: `docs/Tai_lieu_*Zalo*`, `docs/chat-zalo-document.txt`.

### 5.9. Tài chính — `/tai-chinh`

- **Layout:** `tai-chinh/layout.tsx` + `components/FinanceTabs.tsx` (thanh tab dùng chung cho mọi trang con).
- **Các trang con:**
  - `/tai-chinh` (trang chủ tổng quan), `phieu-thu`, `phieu-chi`, `quy` (Quản lý quỹ — nhiều tab: `QuanLyQuyTab`, `PhieuThuTab`, `PhieuChiTab`, `HachToanQuyTab`), `ngan-sach`, `yeu-cau-chi-phi`, `so-cai`, `bao-cao` (KQKD, bảng cân đối — `KqkdTable`, `BalanceSheetTable`, `CashFlowPlaceholder`), `cong-no` (`CongNoDetailDrawer`).
- **Nguồn dữ liệu — KHÁC các module khác:** Tài chính **chạy hoàn toàn trên store cục bộ** (chưa nối backend):
  - **`services/finance/{store.ts, types.ts, seed.ts}`** — class store tự viết, lưu `localStorage` key `finance:v1`, có seed dữ liệu mẫu, sinh số chứng từ (PT/PC).
  - **`hooks/useFinanceStore.ts`** — bọc store bằng `useSyncExternalStore`.
- **Liên kết:** dữ liệu phiếu/quỹ/ngân sách/YCCP liên hệ nhau trong cùng store (vd phiếu chi trừ quỹ, YCCP duyệt → phiếu chi). Phân tích nghiệp vụ: `docs/phan_tich_chuc_nang_tab_tai_chinh.md`.

### 5.10. Cài đặt — `/settings`

- **Files:** `settings/page.tsx` → `components/list/SettingsView.tsx`; hook `hooks/useSettingsPage.ts`.
- **Mục:** `profile/{ProfileSettingsCard, EditProfileModal}.tsx` (sửa hồ sơ — `usersService` + `filesService` đổi avatar); `account/{AccountSecurityCard, ChangePasswordModal}.tsx` (đổi mật khẩu — `authService.updatePassword`).
- **Liên kết:** cập nhật `currentUser` trong session → phản ánh ở `Header`.

### 5.11. Auth — `/auth/*`

- **Login** `/auth/login` — `LoginFormView` + `useLoginForm` → `authService.login` → lưu session → `getMyInfo`. Có `ForgotPasswordModal`.
- **Register** `/auth/register` — `RegisterFormView` + `useRegisterForm` → `authService.register`.
- **Forgot password** `/auth/forgot-password` — `ForgotPasswordView` + `OtpInput` + `useForgotPasswordFlow` → `forgotPassword` → `verifyOTP`/`resendOTP` → `updatePassword`. Validators tại `utils/forgotPassword.validators.ts`.

---

## 6. Hạ tầng dùng chung

### 6.1. UI components (`components/ui/`)
`Button, Card, Input, Select, Badge, Avatar, Spinner, Modal, Dialog, Tabs, Toggle, Toast, ToastProvider, TablePagination, ListPageLayout, useDeleteConfirmation`.
→ Dùng xuyên suốt mọi module để đồng bộ giao diện. `Avatar` dùng `next/image` + initials fallback; trong newsfeed dùng `FeedAvatar` (img thường) để tránh giới hạn domain của `next/image`.

### 6.2. Layout (`components/layout/`)
- `Sidebar.tsx` — điều hướng (mục 4).
- `Header.tsx` — toggle sidebar, ô tìm kiếm, chuông thông báo (`NotificationDropdown`), menu user (avatar từ `getCurrentUserSession`).
- `NotificationDropdown.tsx`, `OneSignalInitializer.tsx` — thông báo realtime.

### 6.3. `lib/`
| File | Vai trò |
|---|---|
| `api-client.ts` | HTTP client + auth + auto-refresh token |
| `auth-session.ts` | Đọc/ghi token & user trong localStorage |
| `utils.ts` | `cn`, `getInitials`, `formatCurrency`, format ngày… (dùng 58+ nơi) |
| `assignee-utils.ts` | Tiện ích xử lý người phụ trách (customers) |
| `socketService.ts` | Singleton socket.io cho chat Zalo realtime |
| `zaloMessageStore.ts` | Store tin nhắn Zalo (dedupe, cập nhật realtime) |
| `zaloTemplateMessageStore.ts` | Store soạn template ZBS |
| `zalo-oa.ts` | OAuth Zalo, đổi token, gửi ZBS theo SĐT |
| `notifications-realtime.ts` | Tích hợp OneSignal push |

### 6.4. `types/`
Hợp đồng dữ liệu: `api.ts` (envelope, payload, response — file lớn nhất, nguồn sự thật), `customer.ts`, `user.ts`, `newsfeed.ts`, `notification.ts`, `permission.ts`, `dashboard.ts`, `reports.ts`, `marketing.ts`, `automation.ts`, `chat.ts`, `zalo-oa.ts`, `customer-journey.ts`, `conversion-rate.ts`, `index.ts`.

### 6.5. `mock-data/`
`customer-filters.ts` — dữ liệu mẫu cho chip/bộ lọc khách hàng (không phải dữ liệu thật).

---

## 7. Bảng liên kết giữa các module

| Module | Phụ thuộc / nhận dữ liệu từ | Cung cấp cho |
|---|---|---|
| Dashboard | Users (thống kê KH) | — |
| Khách hàng | Users (phụ trách), Tags, Statuses, Jobs | Dashboard, Tasks, Zalo chat |
| Nhóm KH | Customer-tags, Users | Khách hàng |
| Người dùng | Permissions, User-tags, User-history, Chat | Khách hàng, Tasks, Dashboard, toàn app (`currentUser`) |
| Công việc | Jobs, Customers, Users, Statuses | Tab công việc của KH/User |
| Thông báo | Notifications API, OneSignal | Header (chuông) |
| Bảng tin | Posts API, Files, currentUser | — |
| Zalo OA | OAuth Zalo, Socket, BFF `api/zalo`, Files | Tab hội thoại của KH; Marketing & Automation dùng template |
| Tài chính | Store cục bộ (`finance:v1`) | (nội bộ store: quỹ ↔ phiếu ↔ YCCP) |
| Cài đặt | Users, Auth, Files | `currentUser` → Header |
| Auth | Auth API | Toàn app (session, token) |

---

## 8. Ghi chú trạng thái

- **Service legacy chưa dùng (sót lại từ template mẫu):** `services/contacts.ts`, `services/companies.ts`, `services/deals.ts`, `services/tasks.ts`, `services/dashboard.ts`, `services/logs.ts`. Module thật dùng `jobs`/`users`/`customers` thay thế. Cân nhắc dọn dẹp.
- **Tài chính** dùng store localStorage, **chưa nối backend** — dữ liệu chỉ tồn tại trên trình duyệt.
- **Newsfeed – nút "Lưu bài"** hiện chỉ là UI (chưa có API bookmark). **Reaction cảm xúc** chỉ lưu phía client (backend chỉ có `LIKE`).
- **Backend URL** cấu hình qua `NEXT_PUBLIC_API_URL` (xem `.env`); Zalo App ID qua `NEXT_PUBLIC_ZALO_APP_ID`.
- **Tài liệu API chi tiết** nằm trong `docs/` (newsfeed, Zalo template/ZNS/ZBS, chat, tài chính, marketing automation).
```
