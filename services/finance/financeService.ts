import { apiClient } from "@/lib/api-client";
import type {
    ApproveExpenseRequestPayload,
    BalanceSheetReport,
    BudgetUsage,
    CashFlowReport,
    ChartAccount,
    ChartAccountListParams,
    CompleteExpenseRequestPayload,
    Counterparty,
    CounterpartyListParams,
    CreateBudgetPayload,
    CreateCounterpartyPayload,
    CreateDebtPayload,
    CreateExpenseRequestPayload,
    CreateFundPayload,
    CreatePaymentPayload,
    CreateReceiptPayload,
    DebtListParams,
    DebtSummary,
    FinanceBudget,
    FinanceBudgetListParams,
    FinanceDashboard,
    FinanceDashboardParams,
    FinanceDebt,
    FinanceEnvelope,
    FinanceExpenseRequest,
    FinanceExpenseRequestListParams,
    FinanceFund,
    FinanceFundListParams,
    FinanceLedgerEntry,
    FinanceLedgerParams,
    FinanceListData,
    FinanceVoucher,
    FinanceVoucherListParams,
    FundMovement,
    IncomeStatementReport,
    RejectExpenseRequestPayload,
    ReportParams,
    TransferVoucherPayload,
    UpdateExpenseRequestPayload,
    UpdateVoucherPayload,
    VoucherDetail,
} from "./apiTypes";

const BASE = "/api/v1.0/finance";

// Doc FULL dùng envelope `data`; hệ thống khác trả `responseData`. Unwrap cả hai.
function unwrap<T>(res: FinanceEnvelope<T>): T {
    const data = (res?.responseData ?? res?.data) as T | undefined;
    if (data === undefined || data === null) {
        throw new Error(res?.message || "Yêu cầu tài chính thất bại");
    }
    return data;
}

function cleanParams(params: object = {}): Record<string, string> {
    return Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            acc[key] = String(value);
        }
        return acc;
    }, {});
}

async function get<T>(path: string, params: object = {}): Promise<T> {
    return unwrap(await apiClient.get<FinanceEnvelope<T>>(`${BASE}${path}`, cleanParams(params)));
}
async function post<T>(path: string, body?: unknown): Promise<T> {
    return unwrap(await apiClient.post<FinanceEnvelope<T>>(`${BASE}${path}`, body));
}
async function put<T>(path: string, body?: unknown): Promise<T> {
    return unwrap(await apiClient.put<FinanceEnvelope<T>>(`${BASE}${path}`, body));
}
async function patch<T>(path: string, body?: unknown): Promise<T> {
    return unwrap(await apiClient.patch<FinanceEnvelope<T>>(`${BASE}${path}`, body));
}
async function del<T>(path: string): Promise<T> {
    return unwrap(await apiClient.delete<FinanceEnvelope<T>>(`${BASE}${path}`));
}

type ListData<T> = FinanceListData<T>;

