# TÀI LIỆU HỆ THỐNG CRM & TÍCH HỢP ZALO OA

> **Tài liệu tổng hợp toàn diện**  
> **Cập nhật:** 2026-06-20  
> **Nhánh phát triển chính:** `feature/automation-marketing`  
> **Mục tiêu:** Cung cấp thông tin chi tiết về mặt chức năng, kiến trúc kỹ thuật, quy chuẩn thiết kế (design system), và đặc tả tích hợp API của toàn bộ dự án CRM.

---

## 1. Tổng quan & Tech Stack

CRM nội bộ là một hệ thống quản lý quan hệ khách hàng đa chức năng dành cho doanh nghiệp, được thiết kế và xây dựng trên nền tảng **Next.js 14 App Router** (hỗ trợ cả React Server Components - RSC và Client Components).

### 1.1. Phạm vi hệ thống
Hệ thống được chia thành ba phân vùng chính:
*   **Khu vực Dashboard (sau đăng nhập):** Nơi làm việc chính của nhân sự (Admin, Leader, Worker), bao gồm các phân hệ: Quản lý khách hàng, Nhóm khách hàng, Người dùng (nhân sự), Công việc/Jobs, Thông báo (realtime + push), Bảng tin nội bộ (Newsfeed), Zalo OA (Chat + Marketing + Automation), Tài chính (Quỹ, Phiếu thu/chi, Ngân sách, Yêu cầu chi phí, Công nợ, Báo cáo), và Cài đặt cá nhân.
*   **Khu vực Auth:** Đăng nhập, đăng ký, quên mật khẩu và xác thực OTP.
*   **Lớp BFF (Backend-For-Frontend) `/app/api/zalo/*`:** Các Route Handler của Next.js đóng vai trò proxy trung gian để gọi sang Zalo Open API nhằm giấu access token và giải quyết vấn đề CORS ở phía Client.

### 1.2. Technology Stack

| Hạng mục | Công nghệ sử dụng | Chi tiết & Vai trò |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Tận dụng RSC để render dữ liệu nhanh và Client Components cho tương tác |
| **Ngôn ngữ** | TypeScript | Cấu hình chế độ kiểm tra nghiêm ngặt (`strict: true`) |
| **Styling** | Tailwind CSS + CSS Variables | Theme chủ đạo là màu xanh công nghệ (Tech Blue), quản lý qua CSS variables |
| **State Management** | Zustand + Custom Store | Quản lý state cục bộ và đồng bộ qua `useSyncExternalStore` |
| **Realtime** | Socket.IO Client + OneSignal | Nhận tin nhắn Zalo OA thời gian thực và đẩy thông báo Web Push |
| **UI Components** | Radix UI + Lucide + React Icons | Bộ component nền tảng phục vụ cho shadcn/ui và hệ thống icon |
| **Charts** | Recharts | Vẽ biểu đồ thống kê KPI, doanh thu, dòng tiền trên Dashboard |
| **Drag & Drop** | `@dnd-kit/*` | Kéo thả và kết nối các node trong workflow của Marketing Automation |
| **Excel Utility** | `xlsx` (SheetJS) | Nhập/xuất dữ liệu Khách hàng và Người dùng ra file Excel |

---

## 2. Kiến trúc FE & Quy ước phát triển

Hệ thống tuân thủ chặt chẽ kiến trúc phân lớp rõ ràng nhằm tối ưu khả năng tái sử dụng mã nguồn và dễ dàng bảo trì.

### 2.1. Bản đồ luồng dữ liệu FE
```
┌─────────────────────────────────────────────────────────────┐
│  Pages (app/.../page.tsx)        — Route, lắp ráp UI          │
│      │ gọi                                                    │
│  Hooks (use*Page.ts)             — State + Logic nghiệp vụ    │
│      │ gọi                                                    │
│  Services (services/*.ts)        — Định nghĩa endpoint        │
│      │ gọi                                                    │
│  apiClient (lib/api-client.ts)   — Fetch + Auth + Refresh     │
│      │ HTTP                                                   │
│  Backend CRM  (NEXT_PUBLIC_API_URL)                           │
└─────────────────────────────────────────────────────────────┘
   Mappers (utils/*Mappers.ts): Chuyển đổi API Row ↔ Model UI
   Types (types/*.ts): Hợp đồng dữ liệu chung
   UI dùng chung (components/ui/*): Button, Modal, Table…
```

### 2.2. Quy ước cấu trúc thư mục của một Module
Mỗi phân hệ dạng danh sách hoặc biểu mẫu CRUD trong project đều tuân theo cấu trúc sau:
1.  **`page.tsx`:** Đóng vai trò route định tuyến, thường chỉ render component View/Section chính của client.
2.  **`hooks/use<Module>Page.ts`:** Nơi quản lý state (danh sách, bộ lọc, tìm kiếm, đóng/mở modal, trạng thái lưu...), gọi service, xử lý mapping dữ liệu và thực hiện cập nhật optimistic UI.
3.  **`services/<module>.ts`:** Định nghĩa endpoint backend (`const ENDPOINT = "/api/v1.0/..."`) và cung cấp các hàm gọi `apiClient` (`get`, `create`, `update`, `delete`).
4.  **`components/list/*`:** Chứa các component phục vụ hiển thị danh sách như: `<Module>ListView`, `<Module>Table`, `<Module>Filters`, `<Module>Search`.
5.  **`components/forms/*`:** Chứa các component modal nhập liệu như: `<Module>FormModal` (tạo/sửa), `<Module>DetailModal` (xem chi tiết).
6.  **`utils/*Mappers.ts`:** Thực hiện chuyển đổi qua lại giữa `*ApiRow` (dữ liệu `snake_case` từ Backend) và Model UI (`camelCase` dùng ở FE).

### 2.3. Định dạng Response chuẩn (`ApiEnvelope`)
Backend bọc dữ liệu trả về trong thuộc tính `responseData` (chứ không phải `data` thông thường):
```json
{
  "status": "success",
  "message": "Thành công",
  "responseData": {
    "rows": [],
    "count": 0
  },
  "violations": null
}
```
*Lưu ý:* Khi viết code luôn phải kiểm tra và giải nén response thông qua `res.responseData`.

