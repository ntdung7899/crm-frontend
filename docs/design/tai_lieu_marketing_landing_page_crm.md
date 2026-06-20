# TÀI LIỆU TRIỂN KHAI CHỨC NĂNG MARKETING → LANDING PAGE

> Module: **Marketing → Landing Page**  
> Mục tiêu: Cấu hình landing page/form thu thập khách hàng từ quảng cáo và tự động tạo customer trong CRM.  
> Hệ thống: CRM Web/App  
> Tech stack tham chiếu: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, apiClient, response envelope `responseData`.

---

## 1. Tổng quan chức năng

Chức năng **Landing Page** nằm trong tab **Marketing**, cho phép Admin/Leader tạo các landing page public dùng để chạy quảng cáo Facebook, Zalo, Google hoặc gắn vào website.

Khi khách hàng truy cập landing page, nhập thông tin và submit form, hệ thống sẽ:

```text
Khách hàng mở link landing page
→ Nhập thông tin vào form
→ Submit
→ Backend validate dữ liệu
→ Backend tạo hoặc cập nhật customer trong CRM
→ Lưu lịch sử submission
→ Gán customer cho nhân viên/campaign nếu có cấu hình
```

---

## 2. Mục tiêu nghiệp vụ

Module Landing Page cần giải quyết các nhu cầu:

- Tạo được landing page phục vụ chạy quảng cáo.
- Cấu hình được nội dung landing page: tiêu đề, mô tả, banner, màu chủ đạo, nội dung giới thiệu.
- Cấu hình được các input cần thu thập từ khách hàng.
- Sinh được link public để gắn vào ads.
- Khách hàng truy cập link mà không cần đăng nhập.
- Khách hàng submit form và hệ thống tạo customer trong CRM.
- Customer tạo từ landing page có nguồn dữ liệu rõ ràng: `LANDING_PAGE`.
- Lưu UTM để đo hiệu quả quảng cáo.
- Lưu toàn bộ lịch sử submit để đối chiếu và báo cáo.
- Có thể gán khách hàng cho nhân viên phụ trách hoặc chiến dịch.

---

## 3. Vị trí menu

Module được đặt trong tab Marketing:

```text
Marketing
└── Landing Page
```

| Menu cha | Menu con | Mô tả |
|---|---|---|
| Marketing | Landing Page | Quản lý landing page thu thập lead từ quảng cáo |

---

## 4. Vai trò sử dụng

| Vai trò | Quyền |
|---|---|
| Admin | Quản lý toàn bộ landing page |
| Leader | Tạo và quản lý landing page của nhóm/khu vực phụ trách |
| Worker/Nhân viên | Xem customer/lead được gán cho mình |
| Khách hàng public | Truy cập landing page và submit form, không cần đăng nhập |

---

## 5. Phạm vi chức năng

### 5.1. Web Admin

Các chức năng cần có:

- Xem danh sách landing page.
- Tạo landing page.
- Chỉnh sửa landing page.
- Bật/tắt landing page.
- Xóa landing page.
- Preview landing page.
- Copy link public.
- Xem danh sách submission.
- Xem customer được tạo từ landing page.
- Tìm kiếm/lọc landing page.
- Theo dõi số lượt submit.

### 5.2. Public Landing Page

Các chức năng cần có:

- Truy cập landing page theo slug.
- Render nội dung landing page.
- Render form động theo cấu hình.
- Validate input bắt buộc.
- Lấy UTM từ URL.
- Submit thông tin khách hàng.
- Hiển thị thông báo thành công/thất bại.
- Responsive tốt trên mobile.

---

## 6. Quy chuẩn hệ thống cần tuân thủ

### 6.1. Response Envelope

Backend trả dữ liệu theo chuẩn:

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

Khi viết service/frontend phải đọc dữ liệu từ:

```ts
res.responseData
```

Không dùng:

```ts
res.data
```

---

### 6.2. Design System

Module Admin sử dụng brand TechX Blue:

```css
--primary: #0C9CEC;
--primary-hover: #0B5ED6;
--primary-active: #0847A6;
--background: #F6FAFF;
--surface: #FFFFFF;
--border: #DDE7F2;
--text-primary: #0F172A;
--text-secondary: #64748B;
```

Màu mặc định của landing page public:

```text
#0C9CEC
```

Cho phép người dùng cấu hình `primary_color` riêng cho từng landing page.

---

### 6.3. Upload file/banner

Nếu landing page có upload banner hoặc ảnh trong nội dung, sử dụng endpoint upload file hiện tại:

```text
POST /api/v1.0/files
```

Sau khi upload thành công, lưu URL vào:

