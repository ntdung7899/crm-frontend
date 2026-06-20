# Finance Module — Full API Reference

> Base path: `/api/v1.0/finance`  
> Auth: `Authorization: Bearer <JWT>` (required on all endpoints)  
> Response envelope: `{ data, message, message_en }`  
> Pagination shape: `{ items, total, page, limit }`

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Chart of Accounts](#2-chart-of-accounts)
3. [Funds](#3-funds)
4. [Vouchers — Receipts & Payments](#4-vouchers)
5. [Ledger Entries](#5-ledger-entries)
6. [Debts](#6-debts)
7. [Budgets](#7-budgets)
8. [Expense Requests](#8-expense-requests)
9. [Counterparties](#9-counterparties)
10. [Reports](#10-reports)
11. [Enums & Constants](#11-enums--constants)
12. [Code Generation Rules](#12-code-generation-rules)
13. [Transaction Business Rules](#13-transaction-business-rules)

---

## 1. Dashboard

### `GET /finance/dashboard`

Tổng quan tài chính theo kỳ.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `period` | string | `this_month` \| `last_month` \| `this_year` (default: `this_month`) |
| `from_date` | string | YYYY-MM-DD (ghi đè period) |
| `to_date` | string | YYYY-MM-DD (ghi đè period) |

**Response:**
```json
{
  "data": {
    "total_income": 150000000,
    "total_expense": 80000000,
    "total_fund": 200000000,
    "total_receivable": 50000000,
    "total_payable": 30000000,
    "cash_flow": [
      { "date": "2024-01-01", "income": 5000000, "expense": 2000000 }
    ]
  }
}
```

---

## 2. Chart of Accounts

### `GET /finance/chart-accounts`

Danh sách tài khoản kế toán.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `keyword` | string | Tìm theo mã TK hoặc tên |
| `account_type` | string | `ASSET` \| `LIABILITY` \| `EQUITY` \| `REVENUE` \| `EXPENSE` |
| `is_active` | boolean | Lọc trạng thái hoạt động |
| `page` | int | Default: 1 |
| `limit` | int | Default: 100 |

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "code": "111",
        "name": "Tiền mặt",
        "account_type": "ASSET",
        "parent_id": null,
        "is_active": true
      }
    ],
    "total": 50, "page": 1, "limit": 100
  }
}
```

### `POST /finance/chart-accounts`

Tạo tài khoản kế toán.

**Body:**
```json
{
  "code": "131",
  "name": "Phải thu khách hàng",
  "account_type": "ASSET",
  "parent_id": null,
  "description": "...",
  "is_active": true
}
```

> `code` phải duy nhất; `account_type` bắt buộc.

---

## 3. Funds

### `GET /finance/funds`

Danh sách quỹ.

**Query params:** `keyword`, `status`, `page`, `limit`

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "fund_code": "QTM",
        "fund_name": "Quỹ tiền mặt",
        "current_balance": 50000000,
        "status": "ACTIVE"
      }
    ],
    "total": 3, "page": 1, "limit": 20
  }
}
```

### `POST /finance/funds`

Tạo quỹ.

**Body:**
```json
{
  "fund_code": "QTM",
  "fund_name": "Quỹ tiền mặt",
  "opening_balance": 50000000,
  "currency": "VND",
  "description": "...",
  "treasurer_uuid": "uuid",
  "approver_uuid": "uuid"
}
```

> `fund_code` phải duy nhất; `current_balance` được gán = `opening_balance`.

### `GET /finance/funds/:id`

Chi tiết quỹ + thống kê tổng thu/chi.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "fund_name": "Quỹ tiền mặt",
    "current_balance": 50000000,
    "stats": {
      "receipt": { "total": 100000000, "count": 12 },
      "payment": { "total": 60000000, "count": 8 }
    }
  }
}
```

### `PUT /finance/funds/:id`

Cập nhật thông tin quỹ (không sửa `fund_code`, `current_balance`).

**Body (partial):**
```json
{
  "fund_name": "...",
  "description": "...",
  "treasurer_uuid": "uuid",
  "approver_uuid": "uuid",
  "manager_uuid": "uuid",
  "metadata": {}
}
```

### `PATCH /finance/funds/:id/status`

Đổi trạng thái quỹ.

**Body:**
```json
{ "status": "LOCKED" }
```

> Allowed: `ACTIVE` | `INACTIVE` | `LOCKED`

### `DELETE /finance/funds/:id`

Xoá quỹ. **Chỉ xoá được khi chưa có phiếu thu/chi.**

### `GET /finance/funds/:id/movements`

Sao kê biến động số dư quỹ.

**Query params:** `from_date`, `to_date`, `page`, `limit`

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "date": "2024-01-15T08:00:00Z",
        "voucher_no": "PT-240115-0001",
        "type": "RECEIPT",
        "amount_delta": 5000000,
        "balance_after": 55000000,
        "description": "Thu tiền hàng"
      }
    ],
    "total": 30, "page": 1, "limit": 20
  }
}
```

---

## 4. Vouchers

### `GET /finance/vouchers`

Danh sách phiếu thu/chi.

**Query params:**

| Param | Type |
|-------|------|
| `voucher_type` | `RECEIPT` \| `PAYMENT` \| `TRANSFER` \| `ADJUSTMENT` |
| `status` | `DRAFT` \| `COMPLETED` \| `CANCELLED` |
| `fund_id` | string |
| `from_date` / `to_date` | string |
| `page` / `limit` | int |

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "voucher_no": "PT-240115-0001",
        "voucher_type": "RECEIPT",
        "voucher_date": "2024-01-15",
        "amount": 5000000,
        "status": "COMPLETED",
        "status_label": "Đã hạch toán",
        "fund_name": "Quỹ tiền mặt"
      }
    ],
    "total": 45, "page": 1, "limit": 20
  }
}
```

### `POST /finance/vouchers/receipts`

Tạo phiếu thu.

**Body:**
```json
{
  "voucher_date": "2024-01-15",
  "content": "Thu tiền hàng tháng 1",
  "fund_id": "uuid",
  "amount": 5000000,
  "status": "COMPLETED",
  "counterparty_id": "uuid",
  "debit_account_id": "uuid",
  "credit_account_id": "uuid",
  "note": "...",
  "attachments": [{ "url": "...", "name": "..." }],
  "metadata": {}
}
```

> Nếu `status = COMPLETED`: tự động cập nhật số dư quỹ, tạo fund_movement, ledger_entry (nếu có TK), cập nhật debt/budget nếu truyền.

### `POST /finance/vouchers/payments`

Tạo phiếu chi. Body tương tự phiếu thu.

> Kiểm tra số dư quỹ đủ chi trước khi thực hiện.

### `GET /finance/vouchers/:id`

Chi tiết phiếu + đầy đủ join (fund, counterparty, debit_account, credit_account, ledger_entries).

### `PUT /finance/vouchers/:id`

Sửa phiếu. **Chỉ khi `status = DRAFT`.**

**Body (partial):** `voucher_date`, `content`, `amount`, `counterparty_id`, `debit_account_id`, `credit_account_id`, `note`, `attachments`, `metadata`

### `PATCH /finance/vouchers/:id/cancel`

Huỷ phiếu.

- Nếu `COMPLETED` → tự động hoàn lại số dư quỹ + tạo movement âm.
- Không huỷ được phiếu đã `CANCELLED`.

**Body:**
```json
{ "note": "Lý do huỷ" }
```

### `POST /finance/vouchers/transfers`

Chuyển tiền giữa hai quỹ. Tạo 2 phiếu cùng lúc: phiếu chi quỹ nguồn + phiếu thu quỹ đích.

**Body:**
```json
{
  "from_fund_id": "uuid",
  "to_fund_id": "uuid",
  "amount": 10000000,
  "content": "Chuyển từ quỹ TM sang quỹ NH",
  "voucher_date": "2024-01-15",
  "note": "..."
}
```

**Response:**
```json
{
  "data": {
    "out_voucher": { "id": "...", "voucher_no": "PC-..." },
    "in_voucher": { "id": "...", "voucher_no": "PT-..." }
  }
}
```

---

## 5. Ledger Entries

### `GET /finance/ledger-entries`

Bút toán kép.

**Query params:** `keyword`, `account_id`, `from_date`, `to_date`, `page`, `limit`

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "entry_date": "2024-01-15",
        "voucher_no": "PT-240115-0001",
        "description": "Thu tiền hàng",
        "debit_account": { "code": "111", "name": "Tiền mặt" },
        "credit_account": { "code": "511", "name": "Doanh thu bán hàng" },
        "amount": 5000000
      }
    ],
    "total": 80, "page": 1, "limit": 20
  }
}
```

---

## 6. Debts

### `GET /finance/debts`

Danh sách công nợ.

**Query params:**

| Param | Description |
|-------|-------------|
| `debt_type` | `RECEIVABLE` \| `PAYABLE` |
| `status` | `OPEN` \| `PARTIAL` \| `SETTLED` \| `OVERDUE` |
| `keyword` | Tìm theo description |
| `counterparty_id` | Lọc theo đối tác |
| `from_date` / `to_date` | Theo due_date |
| `page` / `limit` | Phân trang |

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "debt_type": "RECEIVABLE",
        "amount": 20000000,
        "remaining_amount": 20000000,
        "due_date": "2024-02-15",
        "status": "OPEN",
        "counterparty": { "id": "uuid", "name": "Công ty ABC" }
      }
    ],
    "total": 15, "page": 1, "limit": 20
  }
}
```

### `POST /finance/debts`

Tạo công nợ.

**Body:**
```json
{
  "debt_type": "RECEIVABLE",
  "description": "Phải thu công ty ABC",
  "amount": 20000000,
  "due_date": "2024-02-15",
  "counterparty_id": "uuid",
  "voucher_id": "uuid",
  "note": "..."
}
```

> `remaining_amount` được gán = `amount`; `status` = `OPEN`.

### `GET /finance/debts/summary`

Phân tích tổng hợp công nợ + aging.

**Response:**
```json
{
  "data": {
    "total_receivable": 50000000,
    "total_payable": 30000000,
    "receivable_count": 8,
    "payable_count": 5,
    "overdue_receivable": { "count": 2, "total": 15000000 },
    "overdue_payable": { "count": 1, "total": 5000000 },
    "aging": {
      "0_30": { "receivable": 20000000, "payable": 10000000 },
      "31_60": { "receivable": 15000000, "payable": 15000000 },
      "61_90": { "receivable": 10000000, "payable": 5000000 },
      "over_90": { "receivable": 5000000, "payable": 0 },
      "no_due_date": { "receivable": 0, "payable": 0 }
    }
  }
}
```

### `GET /finance/debts/:id`

Chi tiết công nợ + counterparty + lịch sử phiếu liên quan.

### `PUT /finance/debts/:id`

Cập nhật công nợ (partial).

**Body (partial):** `description`, `due_date`, `note`, `status`

---

## 7. Budgets

### `GET /finance/budgets`

Danh sách ngân sách.

**Query params:** `keyword`, `status`, `page`, `limit`

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "budget_code": "NS-2024-01",
        "budget_name": "Ngân sách vận hành Q1",
        "amount": 100000000,
        "used_amount": 40000000,
        "start_date": "2024-01-01",
        "end_date": "2024-03-31",
        "status": "ACTIVE"
      }
    ],
    "total": 5, "page": 1, "limit": 20
  }
}
```

