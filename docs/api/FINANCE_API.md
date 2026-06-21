# Finance Module API Documentation

Base URL: `/api/v1.0/finance`  
Authentication: `Authorization: Bearer <token>` (bắt buộc cho tất cả endpoint)

---

## Mục lục

1. [Dashboard](#1-dashboard)
2. [Quản lý quỹ](#2-quản-lý-quỹ)
3. [Phiếu thu / Phiếu chi (danh sách)](#3-phiếu-thu--phiếu-chi-danh-sách)
4. [Tạo phiếu thu](#4-tạo-phiếu-thu)
5. [Tạo phiếu chi](#5-tạo-phiếu-chi)
6. [Hạch toán quỹ](#6-hạch-toán-quỹ)
7. [Ngân sách](#7-ngân-sách)
8. [Yêu cầu chi phí](#8-yêu-cầu-chi-phí)
9. [Duyệt yêu cầu chi phí](#9-duyệt-yêu-cầu-chi-phí)
10. [Từ chối yêu cầu chi phí](#10-từ-chối-yêu-cầu-chi-phí)
11. [Hoàn thành / xuất quỹ](#11-hoàn-thành--xuất-quỹ)

---

## 1. Dashboard

### `GET /api/v1.0/finance/dashboard`

Lấy dữ liệu tổng quan tài chính.

#### Query params

| Param | Type | Mô tả |
|-------|------|-------|
| `period` | string | `this_month` \| `last_month` \| `this_year` |
| `from_date` | string | `YYYY-MM-DD` — bắt đầu khoảng thời gian |
| `to_date` | string | `YYYY-MM-DD` — kết thúc khoảng thời gian |

> Nếu không truyền gì → mặc định `this_month`

#### Response

```json
{
  "data": {
    "total_income": 150000000,
    "total_expense": 30000000,
    "total_fund": 1573535000,
    "total_receivable": 1088149999,
    "total_payable": 15000000,
    "cash_flow": [
      {
        "date": "2026-06-01",
        "income": 50000000,
        "expense": 10000000,
        "balance": 1573535000
      },
      {
        "date": "2026-06-02",
        "income": 0,
        "expense": 5000000,
        "balance": 1573535000
      }
    ]
  },
  "message": "Thành công",
  "message_en": "Success"
}
```

#### Logic tính toán

| Field | Nguồn dữ liệu |
|-------|--------------|
| `total_income` | `SUM(amount)` từ `finance_vouchers` WHERE `voucher_type='RECEIPT'` AND `status='COMPLETED'` AND trong khoảng ngày |
| `total_expense` | `SUM(amount)` từ `finance_vouchers` WHERE `voucher_type='PAYMENT'` AND `status='COMPLETED'` AND trong khoảng ngày |
| `total_fund` | `SUM(current_balance)` từ `finance_funds` WHERE `status='ACTIVE'` |
| `total_receivable` | `SUM(remaining_amount)` từ `finance_debts` WHERE `debt_type='RECEIVABLE'` AND `status IN ('OPEN','PARTIAL','OVERDUE')` |
| `total_payable` | `SUM(remaining_amount)` từ `finance_debts` WHERE `debt_type='PAYABLE'` AND `status IN ('OPEN','PARTIAL','OVERDUE')` |
| `cash_flow` | Group by ngày từ `finance_fund_movements` trong khoảng ngày |

---

## 2. Quản lý quỹ

### `GET /api/v1.0/finance/funds`

Lấy danh sách quỹ có phân trang, filter.

#### Query params

| Param | Type | Mô tả |
|-------|------|-------|
| `page` | integer | Trang hiện tại (default: 1) |
| `limit` | integer | Số bản ghi / trang (default: 20, max: 100) |
| `keyword` | string | Tìm theo tên hoặc mã quỹ |
| `status` | string | `ACTIVE` \| `INACTIVE` \| `LOCKED` |

#### Response

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "fund_code": "CASH_MAIN",
        "fund_name": "Quỹ tiền mặt chính",
        "description": null,
        "default_account_id": null,
        "currency": "VND",
        "opening_balance": "500000000",
        "current_balance": "573535000",
        "treasurer_uuid": null,
        "approver_uuid": null,
        "manager_uuid": "uuid",
        "created_by": "uuid",
        "status": "ACTIVE",
        "metadata": {},
        "created_at": "2026-06-18T00:00:00.000Z",
        "updated_at": "2026-06-18T00:00:00.000Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20
  },
  "message": "Thành công",
  "message_en": "Success"
}
```

---

### `POST /api/v1.0/finance/funds`

Tạo quỹ mới.

#### Request body

```json
{
  "fund_code": "VCB",
  "fund_name": "Quỹ Vietcombank",
  "description": "Tài khoản ngân hàng Vietcombank",
  "default_account_id": "uuid",
  "currency": "VND",
  "opening_balance": 1000000000,
  "treasurer_uuid": "uuid",
  "approver_uuid": "uuid",
  "manager_uuid": "uuid",
  "status": "ACTIVE",
  "metadata": {}
}
```

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `fund_name` | ✅ | Tên quỹ |
| `fund_code` | ❌ | Mã quỹ — nếu có phải là duy nhất |
| `opening_balance` | ❌ | Số dư ban đầu (default: 0, phải >= 0) |
| `currency` | ❌ | Đơn vị tiền (default: `VND`) |
| `status` | ❌ | `ACTIVE` \| `INACTIVE` \| `LOCKED` (default: `ACTIVE`) |

#### Response

```json
{
  "data": {
    "id": "uuid",
    "fund_code": "VCB",
    "fund_name": "Quỹ Vietcombank",
    "opening_balance": "1000000000",
    "current_balance": "1000000000",
    "status": "ACTIVE",
    "created_at": "2026-06-18T00:00:00.000Z"
  },
  "message": "Tạo quỹ thành công",
  "message_en": "Fund created successfully"
}
```

#### Lỗi có thể xảy ra

| HTTP | message |
|------|---------|
| 400 | `fund_name là bắt buộc` |
| 400 | `Số dư ban đầu phải >= 0` |
| 400 | `Trạng thái không hợp lệ` |
| 409 | `Mã quỹ đã tồn tại` |

---

## 3. Phiếu thu / Phiếu chi (danh sách)

### `GET /api/v1.0/finance/vouchers`

Lấy danh sách phiếu — dùng chung cho phiếu thu và phiếu chi, phân biệt qua `type`.

#### Query params

| Param | Type | Mô tả |
|-------|------|-------|
| `type` | string | `RECEIPT` \| `PAYMENT` \| `TRANSFER` \| `ADJUSTMENT` |
| `page` | integer | Trang (default: 1) |
| `limit` | integer | Số bản ghi (default: 20) |
| `keyword` | string | Tìm theo `voucher_no` hoặc `content` |
| `status` | string | `DRAFT` \| `PENDING_APPROVAL` \| `APPROVED` \| `COMPLETED` \| `CANCELLED` |
| `fund_id` | string | UUID của quỹ |
| `from_date` | string | `YYYY-MM-DD` |
| `to_date` | string | `YYYY-MM-DD` |

#### Response

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "voucher_no": "PT-260618-0001",
        "voucher_type": "RECEIPT",
        "voucher_date": "2026-06-18",
        "content": "Thu tiền hợp đồng tháng 6",
        "fund_id": "uuid",
        "fund_name": "Quỹ Vietcombank",
        "amount": "50000000",
        "status": "COMPLETED",
        "status_label": "Đã hoàn thành",
        "counterparty_id": null,
        "request_id": null,
        "debt_id": null,
        "debit_account_id": "uuid",
        "credit_account_id": "uuid",
        "cashier_uuid": null,
        "approver_uuid": null,
        "paid_received_at": "2026-06-18T10:30:00.000Z",
        "note": null,
        "created_by": "uuid",
        "created_at": "2026-06-18T10:30:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  },
  "message": "Thành công",
  "message_en": "Success"
}
```

> `status_label` mapping:  
> `DRAFT` → Nháp | `PENDING_APPROVAL` → Chờ duyệt | `APPROVED` → Đã duyệt | `COMPLETED` → Đã hoàn thành | `CANCELLED` → Đã huỷ

---

## 4. Tạo phiếu thu

### `POST /api/v1.0/finance/vouchers/receipts`

Tạo phiếu thu. Nếu `status = COMPLETED` → chạy transaction đầy đủ (cập nhật quỹ, hạch toán, công nợ).

#### Request body

```json
{
  "voucher_date": "2026-06-18",
  "content": "Thu tiền hợp đồng tháng 6",
  "fund_id": "uuid",
  "amount": 50000000,
  "counterparty_id": "uuid",
  "debt_id": "uuid",
  "debit_account_id": "uuid",
  "credit_account_id": "uuid",
  "status": "COMPLETED",
  "note": "Ghi chú",
  "attachments": [],
  "metadata": {}
}
```

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `content` | ✅ | Nội dung phiếu |
| `fund_id` | ✅ | UUID quỹ nhận tiền |
| `amount` | ✅ | Số tiền (> 0) |
| `voucher_date` | ❌ | Ngày phiếu (default: hôm nay) |
| `status` | ❌ | `DRAFT` \| `COMPLETED` (default: `DRAFT`) |
| `debit_account_id` | ❌ | TK Nợ (bắt buộc nếu muốn sinh ledger entry) |
| `credit_account_id` | ❌ | TK Có (bắt buộc nếu muốn sinh ledger entry) — không được trùng TK Nợ |
| `debt_id` | ❌ | Gắn với công nợ phải thu → tự cập nhật `settled_amount` |
| `counterparty_id` | ❌ | Đối tác |

> `voucher_type` tự động = `RECEIPT`  
> `voucher_no` tự sinh: `PT-YYMMDD-XXXX` (VD: `PT-260618-0001`)

#### Luồng transaction khi `status = COMPLETED`

```
1. Kiểm tra fund tồn tại và status = ACTIVE
2. Sinh voucher_no
3. INSERT finance_vouchers (status=COMPLETED, paid_received_at=now)
4. UPDATE finance_funds.current_balance += amount
5. INSERT finance_fund_movements (amount_delta = +amount)
6. INSERT finance_ledger_entries (nếu có debit/credit account)
7. UPDATE finance_debts.settled_amount (nếu có debt_id)
```

#### Hạch toán mẫu — phiếu thu

```
Nợ: 112 (Tiền gửi ngân hàng)
Có: 131 (Phải thu khách hàng)
```

#### Response

```json
{
  "data": {
    "id": "uuid",
    "voucher_no": "PT-260618-0001",
    "voucher_type": "RECEIPT",
    "status": "COMPLETED",
    "amount": "50000000",
    "paid_received_at": "2026-06-18T10:30:00.000Z"
  },
  "message": "Tạo phiếu thu thành công",
  "message_en": "Receipt created successfully"
}
```

#### Lỗi có thể xảy ra

| HTTP | message |
|------|---------|
| 400 | `Nội dung là bắt buộc` |
| 400 | `Quỹ là bắt buộc` |
| 400 | `Số tiền phải lớn hơn 0` |
| 400 | `Quỹ không tồn tại` |
| 400 | `Quỹ không đang hoạt động` |
| 400 | `debit_account_id và credit_account_id không được trùng nhau` |

---

## 5. Tạo phiếu chi

### `POST /api/v1.0/finance/vouchers/payments`

Tạo phiếu chi. Nếu `status = COMPLETED` → chạy transaction đầy đủ.

#### Request body

```json
{
  "voucher_date": "2026-06-18",
  "content": "Chi tiền nhập hàng",
  "fund_id": "uuid",
  "amount": 30000000,
  "counterparty_id": "uuid",
  "request_id": "uuid",
  "debt_id": "uuid",
  "budget_id": "uuid",
  "debit_account_id": "uuid",
  "credit_account_id": "uuid",
  "status": "COMPLETED",
  "note": "Ghi chú",
  "attachments": [],
  "metadata": {}
}
```

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `content` | ✅ | Nội dung phiếu |
| `fund_id` | ✅ | UUID quỹ xuất tiền |
| `amount` | ✅ | Số tiền (> 0) |
| `status` | ❌ | `DRAFT` \| `COMPLETED` (default: `DRAFT`) |
| `request_id` | ❌ | Gắn yêu cầu chi phí → tự cập nhật `disbursed_amount` |
| `budget_id` | ❌ | Gắn ngân sách → tự insert `finance_budget_usages` |
| `debt_id` | ❌ | Gắn công nợ phải trả → tự cập nhật `settled_amount` |

> `voucher_type` tự động = `PAYMENT`  
> `voucher_no` tự sinh: `PC-YYMMDD-XXXX` (VD: `PC-260618-0001`)

#### Luồng transaction khi `status = COMPLETED`

```
1. Kiểm tra fund tồn tại và status = ACTIVE
2. Kiểm tra current_balance >= amount (đủ tiền)
3. Sinh voucher_no
4. INSERT finance_vouchers (status=COMPLETED, paid_received_at=now)
5. UPDATE finance_funds.current_balance -= amount
6. INSERT finance_fund_movements (amount_delta = -amount)
7. INSERT finance_ledger_entries (nếu có debit/credit account)
8. UPDATE finance_expense_requests.disbursed_amount (nếu có request_id)
   → nếu disbursed_amount >= amount thì cập nhật status=COMPLETED
9. INSERT finance_budget_usages (nếu có budget_id)
10. UPDATE finance_debts.settled_amount (nếu có debt_id)
```

#### Hạch toán mẫu — phiếu chi

```
Nợ: 642 (Chi phí quản lý doanh nghiệp)
Có: 112 (Tiền gửi ngân hàng)
```

#### Response

```json
{
  "data": {
    "id": "uuid",
    "voucher_no": "PC-260618-0001",
    "voucher_type": "PAYMENT",
    "status": "COMPLETED",
    "amount": "30000000",
    "paid_received_at": "2026-06-18T10:30:00.000Z"
  },
  "message": "Tạo phiếu chi thành công",
  "message_en": "Payment voucher created successfully"
}
```

#### Lỗi có thể xảy ra

| HTTP | message |
|------|---------|
| 400 | `Số dư quỹ không đủ để thực hiện giao dịch` |
| 400 | `Quỹ không tồn tại` |
| 400 | `Quỹ không đang hoạt động` |

---

## 6. Hạch toán quỹ

### `GET /api/v1.0/finance/ledger-entries`

Lấy danh sách bút toán kế toán.

#### Query params

| Param | Type | Mô tả |
|-------|------|-------|
| `page` | integer | Trang (default: 1) |
| `limit` | integer | Số bản ghi (default: 20) |
| `keyword` | string | Tìm theo `description` |
| `from_date` | string | `YYYY-MM-DD` |
| `to_date` | string | `YYYY-MM-DD` |
| `debit_account_id` | string | UUID tài khoản Nợ |
| `credit_account_id` | string | UUID tài khoản Có |

#### Response

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "entry_date": "2026-06-18",
        "voucher_no": "PT-260618-0001",
        "description": "Thu tiền hợp đồng tháng 6",
        "debit_account_code": "112",
        "debit_account_name": "Tiền gửi ngân hàng",
        "credit_account_code": "131",
        "credit_account_name": "Phải thu khách hàng",
        "amount": 50000000,
        "created_at": "2026-06-18T10:30:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  },
  "message": "Thành công",
  "message_en": "Success"
}
```

---

## 7. Ngân sách

### `GET /api/v1.0/finance/budgets`

Lấy danh sách ngân sách.

#### Query params

| Param | Type | Mô tả |
|-------|------|-------|
| `page` | integer | Trang (default: 1) |
| `limit` | integer | Số bản ghi (default: 20) |
| `keyword` | string | Tìm theo tên hoặc mã ngân sách |
| `status` | string | `DRAFT` \| `ACTIVE` \| `EXPIRED` \| `CLOSED` |

#### Response

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "budget_code": "MARKETING-Q2",
        "budget_name": "Marketing Q2 2026",
        "amount": "100000000",
        "used_amount": 25000000,
        "remaining_amount": 75000000,
        "manager_uuid": "uuid",
        "start_date": "2026-04-01",
        "end_date": "2026-06-30",
        "status": "ACTIVE",
        "status_label": "Đang sử dụng",
        "note": null,
        "created_at": "2026-04-01T00:00:00.000Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20
  },
  "message": "Thành công",
  "message_en": "Success"
}
```

> `used_amount` = `SUM(amount)` từ `finance_budget_usages`  
> `remaining_amount` = `amount - used_amount`  
> Nếu `end_date < today` và `status = ACTIVE` → hiển thị `status = EXPIRED` (không ghi DB)

---

### `POST /api/v1.0/finance/budgets`

Tạo ngân sách mới.

#### Request body

```json
{
  "budget_code": "MARKETING-Q2",
  "budget_name": "Marketing Q2 2026",
  "amount": 100000000,
  "start_date": "2026-04-01",
  "end_date": "2026-06-30",
  "manager_uuid": "uuid",
  "status": "ACTIVE",
  "note": "Ngân sách marketing quý 2",
  "metadata": {}
}
```

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `budget_name` | ✅ | Tên ngân sách |
| `amount` | ✅ | Tổng ngân sách (> 0) |
| `budget_code` | ❌ | Mã ngân sách — nếu có phải là duy nhất |
| `end_date` | ❌ | Phải >= `start_date` nếu cả hai đều truyền |

#### Response

```json
{
  "data": {
    "id": "uuid",
    "budget_code": "MARKETING-Q2",
    "budget_name": "Marketing Q2 2026",
    "amount": "100000000",
    "status": "ACTIVE",
    "created_at": "2026-06-18T00:00:00.000Z"
  },
  "message": "Tạo ngân sách thành công",
  "message_en": "Budget created successfully"
}
```

#### Lỗi có thể xảy ra

| HTTP | message |
|------|---------|
| 400 | `Tên ngân sách là bắt buộc` |
| 400 | `Số tiền ngân sách phải lớn hơn 0` |
| 400 | `end_date phải >= start_date` |
| 409 | `Mã ngân sách đã tồn tại` |

---

## 8. Yêu cầu chi phí

### `GET /api/v1.0/finance/expense-requests`

Lấy danh sách yêu cầu chi phí.

#### Query params

| Param | Type | Mô tả |
|-------|------|-------|
| `page` | integer | Trang (default: 1) |
| `limit` | integer | Số bản ghi (default: 20) |
| `keyword` | string | Tìm theo `request_no` hoặc `content` |
| `type` | string | `PAYMENT` \| `ADVANCE` \| `REIMBURSEMENT` |
| `status` | string | `DRAFT` \| `PENDING_APPROVAL` \| `PENDING_TREASURER` \| `COMPLETED` \| `REJECTED` \| `CANCELLED` |
| `from_date` | string | `YYYY-MM-DD` |
| `to_date` | string | `YYYY-MM-DD` |

#### Response

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "request_no": "PYC/2026-06/0008",
        "request_date": "2026-06-18",
        "content": "Mua xe máy giao hàng",
        "request_type": "PAYMENT",
        "requester_uuid": "uuid",
        "approver_uuid": "uuid",
        "budget_id": null,
        "fund_id": "uuid",
        "amount": "35000000",
        "disbursed_amount": "35000000",
        "status": "COMPLETED",
        "status_label": "Đã hoàn thành",
        "approved_at": "2026-06-18T09:00:00.000Z",
        "completed_at": "2026-06-18T10:30:00.000Z",
        "note": null,
        "created_at": "2026-06-18T08:00:00.000Z"
      }
    ],
    "total": 8,
    "page": 1,
    "limit": 20
  },
  "message": "Thành công",
  "message_en": "Success"
}
```

> `status_label` mapping:  
> `DRAFT` → Nháp | `PENDING_APPROVAL` → Chờ duyệt | `PENDING_TREASURER` → Chờ xuất quỹ | `COMPLETED` → Đã hoàn thành | `REJECTED` → Đã từ chối | `CANCELLED` → Đã huỷ

---

### `POST /api/v1.0/finance/expense-requests`

Tạo yêu cầu chi phí mới.

#### Request body

```json
{
  "request_date": "2026-06-18",
  "content": "Mua xe máy giao hàng",
  "request_type": "PAYMENT",
  "amount": 35000000,
  "budget_id": "uuid",
  "fund_id": "uuid",
  "approver_uuid": "uuid",
  "note": "Ghi chú",
  "attachments": [],
  "metadata": {}
}
```

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `content` | ✅ | Nội dung yêu cầu |
| `request_type` | ✅ | `PAYMENT` \| `ADVANCE` \| `REIMBURSEMENT` |
| `amount` | ✅ | Số tiền yêu cầu (> 0) |
| `request_date` | ❌ | Ngày yêu cầu (default: hôm nay) |
| `approver_uuid` | ❌ | UUID người duyệt |
| `budget_id` | ❌ | Gắn với ngân sách |
| `fund_id` | ❌ | Quỹ dự kiến xuất tiền |

> `request_no` tự sinh: `PYC/YYYY-MM/XXXX` (VD: `PYC/2026-06/0001`)  
> `requester_uuid` tự lấy từ user đăng nhập  
> `status` tự động = `PENDING_APPROVAL`  
> `disbursed_amount` tự động = 0

#### Response

```json
{
  "data": {
    "id": "uuid",
    "request_no": "PYC/2026-06/0009",
    "request_type": "PAYMENT",
    "amount": "35000000",
    "disbursed_amount": "0",
    "status": "PENDING_APPROVAL",
    "created_at": "2026-06-18T08:00:00.000Z"
  },
  "message": "Tạo yêu cầu chi phí thành công",
  "message_en": "Expense request created successfully"
}
```

#### Lỗi có thể xảy ra

| HTTP | message |
|------|---------|
| 400 | `Nội dung là bắt buộc` |
| 400 | `Loại yêu cầu không hợp lệ` |
| 400 | `Số tiền phải lớn hơn 0` |

---

## 9. Duyệt yêu cầu chi phí

### `PATCH /api/v1.0/finance/expense-requests/:id/approve`

Duyệt yêu cầu chi phí — chuyển sang `PENDING_TREASURER`.

#### Request body

```json
{
  "note": "Đồng ý duyệt"
}
```

#### Điều kiện

- Request phải đang ở trạng thái `PENDING_APPROVAL`

#### Luồng xử lý

```
1. Kiểm tra request tồn tại
2. Kiểm tra status = PENDING_APPROVAL
3. UPDATE status → PENDING_TREASURER
4. UPDATE approved_at = now(), approver_uuid = current user
5. INSERT finance_request_approvals (action=APPROVED)
```

#### Response

```json
{
  "data": {
    "id": "uuid",
    "request_no": "PYC/2026-06/0009",
    "status": "PENDING_TREASURER",
    "approved_at": "2026-06-18T09:00:00.000Z",
    "approver_uuid": "uuid"
  },
  "message": "Duyệt yêu cầu thành công",
  "message_en": "Request approved successfully"
}
```

#### Lỗi có thể xảy ra

| HTTP | message |
|------|---------|
| 404 | `Không tìm thấy yêu cầu` |
| 400 | `Chỉ có thể duyệt yêu cầu đang ở trạng thái Chờ duyệt` |

---

## 10. Từ chối yêu cầu chi phí

### `PATCH /api/v1.0/finance/expense-requests/:id/reject`

Từ chối yêu cầu chi phí — chuyển sang `REJECTED`.

#### Request body

```json
{
  "note": "Không duyệt vì vượt ngân sách"
}
```

#### Điều kiện

- Request **không được** ở trạng thái `COMPLETED`, `REJECTED`, hoặc `CANCELLED`

#### Luồng xử lý

```
1. Kiểm tra request tồn tại
2. Kiểm tra status không phải COMPLETED / REJECTED / CANCELLED
3. UPDATE status → REJECTED
4. INSERT finance_request_approvals (action=REJECTED)
```

#### Response

```json
{
  "data": {
    "id": "uuid",
    "request_no": "PYC/2026-06/0009",
    "status": "REJECTED"
  },
  "message": "Từ chối yêu cầu thành công",
  "message_en": "Request rejected successfully"
}
```

#### Lỗi có thể xảy ra

| HTTP | message |
|------|---------|
| 404 | `Không tìm thấy yêu cầu` |
| 400 | `Không thể từ chối yêu cầu đã hoàn thành hoặc đã bị từ chối` |

---

## 11. Hoàn thành / xuất quỹ

### `PATCH /api/v1.0/finance/expense-requests/:id/complete`

Cấp tiền / xuất quỹ cho yêu cầu chi phí đã được duyệt.

#### Request body

```json
{
  "fund_id": "uuid",
  "amount": 35000000,
  "debit_account_id": "uuid",
  "credit_account_id": "uuid",
  "note": "Xuất quỹ cho yêu cầu xe máy"
}
```

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `fund_id` | ✅ | Quỹ xuất tiền |
| `amount` | ✅ | Số tiền cấp (> 0) |
| `debit_account_id` | ❌ | TK Nợ (để sinh ledger entry) |
| `credit_account_id` | ❌ | TK Có (để sinh ledger entry) |

#### Điều kiện

- Request phải đang ở trạng thái `PENDING_TREASURER`
- Quỹ phải tồn tại và `status = ACTIVE`
- `current_balance >= amount`

#### Luồng xử lý (trong transaction)

```
1. Kiểm tra request status = PENDING_TREASURER
2. Lock fund row (SELECT ... FOR UPDATE)
3. Kiểm tra quỹ ACTIVE và đủ tiền
4. Sinh voucher_no (PC-YYMMDD-XXXX)
5. INSERT finance_vouchers (type=PAYMENT, status=COMPLETED, request_id=id)
6. UPDATE finance_funds.current_balance -= amount
7. INSERT finance_fund_movements (amount_delta = -amount)
8. INSERT finance_ledger_entries (nếu có debit/credit account)
9. INSERT finance_budget_usages (nếu request có budget_id)
10. UPDATE finance_expense_requests.disbursed_amount += amount
    → nếu disbursed_amount >= amount → status=COMPLETED, completed_at=now()
```

#### Response

```json
{
  "data": {
    "id": "uuid",
    "request_no": "PYC/2026-06/0009",
    "status": "COMPLETED",
    "disbursed_amount": "35000000",
    "completed_at": "2026-06-18T10:30:00.000Z"
  },
  "message": "Xuất quỹ thành công",
  "message_en": "Expense request completed successfully"
}
```

#### Lỗi có thể xảy ra

| HTTP | message |
|------|---------|
| 404 | `Không tìm thấy yêu cầu` |
| 400 | `Chỉ xuất quỹ được khi yêu cầu ở trạng thái Chờ xuất quỹ` |
| 400 | `Quỹ không tồn tại` |
| 400 | `Quỹ không đang hoạt động` |
| 400 | `Số dư quỹ không đủ` |

---

## Enum tham chiếu

### Finance Fund Status
| Giá trị | Mô tả |
|---------|-------|
| `ACTIVE` | Đang hoạt động |
| `INACTIVE` | Không hoạt động |
| `LOCKED` | Bị khoá |

### Finance Voucher Type
| Giá trị | Mô tả |
|---------|-------|
| `RECEIPT` | Phiếu thu |
| `PAYMENT` | Phiếu chi |
| `TRANSFER` | Chuyển quỹ |
| `ADJUSTMENT` | Điều chỉnh |

### Finance Voucher Status
| Giá trị | Nhãn |
|---------|------|
| `DRAFT` | Nháp |
| `PENDING_APPROVAL` | Chờ duyệt |
| `APPROVED` | Đã duyệt |
| `COMPLETED` | Đã hoàn thành |
| `CANCELLED` | Đã huỷ |

### Finance Budget Status
| Giá trị | Nhãn |
|---------|------|
| `DRAFT` | Nháp |
| `ACTIVE` | Đang sử dụng |
| `EXPIRED` | Hết hạn |
| `CLOSED` | Đã đóng |

### Finance Request Type
| Giá trị | Mô tả |
|---------|-------|
| `PAYMENT` | Thanh toán |
| `ADVANCE` | Tạm ứng |
| `REIMBURSEMENT` | Hoàn ứng |

### Finance Request Status
| Giá trị | Nhãn |
|---------|------|
| `DRAFT` | Nháp |
| `PENDING_APPROVAL` | Chờ duyệt |
| `PENDING_TREASURER` | Chờ xuất quỹ |
| `COMPLETED` | Đã hoàn thành |
| `REJECTED` | Đã từ chối |
| `CANCELLED` | Đã huỷ |

---

## Quy tắc sinh mã tự động

| Loại | Format | Ví dụ |
|------|--------|-------|
| Phiếu thu | `PT-YYMMDD-XXXX` | `PT-260618-0001` |
| Phiếu chi | `PC-YYMMDD-XXXX` | `PC-260618-0001` |
| Yêu cầu chi phí | `PYC/YYYY-MM/XXXX` | `PYC/2026-06/0001` |

> Số thứ tự (`XXXX`) reset về 0001 mỗi ngày (với PT/PC) hoặc mỗi tháng (với PYC).

---

## Tài khoản kế toán gợi ý (cần seed)

| Mã | Tên |
|----|-----|
| `111` | Tiền mặt |
| `112` | Tiền gửi ngân hàng |
| `131` | Phải thu khách hàng |
| `156` | Hàng hóa |
| `331` | Phải trả nhà cung cấp |
| `511` | Doanh thu bán hàng và cung cấp dịch vụ |
| `642` | Chi phí quản lý doanh nghiệp |

```sql
INSERT INTO finance_chart_accounts (id, code, name, account_type, is_active)
VALUES
  (gen_random_uuid(), '111',  'Tiền mặt',                                    'ASSET',    true),
  (gen_random_uuid(), '112',  'Tiền gửi ngân hàng',                          'ASSET',    true),
  (gen_random_uuid(), '131',  'Phải thu khách hàng',                         'ASSET',    true),
  (gen_random_uuid(), '156',  'Hàng hóa',                                    'ASSET',    true),
  (gen_random_uuid(), '331',  'Phải trả nhà cung cấp',                       'LIABILITY',true),
  (gen_random_uuid(), '511',  'Doanh thu bán hàng và cung cấp dịch vụ',      'REVENUE',  true),
  (gen_random_uuid(), '642',  'Chi phí quản lý doanh nghiệp',                'EXPENSE',  true);
```