```text
banner_url
content
form/media config nếu có
```

---

## 7. Cấu hình Landing Page

### 7.1. Thông tin landing page

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `id` | uuid | Auto | ID landing page |
| `organization_id` | uuid | Yes | Tổ chức sở hữu landing page |
| `name` | string | Yes | Tên landing page dùng trong nội bộ |
| `slug` | string | Yes | Đường dẫn public |
| `title` | string | Yes | Tiêu đề hiển thị trên landing page |
| `description` | text | No | Mô tả ngắn |
| `banner_url` | string | No | Ảnh banner |
| `primary_color` | string | No | Màu chủ đạo CTA |
| `content` | text/html | No | Nội dung giới thiệu |
| `assigned_user_id` | uuid | No | Nhân viên phụ trách customer tạo từ landing page |
| `campaign_id` | uuid | No | Chiến dịch marketing liên quan |
| `status` | enum | Yes | `active`, `inactive`, `deleted` |
| `created_by` | uuid | Auto | Người tạo |
| `updated_by` | uuid | Auto | Người cập nhật |
| `created_at` | datetime | Auto | Ngày tạo |
| `updated_at` | datetime | Auto | Ngày cập nhật |
| `deleted_at` | datetime | No | Xóa mềm |

---

## 8. Cấu hình Form Fields

Admin/Leader có thể cấu hình các input cần thu thập trên landing page.

### 8.1. Field mặc định nên có

| Field key | Label | Type | Required | Ghi chú |
|---|---|---|---|---|
| `full_name` | Họ và tên | text | Yes | Tên khách hàng |
| `phone` | Số điện thoại | phone | Yes | Trường định danh chính |
| `email` | Email | email | No | Email khách hàng |
| `address` | Địa chỉ | text | No | Địa chỉ khách hàng |
| `demand` | Nhu cầu quan tâm | textarea | No | Nội dung cần tư vấn |
| `note` | Ghi chú | textarea | No | Ghi chú thêm |

---

### 8.2. Các loại input hỗ trợ

| Type | Mô tả | Ví dụ |
|---|---|---|
| `text` | Text ngắn | Họ tên, công ty |
| `phone` | Số điện thoại | 0909123456 |
| `email` | Email | example@email.com |
| `textarea` | Text dài | Nhu cầu tư vấn |
| `select` | Chọn một giá trị | Khu vực, dịch vụ |
| `radio` | Chọn một trong nhiều giá trị | Loại nhu cầu |
| `checkbox` | Chọn nhiều giá trị | Dịch vụ quan tâm |
| `date` | Chọn ngày | Ngày muốn được liên hệ |
| `hidden` | Trường ẩn | campaign/source/staff |

---

### 8.3. Cấu trúc field config

```json
{
  "field_key": "phone",
  "label": "Số điện thoại",
  "type": "phone",
  "required": true,
  "placeholder": "Nhập số điện thoại",
  "options": [],
  "sort_order": 2
}
```

Với field dạng select/radio/checkbox:

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

---

## 9. Luồng nghiệp vụ

### 9.1. Luồng tạo landing page

```text
Admin/Leader đăng nhập Web Admin
→ Vào Marketing
→ Chọn Landing Page
→ Bấm Tạo landing page
→ Nhập thông tin cơ bản
→ Cấu hình form fields
→ Chọn nhân viên phụ trách/campaign nếu có
→ Lưu landing page
→ Hệ thống sinh link public
→ User copy link để gắn vào quảng cáo
```

---

### 9.2. Luồng khách hàng submit form

```text
Khách hàng mở link landing page từ quảng cáo
→ Xem nội dung landing page
→ Nhập thông tin vào form
→ Bấm Gửi thông tin
→ Frontend validate field bắt buộc
→ Gọi API public submit
→ Backend kiểm tra landing page active
→ Backend validate dữ liệu theo form config
→ Backend kiểm tra duplicate customer
→ Backend tạo hoặc cập nhật customer
→ Backend lưu submission
→ Frontend hiển thị thông báo thành công
```

---

### 9.3. Luồng gán customer

```text
Nếu landing page có assigned_user_id
→ Customer mới được gán cho nhân viên đó

Nếu landing page có campaign_id
→ Customer mới được gán campaign đó

Nếu không có assigned_user_id
→ Customer ở trạng thái chưa phân công
```

---

## 10. API Design

Base URL:

```text
/api/v1.0
```

Admin APIs yêu cầu token:

```text
Authorization: Bearer <token>
```

Public APIs không yêu cầu token.

---

## 10.1. Admin API — Landing Page

### GET `/landing-pages`

Lấy danh sách landing page.

Query params:

| Param | Type | Mô tả |
|---|---|---|
| `currentPage` | number | Trang hiện tại |
| `pageSize` | number | Số bản ghi mỗi trang |
| `keyword` | string | Tìm theo name/slug/title |
| `status` | string | `active`, `inactive` |
| `assigned_user_id` | uuid | Lọc theo nhân viên phụ trách |
| `campaign_id` | uuid | Lọc theo campaign |
| `from_date` | date | Từ ngày |
| `to_date` | date | Đến ngày |

Response:

```json
{
  "status": "success",
  "message": "Thành công",
  "responseData": {
    "rows": [
      {
        "id": "uuid",
        "name": "Landing page sửa máy lạnh",
        "slug": "sua-may-lanh",
        "title": "Đăng ký tư vấn sửa máy lạnh",
        "status": "active",
        "public_url": "https://domain.com/lp/sua-may-lanh",
        "assigned_user_id": "uuid",
        "campaign_id": "uuid",
        "submission_count": 35,
        "customer_count": 30,
        "created_at": "2026-06-20T00:00:00.000Z"
      }
    ],
    "count": 1
  },
  "violations": null
}
```

---

### POST `/landing-pages`

Tạo landing page.

Request:

```json
{
  "name": "Landing page sửa máy lạnh",
  "slug": "sua-may-lanh",
  "title": "Đăng ký tư vấn sửa máy lạnh tại nhà",
  "description": "Nhập thông tin để được tư vấn nhanh.",
  "banner_url": "https://example.com/banner.jpg",
  "primary_color": "#0C9CEC",
  "content": "<p>Dịch vụ sửa máy lạnh chuyên nghiệp...</p>",
  "assigned_user_id": "uuid-nhan-vien",
  "campaign_id": "uuid-campaign",
  "status": "active",
  "form_fields": [
    {
      "field_key": "full_name",
      "label": "Họ và tên",
      "type": "text",
      "required": true,
      "placeholder": "Nhập họ và tên",
      "options": [],
      "sort_order": 1
    },
    {
      "field_key": "phone",
      "label": "Số điện thoại",
      "type": "phone",
      "required": true,
      "placeholder": "Nhập số điện thoại",
      "options": [],
      "sort_order": 2
    }
  ]
}
```

Response:

```json
{
  "status": "success",
  "message": "Tạo landing page thành công",
  "responseData": {
    "id": "uuid",
    "name": "Landing page sửa máy lạnh",
    "slug": "sua-may-lanh"
  },
  "violations": null
}
```

---

### GET `/landing-pages/:id`

Lấy chi tiết landing page.

Response:

```json
{
  "status": "success",
  "message": "Thành công",
  "responseData": {
    "id": "uuid",
    "name": "Landing page sửa máy lạnh",
    "slug": "sua-may-lanh",
    "title": "Đăng ký tư vấn sửa máy lạnh",
    "description": "Nhập thông tin để được tư vấn nhanh.",
    "banner_url": "https://example.com/banner.jpg",
    "primary_color": "#0C9CEC",
    "content": "<p>Dịch vụ...</p>",
    "assigned_user_id": "uuid",
    "campaign_id": "uuid",
    "status": "active",
    "form_fields": []
  },
  "violations": null
}
```

---

### PUT `/landing-pages/:id`

Cập nhật landing page.

Request body tương tự `POST /landing-pages`.

---

### PATCH `/landing-pages/:id/status`

Bật/tắt landing page.

Request:

```json
{
  "status": "inactive"
}
```

---

### DELETE `/landing-pages/:id`

Xóa landing page.

Khuyến nghị:

```text
Không hard delete nếu đã có submission.
Dùng soft delete: status = deleted, deleted_at = now()
```

---

### GET `/landing-pages/:id/submissions`

Lấy danh sách submission của landing page.

Query params:

| Param | Type | Mô tả |
|---|---|---|
| `currentPage` | number | Trang hiện tại |
| `pageSize` | number | Số bản ghi mỗi trang |
| `keyword` | string | Tìm theo tên/số điện thoại/email |
| `from_date` | date | Từ ngày |
| `to_date` | date | Đến ngày |

Response:

```json
{
  "status": "success",
  "message": "Thành công",
  "responseData": {
    "rows": [
      {
        "id": "uuid",
        "landing_page_id": "uuid",
        "customer_id": "uuid",
        "submitted_data": {
          "full_name": "Nguyễn Văn A",
          "phone": "0909123456"
        },
        "utm_source": "facebook",
        "utm_medium": "cpc",
        "utm_campaign": "summer_campaign",
        "utm_content": "banner_01",
        "created_at": "2026-06-20T00:00:00.000Z"
      }
    ],
    "count": 1
  },
  "violations": null
}
```