### `POST /finance/budgets`

Tạo ngân sách.

**Body:**
```json
{
  "budget_code": "NS-2024-01",
  "budget_name": "Ngân sách vận hành Q1",
  "amount": 100000000,
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "manager_uuid": "uuid",
  "note": "..."
}
```

> `budget_code` phải duy nhất; `end_date >= start_date`.

### `GET /finance/budgets/:id`

Chi tiết ngân sách + `used_amount` + `remaining_amount`.

### `PUT /finance/budgets/:id`

Cập nhật ngân sách. **Không được sửa khi `CLOSED` hoặc `EXPIRED`.**

**Body (partial):** `budget_name`, `amount`, `start_date`, `end_date`, `manager_uuid`, `note`, `metadata`

### `PATCH /finance/budgets/:id/close`

Đóng ngân sách (`status = CLOSED`).

### `DELETE /finance/budgets/:id`

Xoá ngân sách. **Chỉ khi chưa có usage.**

### `GET /finance/budgets/:id/usages`

Lịch sử sử dụng ngân sách.

**Query params:** `from_date`, `to_date`, `page`, `limit`

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "amount": 5000000,
        "used_at": "2024-01-15T08:00:00Z",
        "voucher": { "voucher_no": "PC-240115-0001", "content": "Chi phí VP" }
      }
    ],
    "total": 8, "page": 1, "limit": 20
  }
}
```

---

## 8. Expense Requests

### `GET /finance/expense-requests`

Danh sách đề nghị chi.

**Query params:** `status`, `requester_uuid`, `keyword`, `from_date`, `to_date`, `page`, `limit`

**Status flow:**
```
DRAFT → PENDING_APPROVAL → PENDING_TREASURER → COMPLETED
                        ↘ REJECTED
              ↘ CANCELLED (bất kỳ trạng thái nào trừ COMPLETED)
