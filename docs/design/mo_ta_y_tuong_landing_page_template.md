# TÀI LIỆU MÔ TẢ Ý TƯỞNG: LANDING PAGE TEMPLATE → TẠO LANDING PAGE TỪ MẪU

> Module: **Marketing → Landing Page**  
> Ý tưởng chính: Không để người dùng tự thiết kế landing page từ đầu. Hệ thống cung cấp sẵn các mẫu landing page do admin/dev/team thiết kế. Khi tạo landing page mới, người dùng chọn một mẫu có sẵn, sau đó chỉ thay nội dung, form input, nhân viên phụ trách/campaign và publish.

---

## 1. Bối cảnh

Hiện tại màn hình tạo landing page đang đi theo hướng nhập thông tin trực tiếp:

```text
Tạo Landing Page mới
→ Nhập thông tin chung
→ Thiết kế form
→ Gán lead & cấu hình
→ Lưu
```

Cách này có thể dùng được, nhưng với người dùng không chuyên thiết kế, nếu để họ tự nhập toàn bộ landing page từ đầu thì dễ gặp các vấn đề:

- Landing page tạo ra không đồng bộ giao diện.
- Người dùng không biết nên bố cục landing page như thế nào.
- Tốn thời gian tạo page mới cho mỗi chiến dịch.
- Dễ làm sai UX/CTA, ảnh hưởng hiệu quả chạy ads.
- Khó kiểm soát brand và chất lượng hiển thị.

Do đó, cần đổi hướng sang mô hình **template-based landing page**.

---

## 2. Ý tưởng mới cần triển khai

Khi user tạo landing page mới, hệ thống sẽ cho chọn một số landing page mẫu có sẵn.

Sau khi chọn mẫu, hệ thống clone cấu hình mẫu sang landing page mới. User chỉ cần sửa:

- Tên landing page nội bộ.
- Slug public.
- Tiêu đề.
- Mô tả.
- Banner/ảnh.
- Nội dung giới thiệu nếu cần.
- Form input cần thu thập.
- Nhân viên phụ trách lead.
- Campaign/UTM nếu có.
- Trạng thái publish.

Flow mới:

```text
Marketing → Landing Page
→ Bấm “Tạo Landing Page”
→ Chọn mẫu landing page có sẵn
→ Hệ thống clone dữ liệu từ template
→ User chỉnh nội dung cơ bản
→ User chỉnh form input
→ User gán nhân viên/campaign
→ Lưu hoặc Publish
→ Hệ thống sinh link public /lp/:slug
```

---

## 3. Mục tiêu nghiệp vụ

Chức năng này giúp:

- Tạo landing page nhanh hơn.
- Đảm bảo giao diện landing page đồng bộ và đẹp.
- Người dùng không phải thiết kế layout từ đầu.
- Mỗi landing page vẫn tùy chỉnh được nội dung và input form.
- Phù hợp chạy nhiều chiến dịch ads khác nhau.
- Dễ mở rộng thêm template mới trong tương lai.
- Dễ kiểm soát brand và trải nghiệm người dùng.

---

## 4. Phân biệt 2 khái niệm

Cần tách rõ 2 khái niệm:

## 4.1. Landing Page Template

Là mẫu landing page có sẵn do hệ thống/team tạo.

Template dùng để làm khuôn mẫu.

Ví dụ:

- Mẫu tư vấn dịch vụ.
- Mẫu đăng ký nhận báo giá.
- Mẫu đặt lịch hẹn.
- Mẫu thu lead bảo trì/sửa chữa.
- Mẫu giới thiệu sản phẩm.
- Mẫu đăng ký sự kiện.
- Mẫu tuyển dụng.

Template không phải là landing page public cho khách hàng dùng trực tiếp. Template chỉ dùng để clone ra landing page thật.

## 4.2. Landing Page

Là landing page thật được tạo từ template.

Landing page này có slug public, ví dụ:

```text
/lp/sua-may-lanh-q1
/lp/dang-ky-tu-van-crm
/lp/bao-gia-dich-vu
```

Khách hàng sẽ truy cập landing page này từ quảng cáo và submit thông tin.

---

## 5. Flow người dùng đề xuất

## 5.1. Flow tạo Landing Page mới