---

## 10.2. Public API — Landing Page

### GET `/public/landing-pages/:slug`

Lấy thông tin landing page public.

Không cần token.

Response:

```json
{
  "status": "success",
  "message": "Thành công",
  "responseData": {
    "id": "uuid",
    "slug": "sua-may-lanh",
    "title": "Đăng ký tư vấn sửa máy lạnh tại nhà",
    "description": "Nhập thông tin để được tư vấn nhanh.",
    "banner_url": "https://example.com/banner.jpg",
    "primary_color": "#0C9CEC",
    "content": "<p>Dịch vụ sửa máy lạnh chuyên nghiệp...</p>",
    "form_fields": [
      {
        "field_key": "full_name",
        "label": "Họ và tên",
        "type": "text",
        "required": true,
        "placeholder": "Nhập họ và tên",
        "options": [],
        "sort_order": 1
      },
      {
        "field_key": "phone",
        "label": "Số điện thoại",
        "type": "phone",
        "required": true,
        "placeholder": "Nhập số điện thoại",
        "options": [],
        "sort_order": 2
      }
    ]
  },
  "violations": null
}
```

Error nếu không tồn tại hoặc inactive:

```json
{
  "status": "error",
  "message": "Landing page không khả dụng",
  "responseData": null,
  "violations": null
}
```

---

### POST `/public/landing-pages/:slug/submit`

Khách hàng submit form.

Không cần token.

Request:

```json
{
  "full_name": "Nguyễn Văn A",
  "phone": "0909123456",
  "email": "nguyenvana@example.com",
  "address": "Quận 1, TP.HCM",
  "demand": "Tôi muốn được tư vấn dịch vụ",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "campaign_sua_may_lanh",
  "utm_content": "banner_01",
  "utm_term": "keyword_01"
}
```

Backend xử lý:

```text
1. Tìm landing page theo slug
2. Kiểm tra landing page tồn tại và status = active
3. Validate dữ liệu submit theo form_fields
4. Chuẩn hóa phone/email
5. Kiểm tra duplicate customer theo phone/email
6. Tạo mới hoặc cập nhật customer
7. Lưu landing_page_submission
8. Gán assigned_user_id nếu có
9. Gán campaign_id nếu có
10. Trả kết quả thành công
```

Response success:

```json
{
  "status": "success",
  "message": "Gửi thông tin thành công",
  "responseData": {
    "customer_id": "uuid",
    "submission_id": "uuid"
  },
  "violations": null
}
```

Response error:

```json
{
  "status": "error",
  "message": "Vui lòng nhập số điện thoại",
  "responseData": null,
  "violations": [
    {
      "field": "phone",
      "message": "Vui lòng nhập số điện thoại"
    }
  ]
}
```

---

## 11. Customer Integration

Khi khách submit landing page, backend không nên để public frontend gọi trực tiếp API quản trị customer.

Public frontend chỉ gọi:

```text
POST /public/landing-pages/:slug/submit
```

Sau đó backend gọi nội bộ customer service để tạo/cập nhật customer.

Payload customer đề xuất:

```json
{
  "full_name": "Nguyễn Văn A",
  "phone": "0909123456",
  "email": "nguyenvana@example.com",
  "address": "Quận 1, TP.HCM",
  "note": "Tôi muốn được tư vấn dịch vụ",
  "source": "LANDING_PAGE",
  "lead_status": "NEW",
  "assigned_user_id": "uuid-nhan-vien",
  "campaign_id": "uuid-campaign",
  "metadata": {
    "landing_page_id": "uuid",
    "landing_page_slug": "sua-may-lanh",
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "campaign_sua_may_lanh",
    "utm_content": "banner_01",
    "utm_term": "keyword_01"
  }
}
```

Nếu hệ thống customer hiện tại chưa có các field `source`, `lead_status`, `campaign_id`, `metadata`, cần bổ sung migration hoặc map tạm vào field ghi chú/metadata hiện có.

---

## 12. Rule Duplicate Customer

Khuyến nghị chọn Option A.

### Option A — Không tạo trùng customer

Nếu số điện thoại hoặc email đã tồn tại:

```text
- Không tạo customer mới
- Lấy customer_id hiện có
- Có thể cập nhật metadata/source/campaign nếu phù hợp
- Vẫn lưu landing_page_submission mới
- Trả về customer_id hiện có
```

Ưu điểm:

- Không bị rác data.
- CRM dễ quản lý.
- Vẫn tracking được nhiều lần submit.

### Option B — Cho phép tạo lead trùng