```

### `POST /finance/expense-requests`

Tạo đề nghị chi.

**Body:**
```json
{
  "title": "Chi phí hội nghị Q1",
  "amount": 15000000,
  "requested_date": "2024-01-10",
  "fund_id": "uuid",
  "budget_id": "uuid",
  "reason": "...",
  "line_items": [
    { "description": "Thuê hội trường", "amount": 10000000 },
    { "description": "Ăn uống", "amount": 5000000 }
  ],
  "attachments": [{ "url": "...", "name": "..." }]
}
```

> Auto-generates `request_no` (PYC/YYYY-MM/XXXX); `status = DRAFT`; `requester_uuid` từ JWT.  
> `line_items` lưu trong `metadata.line_items`.

### `GET /finance/expense-requests/:id`

Chi tiết đề nghị chi + `line_items` (từ metadata) + `approvals` (lịch sử duyệt).

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "request_no": "PYC/2024-01/0001",
    "title": "Chi phí hội nghị Q1",
    "amount": 15000000,
    "status": "PENDING_APPROVAL",
    "line_items": [
      { "description": "Thuê hội trường", "amount": 10000000 }
    ],
    "approvals": [
      { "action": "SUBMIT", "approver_uuid": "uuid", "created_at": "..." }
    ]
  }
}
```