```text
User vào Marketing → Landing Page
→ Bấm “Tạo Landing Page”
→ Màn hình Chọn mẫu xuất hiện
→ User chọn một template
→ Bấm “Sử dụng mẫu này”
→ Hệ thống chuyển sang màn cấu hình landing page
→ Các field được auto-fill từ template
→ User chỉnh thông tin cần thiết
→ User chỉnh form input
→ User gán nhân viên/campaign
→ User lưu nháp hoặc publish
```

## 5.2. Flow sau khi chọn template

Khi user chọn template, hệ thống tự fill:

| Dữ liệu | Lấy từ template |
|---|---|
| Layout landing page | Có |
| Tiêu đề mặc định | Có |
| Mô tả mặc định | Có |
| Banner mặc định | Có |
| Nội dung giới thiệu | Có |
| Màu CTA | Có |
| CTA text | Có |
| Form fields mặc định | Có |
| Thank you message | Có |

User có thể chỉnh lại tất cả dữ liệu trên ở landing page thật.

---

## 6. UI/UX đề xuất

## 6.1. Cấu trúc màn hình tạo Landing Page

Thay vì 3 tab hiện tại:

```text
Thông tin chung
Thiết kế Form
Gán Lead & Cấu hình
```

Nên đổi thành 4 bước:

```text
1. Chọn mẫu
2. Thông tin chung
3. Thiết kế Form
4. Gán Lead & Cấu hình
```

Hoặc dùng dạng stepper:

```text
[1 Chọn mẫu] → [2 Nội dung] → [3 Form] → [4 Cấu hình & Publish]
```

---

## 6.2. Bước 1 — Chọn mẫu

Màn hình hiển thị danh sách template dạng card.

Mỗi card template gồm:

| Thành phần | Mô tả |
|---|---|
| Ảnh preview | Ảnh mô phỏng giao diện landing page |
| Tên mẫu | Ví dụ: “Mẫu thu lead dịch vụ” |
| Mô tả ngắn | Mẫu phù hợp cho chạy ads dịch vụ |
| Loại mẫu | Service, Product, Booking, Event, Recruitment |
| Số field mặc định | Ví dụ: 4 input |
| Nút xem trước | Preview mẫu |
| Nút sử dụng | Clone mẫu này |

Ví dụ layout:

```text
[Tạo Landing Page mới]

Chọn mẫu Landing Page phù hợp với chiến dịch của bạn

┌──────────────────────────────┐
│ [Ảnh preview]                │
│ Mẫu tư vấn dịch vụ           │
│ Phù hợp thu lead dịch vụ     │
│ Form: Họ tên, SĐT, nhu cầu   │
│ [Xem trước] [Sử dụng mẫu]    │
└──────────────────────────────┘

┌──────────────────────────────┐
│ [Ảnh preview]                │
│ Mẫu nhận báo giá             │
│ Phù hợp chiến dịch báo giá   │
│ Form: Họ tên, SĐT, địa chỉ   │
│ [Xem trước] [Sử dụng mẫu]    │
└──────────────────────────────┘
```

---

## 6.3. Bước 2 — Thông tin chung

Sau khi chọn mẫu, hệ thống auto-fill thông tin từ template.

User chỉnh các field:

| Field | Mô tả |
|---|---|
| Tên Landing Page nội bộ | Tên để quản lý trong admin |
| Slug | Link public |
| Tiêu đề public | Tiêu đề khách hàng nhìn thấy |
| Mô tả ngắn | Mô tả dưới tiêu đề |
| Banner URL | Ảnh banner |
| Màu chủ đạo | Màu CTA |
| CTA text | Text nút submit |
| Nội dung giới thiệu | HTML/Text mô tả dịch vụ |

---

## 6.4. Bước 3 — Thiết kế Form

Đây là phần quan trọng nhất.

User không cần thiết kế lại layout, chỉ cần chỉnh input form.

Form field mặc định lấy từ template. User có thể:

- Thêm field.
- Xóa field.
- Đổi label.
- Đổi placeholder.
- Bật/tắt required.
- Đổi thứ tự field.
- Cấu hình options cho select/radio/checkbox.

Ví dụ template mặc định có:

```text
Họ và tên
Số điện thoại
Nhu cầu tư vấn
```

User có thể thêm:

```text
Email
Địa chỉ
Khu vực
Dịch vụ quan tâm
Ngày muốn được liên hệ
Ghi chú
```

---

## 6.5. Bước 4 — Gán Lead & Cấu hình

User cấu hình:

| Field | Mô tả |
|---|---|
| Nhân viên phụ trách | Lead submit sẽ gán cho nhân viên này |
| Campaign | Gắn lead với campaign |
| Trạng thái | Draft/Active/Inactive |
| Thank you message | Tin nhắn sau khi khách submit |
| Redirect URL | Nếu cần chuyển khách sang trang khác sau submit |
| Bật/tắt tracking UTM | Lưu source/campaign từ URL |
| Publish | Bật landing page public |

---

## 7. Danh sách template nên có sẵn

## 7.1. Template 1 — Mẫu tư vấn dịch vụ

Dùng cho các dịch vụ cần tư vấn sau khi khách để lại thông tin.

Ví dụ ngành:

- Sửa chữa.
- Bảo trì.
- Vệ sinh.
- Tư vấn phần mềm.
- Dịch vụ kỹ thuật.

Form mặc định:

| Field | Type | Required |
|---|---|---|
| Họ và tên | text | Yes |
| Số điện thoại | phone | Yes |
| Nhu cầu tư vấn | textarea | No |

---

## 7.2. Template 2 — Mẫu đăng ký nhận báo giá

Dùng cho chiến dịch ads kêu gọi khách nhận báo giá.

Form mặc định:

| Field | Type | Required |
|---|---|---|
| Họ và tên | text | Yes |
| Số điện thoại | phone | Yes |
| Email | email | No |
| Sản phẩm/dịch vụ quan tâm | select | No |
| Ghi chú | textarea | No |

---

## 7.3. Template 3 — Mẫu đặt lịch hẹn

Dùng cho dịch vụ cần hẹn lịch.

Form mặc định:

| Field | Type | Required |
|---|---|---|
| Họ và tên | text | Yes |
| Số điện thoại | phone | Yes |
| Ngày muốn được liên hệ | date | No |
| Khung giờ mong muốn | select | No |
| Địa chỉ | text | No |

---

## 7.4. Template 4 — Mẫu giới thiệu sản phẩm

Dùng cho landing page bán sản phẩm hoặc giới thiệu sản phẩm mới.

Form mặc định:

| Field | Type | Required |
|---|---|---|
| Họ và tên | text | Yes |
| Số điện thoại | phone | Yes |
| Sản phẩm quan tâm | select | No |
| Số lượng dự kiến | text | No |
| Ghi chú | textarea | No |

---

## 7.5. Template 5 — Mẫu đăng ký sự kiện

Dùng cho workshop, webinar, offline event.

Form mặc định:

| Field | Type | Required |
|---|---|---|
| Họ và tên | text | Yes |
| Số điện thoại | phone | Yes |
| Email | email | Yes |
| Công ty/trường học | text | No |
| Số lượng người tham gia | text | No |

---

## 8. Data Model đề xuất

## 8.1. Bảng `landing_page_templates`

Bảng lưu các mẫu landing page có sẵn.

```sql
CREATE TABLE IF NOT EXISTS public.landing_page_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid,
  name varchar(255) NOT NULL,
  description text,
  category varchar(100),
  preview_image_url text,
  layout_type varchar(100) NOT NULL DEFAULT 'basic_lead_form',
  default_title varchar(255),
  default_description text,
  default_banner_url text,
  default_primary_color varchar(20) DEFAULT '#0C9CEC',
  default_cta_text varchar(100) DEFAULT 'Gửi thông tin',
  default_content text,
  default_form_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_thank_you_message text DEFAULT 'Cảm ơn bạn đã để lại thông tin. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.',
  status varchar(20) NOT NULL DEFAULT 'active',
  is_system_template boolean DEFAULT false,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamptz,

  CONSTRAINT landing_page_templates_status_check
    CHECK (status IN ('active', 'inactive', 'deleted'))
);
```

Ghi chú:

- `is_system_template = true`: template mặc định của hệ thống.
- `organization_id = null`: template global dùng chung.
- `organization_id != null`: template riêng của tổ chức.

---

## 8.2. Bảng `landing_pages`

Bảng lưu landing page thật được tạo từ template.