Nếu số điện thoại hoặc email đã tồn tại:

```text
- Vẫn tạo customer/lead mới
- Đánh dấu trạng thái duplicate
- Admin xử lý merge sau
```

Nhược điểm:

- Dễ trùng dữ liệu.
- Khó quản lý lịch sử chăm sóc.

Khuyến nghị:

```text
Dùng Option A cho MVP.
```

---

## 13. Database Design

### 13.1. Bảng `landing_pages`

```sql
CREATE TABLE IF NOT EXISTS public.landing_pages (
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

  CONSTRAINT landing_pages_status_check
    CHECK (status IN ('active', 'inactive', 'deleted'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_landing_pages_org_slug
  ON public.landing_pages (organization_id, slug)
  WHERE deleted_at IS NULL;
```

---

### 13.2. Bảng `landing_page_fields`

```sql
CREATE TABLE IF NOT EXISTS public.landing_page_fields (
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

  CONSTRAINT landing_page_fields_type_check
    CHECK (type IN ('text', 'phone', 'email', 'textarea', 'select', 'radio', 'checkbox', 'date', 'hidden'))
);

CREATE INDEX IF NOT EXISTS idx_landing_page_fields_page_id
  ON public.landing_page_fields (landing_page_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_landing_page_field_key
  ON public.landing_page_fields (landing_page_id, field_key);
```

---

### 13.3. Bảng `landing_page_submissions`

```sql
CREATE TABLE IF NOT EXISTS public.landing_page_submissions (
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

CREATE INDEX IF NOT EXISTS idx_landing_page_submissions_page_id
  ON public.landing_page_submissions (landing_page_id);

CREATE INDEX IF NOT EXISTS idx_landing_page_submissions_customer_id
  ON public.landing_page_submissions (customer_id);

CREATE INDEX IF NOT EXISTS idx_landing_page_submissions_created_at
  ON public.landing_page_submissions (created_at);
```

---

## 14. Business Rules

| Mã rule | Nội dung |
|---|---|
| LP-BR-01 | Module nằm trong tab Marketing với tên Landing Page |
| LP-BR-02 | Chỉ Admin/Leader có quyền mới được tạo landing page |
| LP-BR-03 | Mỗi landing page có slug duy nhất trong cùng organization |
| LP-BR-04 | Landing page inactive/deleted không được public và không cho submit |
| LP-BR-05 | Landing page phải có ít nhất một field định danh khách hàng, ưu tiên `phone` |
| LP-BR-06 | Field required phải được validate ở frontend và backend |
| LP-BR-07 | Submit thành công phải tạo customer hoặc cập nhật customer theo duplicate rule |
| LP-BR-08 | Customer được tạo từ form phải có `source = LANDING_PAGE` |
| LP-BR-09 | Nếu landing page có `assigned_user_id`, customer được gán cho nhân viên đó |
| LP-BR-10 | Nếu landing page có `campaign_id`, customer được gán vào campaign đó |
| LP-BR-11 | Mỗi lần submit phải lưu một bản ghi vào `landing_page_submissions` |
| LP-BR-12 | Cần lưu UTM để tracking hiệu quả ads |
| LP-BR-13 | Public submit endpoint cần rate limit/chống spam |
| LP-BR-14 | Không expose token hoặc API quản trị customer ra public landing page |
| LP-BR-15 | Người dùng có thể copy public URL của landing page |
| LP-BR-16 | Không hard delete landing page nếu đã có submission |
| LP-BR-17 | Nếu campaign module chưa có, tạm lưu campaign bằng UTM/campaign text |

---

## 15. UI/UX Admin

### 15.1. Màn hình danh sách Landing Page

Các cột hiển thị:

| Cột | Mô tả |
|---|---|
| Tên landing page | `name` |
| Slug | `slug` |
| Link public | Có nút copy |
| Trạng thái | active/inactive |
| Nhân viên phụ trách | assigned user |
| Campaign | campaign hoặc utm_campaign |
| Số lượt submit | submission_count |
| Số customer tạo được | customer_count |
| Ngày tạo | created_at |
| Thao tác | Xem, sửa, preview, copy link, bật/tắt, xóa |

Bộ lọc:

- Tìm kiếm theo tên/slug/title.
- Lọc theo trạng thái.
- Lọc theo nhân viên phụ trách.
- Lọc theo campaign.
- Lọc theo ngày tạo.

---

### 15.2. Màn hình tạo/cập nhật Landing Page

Form chia thành 4 nhóm:

#### Nhóm 1: Thông tin cơ bản

- Tên landing page.
- Slug.
- Tiêu đề.
- Mô tả.
- Banner.
- Màu chủ đạo.
- Nội dung giới thiệu.

