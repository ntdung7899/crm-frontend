# Posts API

Base URL: `/api/v1.0`  
Tất cả các API đều yêu cầu header: `Authorization: Bearer <token>`

---

## 1. Lấy danh sách bài viết

**`GET /posts`**

> Chỉ trả về bài viết của những user trong cùng tổ chức (cùng cây `created_by`).

### Query Params

| Param         | Type   | Required | Default | Mô tả                |
|---------------|--------|----------|---------|----------------------|
| `currentPage` | number | No       | 1       | Trang hiện tại       |
| `pageSize`    | number | No       | 20      | Số bản ghi mỗi trang |

### Response `200`

```json
{
  "status": "success",
  "data": {
    "rows": [
      {
        "id": "uuid",
        "title": "Tiêu đề",
        "content": "Nội dung bài viết",
        "thumbnail_url": "https://...",
        "media_urls": ["https://..."],
        "status": "active",
        "created_by": "uuid",
        "created_at": "2026-06-08T21:25:42.526Z",
        "updated_at": "2026-06-08T21:25:42.526Z",
        "created_by_user": {
          "id": "uuid",
          "full_name": "Nguyen Van A",
          "avatar": "https://..."
        },
        "post_interactions": [
          {
            "id": "uuid",
            "interaction_type": "REACTION",
            "reaction_type": "LIKE",
            "user_id": "uuid"
          }
        ]
      }
    ],
    "count": 100
  }
}
```

> `post_interactions` trong danh sách chỉ trả về `id`, `interaction_type`, `reaction_type`, `user_id` — đủ để FE render tổng số và loại cảm xúc.

---

## 2. Tạo bài viết

**`POST /posts`**

### Request Body

```json
{
  "title": "Tiêu đề bài viết",
  "content": "Nội dung bài viết",
  "thumbnail_url": "https://example.com/image.jpg",
  "media_urls": ["https://example.com/video.mp4"]
}
```

| Field           | Type     | Required | Mô tả                   |
|-----------------|----------|----------|-------------------------|
| `title`         | string   | No       | Tiêu đề                 |
| `content`       | string   | **Yes**  | Nội dung bài viết       |
| `thumbnail_url` | string   | No       | URL ảnh thumbnail       |
| `media_urls`    | string[] | No       | Danh sách URL ảnh/video |

### Response `200`

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Tiêu đề bài viết",
    "content": "Nội dung bài viết",
    "thumbnail_url": "https://...",
    "media_urls": [],
    "status": "active",
    "created_by": "uuid",
    "created_at": "2026-06-08T21:25:42.526Z",
    "updated_at": "2026-06-08T21:25:42.526Z"
  }
}
```

### Errors

| Status | Mô tả                 |
|--------|-----------------------|
| 400    | `content` bị bỏ trống |

### Socket Event phát ra

> Sau khi tạo thành công, server emit socket `post:created` đến tất cả thành viên trong tổ chức (trừ người tạo).

```json
// event: "post:created"
{
  "post_id": "uuid",
  "created_by": "uuid"
}
```

---

## 3. Lấy chi tiết bài viết

**`GET /posts/:id`**

### Path Params

| Param | Type   | Required | Mô tả       |
|-------|--------|----------|-------------|
| `id`  | string | **Yes**  | ID bài viết |

### Response `200`

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Tiêu đề",
    "content": "Nội dung",
    "thumbnail_url": null,
    "media_urls": [],
    "status": "active",
    "created_by": "uuid",
    "created_at": "2026-06-08T21:25:42.526Z",
    "updated_at": "2026-06-08T21:25:42.526Z",
    "created_by_user": {
      "id": "uuid",
      "full_name": "Nguyen Van A",
      "avatar": null
    },
    "post_interactions": [
      {
        "id": "uuid",
        "interaction_type": "REACTION",
        "reaction_type": "LOVE",
        "content": null,
        "parent_comment_id": null,
        "user_id": "uuid",
        "created_at": "2026-06-08T22:00:00.000Z",
        "user": {
          "id": "uuid",
          "full_name": "Nguyen Van A",
          "avatar": null
        }
      },
      {
        "id": "uuid",
        "interaction_type": "COMMENT",
        "reaction_type": null,
        "content": "Bình luận hay đó",
        "parent_comment_id": null,
        "user_id": "uuid",
        "created_at": "2026-06-08T22:05:00.000Z",
        "user": {
          "id": "uuid",
          "full_name": "Tran Thi B",
          "avatar": null
        }
      }
    ]
  }
}
```

