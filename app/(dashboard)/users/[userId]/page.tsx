"use client";

import { ArrowLeft, Bell, Calendar, Copy, KeyRound, Lock, Mail, MoreHorizontal, Pencil, Phone, Send, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import { UserEditorForm } from "../components/forms/UserEditorForm";
import { UserActivityTab } from "./components/UserActivityTab";
import { UserChatTab } from "./components/UserChatTab";
import { UserDetailSection } from "./components/UserDetailSection";
import { UserWorkTab } from "./components/UserWorkTab";
import { UserTab, useUserDetailPage } from "./hooks/useUserDetailPage";
import { formatDateVN } from "@/lib/utils";

export default function UserDetailPage() {
    const {
        user,
        isLoading,
        activeTab,
        setActiveTab,
        tabs,
        isEditing,
        setIsEditing,
        activities,
        isLoadingActivities,
        workJobs,
        isLoadingWorkJobs,
        assignerNameById,
        handleUpdate,
        handleDelete,
        goToUsers,
        DeleteConfirmationDialog,
    } = useUserDetailPage();

    if (isLoading || !user) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
                    Đang tải chi tiết người dùng...
                </div>
            </div>
        );
    }

    const role = "Owner";

    return (
        <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={goToUsers} className="font-medium hover:text-primary-600">Người dùng</button>
                    <span>›</span>
                    <span className="font-semibold text-gray-700">Chi tiết người dùng</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={goToUsers} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                        <ArrowLeft className="h-4 w-4" />
                        Danh sách người dùng
                    </button>
                    <button onClick={() => setIsEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 text-sm font-semibold text-primary-600 transition hover:bg-primary-50">
                        <Pencil className="h-4 w-4" />
                        Chỉnh sửa
                    </button>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50">
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_510px]">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
                        <div className="flex items-center gap-6">
                            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-5xl font-bold text-white shadow-lg">
                                {user.avatar ? <img src={user.avatar} alt={user.full_name} className="h-full w-full object-cover" /> : getInitials(user.full_name)}
                                <span className="absolute bottom-4 right-4 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
                                    <Badge label={user.is_active && !user.is_delete ? "Hoạt động" : "Ngưng hoạt động"} className="bg-emerald-50 text-emerald-600" />
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-gray-600">
                                    <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</p>
                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{user.phone || "Chưa cập nhật"}</p>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Badge label={role} className="bg-violet-50 text-violet-600" />
                                    <Badge label="Quản trị hệ thống" className="bg-violet-50 text-violet-600" />
                                </div>
                                <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
                                    <span>Mã người dùng: {user.id}</span>
                                    <Copy className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 border-t border-gray-100 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                            <MetaRow icon={<Calendar className="h-5 w-5" />} label="Ngày tạo" value={formatDateVN(user.created_at).replace("\n", " ")} />
                            <MetaRow icon={<Calendar className="h-5 w-5" />} label="Cập nhật lần cuối" value={formatDateVN(user.updated_at).replace("\n", " ")} />
                            <MetaRow icon={<UserRound className="h-5 w-5" />} label="Lần đăng nhập gần nhất" value={formatDateVN(user.updated_at).replace("\n", " ")} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-bold text-gray-900">Thao tác nhanh</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAction icon={<KeyRound className="h-5 w-5" />} label="Đặt lại mật khẩu" className="bg-violet-50 text-violet-600" />
                        <QuickAction icon={<Lock className="h-5 w-5" />} label="Khóa tài khoản" className="bg-amber-50 text-amber-600" />
                        <QuickAction icon={<Users className="h-5 w-5" />} label="Phân quyền" className="bg-sky-50 text-sky-600" />
                        <QuickAction icon={<Send className="h-5 w-5" />} label="Gửi thông báo" className="bg-emerald-50 text-emerald-600" />
                    </div>
                    <button onClick={handleDelete} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Xóa người dùng
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4">
                    <nav className="flex gap-6 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as UserTab)}
                                className={`border-b-2 px-4 py-4 text-sm font-semibold transition ${activeTab === tab.id ? "border-primary-600 text-primary-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-4">
                    {activeTab === "detail" &&
                        (isEditing ? (
                            <UserEditorForm
                                mode="edit"
                                initialData={user}
                                submitText="Lưu thay đổi"
                                onSubmit={handleUpdate}
                                onCancel={() => setIsEditing(false)}
                            />
                        ) : (
                            <UserDetailSection user={user} role={role} />
                        ))}

                    {activeTab === "activity" && (
                        <UserActivityTab activities={activities} isLoadingActivities={isLoadingActivities} />
                    )}

                    {activeTab === "work" && (
                        <UserWorkTab
                            workJobs={workJobs}
                            isLoadingWorkJobs={isLoadingWorkJobs}
                            assignerNameById={assignerNameById}
                            userId={user.id}
                            userFullName={user.full_name}
                        />
                    )}

                    {activeTab === "chat" && <UserChatTab userId={user.id} userName={user.full_name} />}
                </div>
            </div>
            <DeleteConfirmationDialog />
        </div>
    );
}

function Badge({ label, className }: { label: string; className: string }) {
    return <span className={`inline-flex rounded-md px-3 py-1 text-sm font-semibold ${className}`}>{label}</span>;
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-primary-600">{icon}</span>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function QuickAction({ icon, label, className }: { icon: React.ReactNode; label: string; className: string }) {
    return (
        <button className={`flex h-16 items-center justify-center gap-3 rounded-lg px-4 text-sm font-semibold transition hover:brightness-95 ${className}`}>
            {icon}
            {label}
        </button>
    );
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "ND";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