### `PUT /finance/expense-requests/:id`

Sửa đề nghị chi. **Chỉ khi `DRAFT`.**

**Body (partial):** `title`, `amount`, `requested_date`, `fund_id`, `budget_id`, `reason`, `line_items`, `attachments`, `metadata`

### `PATCH /finance/expense-requests/:id/submit`

Nộp đề nghị: `DRAFT → PENDING_APPROVAL`.

### `PATCH /finance/expense-requests/:id/approve`

Duyệt đề nghị: `PENDING_APPROVAL → PENDING_TREASURER`.

**Body:**
```json
{ "note": "Đã duyệt" }
```

### `PATCH /finance/expense-requests/:id/reject`

Từ chối đề nghị (không được từ chối trạng thái COMPLETED/CANCELLED/REJECTED).

**Body:**
```json
{ "note": "Lý do từ chối" }
```

### `PATCH /finance/expense-requests/:id/complete`

Hoàn thành thanh toán: `PENDING_TREASURER → COMPLETED`.

Tự động:
1. Kiểm tra quỹ ACTIVE + đủ số dư
2. Tạo phiếu chi COMPLETED
3. Cập nhật số dư quỹ + fund_movement
4. Tạo ledger_entry (nếu có TK)
5. Cập nhật budget_usage (nếu có budget_id)
6. Cập nhật `disbursed_amount` → COMPLETED nếu đã thanh toán đủ

**Body:**
```json
{
  "fund_id": "uuid",
  "note": "Đã chi tiền",
  "debit_account_id": "uuid",
  "credit_account_id": "uuid"
}
```