### Errors

| Status | Mô tả                   |
|--------|-------------------------|
| 404    | Không tìm thấy bài viết |

---

## 4. Cập nhật bài viết

**`PUT /posts/:id`**

> Chỉ chủ bài viết mới được cập nhật.

### Path Params

| Param | Type   | Required | Mô tả       |
|-------|--------|----------|-------------|
| `id`  | string | **Yes**  | ID bài viết |

### Request Body

```json
{
  "title": "Tiêu đề mới",
  "content": "Nội dung mới",
  "thumbnail_url": "https://example.com/new-image.jpg",
  "media_urls": ["https://example.com/video.mp4"],
  "status": "active"
}
```

| Field           | Type     | Required | Mô tả                             |
|-----------------|----------|----------|-----------------------------------|
| `title`         | string   | No       | Tiêu đề mới                       |
| `content`       | string   | No       | Nội dung mới                      |
| `thumbnail_url` | string   | No       | URL ảnh thumbnail mới             |
| `media_urls`    | string[] | No       | Danh sách URL media mới           |
| `status`        | string   | No       | Trạng thái: `active` / `inactive` |

### Response `200`

```json
{
  "status": "success",
  "data": { "id": "uuid", "...": "..." },
  "message": "Cập nhật thành công"
}
```

### Errors

| Status | Mô tả                   |
|--------|-------------------------|
| 403    | Không phải chủ bài viết |
| 404    | Không tìm thấy bài viết |

### Socket Event phát ra

> Sau khi cập nhật thành công, server emit socket `post:updated` đến tất cả thành viên trong tổ chức.

```json
// event: "post:updated"
{
  "post_id": "uuid"
}
```

---

## 5. Xóa bài viết

**`DELETE /posts/:id`**

> Soft delete — chỉ đặt `status = inactive`. Chỉ chủ bài viết mới được xóa.

### Path Params

| Param | Type   | Required | Mô tả       |
|-------|--------|----------|-------------|
| `id`  | string | **Yes**  | ID bài viết |

### Response `200`

```json
{
  "status": "success",
  "data": null,
  "message": "Xóa bài viết thành công"
}
```

### Errors

| Status | Mô tả                   |
|--------|-------------------------|
| 403    | Không phải chủ bài viết |
| 404    | Không tìm thấy bài viết |

### Socket Event phát ra

> Sau khi xóa thành công, server emit socket `post:deleted` đến tất cả thành viên trong tổ chức.

```json
// event: "post:deleted"
{
  "post_id": "uuid"
}
```

---

## 6. Lấy danh sách interactions của bài viết

**`GET /posts/:id/interactions`**

### Path Params

| Param | Type   | Required | Mô tả       |
|-------|--------|----------|-------------|
| `id`  | string | **Yes**  | ID bài viết |

### Query Params

| Param              | Type   | Required | Mô tả                                  |
|--------------------|--------|----------|----------------------------------------|
| `interaction_type` | string | No       | Lọc theo loại: `REACTION` hoặc `COMMENT` |

### Response `200`

```json
{
  "status": "success",
  "data": {
    "rows": [
      {
        "id": "uuid",
        "post_id": "uuid",
        "user_id": "uuid",
        "interaction_type": "REACTION",
        "reaction_type": "HAHA",
        "content": null,
        "parent_comment_id": null,
        "status": "active",
        "created_at": "2026-06-08T22:00:00.000Z",
        "updated_at": "2026-06-08T22:00:00.000Z",
        "user": {
          "id": "uuid",
          "full_name": "Tran Thi B",
          "avatar": null
        }
      },
      {
        "id": "uuid",
        "post_id": "uuid",
        "user_id": "uuid",
        "interaction_type": "COMMENT",
        "reaction_type": null,
        "content": "Bình luận hay đó",
        "parent_comment_id": null,
        "status": "active",
        "created_at": "2026-06-08T22:05:00.000Z",
        "updated_at": "2026-06-08T22:05:00.000Z",
        "user": {
          "id": "uuid",
          "full_name": "Nguyen Van A",
          "avatar": null
        }
      }
    ],
    "count": 5
  }
}
```

---

## 7. Thả cảm xúc / Bình luận bài viết

**`POST /posts/:id/interactions`**

### Path Params

| Param | Type   | Required | Mô tả       |
|-------|--------|----------|-------------|
| `id`  | string | **Yes**  | ID bài viết |