### 2.4. Hạ tầng dùng chung quan trọng
*   **`lib/api-client.ts`:** Đối tượng singleton `apiClient` bọc hàm fetch gốc. Tự động đính kèm header `Authorization: Bearer <token>`, tự động làm mới token (gọi `/auth/genNewAccessToken`) khi gặp lỗi 401 (chống gọi lặp bằng cơ chế lưu trữ `refreshPromise`), và tự động chuyển hướng về `/auth/login` nếu refresh thất bại.
*   **`components/ui/ToastProvider`:** Cung cấp thông báo thành công hoặc lỗi trên giao diện.
*   **`components/ui/useDeleteConfirmation.tsx`:** Dialog xác nhận xóa dùng chung cho mọi module để tối giản hóa code thừa.
*   **`components/ui/ListPageLayout.tsx`:** Layout chuẩn hóa cho các trang danh sách (tích hợp sẵn filter, search, table, pagination, loading và empty state).

---

## 3. Brand Direction & Design System (TechX Blue)

Hệ thống CRM sử dụng bộ nhận diện thương hiệu **TechX**: hiện đại, công nghệ, tốc độ, rõ ràng và chuyên nghiệp.

### 3.1. Brand Colors
*   **Chủ đạo:** Electric Blue kết hợp với nền Dark Navy đậm và điểm nhấn Cyan Glow phát sáng.
*   *Lưu ý thiết kế:* Không dùng màu tím làm chủ đạo. Không dùng màu xanh lá làm brand chính. Tránh dùng toàn bộ nền tối trên giao diện người dùng phổ thông.

### 3.2. Bảng mã màu & CSS Variables (`:root`)
```css
:root {
  /* Brand Colors */
  --primary: #0C9CEC;          /* Electric Blue: CTA, link, active state */
  --primary-hover: #0B5ED6;    /* Strong Blue: Hover state */
  --primary-active: #0847A6;   /* Deep Blue: Pressed state */
  --primary-light: #DFF6FF;    /* Blue Light: Background badge, chip active */
  --primary-soft: #F0FAFF;     /* Blue Soft: Empty state background */

  /* Dark Brand Colors */
  --brand-navy: #0A1224;       /* Tech Navy: Sidebar, login background */
  --brand-navy-2: #0E2953;     /* Deep Navy Blue: Dark card, header dark */
  --brand-navy-3: #123E80;     /* Royal Tech Blue: Highlight on dark */

  /* Accent Colors */
  --cyan: #44CCF5;             /* Cyan Glow: Accent line, icon glow */
  --cyan-light: #E0F7FF;       /* Cyan Light: Badge background */
  --sky-blue: #87EBF8;         /* Sky Tech: Highlight, illustration */
  --sky-blue-light: #ECFEFF;   /* Sky Light: Background soft */

  /* Layout Colors */
  --background: #F6FAFF;       /* App Background: Main background */
  --surface: #FFFFFF;          /* Surface: Card, modal, sheet */
  --border: #DDE7F2;           /* Border: Card border, input border */
  --divider: #EAF0F7;          /* Divider: Light separating lines */

  /* Text Colors */
  --text-primary: #0F172A;     /* Main Text: Titles, bold contents */
  --text-secondary: #64748B;   /* Secondary Text: Subtitles, descriptions */
  --text-muted: #94A3B8;       /* Muted Text: Placeholders, metadata */
  --text-disabled: #CBD5E1;    /* Disabled Text: Disabled elements */
  --text-inverse: #FFFFFF;     /* White Text: Text on blue/navy backgrounds */

  /* Status Colors */
  --success: #10B981;          /* Completed, verified */
  --success-light: #D1FAE5;
  --warning: #F59E0B;          /* Pending, caution */
  --warning-light: #FEF3C7;
  --danger: #EF4444;           /* Deleted, error */
  --danger-light: #FEE2E2;
  --info: #0C9CEC;             /* Process, info */
  --info-light: #DFF6FF;
  --purple: #6366F1;           /* Pin, special role */
  --purple-light: #EDE9FE;

  /* Typography */
  --font-main: "Be Vietnam Pro", "Inter", sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 999px;

  /* Shadow */
  --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.12);
  --shadow-blue: 0 12px 28px rgba(12, 156, 236, 0.28);
}
```

### 3.3. Quy chuẩn CSS cho Component
*   **Sidebar Active Item:**
    ```css
    .sidebar-item.active {
      color: #FFFFFF;
      background: linear-gradient(135deg, #0B5ED6 0%, #44CCF5 100%);
      box-shadow: 0 8px 20px rgba(12, 156, 236, 0.24);
    }
    ```
*   **Primary Button:**
    ```css
    .btn-primary {
      background: #0C9CEC;
      color: #FFFFFF;
      border-radius: 12px;
      font-weight: 600;
      box-shadow: 0 12px 28px rgba(12, 156, 236, 0.28);
      transition: background 0.2s;
    }
    .btn-primary:hover {
      background: #0B5ED6;
    }
    ```
*   **Secondary Button:**
    ```css
    .btn-secondary {
      background: #FFFFFF;
      color: #0C9CEC;
      border: 1px solid #DDE7F2;
      border-radius: 12px;
      font-weight: 600;
    }
    ```
*   **Card Style:**
    ```css
    .card {
      background: #FFFFFF;
      border: 1px solid #DDE7F2;
      border-radius: 20px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    }
    ```
*   **Pastel Avatar System:**
    *   *Blue:* Nền `#DFF6FF` - Chữ `#0B5ED6`
    *   *Cyan:* Nền `#E0F7FF` - Chữ `#0891B2`
    *   *Green:* Nền `#D1FAE5` - Chữ `#059669`
    *   *Orange:* Nền `#FEF3C7` - Chữ `#D97706`
    *   *Purple:* Nền `#EDE9FE` - Chữ `#6366F1`

---

## 4. Các module chức năng CRM

