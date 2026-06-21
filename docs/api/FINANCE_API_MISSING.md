# Finance Module — API CÒN THIẾU (đề xuất bổ sung)

> Đối chiếu giữa `FINANCE_API.md` (đã có) và nhu cầu thực tế của FE phần Tài chính.
> Base URL: `/api/v1.0/finance` · Auth: `Authorization: Bearer <token>`
> Cập nhật: 2026-06-13

Mức độ ưu tiên: 🔴 chặn màn hình · 🟠 thiếu thao tác · 🟡 nice-to-have.

---

## 0. Cần CHỐT trước (không phải endpoint)

| Vấn đề | Hiện trạng | Cần |
|---|---|---|
| **Envelope** | Doc finance ghi `data`; các module khác trả `responseData` | Chốt 1 kiểu (FE đang unwrap cả hai tạm thời) |
| **Phân trang** | finance dùng `page/limit/items/total`; module khác `currentPage/pageSize/rows/count` | Chốt convention |
| **Attachments** | body nhận `attachments: []` nhưng chưa định nghĩa | Chốt schema `[{ url, name }]` (upload qua `POST /api/v1.0/files`) |

---

## 1. 🔴 Danh mục tài khoản kế toán (Chart of Accounts)

> Phiếu/quỹ cần `debit_account_id` / `credit_account_id` / `default_account_id` (UUID). Hiện không có cách lấy danh sách TK để đổ dropdown — FE đang phải hardcode.

### `GET /finance/chart-accounts`
Query: `keyword`, `account_type` (`ASSET|LIABILITY|REVENUE|EXPENSE`), `is_active`

```json
{
  "data": {
    "items": [
      { "id": "uuid", "code": "112", "name": "Tiền gửi ngân hàng", "account_type": "ASSET", "is_active": true }
    ],
    "total": 7
  }
}
```

---

## 2. 🔴 Công nợ (Debts)

> Doc nhắc `finance_debts` (dashboard + `debt_id` của phiếu) nhưng KHÔNG có endpoint nào. Trang `/tai-chinh/cong-no` (6 sub-tab: phải thu, phải trả, thống kê, dự đoán, chi tiết) đang chạy bằng dữ liệu cục bộ.

### `GET /finance/debts`
Query: `debt_type` (`RECEIVABLE|PAYABLE`), `status` (`OPEN|PARTIAL|OVERDUE|SETTLED`), `keyword`, `counterparty_id`, `page`, `limit`

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "counterparty_id": "uuid",
        "counterparty_name": "Công ty A",
        "tax_code": "0101234567",
        "phone": "0987...",
        "manager_uuid": "uuid",
        "debt_type": "RECEIVABLE",
        "original_amount": "100000000",
        "settled_amount": "40000000",
        "remaining_amount": "60000000",
        "due_date": "2026-07-01",
        "status": "PARTIAL",
        "updated_at": "2026-06-18T..."
      }
    ],
    "total": 25
  }
}
```

### `GET /finance/debts/:id`
> Chi tiết + lịch sử thanh toán (các voucher gắn `debt_id`).

### `GET /finance/debts/summary`
> Cho tab Thống kê / Dự đoán: tổng phải thu/phải trả + phân tích tuổi nợ (aging).

```json
{
  "data": {
    "total_receivable": "1088000000",
    "total_payable": "15000000",
    "aging": [
      { "bucket": "0-30", "receivable": 500000000, "payable": 0 },
      { "bucket": "31-60", "receivable": 300000000, "payable": 15000000 },
      { "bucket": "60+",   "receivable": 288000000, "payable": 0 }
    ]
  }
}
```

### `POST /finance/debts` (🟡 nếu cho nhập công nợ thủ công)

---

## 3. 🔴 Báo cáo tài chính (Reports)

> Trang `/tai-chinh/bao-cao` có 6 tab (B01A, B01B, B01-DN cân đối, KQKD, B02-DN, B03-DN lưu chuyển). Doc chỉ có `cash_flow` trong dashboard.

### `GET /finance/reports/income-statement` (KQKD)
Query: `period` | `from_date` & `to_date`

```json
{
  "data": {
    "rows": [
      { "code": "01", "label": "Doanh thu bán hàng", "current": 500000000, "prev": 420000000 },
      { "code": "11", "label": "Giá vốn hàng bán",    "current": 300000000, "prev": 250000000 }
    ]
  }
}
```

### `GET /finance/reports/balance-sheet` (Bảng cân đối — B01-DN)
Query: `as_of_date`

```json
{
  "data": {
    "rows": [
      {
        "account_code": "112", "account_name": "Tiền gửi ngân hàng",
        "open_debit": 500000000, "open_credit": 0,
        "period_debit": 73535000, "period_credit": 0,
        "close_debit": 573535000, "close_credit": 0
      }
    ]
  }
}
```

### `GET /finance/reports/cash-flow` (Lưu chuyển tiền tệ — B03-DN)
Query: `period` | `from_date` & `to_date`

---

## 4. 🟠 Quỹ (Funds) — bổ sung CRUD

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/finance/funds/:id` | Chi tiết quỹ |
| `PUT` | `/finance/funds/:id` | Sửa quỹ (tên, người quản lý, TK mặc định...) |
| `PATCH` | `/finance/funds/:id/status` | Đổi trạng thái `ACTIVE/INACTIVE/LOCKED` (khoá/mở) |
| `DELETE` | `/finance/funds/:id` | Xoá (chỉ khi chưa phát sinh giao dịch) |
| `GET` | `/finance/funds/:id/movements` | Sao kê biến động quỹ (`finance_fund_movements`) |