### Request Body — Reaction (thả cảm xúc)

```json
{
  "interaction_type": "REACTION",
  "reaction_type": "LIKE"
}
```

> Nếu user đã thả cảm xúc trước đó, API sẽ **cập nhật** `reaction_type` thay vì tạo mới (upsert). Mỗi user chỉ có 1 reaction trên 1 bài viết.

### Request Body — Comment (bình luận)

```json
{
  "interaction_type": "COMMENT",
  "content": "Nội dung bình luận"
}
```

### Request Body — Reply comment (trả lời bình luận)

```json
{
  "interaction_type": "COMMENT",
  "content": "Nội dung trả lời",
  "parent_comment_id": "uuid-của-comment-cha"
}
```

### Fields

| Field               | Type   | Required                           | Mô tả                                                              |
|---------------------|--------|------------------------------------|--------------------------------------------------------------------|
| `interaction_type`  | string | **Yes**                            | `REACTION` hoặc `COMMENT`                                          |
| `reaction_type`     | string | **Yes** (khi `REACTION`)           | `LIKE` \| `LOVE` \| `HAHA` \| `WOW` \| `SAD` \| `ANGRY`          |
| `content`           | string | **Yes** (khi `COMMENT`)            | Nội dung bình luận                                                 |
| `parent_comment_id` | string | No                                 | ID comment cha (khi reply comment)                                 |

### Response `200` — Reaction mới

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "post_id": "uuid",
    "user_id": "uuid",
    "interaction_type": "REACTION",
    "reaction_type": "LIKE",
    "content": null,
    "parent_comment_id": null,
    "status": "active",
    "created_at": "2026-06-09T04:43:51.000Z"
  },
  "message": "Đã thả cảm xúc"
}
```

### Response `200` — Reaction đã tồn tại (cập nhật)

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "post_id": "uuid",
    "user_id": "uuid",
    "interaction_type": "REACTION",
    "reaction_type": "LOVE",
    "status": "active"
  },
  "message": "Đã cập nhật cảm xúc"
}
```

### Response `200` — Comment

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "post_id": "uuid",
    "user_id": "uuid",
    "interaction_type": "COMMENT",
    "reaction_type": null,
    "content": "Nội dung bình luận",
    "parent_comment_id": null,
    "status": "active",
    "created_at": "2026-06-09T04:43:51.000Z"
  },
  "message": "Bình luận thành công"
}
```

### Errors

| Status | Mô tả                                                 |
|--------|-------------------------------------------------------|
| 400    | `interaction_type` bỏ trống hoặc không hợp lệ        |
| 400    | `reaction_type` bỏ trống hoặc không hợp lệ khi REACTION |
| 400    | `content` bỏ trống khi `COMMENT`                     |
| 404    | Không tìm thấy bài viết                               |
| 410    | Bài viết đã bị xóa hoặc không còn hoạt động          |

### Socket Events phát ra

> Chỉ emit khi user tương tác với bài viết của **người khác** (không emit nếu tương tác bài của chính mình).

```json
// event: "post:new_reaction" — khi thả hoặc đổi cảm xúc
{
  "post_id": "uuid",
  "interaction_id": "uuid",
  "reaction_type": "LOVE",
  "user_id": "uuid"
}
```

```json
// event: "post:new_comment" — khi bình luận
{
  "post_id": "uuid",
  "interaction_id": "uuid",
  "interaction_type": "COMMENT",
  "content": "Nội dung bình luận",
  "parent_comment_id": null,
  "user_id": "uuid"
}
```

---

## 8. Sửa bình luận / Đổi cảm xúc

**`PUT /posts/:id/interactions`**

### Path Params

| Param | Type   | Required | Mô tả       |
|-------|--------|----------|-------------|
| `id`  | string | **Yes**  | ID bài viết |

### Request Body — Đổi cảm xúc

```json
{
  "interaction_id": "uuid-của-reaction",
  "reaction_type": "LOVE"
}
```

### Request Body — Sửa bình luận

```json
{
  "interaction_id": "uuid-của-comment",
  "content": "Nội dung bình luận đã sửa"
}
```

| Field            | Type   | Required | Mô tả                                                     |
|------------------|--------|----------|-----------------------------------------------------------|
| `interaction_id` | string | **Yes**  | ID của interaction cần cập nhật                           |
| `reaction_type`  | string | Khi REACTION | `LIKE` \| `LOVE` \| `HAHA` \| `WOW` \| `SAD` \| `ANGRY` |
| `content`        | string | Khi COMMENT  | Nội dung bình luận mới (không được để trống)              |

> Chỉ người tạo interaction đó mới sửa được. Server tự xác định loại (`REACTION` hay `COMMENT`) từ DB, không cần truyền `interaction_type`.

### Response `200` — Đổi cảm xúc

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "post_id": "uuid",
    "user_id": "uuid",
    "interaction_type": "REACTION",
    "reaction_type": "LOVE",
    "status": "active"
  },
  "message": "Đã cập nhật cảm xúc"
}
```

