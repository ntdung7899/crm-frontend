// Map 2 chiều giữa model API (apiTypes.ts) và model FE (types.ts).
// Giữ field UI không có trong API vào `metadata` để không mất dữ liệu hiển thị.

import type {
    BudgetStatus,
    FinanceDebt,
    CreateBudgetPayload,
    CreateExpenseRequestPayload,
    CreateFundPayload,
    CreatePaymentPayload,
    CreateReceiptPayload,
    ExpenseRequestStatus,
    ExpenseRequestType,
    FinanceBudget,
    FinanceExpenseRequest,
    FinanceFund,
    FinanceLedgerEntry,
    FinanceVoucher,
    FundStatus,
    Money,
} from "./apiTypes";
import type {
    BoToan,
    KhachHangCongNo,
    LoaiBoToan,
    LoaiYCCP,
    NganSach,
    PhieuChi,
    PhieuThu,
    Quy,
    TrangThaiNganSach,
    TrangThaiQuy,
    TrangThaiYCCP,
    YeuCauChiPhi,
} from "./types";

export function parseMoney(value: Money | null | undefined): number {
    if (value === null || value === undefined) return 0;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
}

function meta(record: Record<string, unknown> | undefined, key: string): string | undefined {
    const v = record?.[key];
    return typeof v === "string" ? v : undefined;
}

// ── Ngân sách ↔ Budget ───────────────────────────────────────────────
const BUDGET_STATUS_TO_FE: Record<BudgetStatus, TrangThaiNganSach> = {
    ACTIVE: "active",
    EXPIRED: "expired",
    DRAFT: "inactive",
    CLOSED: "inactive",
};
const FE_TO_BUDGET_STATUS: Record<TrangThaiNganSach, BudgetStatus> = {
    active: "ACTIVE",
    expired: "EXPIRED",
    inactive: "CLOSED",
};

export function mapBudgetToNganSach(b: FinanceBudget): NganSach {
    return {
        id: b.id,
        ten: b.budget_name,
        soTien: parseMoney(b.amount),
        ngayBatDau: b.start_date ?? "",
        ngayKetThuc: b.end_date ?? "",
        nguoiQuanLy: b.manager_uuid ?? "",
        nguoiThamGia: [],
        moTa: b.note ?? undefined,
        trangThai: BUDGET_STATUS_TO_FE[b.status] ?? "inactive",
        daSuDung: parseMoney(b.used_amount),
        createdAt: b.created_at ?? new Date().toISOString(),
        createdBy: "",
    };
}

export interface NganSachFormInput {
    ten: string;
    soTien: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    nguoiQuanLy: string;
    trangThai: TrangThaiNganSach;
    moTa?: string;
}

export function mapNganSachFormToCreateBudget(form: NganSachFormInput): CreateBudgetPayload {
    return {
        budget_name: form.ten,
        amount: form.soTien,
        start_date: form.ngayBatDau || undefined,
        end_date: form.ngayKetThuc || undefined,
        manager_uuid: form.nguoiQuanLy || undefined,
        status: FE_TO_BUDGET_STATUS[form.trangThai],
        note: form.moTa || undefined,
    };
}

// ── Quỹ ↔ Fund ───────────────────────────────────────────────────────
const FUND_STATUS_TO_FE: Record<FundStatus, TrangThaiQuy> = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    LOCKED: "inactive",
};

export function mapFundToQuy(f: FinanceFund): Quy {
    const m = f.metadata;
    return {
        id: f.id,
        ten: f.fund_name,
        maQuy: f.fund_code ?? undefined,
        loai: (meta(m, "loai") as Quy["loai"]) ?? "tien_mat",
        soDu: parseMoney(f.current_balance),
        duDauKy: parseMoney(f.opening_balance),
        nguoiQuanLy: f.manager_uuid ?? "",
        thuQuy: f.treasurer_uuid ?? undefined,
        nguoiDuyet: f.approver_uuid ?? undefined,
        taiKhoanQuy: f.default_account_id ?? undefined,
        taiKhoanThue: meta(m, "taiKhoanThue"),
        nguoiTao: f.created_by ?? undefined,
        moTa: f.description ?? undefined,
        trangThai: FUND_STATUS_TO_FE[f.status] ?? "active",
        createdAt: f.created_at ?? new Date().toISOString(),
    };
}

export interface QuyFormInput {
    ten: string;
    maQuy?: string;
    loai: Quy["loai"];
    duDauKy?: number;
    nguoiQuanLy: string;
    thuQuy?: string;
    nguoiDuyet?: string;
    taiKhoanQuy?: string;
    taiKhoanThue?: string;
    moTa?: string;
    trangThai: TrangThaiQuy;
}