```sql
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL,
  template_id uuid REFERENCES public.landing_page_templates(id),
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  banner_url text,
  primary_color varchar(20) DEFAULT '#0C9CEC',
  cta_text varchar(100) DEFAULT 'Gửi thông tin',
  content text,
  assigned_user_id uuid,
  campaign_id uuid,
  status varchar(20) NOT NULL DEFAULT 'draft',
  thank_you_message text DEFAULT 'Cảm ơn bạn đã để lại thông tin. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.',
  redirect_url text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  published_at timestamptz,
  deleted_at timestamptz,

  CONSTRAINT landing_pages_status_check
    CHECK (status IN ('draft', 'active', 'inactive', 'deleted'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_landing_pages_org_slug
  ON public.landing_pages (organization_id, slug)
  WHERE deleted_at IS NULL;
```

---

## 8.3. Bảng `landing_page_fields`

Bảng lưu các input của landing page thật.

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

CREATE UNIQUE INDEX IF NOT EXISTS uq_landing_page_field_key
  ON public.landing_page_fields (landing_page_id, field_key);
```

---

## 8.4. Bảng `landing_page_submissions`

Bảng lưu từng lượt submit của khách.

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
```

---

## 9. API đề xuất

Base URL:

```text
/api/v1.0
```

Response phải dùng chuẩn:

```json
{
  "status": "success",
  "message": "Thành công",
  "responseData": {},
  "violations": null
}
```

---

## 9.1. API Landing Page Templates

### GET `/landing-page-templates`

Lấy danh sách template.

Query params:

| Param | Mô tả |
|---|---|
| `keyword` | Tìm theo tên/mô tả |
| `category` | Lọc theo loại template |
| `status` | active/inactive |

Response:

```json
{
  "status": "success",
  "message": "Thành công",
  "responseData": {
    "rows": [
      {
        "id": "uuid",
        "name": "Mẫu tư vấn dịch vụ",
        "description": "Phù hợp thu lead dịch vụ",
        "category": "service",
        "preview_image_url": "https://example.com/preview.jpg",
        "layout_type": "basic_lead_form",
        "default_title": "Đăng ký tư vấn dịch vụ",
        "default_description": "Để lại thông tin để được tư vấn nhanh",
        "default_primary_color": "#0C9CEC",
        "default_cta_text": "Đăng ký tư vấn",
        "default_form_fields": []
      }
    ],
    "count": 1
  },
  "violations": null
}
```

---

### GET `/landing-page-templates/:id`

Lấy chi tiết template.

---

### POST `/landing-page-templates`

Tạo template mới.

API này có thể chỉ dành cho Admin hệ thống hoặc Owner.

---

### PUT `/landing-page-templates/:id`

Cập nhật template.

---

### DELETE `/landing-page-templates/:id`

Xóa mềm template.

---

## 9.2. API tạo Landing Page từ Template

### POST `/landing-pages/from-template`

Tạo landing page mới từ một template.

Request:

```json
{
  "template_id": "uuid-template",
  "name": "Landing page sửa máy lạnh Q1",
  "slug": "sua-may-lanh-q1"
}
```

Backend xử lý:

```text
1. Tìm template theo template_id
2. Kiểm tra template active
3. Clone default_title → landing_pages.title
4. Clone default_description → landing_pages.description
5. Clone default_banner_url → landing_pages.banner_url
6. Clone default_primary_color → landing_pages.primary_color
7. Clone default_cta_text → landing_pages.cta_text
8. Clone default_content → landing_pages.content
9. Clone default_form_fields → landing_page_fields
10. Tạo landing page ở trạng thái draft
11. Trả về landing page vừa tạo
```

Response:

```json
{
  "status": "success",
  "message": "Tạo landing page từ mẫu thành công",
  "responseData": {
    "id": "uuid-landing-page",
    "template_id": "uuid-template",
    "name": "Landing page sửa máy lạnh Q1",
    "slug": "sua-may-lanh-q1",
    "status": "draft"
  },
  "violations": null
}
```

---

## 9.3. API Landing Pages

### GET `/landing-pages`

Lấy danh sách landing page.

### POST `/landing-pages`

Tạo landing page thủ công không qua template.

Có thể giữ lại API này nhưng UI chính nên ưu tiên tạo từ template.

### GET `/landing-pages/:id`

Lấy chi tiết landing page.

### PUT `/landing-pages/:id`

Cập nhật landing page.

### PATCH `/landing-pages/:id/status`

Bật/tắt/publish landing page.

Request:

```json
{
  "status": "active"
}
```

### DELETE `/landing-pages/:id`

Xóa mềm landing page.

### GET `/landing-pages/:id/submissions`