### Response `200` — Sửa bình luận

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "post_id": "uuid",
    "user_id": "uuid",
    "interaction_type": "COMMENT",
    "content": "Nội dung bình luận đã sửa",
    "status": "active"
  },
  "message": "Đã cập nhật bình luận"
}
```

### Errors

| Status | Mô tả                                              |
|--------|----------------------------------------------------|
| 400    | `interaction_id` bỏ trống                          |
| 400    | `reaction_type` không hợp lệ khi REACTION          |
| 400    | `content` bỏ trống khi COMMENT                     |
| 403    | Không phải người tạo interaction                   |
| 404    | Không tìm thấy interaction                         |

---

## 9. Bỏ cảm xúc / Xóa bình luận

**`DELETE /posts/:id/interactions`**

### Path Params

| Param | Type   | Required | Mô tả       |
|-------|--------|----------|-------------|
| `id`  | string | **Yes**  | ID bài viết |

### Case 1 — Xóa interaction cụ thể (comment hoặc reaction) theo ID

```json
{
  "interaction_id": "uuid-của-interaction"
}
```

> Chỉ người tạo interaction đó mới xóa được.

### Case 2 — Bỏ cảm xúc (không truyền `interaction_id`)

```json
{}
```

> Tự động tìm và xóa REACTION hiện tại của user đang gọi trên bài viết.

| Field            | Type   | Required | Mô tả                                           |
|------------------|--------|----------|-------------------------------------------------|
| `interaction_id` | string | No       | ID interaction cần xóa. Bỏ trống = bỏ cảm xúc |

### Response `200` — Bỏ cảm xúc

```json
{
  "status": "success",
  "data": null,
  "message": "Đã bỏ cảm xúc"
}
```

### Response `200` — Xóa bình luận

```json
{
  "status": "success",
  "data": null,
  "message": "Đã xóa bình luận"
}
```

### Errors

| Status | Mô tả                                  |
|--------|----------------------------------------|
| 403    | Không phải người tạo interaction       |
| 404    | Không tìm thấy interaction / cảm xúc  |

---

## Socket Events tổng hợp

> Client lắng nghe các events sau sau khi kết nối socket với token JWT.

| Event              | Khi nào phát                              | Payload                                         | Nhận bởi               |
|--------------------|-------------------------------------------|-------------------------------------------------|------------------------|
| `post:created`     | Có bài viết mới trong tổ chức            | `{ post_id, created_by }`                       | Tất cả org members (trừ người tạo) |
| `post:updated`     | Bài viết được chỉnh sửa                  | `{ post_id }`                                   | Tất cả org members     |
| `post:deleted`     | Bài viết bị xóa                          | `{ post_id }`                                   | Tất cả org members     |
| `post:new_reaction`| Ai đó thả / đổi cảm xúc trên bài viết   | `{ post_id, interaction_id, reaction_type, user_id }` | Chủ bài viết     |
| `post:new_comment` | Ai đó bình luận trên bài viết            | `{ post_id, interaction_id, interaction_type, content, parent_comment_id, user_id }` | Chủ bài viết |

---

## DB Migration cần chạy

> Unique constraint hiện tại `uq_user_reaction_post` trên `(post_id, user_id)` ngăn user vừa react vừa comment cùng 1 bài. Cần chạy migration sau:

```sql
-- Xóa unique constraint cũ
ALTER TABLE public.post_interactions DROP CONSTRAINT IF EXISTS uq_user_reaction_post;

-- Tạo partial unique index: chỉ enforce 1 reaction/user/post, không ảnh hưởng comment
CREATE UNIQUE INDEX uq_user_reaction_post
  ON public.post_interactions (post_id, user_id)
  WHERE interaction_type = 'REACTION' AND status = 'active';
```