### 4.1. Dashboard — `/`
*   **Mô tả:** Màn hình chính sau khi đăng nhập, cung cấp các KPI quan trọng, biểu đồ Recharts phân tích tỷ lệ chuyển đổi, cơ cấu khách hàng, và bảng so sánh hiệu suất giữa các nhân sự (Leader vs Worker).
*   **Liên kết dữ liệu:** Dữ liệu thống kê được tổng hợp thông qua endpoints của `usersService`: `/api/v1.0/users/customerCount` và `/users/customerTagStatistic` thay vì file mock cũ.

### 4.2. Khách hàng — `/customers`
*   **Giao diện & Cấu trúc:** Danh sách khách hàng hỗ trợ tìm kiếm, bộ lọc nâng cao (lưu bộ lọc mẫu bằng chip màu).
*   **Trang Chi tiết `/customers/[customerId]`:** Chứa các tab: **Thông tin** (chỉnh sửa thông tin đầy đủ), **Công việc** (danh sách công việc thuộc khách hàng đó), **Hội thoại** (đồng bộ chat Zalo OA trực tiếp), và **File phương tiện** (hình ảnh, tài liệu đính kèm).
*   **Import/Export:** Dùng thư viện `xlsx` để xử lý file Excel client-side, đẩy lên server qua endpoint `/api/v1.0/customers/import` và `/export`.
*   **Quản lý gán phụ trách:** Endpoint `/api/v1.0/customer_assigned_user` dùng để phân quyền nhân sự chăm sóc khách hàng.

### 4.3. Nhóm khách hàng — `/customers/groups`
*   **Mô tả:** Quản lý danh mục nhóm. Nhóm khách hàng thực chất được cấu hình dựa trên cơ chế **tags** gắn với khách hàng, kèm theo phân quyền cho nhân sự phụ trách nhóm đó.

### 4.5. Người dùng (Nhân sự) — `/users`
*   **Mô tả:** Quản lý thông tin nhân sự nội bộ trong CRM.
*   **Quyền hạn & Hoạt động:** Quản lý vai trò (Owner, Leader, Worker) để phân chia quyền truy cập dữ liệu. Hoạt động của user được ghi nhận tại `user_history` và hiển thị tại tab Hoạt động.
*   **Chat nội bộ (Worker ↔ Leader ↔ Admin):**
    *   Sử dụng endpoint `/api/v1.0/chat_messages` để quản lý danh sách cuộc hội thoại và tin nhắn.
    *   Hỗ trợ tin nhắn 1-1 realtime thông qua Socket.IO.
    *   *Quy tắc nghiệp vụ:* Cuộc hội thoại xác định qua `other_user_id`. Unread count được lưu và reset cục bộ khi click mở chat. Sử dụng Optimistic UI để chèn tin nhắn ngay lập tức trước khi API phản hồi.

### 4.6. Công việc — `/tasks`
*   **Mô tả:** Hệ thống quản lý công việc (Jobs) của doanh nghiệp.
*   **Endpoints:** Sử dụng `services/jobs.ts` để gọi API `/api/v1.0/job` (hỗ trợ `bulkUpdateJobs` và `bulkDeleteJobs`).
*   *Lưu ý quan trọng:* Toàn bộ logic chạy trên bảng `jobs`. File `services/tasks.ts` cũ (mock) đã bị loại bỏ.
*   **SubJobTimeline:** Biểu diễn tiến độ của các công việc con theo dạng sơ đồ dòng thời gian (timeline).

### 4.7. Thông báo — `/notifications`
*   **Mô tả:** Nhận các thông báo từ hệ thống.
*   **Realtime & Push:** Tích hợp SDK OneSignal để đăng ký Web Push Notification. Tiện ích `<NotificationDropdown>` ở header hiển thị nhanh số lượng thông báo chưa đọc.

### 4.8. Bảng tin (Newsfeed) — `/newsfeed`
*   **Mô tả:** Trang mạng xã hội thu nhỏ cho doanh nghiệp.
*   **Chức năng:** Tạo bài viết (hỗ trợ upload media thông qua `/api/v1.0/files`), tương tác cảm xúc (hover hiện 6 loại emoji), bình luận lồng nhau nhiều cấp (`parent_comment_id`).
*   **Cơ chế cập nhật:** Dữ liệu reaction và bình luận được cập nhật dạng optimistic UI.

### 4.9. Zalo Official Account — `/zalo-oa`
*   **Kết nối OA:** Cấu hình OAuth callback thông qua BFF `/api/zalo/oauth/callback` để lấy và gia hạn access token từ Zalo Business.
*   **Chat hội thoại:** Tích hợp Socket.IO nhận sự kiện `zalo:new_message` để đồng bộ tin nhắn khách hàng gửi tới OA thời gian thực.
*   **Marketing & Automation:** Quản lý các chiến dịch gửi ZNS hàng loạt theo danh sách Excel hoặc thiết kế kịch bản tự động hóa kéo thả (Workflow Builder).

### 4.10. Tài chính — `/tai-chinh`
*   **Đặc điểm:** Hiện tại phân hệ Tài chính đang **chạy hoàn toàn offline** bằng local store (`localStorage` key `finance:v1`) thông qua hook `useFinanceStore` được bọc bằng `useSyncExternalStore` để đồng bộ dữ liệu.
*   **Chức năng:** Tổng quan dòng tiền, Quản lý quỹ, Phiếu thu/chi (tự động sinh số PT/PC), Ngân sách, Yêu cầu chi phí, Sổ cái, Công nợ và Báo cáo tài chính (KQKD, Bảng cân đối).

---

## 5. Đặc tả Tích hợp Zalo Official Account (OA) & Messaging

Phân hệ Zalo OA Chat cho phép nhân viên chăm sóc khách hàng trực tiếp từ CRM. Toàn bộ cuộc hội thoại được đồng bộ realtime và lưu trữ tập trung tại database nội bộ.

### 5.1. Database Design (PostgreSQL)

