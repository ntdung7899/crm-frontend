// Types khớp tài liệu docs/FINANCE_API.md (các endpoint ĐÃ CÓ ở backend).
// Tách riêng khỏi services/finance/types.ts (model store cục bộ).

// ── Enums ────────────────────────────────────────────────────────────
export type FundStatus = "ACTIVE" | "INACTIVE" | "LOCKED";
export type VoucherType = "RECEIPT" | "PAYMENT" | "TRANSFER" | "ADJUSTMENT";
export type VoucherStatus =
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "COMPLETED"
    | "CANCELLED";
export type BudgetStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "CLOSED";
export type ExpenseRequestType = "PAYMENT" | "ADVANCE" | "REIMBURSEMENT";
export type ExpenseRequestStatus =
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "PENDING_TREASURER"
    | "COMPLETED"
    | "REJECTED"
    | "CANCELLED";

/** Số tiền có thể trả về dạng string ("500000000") hoặc number tuỳ field. */
export type Money = string | number;

// ── Envelope & phân trang ────────────────────────────────────────────
// Doc ghi `data`, nhưng các API khác của hệ thống trả `responseData`.
// Service unwrap cả hai để an toàn cho tới khi BE chốt.
export interface FinanceEnvelope<T> {
    data?: T;
    responseData?: T;
    message?: string;
    message_en?: string;
}

export interface FinanceListData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export interface FinancePaginationParams {
    page?: number;
    limit?: number;
    keyword?: string;
}

// ── Dashboard ────────────────────────────────────────────────────────
export interface FinanceDashboardParams {
    period?: "this_month" | "last_month" | "this_year";
    from_date?: string;
    to_date?: string;
}

export interface FinanceCashFlowPoint {
    date: string;
    income: number;
    expense: number;
    balance: number;
}

export interface FinanceDashboard {
    total_income: number;
    total_expense: number;
    total_fund: number;
    total_receivable: number;
    total_payable: number;
    cash_flow: FinanceCashFlowPoint[];
}

// ── Quỹ ──────────────────────────────────────────────────────────────
export interface FinanceFund {
    id: string;
    fund_code: string | null;
    fund_name: string;
    description: string | null;
    default_account_id: string | null;
    currency: string;
    opening_balance: Money;
    current_balance: Money;
    treasurer_uuid: string | null;
    approver_uuid: string | null;
    manager_uuid: string | null;
    created_by: string | null;
    status: FundStatus;
    metadata?: Record<string, unknown>;
    created_at: string | null;
    updated_at?: string | null;
}

export interface FinanceFundListParams extends FinancePaginationParams {
    status?: FundStatus;
}

export interface CreateFundPayload {
    fund_name: string;
    fund_code?: string;
    description?: string;
    default_account_id?: string;
    currency?: string;
    opening_balance?: number;
    treasurer_uuid?: string;
    approver_uuid?: string;
    manager_uuid?: string;
    status?: FundStatus;
    metadata?: Record<string, unknown>;
}

// ── Phiếu (thu/chi) ──────────────────────────────────────────────────
export interface FinanceVoucher {
    id: string;
    voucher_no: string;
    voucher_type: VoucherType;
    voucher_date: string;
    content: string;
    fund_id: string | null;
    fund_name?: string | null;
    amount: Money;
    status: VoucherStatus;
    status_label?: string;
    counterparty_id: string | null;
    request_id: string | null;
    debt_id: string | null;
    debit_account_id: string | null;
    credit_account_id: string | null;
    cashier_uuid: string | null;
    approver_uuid: string | null;
    paid_received_at: string | null;
    note: string | null;
    created_by: string | null;
    created_at: string | null;
}

export interface FinanceVoucherListParams extends FinancePaginationParams {
    voucher_type?: VoucherType;
    status?: VoucherStatus;
    fund_id?: string;
    from_date?: string;
    to_date?: string;
}

export interface VoucherDetail extends FinanceVoucher {
    fund?: { id: string; fund_name: string } | null;
    counterparty?: { id: string; name: string } | null;
    attachments?: FinanceAttachment[];
}

export interface UpdateVoucherPayload {
    voucher_date?: string;
    content?: string;
    amount?: number;
    counterparty_id?: string;
    debit_account_id?: string;
    credit_account_id?: string;
    note?: string;
    attachments?: FinanceAttachment[];
    metadata?: Record<string, unknown>;
}