#### Nhóm 2: Cấu hình form

- Add field.
- Remove field.
- Reorder field.
- Cấu hình label.
- Cấu hình type.
- Cấu hình required.
- Cấu hình placeholder.
- Cấu hình options nếu là select/radio/checkbox.

#### Nhóm 3: Gán lead

- Nhân viên phụ trách.
- Campaign.
- Trạng thái.

#### Nhóm 4: Preview

- Xem trước landing page.
- Copy public URL.

---

## 16. UI/UX Public Landing Page

Route public đề xuất:

```text
/lp/:slug
```

Layout tối thiểu:

```text
[Banner]

[Tiêu đề landing page]
[Mô tả ngắn]
[Nội dung giới thiệu]

[Form nhập thông tin]
- Họ tên
- Số điện thoại
- Email
- Địa chỉ
- Nhu cầu tư vấn

[Button CTA: Gửi thông tin / Đăng ký tư vấn]

[Thông báo thành công]
Cảm ơn bạn đã để lại thông tin. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.
```

Yêu cầu:

- Responsive mobile.
- Load nhanh vì dùng để chạy ads.
- CTA rõ ràng.
- Validate lỗi thân thiện.
- Không yêu cầu đăng nhập.
- Có lấy UTM từ URL.
- Không expose token.

---

## 17. Frontend Tasks

### 17.1. Module Admin

Cấu trúc đề xuất:

```text
/app/marketing/landing-page/page.tsx

/modules/marketing/landing-page/
├── hooks/useLandingPagePage.ts
├── services/landingPages.ts
├── types/landingPage.types.ts
├── utils/landingPageMappers.ts
├── components/list/LandingPageListView.tsx
├── components/list/LandingPageTable.tsx
├── components/list/LandingPageFilters.tsx
├── components/forms/LandingPageFormModal.tsx
├── components/forms/LandingPageFieldBuilder.tsx
├── components/forms/LandingPageFieldEditor.tsx
├── components/forms/LandingPagePreviewModal.tsx
└── components/forms/LandingPageSubmissionsModal.tsx
```

Việc cần làm:

- Thêm menu Marketing → Landing Page.
- Tạo page route.
- Tạo service gọi API.
- Tạo type API row và UI model.
- Tạo mapper snake_case ↔ camelCase.
- Tạo danh sách landing page.
- Tạo form tạo/sửa.
- Tạo form builder động.
- Tạo preview modal.
- Tạo copy public link.
- Tạo submissions modal.
- Sử dụng `ListPageLayout` nếu phù hợp.
- Sử dụng `ToastProvider` để báo thành công/lỗi.
- Sử dụng `useDeleteConfirmation` cho xóa.

---

### 17.2. Public Frontend

Route:

```text
/app/lp/[slug]/page.tsx
```

Việc cần làm:

- Gọi `GET /public/landing-pages/:slug`.
- Render nội dung landing page.
- Render dynamic form theo `form_fields`.
- Lấy UTM từ query string:
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `utm_content`
  - `utm_term`
- Submit form qua `POST /public/landing-pages/:slug/submit`.
- Hiển thị loading khi submit.
- Hiển thị success/error message.
- Validate required field trước khi submit.
- Responsive tốt trên mobile.

Ví dụ link chạy ads:

```text
https://crm-domain.com/lp/sua-may-lanh?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_2026&utm_content=banner_01
```

---

## 18. Backend Tasks

Module backend đề xuất:

```text
LandingPageController
LandingPageService
PublicLandingPageController
LandingPageSubmissionService
CustomerService integration
```

Việc cần làm:

- CRUD landing page.
- CRUD landing page fields.
- Public get landing page by slug.
- Public submit landing page.
- Validate dynamic form.
- Map data sang customer.
- Gọi customer service tạo/cập nhật customer.
- Lưu submission.
- Lưu UTM.
- Lưu IP/user-agent.
- Rate limit endpoint public submit.
- Không yêu cầu token cho public endpoints.
- Auth required cho admin endpoints.
- Kiểm tra quyền Admin/Leader.

---

## 19. Validation

### 19.1. Validate khi tạo landing page

| Field | Rule |
|---|---|
| `name` | Required |
| `slug` | Required, lowercase, không dấu, không khoảng trắng |
| `title` | Required |
| `status` | `active`, `inactive` |
| `form_fields` | Array |
| `form_fields[].field_key` | Required, unique trong landing page |
| `form_fields[].label` | Required |
| `form_fields[].type` | Required, nằm trong danh sách type hợp lệ |
| `form_fields[].required` | Boolean |
| `options` | Required nếu type là select/radio/checkbox |