export function mapQuyFormToCreateFund(form: QuyFormInput): CreateFundPayload {
    return {
        fund_name: form.ten,
        fund_code: form.maQuy || undefined,
        description: form.moTa || undefined,
        default_account_id: form.taiKhoanQuy || undefined,
        opening_balance: form.duDauKy ?? 0,
        treasurer_uuid: form.thuQuy || undefined,
        approver_uuid: form.nguoiDuyet || undefined,
        manager_uuid: form.nguoiQuanLy || undefined,
        status: form.trangThai === "active" ? "ACTIVE" : "INACTIVE",
        metadata: {
            loai: form.loai,
            ...(form.taiKhoanThue ? { taiKhoanThue: form.taiKhoanThue } : {}),
        },
    };
}

// ── Phiếu thu / chi ↔ Voucher ────────────────────────────────────────
export function mapVoucherToPhieuThu(v: FinanceVoucher): PhieuThu {
    return {
        id: v.id,
        soChungTu: v.voucher_no,
        noiDung: v.content,
        ngayYeuCau: v.voucher_date,
        ngayChungTu: v.voucher_date,
        quyId: v.fund_id ?? "",
        hinhThucThanhToan: "tien_mat",
        moTa: v.note ?? undefined,
        nguon: "tu_nhap",
        khachHangId: v.counterparty_id ?? undefined,
        soTien: parseMoney(v.amount),
        hachToan:
            v.debit_account_id && v.credit_account_id
                ? { taiKhoanNo: v.debit_account_id, taiKhoanCo: v.credit_account_id, soTien: parseMoney(v.amount) }
                : undefined,
        nguoiTao: v.created_by ?? "",
        createdAt: v.created_at ?? new Date().toISOString(),
    };
}

export function mapVoucherToPhieuChi(v: FinanceVoucher): PhieuChi {
    return {
        id: v.id,
        soChungTu: v.voucher_no,
        noiDung: v.content,
        ngayYeuCau: v.voucher_date,
        ngayChungTu: v.voucher_date,
        quyId: v.fund_id ?? "",
        hinhThucThanhToan: "tien_mat",
        moTa: v.note ?? undefined,
        nguon: v.request_id ? "yccp" : "tu_nhap",
        yccpId: v.request_id ?? undefined,
        doiTuongId: v.counterparty_id ?? undefined,
        soTien: parseMoney(v.amount),
        hachToan:
            v.debit_account_id && v.credit_account_id
                ? { taiKhoanNo: v.debit_account_id, taiKhoanCo: v.credit_account_id, soTien: parseMoney(v.amount) }
                : undefined,
        nguoiTao: v.created_by ?? "",
        createdAt: v.created_at ?? new Date().toISOString(),
    };
}

export interface PhieuFormInput {
    noiDung: string;
    quyId: string;
    soTien: number;
    ngayChungTu?: string;
    moTa?: string;
    khachHangId?: string;
    doiTuongId?: string;
    yccpId?: string;
    taiKhoanNo?: string;
    taiKhoanCo?: string;
}

export function mapFormToCreateReceipt(form: PhieuFormInput): CreateReceiptPayload {
    return {
        content: form.noiDung,
        fund_id: form.quyId,
        amount: form.soTien,
        voucher_date: form.ngayChungTu || undefined,
        counterparty_id: form.khachHangId || undefined,
        debit_account_id: form.taiKhoanNo || undefined,
        credit_account_id: form.taiKhoanCo || undefined,
        status: "COMPLETED",
        note: form.moTa || undefined,
    };
}

export function mapFormToCreatePayment(form: PhieuFormInput): CreatePaymentPayload {
    return {
        content: form.noiDung,
        fund_id: form.quyId,
        amount: form.soTien,
        voucher_date: form.ngayChungTu || undefined,
        counterparty_id: form.doiTuongId || undefined,
        request_id: form.yccpId || undefined,
        debit_account_id: form.taiKhoanNo || undefined,
        credit_account_id: form.taiKhoanCo || undefined,
        status: "COMPLETED",
        note: form.moTa || undefined,
    };
}

// ── Yêu cầu chi phí ↔ Expense request ────────────────────────────────
const REQ_STATUS_TO_FE: Record<ExpenseRequestStatus, TrangThaiYCCP> = {
    DRAFT: "nhap",
    PENDING_APPROVAL: "cho_xac_nhan",
    PENDING_TREASURER: "cho_xuat_quy",
    COMPLETED: "hoan_thanh",
    REJECTED: "tu_choi",
    CANCELLED: "huy",
};
export const FE_TO_REQ_STATUS: Partial<Record<TrangThaiYCCP, ExpenseRequestStatus>> = {
    nhap: "DRAFT",
    cho_xac_nhan: "PENDING_APPROVAL",
    cho_xuat_quy: "PENDING_TREASURER",
    hoan_thanh: "COMPLETED",
    tu_choi: "REJECTED",
    huy: "CANCELLED",
};
const REQ_TYPE_TO_FE: Record<ExpenseRequestType, LoaiYCCP> = {
    PAYMENT: "thanh_toan",
    ADVANCE: "tam_ung",
    REIMBURSEMENT: "hoan_ung",
};
export const FE_TO_REQ_TYPE: Record<LoaiYCCP, ExpenseRequestType> = {
    thanh_toan: "PAYMENT",
    tam_ung: "ADVANCE",
    hoan_ung: "REIMBURSEMENT",
};