Lấy danh sách submit của landing page.

---

## 9.4. Public API

### GET `/public/landing-pages/:slug`

Lấy dữ liệu landing page public.

Không cần token.

### POST `/public/landing-pages/:slug/submit`

Khách submit form.

Không cần token.

Backend sau khi submit cần:

```text
Validate landing page active
→ Validate form fields
→ Check duplicate customer
→ Create/update customer
→ Save submission
→ Return success
```

---

## 10. Frontend flow chi tiết

## 10.1. Route Admin

Đề xuất route:

```text
/marketing/landing-page
/marketing/landing-page/new
/marketing/landing-page/:id/edit
```

## 10.2. Route Public

```text
/lp/:slug
```

## 10.3. Cấu trúc module Frontend

```text
/app/marketing/landing-page/page.tsx
/app/marketing/landing-page/new/page.tsx
/app/marketing/landing-page/[id]/edit/page.tsx
/app/lp/[slug]/page.tsx

/modules/marketing/landing-page/
├── hooks/useLandingPagePage.ts
├── hooks/useLandingPageCreatePage.ts
├── hooks/useLandingPageTemplatePicker.ts
├── services/landingPages.ts
├── services/landingPageTemplates.ts
├── types/landingPage.types.ts
├── utils/landingPageMappers.ts
├── components/template-picker/LandingPageTemplatePicker.tsx
├── components/template-picker/LandingPageTemplateCard.tsx
├── components/template-picker/LandingPageTemplatePreviewModal.tsx
├── components/list/LandingPageListView.tsx
├── components/forms/LandingPageForm.tsx
├── components/forms/LandingPageFieldBuilder.tsx
├── components/forms/LandingPageFieldEditor.tsx
├── components/forms/LandingPageLeadConfig.tsx
└── components/public/PublicLandingPageView.tsx
```

---

## 11. UI states cần xử lý

## 11.1. Khi chưa chọn template

Hiển thị màn chọn mẫu.

```text
Tiêu đề: Chọn mẫu Landing Page
Mô tả: Hãy chọn một mẫu phù hợp với chiến dịch quảng cáo của bạn.
Danh sách template cards
```

Button:

```text
Xem trước
Sử dụng mẫu này
```

## 11.2. Khi đã chọn template

Chuyển sang form cấu hình landing page.

Hiển thị thông tin:

```text
Đang sử dụng mẫu: Mẫu tư vấn dịch vụ
[Đổi mẫu]
```

Nếu user bấm đổi mẫu, cần cảnh báo:

```text
Đổi mẫu có thể thay thế nội dung và form hiện tại. Bạn có chắc muốn tiếp tục không?
```

---

## 12. Business Rules

| Mã | Rule |
|---|---|
| LPT-BR-01 | Khi tạo landing page mới, UI mặc định phải bắt đầu bằng bước chọn template |
| LPT-BR-02 | Template chỉ dùng để clone, không phải landing page public |
| LPT-BR-03 | Landing page thật phải lưu `template_id` nếu được tạo từ template |
| LPT-BR-04 | Sau khi clone, landing page có thể chỉnh độc lập, không bị ảnh hưởng nếu template thay đổi |
| LPT-BR-05 | Template inactive không được chọn để tạo landing page mới |
| LPT-BR-06 | Landing page clone từ template mặc định ở trạng thái `draft` |
| LPT-BR-07 | User phải nhập `name` và `slug` trước khi lưu landing page |
| LPT-BR-08 | Slug phải unique trong organization |
| LPT-BR-09 | User có thể thay đổi form fields sau khi clone template |
| LPT-BR-10 | Public landing page chỉ hiển thị khi status = `active` |
| LPT-BR-11 | Submit form phải tạo/cập nhật customer và lưu submission |
| LPT-BR-12 | Không để public frontend gọi trực tiếp API customer cần token |
| LPT-BR-13 | Response API phải dùng `responseData`, không dùng `data` |
| LPT-BR-14 | UI Admin dùng màu TechX Blue `#0C9CEC` |
| LPT-BR-15 | Public landing page có thể dùng `primary_color` của landing page |

---

## 13. Acceptance Criteria

