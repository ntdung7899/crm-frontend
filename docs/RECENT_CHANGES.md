# API Documentation — Recent Changes

Base URL: `/api/v1.0`  
Header bắt buộc: `Authorization: Bearer <token>`

---

## Mục lục

1. [Posts API](#1-posts-api)
   - [Danh sách bài viết](#11-get-posts)
   - [Tạo bài viết](#12-post-posts)
   - [Chi tiết bài viết](#13-get-postsid)
   - [Cập nhật bài viết](#14-put-postsid)
   - [Xóa bài viết](#15-delete-postsid)
   - [Interactions (Like/Comment)](#16-interactions)
2. [Products API](#2-products-api)
   - [Danh sách sản phẩm](#21-get-products)
   - [Tạo sản phẩm](#22-post-products)
   - [Chi tiết sản phẩm](#23-get-productsid)
   - [Cập nhật sản phẩm](#24-put-productsid)
   - [Xóa sản phẩm](#25-delete-productsid)
3. [Orders API](#3-orders-api)
   - [Danh sách đơn hàng](#31-get-orders)
   - [Tạo đơn hàng](#32-post-orders)
   - [Chi tiết đơn hàng](#33-get-ordersid)
   - [Cập nhật đơn hàng](#34-put-ordersid)
   - [Xóa đơn hàng](#35-delete-ordersid)
4. [Job + Order — Tạo cùng lúc](#4-job--order--tạo-cùng-lúc)
5. [Socket Events](#5-socket-events)

---

## 1. Posts API

### 1.1 GET /posts

Lấy danh sách bài viết của tổ chức. Lọc theo quyền xem (`view_permission_ids`).

**Query Params**

| Param         | Type   | Default  | Mô tả                                      |
|---------------|--------|----------|--------------------------------------------|
| `currentPage` | number | `1`      | Trang hiện tại                             |
| `pageSize`    | number | `20`     | Số bản ghi mỗi trang                       |
| `keyword`     | string | —        | Tìm kiếm theo `title` hoặc `content`       |

**Logic phân quyền xem:**
- `view_permission_ids = []` → mọi thành viên trong tổ chức đều xem được
- `view_permission_ids = [id1, id2]` → chỉ user có quyền tương ứng mới xem được (người tạo luôn xem được)

**Response 200**
```json
{
  "status": "success",
  "data": {
    "rows": [
      {
        "id": "uuid",
        "title": "Tiêu đề bài viết",
        "content": "Nội dung",
        "media_urls": ["https://..."],
        "view_permission_ids": [],
        "created_by": "uuid",
        "created_at": "2026-06-18T00:00:00.000Z",
        "created_by_user": { "id": "uuid", "full_name": "Nguyen Van A", "avatar": null }
      }
    ],
    "count": 50
  }
}
```

---

### 1.2 POST /posts

Tạo bài viết mới. Phát socket `post:created` đến tất cả thành viên tổ chức.

**Request Body**

```json
{
  "title": "Tiêu đề bài viết",
  "content": "Nội dung bài viết",
  "media_urls": ["https://example.com/image.jpg"],
  "view_permission_ids": ["permission-uuid-1", "permission-uuid-2"]
}
```

| Field                | Type     | Required | Mô tả                                                              |
|----------------------|----------|----------|--------------------------------------------------------------------|
| `title`              | string   | **Yes**  | Tiêu đề                                                            |
| `content`            | string   | No       | Nội dung                                                           |
| `media_urls`         | string[] | No       | Danh sách URL ảnh/video                                            |
| `view_permission_ids`| string[] | No       | Rỗng = mọi người xem được; có ID = chỉ user thuộc quyền đó xem được |

**Response 200**
```json
{
  "status": "success",
  "data": { "id": "uuid", "title": "...", "view_permission_ids": [], "created_by": "uuid" },
  "message": "Tạo bài viết thành công"
}
```

---

### 1.3 GET /posts/:id

Chi tiết bài viết. Trả 403 nếu user không có quyền xem.

**Response 200**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Tiêu đề",
    "content": "Nội dung",
    "media_urls": [],
    "view_permission_ids": [],
    "created_by": "uuid",
    "created_at": "2026-06-18T00:00:00.000Z",
    "created_by_user": { "id": "uuid", "full_name": "Nguyen Van A", "avatar": null }
  }
}
```

**Errors**

| Status | Mô tả                         |
|--------|-------------------------------|
| 403    | Không có quyền xem bài viết   |
| 404    | Không tìm thấy bài viết       |

---

### 1.4 PUT /posts/:id

Cập nhật bài viết. Chỉ người tạo. Phát socket `post:updated` đến tổ chức.

**Request Body**

```json
{
  "title": "Tiêu đề mới",
  "content": "Nội dung mới",
  "media_urls": [],
  "view_permission_ids": ["permission-uuid"]
}
```

| Field                | Type     | Required | Mô tả              |
|----------------------|----------|----------|--------------------|
| `title`              | string   | No       | Tiêu đề mới        |
| `content`            | string   | No       | Nội dung mới       |
| `media_urls`         | string[] | No       | Danh sách URL mới  |
| `view_permission_ids`| string[] | No       | Cập nhật quyền xem |

**Errors**

| Status | Mô tả                           |
|--------|---------------------------------|
| 403    | Không phải người tạo bài viết   |
| 404    | Không tìm thấy bài viết         |

---

### 1.5 DELETE /posts/:id

Xóa vĩnh viễn (hard delete). Chỉ người tạo. Phát socket `post:deleted` đến tổ chức.

**Errors**

| Status | Mô tả                           |
|--------|---------------------------------|
| 403    | Không phải người tạo bài viết   |
| 404    | Không tìm thấy bài viết         |

---

### 1.6 Interactions

#### GET /posts/:id/interactions

Lấy danh sách tương tác của bài viết.

**Query Params**

| Param              | Type   | Mô tả                              |
|--------------------|--------|------------------------------------|
| `interaction_type` | string | `REACTION` hoặc `COMMENT` (optional) |

**Response 200**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "user_id": "uuid",
      "interaction_type": "REACTION",
      "reaction_type": "LIKE",
      "content": null,
      "status": "active",
      "user": { "id": "uuid", "full_name": "Nguyen Van A", "avatar": null }
    },
    {
      "id": "uuid",
      "post_id": "uuid",
      "user_id": "uuid",
      "interaction_type": "COMMENT",
      "reaction_type": null,
      "content": "Nội dung bình luận",
      "status": "active",
      "user": { "id": "uuid", "full_name": "Tran Thi B", "avatar": null }
    }
  ]
}
```

---

#### POST /posts/:id/interactions

Thả reaction hoặc comment. Nếu đã react rồi thì upsert (cập nhật loại reaction).

**Request Body — Reaction**

```json
{
  "interaction_type": "REACTION",
  "reaction_type": "LIKE"
}
```

**Request Body — Comment**

```json
{
  "interaction_type": "COMMENT",
  "content": "Nội dung bình luận"
}
```

| Field              | Type   | Required | Mô tả                                              |
|--------------------|--------|----------|----------------------------------------------------|
| `interaction_type` | string | **Yes**  | `REACTION` hoặc `COMMENT`                          |
| `reaction_type`    | string | Cond.    | Bắt buộc nếu `REACTION`: `LIKE\|LOVE\|HAHA\|WOW\|SAD\|ANGRY` |
| `content`          | string | Cond.    | Bắt buộc nếu `COMMENT`                            |

**Socket phát sau khi tạo:**
- `post:new_reaction` → chủ bài viết
- `post:new_comment` → chủ bài viết

**Errors**

| Status | Mô tả                               |
|--------|-------------------------------------|
| 400    | Thiếu/sai `interaction_type`, `reaction_type`, `content` |
| 404    | Không tìm thấy bài viết             |

---

#### PUT /posts/:id/interactions

Chỉnh sửa reaction type hoặc nội dung comment. Chỉ chủ sở hữu interaction.

**Request Body — Đổi reaction**

```json
{
  "interaction_id": "uuid",
  "reaction_type": "LOVE"
}
```

**Request Body — Sửa comment**

```json
{
  "interaction_id": "uuid",
  "content": "Nội dung mới"
}
```

| Field            | Type   | Required | Mô tả                              |
|------------------|--------|----------|------------------------------------|
| `interaction_id` | string | **Yes**  | ID của interaction cần sửa         |
| `reaction_type`  | string | Cond.    | Bắt buộc nếu interaction là REACTION |
| `content`        | string | Cond.    | Bắt buộc nếu interaction là COMMENT  |

**Errors**

| Status | Mô tả                                 |
|--------|---------------------------------------|
| 400    | Thiếu `interaction_id` hoặc giá trị sai |
| 403    | Không phải chủ sở hữu interaction     |
| 404    | Không tìm thấy interaction            |

---

#### DELETE /posts/:id/interactions

Xóa interaction (soft delete — `status: inactive`).

**Request Body**

```json
{ "interaction_id": "uuid" }
```

> Nếu không truyền `interaction_id`, sẽ xóa REACTION hiện tại của user trên bài viết đó.

---

## 2. Products API

### 2.1 GET /products

Danh sách sản phẩm của tổ chức, hỗ trợ tìm kiếm và lọc.

**Query Params**

| Param         | Type   | Default  | Mô tả                                      |
|---------------|--------|----------|--------------------------------------------|
| `currentPage` | number | `1`      | Trang hiện tại                             |
| `pageSize`    | number | `20`     | Số bản ghi mỗi trang                       |
| `status`      | string | `active` | `active` \| `inactive`                     |
| `keyword`     | string | —        | Tìm theo `name` hoặc `code` (không phân biệt hoa thường) |

**Response 200**
```json
{
  "status": "success",
  "data": {
    "rows": [
      {
        "id": "uuid",
        "name": "Sản phẩm A",
        "code": "SP001",
        "description": "Mô tả ngắn",
        "content": "Mô tả chi tiết",
        "thumbnail_url": "https://...",
        "media_urls": ["https://..."],
        "price": 150000,
        "original_price": 200000,
        "stock_quantity": 50,
        "status": "active",
        "created_by": "uuid",
        "created_at": "2026-06-18T00:00:00.000Z",
        "created_by_user": { "id": "uuid", "full_name": "Nguyen Van A", "avatar": null }
      }
    ],
    "count": 100
  }
}
```

---

### 2.2 POST /products

Tạo sản phẩm mới.

**Request Body**

```json
{
  "name": "Tên sản phẩm",
  "code": "SP001",
  "description": "Mô tả ngắn",
  "content": "Mô tả chi tiết HTML",
  "thumbnail_url": "https://example.com/image.jpg",
  "media_urls": ["https://example.com/img1.jpg"],
  "price": 150000,
  "original_price": 200000,
  "stock_quantity": 50
}
```

| Field            | Type     | Required | Mô tả                                |
|------------------|----------|----------|--------------------------------------|
| `name`           | string   | **Yes**  | Tên sản phẩm                         |
| `code`           | string   | No       | Mã sản phẩm (unique toàn hệ thống)   |
| `description`    | string   | No       | Mô tả ngắn                           |
| `content`        | string   | No       | Mô tả chi tiết (có thể HTML)         |
| `thumbnail_url`  | string   | No       | URL ảnh đại diện                     |
| `media_urls`     | string[] | No       | Danh sách URL ảnh/video              |
| `price`          | number   | **Yes**  | Giá bán (>= 0)                       |
| `original_price` | number   | No       | Giá gốc                              |
| `stock_quantity` | number   | No       | Tồn kho (>= 0, mặc định `0`)         |

**Errors**

| Status | Mô tả                         |
|--------|-------------------------------|
| 400    | `name` bỏ trống               |
| 400    | `price` không hợp lệ          |
| 400    | `stock_quantity` không hợp lệ |
| 409    | `code` đã tồn tại             |

---

### 2.3 GET /products/:id

Chi tiết sản phẩm kèm thông tin người tạo và người cập nhật.

**Response 200**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Tên sản phẩm",
    "code": "SP001",
    "description": "Mô tả ngắn",
    "content": "Mô tả chi tiết",
    "thumbnail_url": "https://...",
    "media_urls": [],
    "price": 150000,
    "original_price": 200000,
    "stock_quantity": 50,
    "status": "active",
    "created_by": "uuid",
    "updated_by": null,
    "created_at": "2026-06-18T00:00:00.000Z",
    "updated_at": "2026-06-18T00:00:00.000Z",
    "created_by_user": { "id": "uuid", "full_name": "Nguyen Van A", "avatar": null },
    "updated_by_user": null
  }
}
```

---

### 2.4 PUT /products/:id

Cập nhật sản phẩm. Chỉ người tạo. Chỉ cần truyền field muốn thay đổi.

**Request Body**

```json
{
  "name": "Tên mới",
  "code": "SP002",
  "description": "Mô tả mới",
  "content": "Nội dung mới",
  "thumbnail_url": "https://example.com/new.jpg",
  "media_urls": [],
  "price": 180000,
  "original_price": 220000,
  "stock_quantity": 30,
  "status": "inactive"
}
```

| Field            | Type     | Required | Mô tả                       |
|------------------|----------|----------|-----------------------------|
| `name`           | string   | No       | Tên mới                     |
| `code`           | string   | No       | Mã mới (unique)             |
| `description`    | string   | No       | Mô tả ngắn mới              |
| `content`        | string   | No       | Mô tả chi tiết mới          |
| `thumbnail_url`  | string   | No       | URL ảnh mới                 |
| `media_urls`     | string[] | No       | Danh sách URL media mới     |
| `price`          | number   | No       | Giá bán mới (>= 0)          |
| `original_price` | number   | No       | Giá gốc mới                 |
| `stock_quantity` | number   | No       | Tồn kho mới (>= 0)          |
| `status`         | string   | No       | `active` \| `inactive`      |

**Errors**

| Status | Mô tả                                       |
|--------|---------------------------------------------|
| 400    | `price` hoặc `stock_quantity` không hợp lệ  |
| 403    | Không phải người tạo sản phẩm               |
| 404    | Không tìm thấy sản phẩm                     |
| 409    | `code` đã tồn tại                           |

---

### 2.5 DELETE /products/:id

Xóa vĩnh viễn (hard delete). Chỉ người tạo.

**Errors**

| Status | Mô tả                        |
|--------|------------------------------|
| 403    | Không phải người tạo sản phẩm |
| 404    | Không tìm thấy sản phẩm      |

---

## 3. Orders API

Mỗi job chỉ có **một** đơn hàng (quan hệ 1-1).

### 3.1 GET /orders

Danh sách đơn hàng của tổ chức, kèm items và thông tin sản phẩm.

**Query Params**

| Param         | Type   | Default | Mô tả                                              |
|---------------|--------|---------|----------------------------------------------------|
| `currentPage` | number | `1`     | Trang hiện tại                                     |
| `pageSize`    | number | `20`    | Số bản ghi mỗi trang                               |
| `status`      | string | —       | `pending` \| `processing` \| `completed` \| `cancelled` |
| `keyword`     | string | —       | Tìm theo `order_code`                              |
| `job_id`      | string | —       | Lọc theo job                                       |

**Response 200**
```json
{
  "status": "success",
  "data": {
    "rows": [
      {
        "id": "uuid",
        "order_code": "ORD-20260618-4821",
        "job_id": "uuid",
        "customer_uuid": "uuid",
        "subtotal_amount": "300000",
        "discount_amount": "10000",
        "total_amount": "290000",
        "status": "pending",
        "note": "Ghi chú",
        "created_by": "uuid",
        "created_at": "2026-06-18T00:00:00.000Z",
        "customer_uu": { "id": "uuid", "full_name": "Nguyen Van A", "phone": "0909..." },
        "created_by_user": { "id": "uuid", "full_name": "Staff A", "avatar": null },
        "order_items": [
          {
            "id": "uuid",
            "product_name": "Sản phẩm A",
            "product_code": "SP001",
            "quantity": 2,
            "unit_price": "150000",
            "discount_amount": "0",
            "total_price": "300000",
            "product": { "id": "uuid", "name": "Sản phẩm A", "code": "SP001", "thumbnail_url": null }
          }
        ]
      }
    ],
    "count": 10
  }
}
```

---

### 3.2 POST /orders

Tạo đơn hàng mới cho một job. **Một job chỉ được tạo một đơn hàng.**

**Request Body**

```json
{
  "job_id": "uuid",
  "customer_uuid": "uuid",
  "discount_amount": 10000,
  "note": "Ghi chú đơn hàng",
  "status": "pending",
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Sản phẩm A",
      "product_code": "SP001",
      "quantity": 2,
      "unit_price": 150000,
      "discount_amount": 0,
      "note": "Ghi chú item"
    }
  ]
}
```

| Field             | Type     | Required | Mô tả                                           |
|-------------------|----------|----------|-------------------------------------------------|
| `job_id`          | string   | **Yes**  | ID của job (unique — mỗi job một đơn hàng)      |
| `customer_uuid`   | string   | No       | ID khách hàng                                   |
| `discount_amount` | number   | No       | Giảm giá ở cấp đơn hàng (mặc định `0`)         |
| `note`            | string   | No       | Ghi chú đơn hàng                                |
| `status`          | string   | No       | `pending` \| `processing` \| `completed` \| `cancelled` (mặc định `pending`) |
| `items`           | array    | No       | Danh sách sản phẩm trong đơn hàng               |

**Cấu trúc mỗi item:**

| Field             | Type   | Required | Mô tả                                       |
|-------------------|--------|----------|---------------------------------------------|
| `product_id`      | string | No       | ID sản phẩm (nếu chọn từ catalog)           |
| `product_name`    | string | **Yes**  | Tên sản phẩm (lưu snapshot tại thời điểm đặt) |
| `product_code`    | string | No       | Mã sản phẩm                                 |
| `quantity`        | number | No       | Số lượng (mặc định `1`)                     |
| `unit_price`      | number | No       | Đơn giá (mặc định `0`)                      |
| `discount_amount` | number | No       | Giảm giá item (mặc định `0`)                |
| `note`            | string | No       | Ghi chú item                                |

**Logic tính tiền:**
- `total_price` (item) = `quantity × unit_price − discount_amount` (item)
- `subtotal_amount` (đơn hàng) = Σ(`quantity × unit_price`) của tất cả items
- `total_amount` = `subtotal_amount − discount_amount` (đơn hàng)

**Response 200**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "order_code": "ORD-20260618-4821",
    "job_id": "uuid",
    "subtotal_amount": "300000",
    "discount_amount": "10000",
    "total_amount": "290000",
    "status": "pending",
    "order_items": [ { "...": "..." } ]
  },
  "message": "Tạo đơn hàng thành công"
}
```

**Errors**

| Status | Mô tả                                          |
|--------|------------------------------------------------|
| 400    | `job_id` bỏ trống                              |
| 400    | `items` không phải mảng                        |
| 409    | Job này đã có đơn hàng (unique constraint)     |

---

### 3.3 GET /orders/:id

Chi tiết đơn hàng kèm toàn bộ items, thông tin sản phẩm, khách hàng, người tạo/cập nhật.

**Response 200**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "order_code": "ORD-20260618-4821",
    "job_id": "uuid",
    "subtotal_amount": "300000",
    "discount_amount": "10000",
    "total_amount": "290000",
    "status": "pending",
    "note": "Ghi chú",
    "created_by": "uuid",
    "updated_by": null,
    "created_at": "2026-06-18T00:00:00.000Z",
    "updated_at": "2026-06-18T00:00:00.000Z",
    "customer_uu": { "id": "uuid", "full_name": "Nguyen Van A", "phone": "0909...", "email": "..." },
    "created_by_user": { "id": "uuid", "full_name": "Staff A", "avatar": null },
    "updated_by_user": null,
    "order_items": [
      {
        "id": "uuid",
        "order_id": "uuid",
        "product_id": "uuid",
        "product_name": "Sản phẩm A",
        "product_code": "SP001",
        "quantity": 2,
        "unit_price": "150000",
        "discount_amount": "0",
        "total_price": "300000",
        "note": null,
        "product": { "id": "uuid", "name": "Sản phẩm A", "code": "SP001", "thumbnail_url": null, "price": "150000" }
      }
    ]
  }
}
```

---

### 3.4 PUT /orders/:id

Cập nhật đơn hàng. Chỉ người tạo. Nếu truyền `items`, **toàn bộ items cũ sẽ bị thay thế**.

**Request Body**

```json
{
  "customer_uuid": "uuid",
  "discount_amount": 20000,
  "note": "Ghi chú mới",
  "status": "processing",
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Sản phẩm B",
      "product_code": "SP002",
      "quantity": 1,
      "unit_price": 200000,
      "discount_amount": 0
    }
  ]
}
```

| Field             | Type   | Required | Mô tả                                                   |
|-------------------|--------|----------|---------------------------------------------------------|
| `customer_uuid`   | string | No       | Cập nhật khách hàng                                     |
| `discount_amount` | number | No       | Giảm giá mới (tự động tính lại `total_amount`)          |
| `note`            | string | No       | Ghi chú mới                                             |
| `status`          | string | No       | `pending` \| `processing` \| `completed` \| `cancelled` |
| `items`           | array  | No       | **Nếu truyền → xóa hết items cũ, tạo lại items mới**   |

**Errors**

| Status | Mô tả                           |
|--------|---------------------------------|
| 400    | `items` không phải mảng         |
| 403    | Không phải người tạo đơn hàng   |
| 404    | Không tìm thấy đơn hàng         |

---

### 3.5 DELETE /orders/:id

Xóa vĩnh viễn đơn hàng và toàn bộ items (hard delete). Chỉ người tạo.

**Errors**

| Status | Mô tả                          |
|--------|--------------------------------|
| 403    | Không phải người tạo đơn hàng  |
| 404    | Không tìm thấy đơn hàng        |

---

## 4. Job + Order — Tạo cùng lúc

`POST /job` hỗ trợ tạo order ngay trong payload của job. Field `order` là **optional**.

**Request Body**

```json
[
  {
    "job_name": "Tư vấn khách hàng A",
    "job_time": { "start": "2026-06-18T09:00:00Z", "end": "2026-06-18T10:00:00Z" },
    "content": "Nội dung công việc",
    "performer_uuid": "uuid-nhan-vien",
    "customer_uuid": "uuid-khach-hang",
    "order": {
      "discount_amount": 10000,
      "note": "Ghi chú đơn hàng",
      "status": "pending",
      "items": [
        {
          "product_id": "uuid-san-pham",
          "product_name": "Sản phẩm A",
          "product_code": "SP001",
          "quantity": 2,
          "unit_price": 150000,
          "discount_amount": 0,
          "note": ""
        }
      ]
    }
  }
]
```

**Luồng xử lý:**

1. Tách `order` ra khỏi body trước khi tạo job
2. Tạo job(s) như bình thường
3. Với mỗi job có field `order`, tự động tạo đơn hàng gắn với `job_id` vừa tạo
4. `customer_uuid` của order lấy từ `order.customer_uuid` → nếu không có thì lấy từ `job.customer_uuid`

> **Lưu ý:** Không truyền `order` → chỉ tạo job, không có đơn hàng. Có thể tạo order sau qua `POST /orders`.

---

## 5. Socket Events

Tất cả socket event được emit sau khi action thành công. Client join room `user:{userId}` để nhận.

| Event               | Emit đến                  | Trigger bởi                            | Payload                          |
|---------------------|---------------------------|----------------------------------------|----------------------------------|
| `post:created`      | Tất cả thành viên tổ chức | `POST /posts`                          | `{ post_id }`                    |
| `post:updated`      | Tất cả thành viên tổ chức | `PUT /posts/:id`                       | `{ post_id }`                    |
| `post:deleted`      | Tất cả thành viên tổ chức | `DELETE /posts/:id`                    | `{ post_id }`                    |
| `post:new_reaction` | Chủ bài viết              | `POST /posts/:id/interactions` (REACTION) | `{ post_id, user_id, reaction_type }` |
| `post:new_comment`  | Chủ bài viết              | `POST /posts/:id/interactions` (COMMENT)  | `{ post_id, user_id, content }`  |

> Không emit đến chính người thực hiện hành động (self-skip).

---

## DB Migration cần thiết

Để user có thể vừa REACTION vừa COMMENT trên cùng một bài viết, cần chạy migration sau:

```sql
-- Xóa unique constraint cũ (chặn user react + comment cùng lúc)
ALTER TABLE public.post_interactions
  DROP CONSTRAINT IF EXISTS uq_user_reaction_post;

-- Tạo partial unique index — chỉ chặn duplicate REACTION active
CREATE UNIQUE INDEX uq_user_reaction_post
  ON public.post_interactions (post_id, user_id)
  WHERE interaction_type = 'REACTION' AND status = 'active';
```