export function mapExpenseRequestToYCCP(r: FinanceExpenseRequest): YeuCauChiPhi {
    const soTien = parseMoney(r.amount);
    const noiDung = r.title ?? r.content ?? "";
    const lineItems = (r.line_items ?? []).map((li, i) => ({
        id: li.id ?? `${r.id}-${i}`,
        noiDung: li.description,
        soTien: parseMoney(li.amount),
    }));
    return {
        id: r.id,
        maYeuCau: r.request_no,
        loai: r.request_type ? REQ_TYPE_TO_FE[r.request_type] ?? "thanh_toan" : "thanh_toan",
        noiDung,
        lyDo: r.reason ?? r.note ?? "",
        nguoiYeuCauId: r.requester_uuid ?? "",
        nguoiPheDuyetId: r.approver_uuid ?? "",
        soTien,
        daCap: parseMoney(r.disbursed_amount),
        ngayYeuCau: r.requested_date ?? r.request_date ?? "",
        danhSachNoiDung: lineItems.length > 0 ? lineItems : [{ id: r.id, noiDung, soTien }],
        trangThai: REQ_STATUS_TO_FE[r.status] ?? "nhap",
        lichSu: (r.approvals ?? []).map((a) => ({
            thoiGian: a.created_at ?? "",
            nguoi: a.approver_uuid ?? "",
            hanhDong: a.action,
            ghiChu: a.note ?? undefined,
        })),
        createdAt: r.created_at ?? new Date().toISOString(),
    };
}

export interface YccpFormInput {
    loai: LoaiYCCP;
    noiDung: string;
    soTien: number;
    ngayYeuCau?: string;
    quyId?: string;
    nganSachId?: string;
    lyDo?: string;
    danhSachNoiDung?: { noiDung: string; soTien: number }[];
}

export function mapYccpFormToCreateRequest(form: YccpFormInput): CreateExpenseRequestPayload {
    return {
        title: form.noiDung,
        amount: form.soTien,
        requested_date: form.ngayYeuCau || undefined,
        fund_id: form.quyId || undefined,
        budget_id: form.nganSachId || undefined,
        reason: form.lyDo || undefined,
        line_items: form.danhSachNoiDung?.map((d) => ({ description: d.noiDung, amount: d.soTien })),
        // loại YCCP chưa có cột riêng ở BE → lưu tạm vào metadata
        metadata: { loai: form.loai },
    };
}

// ── Công nợ: gộp các dòng debt theo đối tác → KhachHangCongNo ─────────
export function mapDebtsToCongNo(debts: FinanceDebt[]): KhachHangCongNo[] {
    const byParty = new Map<string, KhachHangCongNo>();
    for (const d of debts) {
        const partyId = d.counterparty?.id ?? d.counterparty_id ?? d.id;
        const remaining = parseMoney(d.remaining_amount);
        const existing =
            byParty.get(partyId) ??
            ({
                id: partyId,
                ten: d.counterparty?.name ?? d.description ?? "Đối tác",
                phaiThu: 0,
                phaiTra: 0,
                ngayCapNhat: d.updated_at ?? undefined,
            } as KhachHangCongNo);
        if (d.debt_type === "RECEIVABLE") existing.phaiThu += remaining;
        else existing.phaiTra += remaining;
        byParty.set(partyId, existing);
    }
    return Array.from(byParty.values());
}

// ── Sổ cái ↔ Ledger entry ────────────────────────────────────────────
export function mapLedgerEntryToBoToan(e: FinanceLedgerEntry): BoToan {
    const loai: LoaiBoToan = e.voucher_no?.startsWith("PT")
        ? "phieu_thu"
        : e.voucher_no?.startsWith("PC")
            ? "phieu_chi"
            : "dieu_chinh";
    return {
        id: e.id,
        ngayGhiSo: e.entry_date,
        ngayChungTu: e.entry_date,
        soChungTu: e.voucher_no ?? "",
        loai,
        dienGiai: e.description ?? "",
        taiKhoanNo: e.debit_account_code ?? "",
        taiKhoanCo: e.credit_account_code ?? "",
        soTien: parseMoney(e.amount),
    };
}
