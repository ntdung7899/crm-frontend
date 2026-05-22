import { ReactNode } from "react";
import { Info, Mail, Shield, UserRound } from "lucide-react";
import { formatDateVN, formatDateVNDateOnly } from "@/lib/utils";
import { UserProfile } from "@/types/user";

type UserDetailSectionProps = {
    user: UserProfile;
    role?: string;
};

export function UserDetailSection({ user, role = "Owner" }: UserDetailSectionProps) {
    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.1fr]">
            <div className="space-y-4">
                <InfoCard icon={<Mail className="h-5 w-5" />} title="Thông tin liên hệ">
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Số điện thoại" value={user.phone || "Chưa cập nhật"} />
                    <InfoRow label="Ngôn ngữ" value="Tiếng Việt" />
                    <InfoRow label="Địa chỉ" value="Chưa cập nhật" />
                </InfoCard>

                <InfoCard icon={<Shield className="h-5 w-5" />} title="Thiết lập bảo mật">
                    <InfoRow label="Phương thức đăng nhập" value="Email & Mật khẩu" />
                    <InfoRow label="Đổi mật khẩu lần cuối" value={formatDateVN(user.updated_at).replace("\n", " ")} />
                    <InfoRow label="Trạng thái 2FA" value="Chưa bật" subtle />
                </InfoCard>
            </div>

            <InfoCard icon={<UserRound className="h-5 w-5" />} title="Thông tin tài khoản">
                <InfoRow label="Vai trò" value={role} badge="purple" />
                <InfoRow label="Trạng thái" value={user.is_active && !user.is_delete ? "Hoạt động" : "Ngưng hoạt động"} badge="success" />
                <InfoRow label="Lần đăng nhập gần nhất" value={formatDateVN(user.updated_at).replace("\n", " ")} />
                <InfoRow label="Ngày tạo" value={formatDateVN(user.created_at).replace("\n", " ")} />
                <InfoRow label="Cập nhật lần cuối" value={formatDateVN(user.updated_at).replace("\n", " ")} />
                <InfoRow label="Người tạo" value="ADMIN" />
                <InfoRow label="Xác thực email" value="Đã xác thực" badge="success" />
                <InfoRow label="Xác thực số điện thoại" value="Đã xác thực" badge="success" />
            </InfoCard>

            <InfoCard icon={<Info className="h-5 w-5" />} title="Thông tin khác">
                <InfoRow label="Ngày sinh" value={user.birthday ? formatDateVNDateOnly(user.birthday) : "Chưa cập nhật"} />
                <InfoRow label="Giới tính" value="Nam" />
                <InfoRow label="Đơn vị / Phòng ban" value="Chưa cập nhật" muted />
                <InfoRow label="Chức vụ" value="Chưa cập nhật" muted />
                <InfoRow label="Ghi chú" value="Chưa cập nhật" muted />
            </InfoCard>
        </div>
    );
}

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <span className="text-primary-600">{icon}</span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">{title}</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {children}
            </div>
        </section>
    );
}

function InfoRow({ label, value, badge, muted, subtle }: { label: string; value: string; badge?: "purple" | "success"; muted?: boolean; subtle?: boolean }) {
    return (
        <div className="grid grid-cols-[1fr_1fr] gap-4 py-3 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`font-semibold ${muted ? "text-gray-500" : "text-gray-900"}`}>
                {badge ? <Badge value={value} variant={badge} /> : subtle ? <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{value}</span> : value}
            </span>
        </div>
    );
}

function Badge({ value, variant }: { value: string; variant: "purple" | "success" }) {
    const className = variant === "purple" ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-600";
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${className}`}>
            {variant === "success" && <span className="h-2 w-2 rounded-full bg-current" />}
            {value}
        </span>
    );
}