#### Bảng `zalo_oa_accounts`
Lưu trữ thông tin cấu hình và token của các OA được kết nối.
```sql
CREATE TABLE zalo_oa_accounts (
    id UUID PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL UNIQUE,
    app_id VARCHAR(100),
    name VARCHAR(255),
    avatar TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    package_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Bảng `zalo_users`
Lưu trữ thông tin khách hàng Zalo tương tác với OA.
```sql
CREATE TABLE zalo_users (
    id UUID PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    avatar TEXT,
    phone VARCHAR(50),
    user_is_follower BOOLEAN,
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_id VARCHAR(100),
    conversation_id VARCHAR(100),
    last_interaction_at TIMESTAMP,
    detail_synced_at TIMESTAMP,
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (oa_id, user_id)
);
```

#### Bảng `zalo_conversations`
Quản lý các phiên hội thoại.
```sql
CREATE TABLE zalo_conversations (
    id UUID PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    anonymous_id VARCHAR(100),
    conversation_id VARCHAR(100),
    display_name VARCHAR(255),
    avatar TEXT,
    last_message TEXT,
    last_message_id VARCHAR(100),
    last_message_at TIMESTAMP,
    unread_count INT DEFAULT 0,
    assigned_staff_id UUID,
    status VARCHAR(50) DEFAULT 'open',
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (oa_id, conversation_id)
);
```

#### Bảng `zalo_messages`
Lưu trữ chi tiết nội dung các tin nhắn gửi đi và nhận về.
```sql
CREATE TABLE zalo_messages (
    id UUID PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(100),
    user_id VARCHAR(100),
    anonymous_id VARCHAR(100),
    zalo_message_id VARCHAR(100),
    quote_message_id VARCHAR(100),
    direction VARCHAR(20) NOT NULL, -- inbound | outbound
    message_type VARCHAR(50) NOT NULL, -- text | image | file | quote | info_request
    content TEXT,
    attachment_url TEXT,
    attachment_id VARCHAR(100),
    attachment_name VARCHAR(255),
    send_status VARCHAR(50) DEFAULT 'pending', -- pending | sent | failed
    error_code VARCHAR(50),
    error_message TEXT,
    sent_by_user_id UUID,
    sent_at TIMESTAMP,
    received_at TIMESTAMP,
    raw_request JSONB,
    raw_response JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Bảng `zalo_message_send_logs`
Log chi tiết cuộc gọi Zalo API phục vụ gỡ lỗi và kiểm tra kỹ thuật.
```sql
CREATE TABLE zalo_message_send_logs (
    id UUID PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL,
    internal_message_id UUID,
    zalo_message_id VARCHAR(100),
    endpoint VARCHAR(255),
    request_body JSONB,
    response_body JSONB,
    http_status INT,
    zalo_error_code VARCHAR(50),
    zalo_error_message TEXT,
    status VARCHAR(50), -- success | failed
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2. API Spec dành cho Chat & Messaging

*   **Lấy danh sách cuộc hội thoại:** `GET /api/zalo/oa/:oaId/conversations` (đọc DB nội bộ).
*   **Lấy chi tiết tin nhắn:** `GET /api/zalo/oa/:oaId/conversations/:conversationId/messages`.
*   **Gửi tin nhắn Văn bản (Text):** `POST /api/zalo/oa/:oaId/messages/text`
    *   *Payload:* `{"userId": "...", "conversationId": "...", "text": "..."}`
*   **Gửi tin nhắn Ảnh (Image):** `POST /api/zalo/oa/:oaId/messages/image` (Multipart file upload → Zalo upload API → Gửi attachment ID).
*   **Gửi tin nhắn File/Tài liệu:** `POST /api/zalo/oa/:oaId/messages/file` (Upload file lên Zalo → Nhận attachment ID → Gửi tin nhắn).
*   **Gửi tin nhắn Trích dẫn (Quote):** `POST /api/zalo/oa/:oaId/messages/quote`
    *   *Payload:* `{"userId": "...", "conversationId": "...", "quoteMessageId": "...", "text": "..."}`
*   **Gửi Yêu cầu Thông tin Người dùng:** `POST /api/zalo/oa/:oaId/messages/request-user-info` (Gửi template yêu cầu chia sẻ SĐT từ Zalo).
*   **Kiểm tra hạn mức/điều kiện nhắn tin:** `GET /api/zalo/oa/:oaId/users/:userId/quota`.

### 5.3. Socket.IO Realtime Integration
*   **Kết nối:** Khi user đăng nhập thành công, client khởi chạy singleton kết nối socket đính kèm access token của CRM.
*   **Tự động xử lý:** Backend tự động gia nhập (join) socket vào room `user:{userId}` và các room của các OA active.
*   **Lắng nghe tin nhắn mới:**
    ```typescript
    socket.on('zalo:new_message', (msg: ZaloNewMessage) => {
      // Đồng bộ tin nhắn mới nhận được vào store ZaloMessageStore
    });
    ```

---

## 6. Tích hợp Zalo ZBS & ZNS Template Message

Zalo ZBS (Zalo Business Solution) và ZNS (Zalo Notification Service) cho phép hệ thống CRM gửi các thông báo có cấu trúc theo mẫu tới số điện thoại khách hàng (xác nhận đơn hàng, OTP, nhắc hẹn).

### 6.1. So sánh OA Chat và Template Message

| Tiêu chí | OA Chat / Tin tư vấn | ZBS/ZNS Template Message |
| :--- | :--- | :--- |
| **Người nhận** | `user_id` đã tương tác với OA | `phone` của khách hàng |
| **Mục đích** | Chat CSKH 1-1, phản hồi tự do | Thông báo theo mẫu định sẵn |
| **Nội dung** | Văn bản, hình ảnh, file tự do | Phải tuân theo template đã được duyệt |
| **API chính** | `openapi.zalo.me/v3.0/oa/message/cs` | `business.openapi.zalo.me/message/template` |

### 6.2. Thiết kế Database cho Template

#### Bảng `zalo_templates`
```sql
CREATE TABLE zalo_templates (
    id UUID PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    template_name VARCHAR(255),
    status VARCHAR(50), -- draft | pending_review | approved | rejected
    template_type VARCHAR(100),
    variables JSONB,
    sample_data JSONB,
    raw_data JSONB,
    synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (oa_id, template_id)
);
```

#### Bảng `zalo_template_messages`
```sql
CREATE TABLE zalo_template_messages (
    id UUID PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    normalized_phone VARCHAR(30) NOT NULL,
    tracking_id VARCHAR(255) NOT NULL UNIQUE,
    mode VARCHAR(30) DEFAULT 'production', -- development | production
    template_data JSONB NOT NULL,
    zalo_msg_id VARCHAR(100),
    send_status VARCHAR(50) DEFAULT 'pending', -- pending | sent_to_zalo | delivered | failed
    zalo_error_code VARCHAR(50),
    zalo_error_message TEXT,
    sent_time TIMESTAMP,
    delivery_time TIMESTAMP,
    quota JSONB,
    raw_request JSONB,
    raw_response JSONB,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Bảng `zalo_template_message_events`
Lưu trữ thông tin từ webhook cập nhật trạng thái tin nhắn Zalo gửi đi.
```sql
CREATE TABLE zalo_template_message_events (
    id UUID PRIMARY KEY,
    oa_id VARCHAR(50),
    app_id VARCHAR(100),
    msg_id VARCHAR(100),
    tracking_id VARCHAR(255),
    event_name VARCHAR(100), -- user_received_message | user_seen_message
    recipient VARCHAR(30),
    delivery_time TIMESTAMP,
    raw_event JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 6.3. API Quản lý & Gửi Template
*   **Tạo template gửi duyệt:** `POST /api/zalo/templates` (gọi sang `business.openapi.zalo.me/template/create`).
*   **Chỉnh sửa template:** `PATCH /api/zalo/templates/:templateId`.
*   **Đồng bộ danh sách template:** `POST /api/zalo/templates/sync` (Đồng bộ danh sách từ Zalo về DB).
*   **Gửi tin template qua SĐT:** `POST /api/zalo/templates/send`
    *   *Yêu cầu đầu vào:* `oaId`, `phone`, `templateId`, `templateData` (chứa các biến động), `mode` (`development` hoặc `production`), `trackingId`.
    *   *Quy trình xử lý:*
        1. Chuẩn hóa số điện thoại về dạng `84xxxxxxxx` (ví dụ `0901234567` : `84901234567`).
        2. Tự động sinh `trackingId` theo nghiệp vụ (ví dụ `ORDER_DH001_1718000000`) nếu thiếu.
        3. Tạo bản ghi trạng thái `pending` trong DB.
        4. Gọi API Zalo (nếu `mode = development`, đính kèm trường `"mode": "development"` vào payload).
        5. Cập nhật trạng thái `sent_to_zalo` và lưu `zaloMsgId` cùng quota còn lại.
*   **Webhook nhận trạng thái tin nhắn:** `POST /api/zalo/webhook/template-message`
    *   Lắng nghe sự kiện `user_received_message` từ Zalo Webhook → Tìm kiếm tin nhắn theo `msg_id` → Cập nhật trạng thái `send_status = 'delivered'` và lưu `delivery_time`.

---

## 7. Module Marketing Automation Workflow

Hỗ trợ doanh nghiệp kéo thả xây dựng kịch bản gửi tin tự động hóa (Marketing Automation) dựa trên thư viện vẽ flowchart **React Flow** (`@xyflow/react`).

### 7.1. Giao diện thiết kế (Workflow Builder)
*   **Canvas thiết kế:** Nơi hiển thị các Node và các đường nối (Edge) kết nối điều kiện. Tích hợp thanh công cụ zoom và bản đồ thu nhỏ (Mini map).
*   **Bảng điều khiển Node (Node Config Panel):** Khi click vào một node, bảng cấu hình chi tiết xuất hiện bên phải để thiết lập thông số.

### 7.2. Data Models (Zustand / API Schema)

#### Đối tượng Automation (Header)
```json
{
  "id": "uuid",
  "name": "Kịch bản gửi tin chúc mừng sinh nhật",
  "description": "Tự động gửi SMS chúc mừng sinh nhật cho khách hàng",
  "trigger_name": "customer_birthday",
  "status": "draft", -- draft | active | paused
  "run_count": 0,
  "success_count": 0,
  "failed_count": 0,
  "success_rate": 0.0,
  "created_at": "2026-06-20T12:00:00Z"
}
```

#### Node Schema
```json
{
  "id": "uuid",
  "automation_id": "uuid",
  "node_type": "trigger", -- trigger | condition | action | delay | end
  "name": "Sự kiện sinh nhật",
  "description": "Kích hoạt vào ngày sinh nhật khách hàng",
  "trigger_type": "birthday_event", -- null nếu không phải trigger
  "action_type": null, -- send_sms | send_zns | create_task
  "delay_value": 0,
  "delay_unit": "minute", -- minute | hour | day | week
  "config": {
    "time": "09:00"
  },
  "position_x": 100.0,
  "position_y": 150.0,
  "sort_order": 0,
  "is_active": true
}
```

#### Edge Schema
```json
{
  "id": "uuid",
  "source_node_id": "uuid_1",
  "target_node_id": "uuid_2",
  "condition_result": "default" -- default | true | false | null
}
```

### 7.3. Các loại Node hỗ trợ và Cấu hình chi tiết
1.  **`trigger` (Node bắt đầu):** Kích hoạt luồng. Hỗ trợ kích hoạt theo hành động (Tạo mới khách hàng, Cập nhật trạng thái khách hàng, Tạo mới công việc) hoặc theo thời gian (Hằng ngày, Trước/Sau sự kiện X ngày).
2.  **`condition` (Node điều kiện):** Rẽ nhánh True/False dựa trên việc kiểm tra thuộc tính khách hàng (Nhóm, Nhãn, Người quản lý) hoặc thuộc tính công việc.
3.  **`action` (Node hành động):** Thực thi tác vụ. Hỗ trợ hành động: Gửi SMS, Gửi tin nhắn ZNS, Giao việc tự động cho nhân viên.
4.  **`delay` (Node chờ):** Tạm dừng luồng trong khoảng thời gian X phút/giờ/ngày/tuần trước khi đi tới node tiếp theo.
5.  **`end` (Node kết thúc):** Đánh dấu kết thúc luồng nghiệp vụ tự động hóa.

### 7.4. Endpoints API cho Automation
*   `GET /api/v1.0/automations`: Lấy danh sách kịch bản.
*   `POST /api/v1.0/automations`: Tạo kịch bản trống.
*   `GET /api/v1.0/automations/:id`: Lấy chi tiết kịch bản (nạp danh sách Nodes và Edges tương ứng).
*   `PUT /api/v1.0/automations/:id`: Lưu thiết kế canvas (gửi danh sách Nodes, Edges lên server).
*   `PATCH /api/v1.0/automations/:id/status`: Bật/Tắt kịch bản (`active` / `paused`).

---

## 8. Đặc tả Phân hệ Tài chính & API Reference

Phần này mô tả sự chuyển đổi từ **Store cục bộ (LocalStorage)** hiện tại sang hệ thống **API Backend chính thức** theo đề xuất thiết kế để kết nối cơ sở dữ liệu.

### 8.1. Quy ước & Quy tắc chung
1.  **Response Envelope:** Sử dụng thống nhất `responseData` thay vì `data`.
2.  **Phân trang:** Định dạng trả về phải tuân thủ dạng `{ rows: [], count: 0 }` thay vì items/total.
3.  **Hóa đơn đính kèm (Attachments):** Nhận mảng đối tượng `[{ "url": "...", "name": "..." }]`. Ảnh/file đính kèm phải được upload trước qua endpoint `/api/v1.0/files` để lấy URL.

### 8.2. Danh mục API Phân hệ Tài chính (Đầy đủ & Chi tiết)

#### A. Tổng quan (Dashboard)
*   **`GET /api/v1.0/finance/dashboard`:** Lấy các con số báo cáo nhanh và dữ liệu dòng tiền.
    *   *Response mẫu:*
        ```json
        {
          "status": "success",
          "responseData": {
            "totalIncome": 150000000,
            "totalExpense": 30000000,
            "totalFund": 1573535000,
            "totalReceivable": 1088149999,
            "totalPayable": 15000000,
            "cashFlow": [
              { "date": "2026-06-01", "income": 50000000, "expense": 10000000, "balance": 1573535000 }
            ]
          }
        }
        ```

#### B. Danh mục tài khoản kế toán (Chart of Accounts)
*   **`GET /api/v1.0/finance/chart-accounts`:** Đổ dữ liệu tài khoản kế toán vào dropdown.
    *   *Response mẫu:*
        ```json
        {
          "status": "success",
          "responseData": {
            "rows": [
              { "id": "uuid-1", "code": "111", "name": "Tiền mặt tại quỹ", "accountType": "ASSET", "isActive": true },
              { "id": "uuid-2", "code": "112", "name": "Tiền gửi ngân hàng", "accountType": "ASSET", "isActive": true }
            ],
            "count": 2
          }
        }
        ```

#### C. Quản lý Quỹ (Funds)
*   **`GET /api/v1.0/finance/funds`:** Lấy danh sách quỹ (tiền mặt, ngân hàng...).
*   **`POST /api/v1.0/finance/funds`:** Tạo quỹ mới.
*   **`GET /api/v1.0/finance/funds/:id`:** Chi tiết quỹ.
*   **`PUT /api/v1.0/finance/funds/:id`:** Cập nhật thông tin quỹ.
*   **`DELETE /api/v1.0/finance/funds/:id`:** Xóa quỹ (chỉ cho phép khi chưa có phát sinh giao dịch).
*   **`GET /api/v1.0/finance/funds/:id/movements`:** Lấy lịch sử biến động số dư (sao kê quỹ).

#### D. Chứng từ Thu/Chi & Chuyển quỹ (Vouchers)
*   **`GET /api/v1.0/finance/vouchers`:** Danh sách chứng từ (Lọc theo `type = RECEIPT | PAYMENT | TRANSFER | ADJUSTMENT`).
*   **`POST /api/v1.0/finance/vouchers`:** Tạo phiếu thu hoặc phiếu chi mới.
    *   *Quy tắc nghiệp vụ:* Số tiền phải > 0. Tự động cập nhật tăng/giảm số dư quỹ tương ứng. Cập nhật giảm trừ công nợ khách hàng nếu nguồn thu liên kết công nợ.
*   **`GET /api/v1.0/finance/vouchers/:id`:** Xem chi tiết phiếu (bao gồm hạch toán nợ/có và file đính kèm).
*   **`PUT /api/v1.0/finance/vouchers/:id`:** Sửa đổi thông tin phiếu nháp (`DRAFT`).
*   **`PATCH /api/v1.0/finance/vouchers/:id/cancel`:** Hủy phiếu thu/chi (nếu đã hoàn thành thì thực hiện hoàn quỹ).
*   **`POST /api/v1.0/finance/vouchers/transfers`:** Giao dịch chuyển tiền giữa các quỹ (`fromFundId`, `toFundId`, `amount`).

#### E. Quản lý Ngân sách (Budgets)
*   **`GET /api/v1.0/finance/budgets`:** Lấy danh sách ngân sách phòng ban/dự án.
*   **`POST /api/v1.0/finance/budgets`:** Khởi tạo ngân sách.
*   **`GET /api/v1.0/finance/budgets/:id`:** Chi tiết ngân sách và hạn mức còn lại.
*   **`PUT /api/v1.0/finance/budgets/:id`:** Sửa đổi ngân sách.
*   **`PATCH /api/v1.0/finance/budgets/:id/close`:** Đóng ngân sách.
*   **`GET /api/v1.0/finance/budgets/:id/usages`:** Log các lần sử dụng/trừ tiền ngân sách.

#### F. Yêu cầu Chi phí (Expense Requests)
*   **`GET /api/v1.0/finance/expense-requests`:** Lịch sử yêu cầu chi tiền của nhân viên.
*   **`POST /api/v1.0/finance/expense-requests`:** Tạo yêu cầu chi phí mới (nhập danh sách dòng chi chi tiết `lineItems`, lý do, ngân sách liên kết).
*   **`GET /api/v1.0/finance/expense-requests/:id`:** Chi tiết yêu cầu và lịch sử phê duyệt (`approvals`).
*   **`PATCH /api/v1.0/finance/expense-requests/:id/submit`:** Gửi phê duyệt (`DRAFT` → `PENDING_APPROVAL`).
*   **`PATCH /api/v1.0/finance/expense-requests/:id/approve`:** Phê duyệt yêu cầu.
*   **`PATCH /api/v1.0/finance/expense-requests/:id/reject`:** Từ chối yêu cầu (bắt buộc nhập lý do từ chối).
*   **`PATCH /api/v1.0/finance/expense-requests/:id/cancel`:** Hủy yêu cầu.

#### G. Quản lý Công nợ (Debts)
*   **`GET /api/v1.0/finance/debts`:** Lấy danh sách công nợ phải thu (Receivable) và phải trả (Payable).
*   **`GET /api/v1.0/finance/debts/:id`:** Chi tiết công nợ và các phiếu thanh toán liên quan.
*   **`GET /api/v1.0/finance/debts/summary`:** Thống kê tổng nợ, phân tích tuổi nợ (aging buckets: 0-30, 31-60, 60+ ngày) phục vụ dự báo dòng tiền.

#### H. Báo cáo Tài chính (Reports)
*   **`GET /api/v1.0/finance/reports/income-statement`:** Báo cáo Kết quả Hoạt động Kinh doanh (doanh thu, giá vốn, chi phí, lợi nhuận).
*   **`GET /api/v1.0/finance/reports/balance-sheet`:** Bảng Cân đối Kế toán (cân đối tài sản và nguồn vốn).
*   **`GET /api/v1.0/finance/reports/cash-flow`:** Báo cáo Lưu chuyển Tiền tệ.

#### I. Đối tác & Nhà cung cấp (Counterparties)
*   **`GET /api/v1.0/finance/counterparties`:** Trả về danh sách đối tượng nhận/nộp tiền.
    *   *Quy tắc:* Khách hàng lấy từ `/customers`, nhân viên lấy từ `/users`, các nhà cung cấp (NCC) lấy từ danh mục Counterparties riêng với thuộc tính `type = SUPPLIER`.

---

## 9. Bảng liên kết chéo giữa các phân hệ

Để giúp các nhà phát triển hình dung rõ luồng dữ liệu truyền tải giữa các thành phần, dưới đây là bảng mô tả sự phụ thuộc và tương tác chéo:

| Phân hệ (Module) | Nhận dữ liệu đầu vào từ | Cung cấp đầu ra cho |
| :--- | :--- | :--- |
| **Dashboard** | `Users` (thống kê nhân sự), `Customers` (thống kê khách hàng), `Finance` (tồn quỹ, dòng tiền) | Màn hình xem nhanh tổng quan của Ban giám trị |
| **Khách hàng** | `Users` (phân vai phụ trách), `Statuses` (trạng thái tiếp cận), `Customer-tags` (nhóm) | `Dashboard` (thống kê), `Tasks` (liên kết việc), `Zalo OA` (chat, marketing) |
| **Người dùng** | `Permissions` (phân quyền), `User-tags`, `User-history` (hoạt động) | `Khách hàng` (phụ trách), `Tasks` (thực hiện), toàn bộ app (`currentUser` session) |
| **Công việc (Tasks)** | `Jobs` (gốc dữ liệu), `Customers` (liên kết khách), `Users` (người làm) | Tab "Công việc" hiển thị tại Chi tiết Khách hàng và Chi tiết User |
| **Bảng tin (Newsfeed)** | `Posts API` (bài viết), `Files` (tải ảnh/video), `currentUser` (avatar, tên) | Khu vực tương tác cộng đồng nội bộ doanh nghiệp |
| **Zalo OA Chat** | `OAuth BFF` (token), `Socket.io` (realtime), `Files` (upload media) | Tab "Hội thoại" tại Chi tiết Khách hàng; Cung cấp template cho Automation/Marketing |
| **Marketing Automation** | `React Flow Canvas`, `Zalo Templates` (mẫu tin nhắn), `Trigger Events` (sự kiện CRM) | `Zalo OA` (tự động gửi ZNS), `Tasks` (tự động tạo việc cho nhân sự) |
| **Tài chính** | `Finance DB` (tài khoản, quỹ), `Expense Requests` (yêu cầu chi), `Customers` (công nợ thu) | `Dashboard` (dữ liệu dòng tiền), Tự động trừ quỹ và tạo phiếu chi sau khi duyệt Expense Request |

## 10. Phân hệ Marketing Landing Page

Chức năng **Landing Page** nằm trong tab **Marketing**, cho phép Admin/Leader tạo các landing page public dùng để chạy quảng cáo Facebook, Zalo, Google hoặc gắn vào website nhằm thu thập thông tin khách hàng tiềm năng (leads) và tự động tạo customer trong CRM.

### 10.1. Luồng nghiệp vụ
```text
Khách hàng mở link landing page (/lp/:slug) từ quảng cáo
→ Nhập thông tin vào form (dynamic fields)
→ Submit (Frontend validate required fields)
→ Gọi Public API submit (không kèm token)
→ Backend kiểm tra landing page active & validate dữ liệu
→ Backend chuẩn hóa số điện thoại, kiểm tra duplicate customer (Option A - Không tạo trùng)
→ Backend tự động tạo/cập nhật customer với source = LANDING_PAGE
→ Lưu lịch sử submission, gắn assigned_user_id & campaign_id nếu có
→ Trả về thông báo thành công cho khách hàng
```

### 10.2. Cấu hình Landing Page & Form Fields
Mỗi Landing Page gồm các thông tin cơ bản: tiêu đề, mô tả, ảnh banner, màu chủ đạo (CTA color), nội dung giới thiệu (HTML/Text) cùng với cấu hình danh sách các trường (Form Fields) động.

Các loại input được hỗ trợ bao gồm:
*   `text` (Text ngắn như Họ tên, Công ty)
*   `phone` (Số điện thoại)
*   `email` (Địa chỉ email)
*   `textarea` (Nhu cầu tư vấn, ghi chú)
*   `select` / `radio` / `checkbox` (Hỗ trợ cấu hình options)
*   `date` (Chọn ngày liên hệ)
*   `hidden` (Trường ẩn chứa campaign, source, staff...)

Cấu trúc JSON lưu cấu hình field động:
```json
{
  "field_key": "service_interest",
  "label": "Dịch vụ quan tâm",
  "type": "select",
  "required": false,
  "placeholder": "Chọn dịch vụ",
  "options": [
    { "label": "Dịch vụ A", "value": "service_a" },
    { "label": "Dịch vụ B", "value": "service_b" }
  ],
  "sort_order": 5
}
```

### 10.3. Thiết kế Database

#### Bảng `landing_pages`
```sql
CREATE TABLE public.landing_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL,
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  banner_url text,
  primary_color varchar(20) DEFAULT '#0C9CEC',
  content text,
  assigned_user_id uuid,
  campaign_id uuid,
  status varchar(20) NOT NULL DEFAULT 'active',
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamptz,
  CONSTRAINT landing_pages_status_check CHECK (status IN ('active', 'inactive', 'deleted'))
);

CREATE UNIQUE INDEX uq_landing_pages_org_slug
  ON public.landing_pages (organization_id, slug)
  WHERE deleted_at IS NULL;
```

#### Bảng `landing_page_fields`
```sql
CREATE TABLE public.landing_page_fields (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id uuid NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  field_key varchar(100) NOT NULL,
  label varchar(255) NOT NULL,
  type varchar(50) NOT NULL,
  required boolean DEFAULT false,
  placeholder varchar(255),
  options jsonb DEFAULT '[]'::jsonb,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT landing_page_fields_type_check CHECK (type IN ('text', 'phone', 'email', 'textarea', 'select', 'radio', 'checkbox', 'date', 'hidden'))
);

CREATE INDEX idx_landing_page_fields_page_id ON public.landing_page_fields(landing_page_id);
CREATE UNIQUE INDEX uq_landing_page_field_key ON public.landing_page_fields(landing_page_id, field_key);
```

#### Bảng `landing_page_submissions`
```sql
CREATE TABLE public.landing_page_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id uuid NOT NULL REFERENCES public.landing_pages(id),
  organization_id uuid NOT NULL,
  customer_id uuid,
  submitted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_source varchar(255),
  utm_medium varchar(255),
  utm_campaign varchar(255),
  utm_content varchar(255),
  utm_term varchar(255),
  ip_address varchar(100),
  user_agent text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_landing_page_submissions_page_id ON public.landing_page_submissions(landing_page_id);
CREATE INDEX idx_landing_page_submissions_customer_id ON public.landing_page_submissions(customer_id);
CREATE INDEX idx_landing_page_submissions_created_at ON public.landing_page_submissions(created_at);
```

### 10.4. Danh mục API

#### A. Admin APIs (Yêu cầu Token `Authorization: Bearer <token>`)
*   `GET /api/v1.0/landing-pages`: Lấy danh sách các landing page có phân trang, tìm kiếm và lọc.
*   `POST /api/v1.0/landing-pages`: Tạo mới landing page (kèm form_fields).
*   `GET /api/v1.0/landing-pages/:id`: Lấy chi tiết landing page và form_fields.
*   `PUT /api/v1.0/landing-pages/:id`: Cập nhật thông tin và danh sách fields.
*   `PATCH /api/v1.0/landing-pages/:id/status`: Bật/tắt hoạt động (`status = active | inactive`).
*   `DELETE /api/v1.0/landing-pages/:id`: Xóa mềm landing page (nếu đã có submissions thì chỉ được cập nhật status = deleted và deleted_at = now).
*   `GET /api/v1.0/landing-pages/:id/submissions`: Xem danh sách lead gửi thông tin về.

#### B. Public APIs (Không yêu cầu token)
*   `GET /api/v1.0/public/landing-pages/:slug`: Trả về cấu hình landing page public phục vụ render UI phía Client.
*   `POST /api/v1.0/public/landing-pages/:slug/submit`: Nhận thông tin đăng ký tư vấn từ khách hàng.
    *   *Payload:* Chứa các key-value của form fields đã nhập, cùng UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`).