| Mã | Tiêu chí nghiệm thu |
|---|---|
| LPT-AC-01 | Khi bấm tạo landing page mới, hệ thống hiển thị bước chọn mẫu |
| LPT-AC-02 | User xem được danh sách template dạng card |
| LPT-AC-03 | Mỗi template có ảnh preview, tên, mô tả và nút sử dụng |
| LPT-AC-04 | User preview được template trước khi chọn |
| LPT-AC-05 | User chọn template và hệ thống clone dữ liệu mẫu sang landing page mới |
| LPT-AC-06 | Form thông tin chung được auto-fill từ template |
| LPT-AC-07 | Form fields được clone từ `default_form_fields` của template |
| LPT-AC-08 | User chỉnh được form fields sau khi clone |
| LPT-AC-09 | User lưu được landing page ở trạng thái draft |
| LPT-AC-10 | User publish được landing page |
| LPT-AC-11 | Public URL `/lp/:slug` render đúng landing page đã publish |
| LPT-AC-12 | Khách submit form thành công |
| LPT-AC-13 | Backend tạo/cập nhật customer sau submit |
| LPT-AC-14 | Backend lưu submission sau submit |
| LPT-AC-15 | Nếu đổi template sau khi đã sửa dữ liệu, hệ thống cảnh báo trước |
| LPT-AC-16 | Template inactive không hiển thị trong danh sách chọn |
| LPT-AC-17 | API frontend đọc dữ liệu từ `responseData` |
| LPT-AC-18 | Giao diện admin đúng design system hiện tại |
| LPT-AC-19 | Landing page public responsive mobile |
| LPT-AC-20 | Link public có thể copy để gắn vào quảng cáo |

---

## 14. Prompt ngắn cho AI Dev

Triển khai cải tiến module **Marketing → Landing Page** theo hướng template-based.

Khi user tạo Landing Page mới, không hiển thị ngay form nhập thông tin như hiện tại. Thay vào đó, bước đầu tiên phải là **Chọn mẫu Landing Page**. Hệ thống hiển thị danh sách các template có sẵn dạng card, mỗi card có ảnh preview, tên mẫu, mô tả, loại mẫu, nút xem trước và nút “Sử dụng mẫu này”.

Sau khi user chọn một template, hệ thống clone dữ liệu từ template sang landing page mới, bao gồm: title, description, banner, primary_color, cta_text, content và default_form_fields. Landing page mới mặc định ở trạng thái `draft`.

Sau khi clone, user chuyển sang các bước chỉnh sửa:

```text
1. Thông tin chung
2. Thiết kế Form
3. Gán Lead & Cấu hình
```

User chỉ cần thay nội dung và input form, không cần tự thiết kế layout từ đầu.

Cần bổ sung khái niệm `landing_page_templates` để lưu mẫu landing page và `template_id` trong `landing_pages` để biết landing page được tạo từ mẫu nào.

Cần API:

```text
GET /api/v1.0/landing-page-templates
GET /api/v1.0/landing-page-templates/:id
POST /api/v1.0/landing-pages/from-template
```

Vẫn giữ các API Landing Page hiện tại:

```text
GET /api/v1.0/landing-pages
POST /api/v1.0/landing-pages
GET /api/v1.0/landing-pages/:id
PUT /api/v1.0/landing-pages/:id
PATCH /api/v1.0/landing-pages/:id/status
DELETE /api/v1.0/landing-pages/:id
GET /api/v1.0/landing-pages/:id/submissions
```

Public API:

```text
GET /api/v1.0/public/landing-pages/:slug
POST /api/v1.0/public/landing-pages/:slug/submit
```

Response API phải dùng `responseData`.

UI Admin dùng design system TechX Blue với màu chính `#0C9CEC`.

Public landing page dùng route:

```text
/lp/:slug
```

Khi khách submit form, backend validate landing page active, validate form fields, tạo/cập nhật customer trong CRM, lưu submission và trả về kết quả thành công.

Không để public frontend gọi trực tiếp API customer cần token. Public frontend chỉ gọi endpoint submit, backend tự xử lý tạo customer nội bộ.

---

## 15. Kết luận

Ý tưởng chọn template trước rồi mới chỉnh input form là hướng nên triển khai.

Mô hình đúng:

```text
Template là khuôn mẫu
Landing Page là bản được clone từ template
User chỉnh nội dung và form input trên bản landing page thật
Public customer chỉ nhìn thấy landing page đã publish
```

Cách này giúp module Landing Page dễ dùng, đồng bộ giao diện, phù hợp chạy ads và dễ mở rộng thêm template trong tương lai.