### `PATCH /finance/expense-requests/:id/cancel`

Huỷ đề nghị. Không huỷ được khi `COMPLETED`, `CANCELLED`, `REJECTED`.

**Body:**
```json
{ "note": "Lý do huỷ" }
```

---

## 9. Counterparties

### `GET /finance/counterparties`

Danh sách đối tác thu/chi.

**Query params:**

| Param | Description |
|-------|-------------|
| `keyword` | Tìm theo tên, điện thoại, email, mã số thuế |
| `type` | `CUSTOMER` \| `SUPPLIER` \| `EMPLOYEE` \| `OTHER` |
| `page` / `limit` | Phân trang (default limit: 50) |

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Công ty ABC",
        "counterparty_type": "CUSTOMER",
        "phone": "0901234567",
        "email": "abc@company.com",
        "tax_code": "0123456789"
      }
    ],
    "total": 20, "page": 1, "limit": 50
  }
}
```

### `POST /finance/counterparties`

Tạo đối tác mới.

**Body:**
```json
{
  "name": "Công ty ABC",
  "counterparty_type": "CUSTOMER",
  "phone": "0901234567",
  "email": "abc@company.com",
  "tax_code": "0123456789",
  "address": "...",
  "note": "..."
}
```

---

## 10. Reports

### `GET /finance/reports/income-statement`

Kết quả kinh doanh (KQKD) — so sánh kỳ hiện tại vs kỳ trước.

**Query params:** `period` (`this_month` \| `last_month` \| `this_year`), `from_date`, `to_date`

**Response:**
```json
{
  "data": {
    "period": { "from_date": "2024-01-01", "to_date": "2024-01-31" },
    "summary": {
      "total_revenue": 150000000,
      "total_expense": 80000000,
      "profit": 70000000
    },
    "vs_previous": {
      "revenue_change_pct": 12.5,
      "expense_change_pct": -5.0,
      "profit_change_pct": 30.0
    },
    "rows": [
      {
        "account_code": "511",
        "account_name": "Doanh thu bán hàng",
        "account_type": "REVENUE",
        "current_period": 150000000,
        "previous_period": 133000000
      }
    ]
  }
}
```

### `GET /finance/reports/balance-sheet`

Bảng cân đối kế toán (B01-DN).

**Query params:** `as_of_date` (default: hôm nay), `from_date` (default: đầu năm)

**Response:**
```json
{
  "data": {
    "as_of_date": "2024-01-31",
    "from_date": "2024-01-01",
    "summary": {
      "total_assets": 500000000,
      "total_liabilities": 200000000,
      "equity": 300000000
    },
    "rows": [
      {
        "account_type": "ASSET",
        "account_code": "111",
        "account_name": "Tiền mặt",
        "open_debit": 50000000,
        "open_credit": 0,
        "period_debit": 20000000,
        "period_credit": 5000000,
        "close_debit": 70000000,
        "close_credit": 5000000
      }
    ]
  }
}
```

### `GET /finance/reports/cash-flow`

Lưu chuyển tiền tệ (B03-DN).

**Query params:** `period`, `from_date`, `to_date`, `group_by` (`day` \| `month`, default: `day`)

**Response:**
```json
{
  "data": {
    "period": { "from_date": "2024-01-01", "to_date": "2024-01-31" },
    "summary": {
      "total_income": 150000000,
      "total_expense": 80000000,
      "net_cash_flow": 70000000
    },
    "by_type": {
      "receipt": 150000000,
      "payment": 80000000,
      "transfer": 0,
      "adjustment": 0
    },
    "timeline": [
      { "period": "2024-01-01", "income": 5000000, "expense": 2000000, "net": 3000000 }
    ]
  }
}
```

---

## 11. Enums & Constants

### Fund status
| Value | Mô tả |
|-------|-------|
| `ACTIVE` | Đang hoạt động |
| `INACTIVE` | Tạm dừng |
| `LOCKED` | Khoá (chỉ đọc) |

### Voucher type
| Value | Mô tả |
|-------|-------|
| `RECEIPT` | Phiếu thu |
| `PAYMENT` | Phiếu chi |
| `TRANSFER` | Chuyển quỹ |
| `ADJUSTMENT` | Điều chỉnh |

### Voucher status
| Value | Mô tả |
|-------|-------|
| `DRAFT` | Nháp |
| `COMPLETED` | Đã hạch toán |
| `CANCELLED` | Đã huỷ |

### Debt type
| Value | Mô tả |
|-------|-------|
| `RECEIVABLE` | Phải thu |
| `PAYABLE` | Phải trả |

### Debt status
| Value | Mô tả |
|-------|-------|
| `OPEN` | Chưa thanh toán |
| `PARTIAL` | Thanh toán một phần |
| `SETTLED` | Đã tất toán |
| `OVERDUE` | Quá hạn |

### Budget status
| Value | Mô tả |
|-------|-------|
| `ACTIVE` | Đang dùng |
| `CLOSED` | Đã đóng |
| `EXPIRED` | Hết hạn |

### Expense request status
| Value | Mô tả |
|-------|-------|
| `DRAFT` | Nháp |
| `PENDING_APPROVAL` | Chờ duyệt |
| `PENDING_TREASURER` | Chờ thanh toán |
| `COMPLETED` | Đã thanh toán |
| `REJECTED` | Từ chối |
| `CANCELLED` | Đã huỷ |

### Chart account type
| Value | Mô tả |
|-------|-------|
| `ASSET` | Tài sản |
| `LIABILITY` | Nợ phải trả |
| `EQUITY` | Vốn chủ sở hữu |
| `REVENUE` | Doanh thu |
| `EXPENSE` | Chi phí |

### Counterparty type
| Value | Mô tả |
|-------|-------|
| `CUSTOMER` | Khách hàng |
| `SUPPLIER` | Nhà cung cấp |
| `EMPLOYEE` | Nhân viên |
| `OTHER` | Khác |

---

## 12. Code Generation Rules

### Voucher No

- **Phiếu thu**: `PT-YYMMDD-XXXX` (e.g. `PT-240115-0001`)
- **Phiếu chi**: `PC-YYMMDD-XXXX` (e.g. `PC-240115-0001`)
- Reset counter mỗi ngày; 4 chữ số padding.

### Request No

- **Đề nghị chi**: `PYC/YYYY-MM/XXXX` (e.g. `PYC/2024-01/0001`)
- Reset counter mỗi tháng; 4 chữ số padding.

---

## 13. Transaction Business Rules

### Tạo phiếu (status = COMPLETED)

1. Lấy quỹ với `LOCK UPDATE`
2. Kiểm tra quỹ `ACTIVE`
3. Với PAYMENT: kiểm tra `current_balance >= amount`
4. Insert `finance_voucher` với `paid_received_at = now()`
5. Cập nhật `current_balance`:
   - RECEIPT: `balance += amount`
   - PAYMENT: `balance -= amount`
6. Insert `finance_fund_movements` (`amount_delta`, `balance_after`)
7. Nếu có `debit_account_id` và `credit_account_id`: insert `finance_ledger_entries`
8. Nếu có `debt_id`: tăng `settled_amount` trên `finance_debts`
9. Nếu có `budget_id`: tăng `used_amount` → insert `finance_budget_usages`
10. Nếu có `request_id`: tăng `disbursed_amount` trên `finance_expense_requests`

### Huỷ phiếu COMPLETED

1. Lấy quỹ với `LOCK UPDATE`
2. Đảo ngược delta: RECEIPT → `-amount`; PAYMENT → `+amount`
3. Insert movement với delta âm/dương
4. Update `status = CANCELLED`

### Chuyển quỹ

1. Lock cả 2 quỹ đồng thời
2. Kiểm tra từng quỹ ACTIVE + quỹ nguồn đủ số dư
3. Tạo 2 phiếu TRANSFER
4. Cập nhật balance cả 2 quỹ
5. Tạo 2 movements

---

*Tài liệu này bao gồm toàn bộ Finance Module (Phase 1 + Phase 2 bổ sung). Cập nhật lần cuối: 2026-06-19.*