### 10.5. Cấu trúc cấu phần FE của Module Landing Page
Quy chuẩn cấu trúc code Frontend tuân theo cấu trúc dự án:
```text
/app/marketing/landing-page/page.tsx  -- Route Admin
/app/lp/[slug]/page.tsx               -- Route Public Landing Page (Responsive Mobile, Load nhanh)

/modules/marketing/landing-page/
├── hooks/useLandingPagePage.ts       -- Logic nghiệp vụ
├── services/landingPages.ts          -- Gọi API (apiClient)
├── types/landingPage.types.ts        -- Định nghĩa Type/Interface
├── utils/landingPageMappers.ts       -- Mappers snake_case ↔ camelCase
├── components/list/                  -- List view, filters, tables
└── components/forms/                 -- Form modal, dynamic field builder, preview, submissions list
```

### 10.6. Quy tắc nghiệp vụ & Bảo mật
1.  **Duplicate Customer Check:** Khi khách hàng submit form, kiểm tra số điện thoại/email trùng lặp trong DB. Nếu đã tồn tại customer: Không tạo mới customer, chỉ lấy `customerId` hiện tại, cập nhật metadata/source và lưu một bản ghi submission mới để theo dõi (Option A).
2.  **Expose Token Prevention:** Không gọi trực tiếp API quản trị `POST /customers` từ form public landing page. Public frontend chỉ gửi yêu cầu qua `/public/landing-pages/:slug/submit`, backend sẽ đảm nhận gọi dịch vụ customer service nội bộ để ghi nhận lead mới.
3.  **Spam Protection:** API Public submit cần có cơ chế rate limit theo IP để chống spam lead.

---
*Tài liệu kết thúc.*
