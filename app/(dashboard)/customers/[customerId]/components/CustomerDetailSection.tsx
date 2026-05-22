import { ReactNode } from "react";
import { BriefcaseBusiness, Calendar, Clock, FileText, MessageSquare, Pencil, ShieldCheck, User, UserRound, Users } from "lucide-react";
import { formatDateVN, formatDateVNDateOnly } from "@/lib/utils";
import { Customer } from "@/types/customer";

type CustomerDetailSectionProps = {
    customer: Customer;
    onEdit: () => void;
};

export function CustomerDetailSection({ customer, onEdit }: CustomerDetailSectionProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <InfoCard icon={<FileText className="h-5 w-5" />} title="Thông tin liên hệ" onEdit={onEdit}>
                    <TwoColumnInfo
                        left={[
                            ["Số điện thoại", customer.phone || customer.mobilePhone || "Chưa cập nhật"],
                            ["Địa chỉ", customer.address || "Chưa cập nhật"],
                            ["Website", customer.website || "Chưa cập nhật"],
                        ]}
                        right={[
                            ["Email", customer.email || "Chưa cập nhật"],
                            ["Leader (Quản lý phụ trách)", customer.leader_assignee || "Chưa phân công"],
                            ["Worker (Nhân viên chăm sóc)", customer.worker_assignee || "Chưa phân công"],
                        ]}
                    />
                </InfoCard>

                <InfoCard icon={<UserRound className="h-5 w-5" />} title="Phân công & chăm sóc" onEdit={onEdit}>
                    <TwoColumnInfo
                        left={[
                            ["Leader (Quản lý phụ trách)", customer.leader_assignee || "Chưa phân công"],
                            ["Worker (Nhân viên chăm sóc)", customer.worker_assignee || "Chưa phân công"],
                        ]}
                        right={[
                            ["Trạng thái", customer.is_active === false ? "Ngưng hoạt động" : "Khách hàng", "success"],
                            ["Nhóm khách hàng", customer.groups?.[0] || "Chưa nhóm", "purple"],
                            ["Nguồn khách hàng", customer.customerSource || customer.source || "Zalo OA", "blue"],
                        ]}
                    />
                </InfoCard>

                <InfoCard icon={<User className="h-5 w-5" />} title="Thông tin cá nhân" onEdit={onEdit}>
                    <TwoColumnInfo
                        left={[
                            ["Giới tính", customer.gender === "Male" ? "Nam" : customer.gender === "Female" ? "Nữ" : "Khác"],
                            ["Ngày sinh", customer.day_of_birth ? formatDateVNDateOnly(customer.day_of_birth) : "Chưa cập nhật"],
                        ]}
                        right={[["Nghề nghiệp", customer.major || "Chưa cập nhật"]]}
                    />
                </InfoCard>

                <InfoCard icon={<BriefcaseBusiness className="h-5 w-5" />} title="Thông tin doanh nghiệp" onEdit={onEdit}>
                    <TwoColumnInfo
                        left={[
                            ["Tên công ty", customer.company_name || "Chưa cập nhật"],
                            ["Mã số thuế", customer.tax_code || "Chưa cập nhật"],
                        ]}
                        right={[
                            ["Ngày thành lập", customer.company_establish_date ? formatDateVNDateOnly(customer.company_establish_date) : "Chưa cập nhật"],
                            ["Quy mô", "Chưa cập nhật"],
                        ]}
                    />
                </InfoCard>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2 text-primary-600">
                    <Clock className="h-5 w-5" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">Mốc thời gian</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <TimelineItem icon={<Calendar className="h-5 w-5" />} label="Ngày tạo" value={formatDateVN(customer.createdDate).replace("\n", " ")} className="bg-violet-50 text-violet-600" />
                    <TimelineItem icon={<Clock className="h-5 w-5" />} label="Cập nhật gần nhất" value={customer.lastContactDate ? formatDateVN(customer.lastContactDate).replace("\n", " ") : "Chưa có dữ liệu"} className="bg-sky-50 text-sky-600" />
                    <TimelineItem icon={<MessageSquare className="h-5 w-5" />} label="Tương tác gần nhất" value="Chưa có dữ liệu" className="bg-emerald-50 text-emerald-600" />
                    <TimelineItem icon={<ShieldCheck className="h-5 w-5" />} label="Chăm sóc gần nhất" value="Chưa có dữ liệu" className="bg-amber-50 text-amber-600" />
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon, title, onEdit, children }: { icon: ReactNode; title: string; onEdit: () => void; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="text-primary-600">{icon}</span>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">{title}</h3>
                </div>
                <button onClick={onEdit} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                    <Pencil className="h-4 w-4" />
                    Chỉnh sửa
                </button>
            </div>
            {children}
        </section>
    );
}

function TwoColumnInfo({ left, right }: { left: InfoTuple[]; right: InfoTuple[] }) {
    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-4 md:border-r md:border-gray-100 md:pr-6">
                {left.map(([label, value, variant]) => <InfoItem key={label} label={label} value={value} variant={variant} />)}
            </div>
            <div className="space-y-4">
                {right.map(([label, value, variant]) => <InfoItem key={label} label={label} value={value} variant={variant} />)}
            </div>
        </div>
    );
}

type InfoVariant = "success" | "purple" | "blue";
type InfoTuple = [string, string] | [string, string, InfoVariant];

function InfoItem({ label, value, variant }: { label: string; value: string; variant?: InfoVariant }) {
    return (
        <div>
            <p className="mb-1 text-sm text-gray-500">{label}</p>
            {variant ? <Badge value={value} variant={variant} /> : <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>}
        </div>
    );
}

function Badge({ value, variant }: { value: string; variant: InfoVariant }) {
    const classes = {
        success: "bg-emerald-50 text-emerald-600",
        purple: "bg-violet-50 text-violet-600",
        blue: "bg-sky-50 text-sky-600",
    }[variant];

    return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${classes}`}>{value}</span>;
}

function TimelineItem({ icon, label, value, className }: { icon: ReactNode; label: string; value: string; className: string }) {
    return (
        <div className="flex items-center gap-4">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}>{icon}</span>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