---

### 19.2. Validate khi khách submit

| Field | Rule |
|---|---|
| Required fields | Không được rỗng |
| Phone | Đúng format số điện thoại |
| Email | Đúng format email nếu có nhập |
| Select/radio | Value phải nằm trong options |
| Checkbox | Value phải là array |
| Landing page | Phải tồn tại và active |
| Payload size | Không vượt quá giới hạn cho phép |

---

## 20. Security / Anti-spam

Public endpoint cần có:

- Rate limit theo IP.
- Chống submit quá nhanh.
- Có thể tích hợp captcha ở phase sau.
- Không cho submit nếu landing page inactive.
- Không expose API quản trị ra public.
- Không expose token.
- Sanitize input để tránh XSS.
- Log IP/user-agent.
- Giới hạn kích thước payload.
- Không lưu dữ liệu nhạy cảm không cần thiết.

---

## 21. Error Handling

| Trường hợp | Response đề xuất |
|---|---|
| Landing page không tồn tại | `404 - Landing page không tồn tại` |
| Landing page inactive | `403 - Landing page không khả dụng` |
| Thiếu field bắt buộc | `400 - Vui lòng nhập [label]` |
| Phone không hợp lệ | `400 - Số điện thoại không hợp lệ` |
| Email không hợp lệ | `400 - Email không hợp lệ` |
| Submit quá nhiều lần | `429 - Bạn gửi quá nhiều lần, vui lòng thử lại sau` |
| Lỗi tạo customer | `500 - Không thể lưu thông tin, vui lòng thử lại` |

---

## 22. Acceptance Criteria

| Mã | Tiêu chí nghiệm thu |
|---|---|
| LP-AC-01 | Menu Marketing có item Landing Page |
| LP-AC-02 | Admin/Leader tạo được landing page |
| LP-AC-03 | Landing page cấu hình được tiêu đề, mô tả, banner, màu chủ đạo |
| LP-AC-04 | Landing page cấu hình được danh sách input động |
| LP-AC-05 | Có thể bật/tắt landing page |
| LP-AC-06 | Có thể copy link public landing page |
| LP-AC-07 | Khách hàng truy cập landing page public mà không cần đăng nhập |
| LP-AC-08 | Public landing page render đúng form fields đã cấu hình |
| LP-AC-09 | Required fields được validate trước khi submit |
| LP-AC-10 | Submit thành công tạo hoặc cập nhật customer trong CRM |
| LP-AC-11 | Customer có `source = LANDING_PAGE` |
| LP-AC-12 | Customer được gán `assigned_user_id` nếu landing page có cấu hình |
| LP-AC-13 | Customer được gán `campaign_id` nếu landing page có cấu hình |
| LP-AC-14 | Hệ thống lưu submission sau mỗi lần submit |
| LP-AC-15 | Admin xem được danh sách submission của landing page |
| LP-AC-16 | Landing page inactive thì không cho khách submit |
| LP-AC-17 | UTM từ URL được lưu vào submission/customer metadata |
| LP-AC-18 | Endpoint public submit có chống spam/rate limit cơ bản |
| LP-AC-19 | Không gọi trực tiếp API customer có token từ public frontend |
| LP-AC-20 | UI public responsive tốt trên mobile |
| LP-AC-21 | Response frontend đọc đúng từ `responseData` |
| LP-AC-22 | UI Admin tuân thủ design system TechX Blue |

---

## 23. Phase triển khai

### Phase 1 — MVP

| Hạng mục |
|---|
| Menu Marketing → Landing Page |
| CRUD landing page |
| Cấu hình form fields cơ bản |
| Public landing page theo slug |
| Public submit form |
| Tạo/cập nhật customer từ submission |
| Lưu submission |
| Copy public link |
| Validate required fields |
| Lưu UTM cơ bản |

---

### Phase 2 — Tracking & Quản trị

| Hạng mục |
|---|
| Danh sách submissions |
| Thống kê số lượt submit |
| Gán nhân viên phụ trách |
| Gán campaign |
| Xử lý duplicate customer |
| Bộ lọc theo ngày/campaign/nhân viên |
| Preview landing page |

---

### Phase 3 — Nâng cao

| Hạng mục |
|---|
| Drag/drop reorder fields |
| Captcha chống spam |
| Template landing page |
| Báo cáo conversion |
| A/B testing |
| Kết nối automation sau khi submit |
| Tự động gửi ZNS/SMS sau submit |

---

## 24. Checklist cho AI Dev

### Backend