export interface TransferVoucherPayload {
    from_fund_id: string;
    to_fund_id: string;
    amount: number;
    content: string;
    voucher_date?: string;
    note?: string;
}

export interface FinanceAttachment {
    url: string;
    name: string;
}

interface BaseVoucherPayload {
    content: string;
    fund_id: string;
    amount: number;
    voucher_date?: string;
    counterparty_id?: string;
    debt_id?: string;
    debit_account_id?: string;
    credit_account_id?: string;
    status?: "DRAFT" | "COMPLETED";
    note?: string;
    attachments?: FinanceAttachment[];
    metadata?: Record<string, unknown>;
}

export type CreateReceiptPayload = BaseVoucherPayload;

export interface CreatePaymentPayload extends BaseVoucherPayload {
    request_id?: string;
    budget_id?: string;
}

// ── Sổ hạch toán (ledger) ────────────────────────────────────────────
export interface FinanceLedgerEntry {
    id: string;
    entry_date: string;
    voucher_no: string | null;
    description: string | null;
    debit_account_code: string | null;
    debit_account_name: string | null;
    credit_account_code: string | null;
    credit_account_name: string | null;
    amount: number;
    created_at: string | null;
}

export interface FinanceLedgerParams extends FinancePaginationParams {
    from_date?: string;
    to_date?: string;
    debit_account_id?: string;
    credit_account_id?: string;
}

// ── Ngân sách ────────────────────────────────────────────────────────
export interface FinanceBudget {
    id: string;
    budget_code: string | null;
    budget_name: string;
    amount: Money;
    used_amount: number;
    remaining_amount: number;
    manager_uuid: string | null;
    start_date: string | null;
    end_date: string | null;
    status: BudgetStatus;
    status_label?: string;
    note: string | null;
    created_at: string | null;
}

export interface FinanceBudgetListParams extends FinancePaginationParams {
    status?: BudgetStatus;
}

export interface CreateBudgetPayload {
    budget_name: string;
    amount: number;
    budget_code?: string;
    start_date?: string;
    end_date?: string;
    manager_uuid?: string;
    status?: BudgetStatus;
    note?: string;
    metadata?: Record<string, unknown>;
}

// ── Yêu cầu chi phí ──────────────────────────────────────────────────
export interface ExpenseLineItem {
    id?: string;
    description: string;
    amount: number;
}

export interface ExpenseApproval {
    action: string;
    approver_uuid: string | null;
    note?: string | null;
    created_at: string | null;
}

export interface FinanceExpenseRequest {
    id: string;
    request_no: string;
    /** Bản FULL trả `title`; bản cũ là `content`. */
    title?: string;
    content?: string;
    requested_date?: string;
    request_date?: string;
    request_type?: ExpenseRequestType;
    reason?: string | null;
    requester_uuid: string | null;
    approver_uuid: string | null;
    budget_id: string | null;
    fund_id: string | null;
    amount: Money;
    disbursed_amount: Money;
    status: ExpenseRequestStatus;
    status_label?: string;
    line_items?: ExpenseLineItem[];
    approvals?: ExpenseApproval[];
    approved_at: string | null;
    completed_at: string | null;
    note: string | null;
    created_at: string | null;
}

export interface FinanceExpenseRequestListParams extends FinancePaginationParams {
    type?: ExpenseRequestType;
    status?: ExpenseRequestStatus;
    from_date?: string;
    to_date?: string;
}

export interface CreateExpenseRequestPayload {
    title: string;
    amount: number;
    requested_date?: string;
    fund_id?: string;
    budget_id?: string;
    reason?: string;
    line_items?: ExpenseLineItem[];
    attachments?: FinanceAttachment[];
    metadata?: Record<string, unknown>;
}

export type UpdateExpenseRequestPayload = Partial<CreateExpenseRequestPayload>;

export interface ApproveExpenseRequestPayload {
    note?: string;
}

export interface RejectExpenseRequestPayload {
    note?: string;
}

/** Bản FULL: complete KHÔNG cần amount (BE tự lấy từ request). */
export interface CompleteExpenseRequestPayload {
    fund_id: string;
    debit_account_id?: string;
    credit_account_id?: string;
    note?: string;
}