export const financeService = {
    // 1. Dashboard
    getDashboard: (params: FinanceDashboardParams = {}) => get<FinanceDashboard>("/dashboard", params),

    // 2. Chart of accounts
    getChartAccounts: (params: ChartAccountListParams = {}) =>
        get<ListData<ChartAccount>>("/chart-accounts", params),
    createChartAccount: (body: Partial<ChartAccount> & { code: string; name: string; account_type: string }) =>
        post<ChartAccount>("/chart-accounts", body),

    // 3. Funds
    getFunds: (params: FinanceFundListParams = {}) => get<ListData<FinanceFund>>("/funds", params),
    getFund: (id: string) => get<FinanceFund>(`/funds/${id}`),
    createFund: (body: CreateFundPayload) => post<FinanceFund>("/funds", body),
    updateFund: (id: string, body: Partial<CreateFundPayload>) => put<FinanceFund>(`/funds/${id}`, body),
    updateFundStatus: (id: string, status: FinanceFund["status"]) =>
        patch<FinanceFund>(`/funds/${id}/status`, { status }),
    deleteFund: (id: string) => del<null>(`/funds/${id}`),
    getFundMovements: (id: string, params: { from_date?: string; to_date?: string; page?: number; limit?: number } = {}) =>
        get<ListData<FundMovement>>(`/funds/${id}/movements`, params),

    // 4. Vouchers
    getVouchers: (params: FinanceVoucherListParams = {}) => get<ListData<FinanceVoucher>>("/vouchers", params),
    getVoucher: (id: string) => get<VoucherDetail>(`/vouchers/${id}`),
    createReceipt: (body: CreateReceiptPayload) => post<FinanceVoucher>("/vouchers/receipts", body),
    createPayment: (body: CreatePaymentPayload) => post<FinanceVoucher>("/vouchers/payments", body),
    updateVoucher: (id: string, body: UpdateVoucherPayload) => put<FinanceVoucher>(`/vouchers/${id}`, body),
    cancelVoucher: (id: string, note?: string) => patch<FinanceVoucher>(`/vouchers/${id}/cancel`, { note }),
    createTransfer: (body: TransferVoucherPayload) =>
        post<{ out_voucher: FinanceVoucher; in_voucher: FinanceVoucher }>("/vouchers/transfers", body),

    // 5. Ledger
    getLedgerEntries: (params: FinanceLedgerParams = {}) => get<ListData<FinanceLedgerEntry>>("/ledger-entries", params),

    // 6. Debts
    getDebts: (params: DebtListParams = {}) => get<ListData<FinanceDebt>>("/debts", params),
    getDebt: (id: string) => get<FinanceDebt>(`/debts/${id}`),
    getDebtSummary: () => get<DebtSummary>("/debts/summary"),
    createDebt: (body: CreateDebtPayload) => post<FinanceDebt>("/debts", body),
    updateDebt: (id: string, body: Partial<CreateDebtPayload> & { status?: string }) =>
        put<FinanceDebt>(`/debts/${id}`, body),

    // 7. Budgets
    getBudgets: (params: FinanceBudgetListParams = {}) => get<ListData<FinanceBudget>>("/budgets", params),
    getBudget: (id: string) => get<FinanceBudget>(`/budgets/${id}`),
    createBudget: (body: CreateBudgetPayload) => post<FinanceBudget>("/budgets", body),
    updateBudget: (id: string, body: Partial<CreateBudgetPayload>) => put<FinanceBudget>(`/budgets/${id}`, body),
    closeBudget: (id: string) => patch<FinanceBudget>(`/budgets/${id}/close`),
    deleteBudget: (id: string) => del<null>(`/budgets/${id}`),
    getBudgetUsages: (id: string) => get<ListData<BudgetUsage>>(`/budgets/${id}/usages`),

    // 8. Expense requests
    getExpenseRequests: (params: FinanceExpenseRequestListParams = {}) =>
        get<ListData<FinanceExpenseRequest>>("/expense-requests", params),
    getExpenseRequest: (id: string) => get<FinanceExpenseRequest>(`/expense-requests/${id}`),
    createExpenseRequest: (body: CreateExpenseRequestPayload) =>
        post<FinanceExpenseRequest>("/expense-requests", body),
    updateExpenseRequest: (id: string, body: UpdateExpenseRequestPayload) =>
        put<FinanceExpenseRequest>(`/expense-requests/${id}`, body),
    submitExpenseRequest: (id: string) => patch<FinanceExpenseRequest>(`/expense-requests/${id}/submit`),
    approveExpenseRequest: (id: string, body: ApproveExpenseRequestPayload = {}) =>
        patch<FinanceExpenseRequest>(`/expense-requests/${id}/approve`, body),
    rejectExpenseRequest: (id: string, body: RejectExpenseRequestPayload = {}) =>
        patch<FinanceExpenseRequest>(`/expense-requests/${id}/reject`, body),
    completeExpenseRequest: (id: string, body: CompleteExpenseRequestPayload) =>
        patch<FinanceExpenseRequest>(`/expense-requests/${id}/complete`, body),
    cancelExpenseRequest: (id: string, note?: string) =>
        patch<FinanceExpenseRequest>(`/expense-requests/${id}/cancel`, { note }),

    // 9. Counterparties
    getCounterparties: (params: CounterpartyListParams = {}) =>
        get<ListData<Counterparty>>("/counterparties", params),
    createCounterparty: (body: CreateCounterpartyPayload) => post<Counterparty>("/counterparties", body),

    // 10. Reports
    getIncomeStatement: (params: ReportParams = {}) =>
        get<IncomeStatementReport>("/reports/income-statement", params),
    getBalanceSheet: (params: { as_of_date?: string; from_date?: string } = {}) =>
        get<BalanceSheetReport>("/reports/balance-sheet", params),
    getCashFlow: (params: ReportParams & { group_by?: "day" | "month" } = {}) =>
        get<CashFlowReport>("/reports/cash-flow", params),
};