**Field cần thêm vào fund:** `fund_type` (loại quỹ: `CASH|BANK|INTERNAL` — FE có tiền mặt/ngân hàng/nội bộ), `tax_account_id`.

`GET /finance/funds/:id/movements` response:
```json
{
  "data": {
    "items": [
      { "id": "uuid", "date": "2026-06-18", "voucher_no": "PT-260618-0001",
        "type": "RECEIPT", "amount_delta": "50000000", "balance_after": "573535000",
        "description": "Thu tiền hợp đồng" }
    ],
    "total": 30
  }
}
```

---

## 5. 🟠 Phiếu thu/chi (Vouchers) — bổ sung

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/finance/vouchers/:id` | Chi tiết phiếu (kèm attachments, hạch toán) — cho Detail modal |
| `PUT` | `/finance/vouchers/:id` | Sửa phiếu nháp (`DRAFT`) |
| `PATCH` | `/finance/vouchers/:id/cancel` | Huỷ phiếu (`CANCELLED`); nếu đã `COMPLETED` → hoàn quỹ |
| `POST` | `/finance/vouchers/transfers` | Chuyển quỹ (`TRANSFER`): `from_fund_id`, `to_fund_id`, `amount`, `voucher_date` |
| `POST` | `/finance/vouchers/adjustments` | 🟡 Điều chỉnh số dư quỹ (`ADJUSTMENT`) |

**Field cần thêm vào voucher (receipt/payment):**
- `payment_method` (`CASH|TRANSFER|OTHER` — hình thức thanh toán)
- `source` (nguồn thu/chi: `MANUAL|ORDER|CUSTOMER|REFUND|REQUEST...`)

---

## 6. 🟠 Ngân sách (Budgets) — bổ sung CRUD

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/finance/budgets/:id` | Chi tiết + danh sách sử dụng |
| `PUT` | `/finance/budgets/:id` | Sửa ngân sách |
| `PATCH` | `/finance/budgets/:id/close` | Đóng ngân sách (`CLOSED`) |
| `DELETE` | `/finance/budgets/:id` | Xoá (khi chưa phát sinh sử dụng) |
| `GET` | `/finance/budgets/:id/usages` | Lịch sử sử dụng (`finance_budget_usages`) |

**Field cần thêm:** `participant_uuids` (người tham gia — FE có), `is_template`.

---

## 7. 🟠 Yêu cầu chi phí (Expense Requests) — bổ sung

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/finance/expense-requests/:id` | Chi tiết + **lịch sử duyệt** (`finance_request_approvals`) + line items — cho Detail modal |
| `PUT` | `/finance/expense-requests/:id` | Sửa yêu cầu nháp |
| `PATCH` | `/finance/expense-requests/:id/submit` | Gửi duyệt (`DRAFT → PENDING_APPROVAL`) |
| `PATCH` | `/finance/expense-requests/:id/cancel` | Huỷ yêu cầu (`CANCELLED`) |

**Field cần thêm vào body create/update:**
- `line_items: [{ content, amount }]` (FE có nhiều dòng nội dung chi — `danhSachNoiDung`)
- `reason` (lý do — `lyDo`)
- `order_id`, `customer_id` (liên kết đơn hàng / khách hàng)

**Enum cần thêm:** trạng thái `PROCESSING` (Đang xử lý) — FE có `dang_xu_ly`.

`GET /finance/expense-requests/:id` cần trả thêm:
```json
{
  "data": {
    "id": "uuid",
    "...": "(các field như list)",
    "line_items": [{ "id": "uuid", "content": "Mua xe", "amount": "35000000" }],
    "approvals": [
      { "action": "APPROVED", "actor_uuid": "uuid", "actor_name": "Nguyen Van A",
        "note": "Đồng ý", "created_at": "2026-06-18T09:00:00Z" }
    ]
  }
}
```

---

## 8. 🟡 Đối tác / NCC (Counterparties)

> `counterparty_id` dùng ở phiếu/công nợ. Phiếu chi FE có đối tượng **NCC (nhà cung cấp)** — chưa có nguồn dữ liệu.

### `GET /finance/counterparties`
Query: `type` (`CUSTOMER|SUPPLIER|EMPLOYEE|OTHER`), `keyword`

> Hoặc xác nhận: khách hàng lấy từ `/customers`, nhân viên từ `/users`, **NCC lấy từ đâu?**

---

## Tổng hợp ưu tiên triển khai

1. 🔴 `GET /finance/chart-accounts` — mở khoá mọi form chọn TK.
2. 🔴 `GET /finance/debts` (+ `/:id`, `/summary`) — trang Công nợ.
3. 🔴 `GET /finance/reports/{income-statement,balance-sheet,cash-flow}` — trang Báo cáo.
4. 🟠 GET-detail + update + cancel cho vouchers / expense-requests / funds / budgets.
5. 🟠 Bổ sung field: voucher(`payment_method`,`source`), fund(`fund_type`,`tax_account_id`), request(`line_items`,`reason`,`order_id`,`customer_id`,status `PROCESSING`).
6. 🟡 `GET /finance/counterparties`, transfers/adjustments, fund movements, budget usages.