// ── Danh mục tài khoản kế toán ───────────────────────────────────────
export type ChartAccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export interface ChartAccount {
    id: string;
    code: string;
    name: string;
    account_type: ChartAccountType;
    parent_id?: string | null;
    is_active: boolean;
}

export interface ChartAccountListParams extends FinancePaginationParams {
    account_type?: ChartAccountType;
    is_active?: boolean;
}

// ── Đối tác ──────────────────────────────────────────────────────────
export type CounterpartyType = "CUSTOMER" | "SUPPLIER" | "EMPLOYEE" | "OTHER";

export interface Counterparty {
    id: string;
    name: string;
    counterparty_type: CounterpartyType;
    phone?: string | null;
    email?: string | null;
    tax_code?: string | null;
}

export interface CounterpartyListParams extends FinancePaginationParams {
    type?: CounterpartyType;
}

export interface CreateCounterpartyPayload {
    name: string;
    counterparty_type: CounterpartyType;
    phone?: string;
    email?: string;
    tax_code?: string;
    address?: string;
    note?: string;
}

// ── Công nợ ──────────────────────────────────────────────────────────
export type DebtType = "RECEIVABLE" | "PAYABLE";
export type DebtStatus = "OPEN" | "PARTIAL" | "SETTLED" | "OVERDUE";

export interface FinanceDebt {
    id: string;
    debt_type: DebtType;
    description?: string | null;
    amount: Money;
    remaining_amount: Money;
    due_date: string | null;
    status: DebtStatus;
    counterparty?: { id: string; name: string } | null;
    counterparty_id?: string | null;
    updated_at?: string | null;
}

export interface DebtListParams extends FinancePaginationParams {
    debt_type?: DebtType;
    status?: DebtStatus;
    counterparty_id?: string;
    from_date?: string;
    to_date?: string;
}

export interface CreateDebtPayload {
    debt_type: DebtType;
    description?: string;
    amount: number;
    due_date?: string;
    counterparty_id?: string;
    voucher_id?: string;
    note?: string;
}

export interface DebtAgingBucket {
    receivable: number;
    payable: number;
}

export interface DebtSummary {
    total_receivable: number;
    total_payable: number;
    receivable_count: number;
    payable_count: number;
    overdue_receivable: { count: number; total: number };
    overdue_payable: { count: number; total: number };
    aging: {
        "0_30": DebtAgingBucket;
        "31_60": DebtAgingBucket;
        "61_90": DebtAgingBucket;
        over_90: DebtAgingBucket;
        no_due_date: DebtAgingBucket;
    };
}

// ── Sao kê quỹ / sử dụng ngân sách ────────────────────────────────────
export interface FundMovement {
    id: string;
    date: string;
    voucher_no: string | null;
    type: VoucherType;
    amount_delta: Money;
    balance_after: Money;
    description: string | null;
}

export interface BudgetUsage {
    id: string;
    voucher_no?: string | null;
    amount: Money;
    created_at: string | null;
    description?: string | null;
}

// ── Báo cáo ──────────────────────────────────────────────────────────
export interface IncomeStatementRow {
    account_code: string;
    account_name: string;
    account_type: ChartAccountType;
    current_period: number;
    previous_period: number;
}

export interface IncomeStatementReport {
    period: { from_date: string; to_date: string };
    summary: { total_revenue: number; total_expense: number; profit: number };
    vs_previous: { revenue_change_pct: number; expense_change_pct: number; profit_change_pct: number };
    rows: IncomeStatementRow[];
}

export interface BalanceSheetRow {
    account_type: ChartAccountType;
    account_code: string;
    account_name: string;
    open_debit: number;
    open_credit: number;
    period_debit: number;
    period_credit: number;
    close_debit: number;
    close_credit: number;
}

export interface BalanceSheetReport {
    as_of_date: string;
    from_date: string;
    summary: { total_assets: number; total_liabilities: number; equity: number };
    rows: BalanceSheetRow[];
}

export interface CashFlowReport {
    period: { from_date: string; to_date: string };
    summary: { total_income: number; total_expense: number; net_cash_flow: number };
    by_type: { receipt: number; payment: number; transfer: number; adjustment: number };
    timeline: { period: string; income: number; expense: number; net: number }[];
}

export interface ReportParams {
    period?: "this_month" | "last_month" | "this_year";
    from_date?: string;
    to_date?: string;
}