- [ ] Tạo bảng `landing_pages`.
- [ ] Tạo bảng `landing_page_fields`.
- [ ] Tạo bảng `landing_page_submissions`.
- [ ] Tạo API `GET /landing-pages`.
- [ ] Tạo API `POST /landing-pages`.
- [ ] Tạo API `GET /landing-pages/:id`.
- [ ] Tạo API `PUT /landing-pages/:id`.
- [ ] Tạo API `PATCH /landing-pages/:id/status`.
- [ ] Tạo API `DELETE /landing-pages/:id`.
- [ ] Tạo API `GET /landing-pages/:id/submissions`.
- [ ] Tạo API `GET /public/landing-pages/:slug`.
- [ ] Tạo API `POST /public/landing-pages/:slug/submit`.
- [ ] Tích hợp customer service.
- [ ] Xử lý duplicate customer.
- [ ] Lưu UTM/IP/user-agent.
- [ ] Rate limit public submit.

### Frontend Admin

- [ ] Thêm menu Marketing → Landing Page.
- [ ] Tạo route `/marketing/landing-page`.
- [ ] Tạo service `landingPages.ts`.
- [ ] Tạo types.
- [ ] Tạo mapper.
- [ ] Tạo list page.
- [ ] Tạo table.
- [ ] Tạo filters.
- [ ] Tạo form modal.
- [ ] Tạo dynamic field builder.
- [ ] Tạo preview modal.
- [ ] Tạo submissions modal.
- [ ] Tạo copy link action.
- [ ] Gọi API và đọc `responseData`.

### Frontend Public

- [ ] Tạo route `/lp/[slug]`.
- [ ] Gọi public landing page API.
- [ ] Render nội dung landing page.
- [ ] Render dynamic form.
- [ ] Validate field required.
- [ ] Lấy UTM từ URL.
- [ ] Submit form.
- [ ] Hiển thị success/error.
- [ ] Responsive mobile.

---

## 25. Prompt ngắn để giao cho AI Dev

Triển khai module mới tên **Landing Page** nằm trong tab **Marketing** của hệ thống CRM.

Module cho phép Admin/Leader tạo landing page dùng để chạy ads thu thập thông tin khách hàng. Người dùng cấu hình được tiêu đề, mô tả, banner, màu chủ đạo, nội dung giới thiệu và danh sách input động của form.

Hệ thống sinh link public dạng:

```text
/lp/:slug
```

Khách hàng truy cập link này không cần đăng nhập, nhập thông tin vào form và submit. Khi submit, frontend gọi API public:

```text
POST /api/v1.0/public/landing-pages/:slug/submit
```

Backend validate landing page, validate form fields, lưu submission, sau đó tạo hoặc cập nhật customer trong CRM thông qua customer service nội bộ.

Customer tạo từ landing page cần có:

```text
source = LANDING_PAGE
lead_status = NEW
assigned_user_id = assigned_user_id của landing page nếu có
campaign_id = campaign_id của landing page nếu có
metadata chứa landing_page_id, slug và UTM
```

Không được để public frontend gọi trực tiếp API quản trị `POST /customers` nếu API này yêu cầu token. Public frontend chỉ gọi endpoint public submit, backend xử lý tạo customer nội bộ.

Frontend phải tuân thủ kiến trúc module hiện tại:

```text
page.tsx
hooks/use<Module>Page.ts
services/<module>.ts
components/list/*
components/forms/*
utils/*Mappers.ts
types/*.ts
```

Response API phải đọc từ `responseData`, không đọc từ `data`.

UI Admin dùng design system TechX Blue, màu chính `#0C9CEC`.

Cần có database cho:

```text
landing_pages
landing_page_fields
landing_page_submissions
```

Cần có API CRUD landing page, API public get by slug, API public submit, UI Web Admin và UI Public Landing Page responsive mobile.

---

## 26. Ghi chú còn cần xác nhận

Trước khi triển khai backend production, cần xác nhận thêm:

1. API tạo customer hiện tại chính xác là endpoint nào.
2. Payload customer hiện tại gồm field nào.
3. Bảng customer hiện tại có `source`, `lead_status`, `metadata`, `campaign_id` chưa.
4. Campaign module đã có hay chưa.
5. Leader được quản lý landing page theo nhóm/khu vực hay chỉ landing page do mình tạo.
6. Có cần captcha ngay trong MVP không.
7. Có cần gửi thông báo cho nhân viên phụ trách khi có lead mới không.

Nếu chưa có các thông tin trên, MVP vẫn có thể triển khai theo hướng:
- Lưu submission đầy đủ.
- Tạo customer bằng service hiện tại.
- Tạm lưu campaign/UTM trong metadata.
- Bổ sung notification/captcha/campaign nâng cao ở phase sau.
