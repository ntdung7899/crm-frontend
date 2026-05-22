"use client";

import { ArrowLeft, CalendarCheck, Clock, Copy, FileText, MessageCircle, MoreHorizontal, Pencil, Phone, Trash2, UserRound, Users } from "lucide-react";
import { CustomerEditorForm } from "../components/forms/CustomerEditorForm";
import { CustomerChatTab } from "./components/CustomerChatTab";
import { CustomerDetailSection } from "./components/CustomerDetailSection";
import { CustomerMediaTab } from "./components/CustomerMediaTab";
import { CustomerWorkTab } from "./components/CustomerWorkTab";
import { CustomerTab, useCustomerDetailPage } from "./hooks/useCustomerDetailPage";
import { formatDateVN } from "@/lib/utils";

export default function CustomerDetailPage() {
    const {
        customer,
        isLoading,
        activeTab,
        setActiveTab,
        tabs,
        isEditing,
        setIsEditing,
        conversation,
        workJobs,
        isLoadingWorkJobs,
        assignerNameById,
        handleUpdate,
        handleDelete,
        goToCustomers,
        DeleteConfirmationDialog,
    } = useCustomerDetailPage();

    if (isLoading || !customer) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
                    Đang tải chi tiết khách hàng...
                </div>
            </div>
        );
    }

    const source = customer.customerSource || customer.source || "Zalo OA";
    const primaryGroup = customer.groups?.[0] || "Chưa nhóm";
    const assignee = customer.assignee?.trim() || "Chưa phân công";
    const interactionCount = conversation?.messages.length ?? 0;

    return (
        <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={goToCustomers} className="font-medium hover:text-primary-600">Quản lý khách hàng</button>
                    <span>›</span>
                    <span className="font-semibold text-gray-700">Chi tiết khách hàng</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={goToCustomers} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                        <ArrowLeft className="h-4 w-4" />
                        Danh sách khách hàng
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

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_470px]">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-6">
                            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 text-5xl font-bold text-white shadow-lg">
                                {getInitials(customer.customerName)}
                                <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{customer.customerName}</h1>
                                <div className="mt-3 flex items-center gap-2 text-lg font-medium text-gray-700">
                                    <Phone className="h-5 w-5 text-primary-600" />
                                    {customer.phone || customer.mobilePhone || "Chưa cập nhật"}
                                </div>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Badge className="bg-emerald-50 text-emerald-600" label={customer.is_active === false ? "Ngưng hoạt động" : "Hoạt động"} />
                                    <Badge className="bg-violet-50 text-violet-600" label={customer.type === "company" ? "Doanh nghiệp" : "Cá nhân"} />
                                    <Badge className="bg-violet-50 text-violet-600" label={primaryGroup} />
                                    <Badge className="bg-sky-50 text-sky-600" label={source} />
                                </div>
                            </div>
                        </div>
                        <div className="grid min-w-[260px] gap-5 text-sm">
                            <div>
                                <p className="text-gray-500">Mã khách hàng</p>
                                <div className="mt-1 flex items-center gap-2 font-semibold text-gray-900">
                                    <span>{shortId(customer.id)}</span>
                                    <Copy className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500">Ngày tạo</p>
                                <p className="mt-1 font-semibold text-gray-900 whitespace-pre-line">{formatDateVN(customer.createdDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-bold text-gray-900">Thao tác nhanh</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <QuickAction icon={<Phone className="h-6 w-6" />} label="Gọi điện" className="bg-emerald-50 text-emerald-600" />
                        <QuickAction icon={<MessageCircle className="h-6 w-6" />} label="Gửi Zalo" className="bg-sky-50 text-sky-600" />
                        <QuickAction icon={<CalendarCheck className="h-6 w-6" />} label="Tạo công việc" className="bg-violet-50 text-violet-600" />
                        <QuickAction icon={<FileText className="h-6 w-6" />} label="Thêm ghi chú" className="bg-amber-50 text-amber-600" />
                    </div>
                    <button onClick={handleDelete} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Xóa khách hàng
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard icon={<Users className="h-6 w-6" />} label="Tổng tương tác" value={interactionCount.toLocaleString("vi-VN")} note="Tin nhắn, cuộc gọi" className="bg-violet-50 text-violet-600" />
                <SummaryCard icon={<Clock className="h-6 w-6" />} label="Lần chăm sóc gần nhất" value="-" note="Chưa có dữ liệu" className="bg-emerald-50 text-emerald-600" />
                <SummaryCard icon={<UserRound className="h-6 w-6" />} label="Người phụ trách" value={assignee} note="Leader / Worker" className="bg-amber-50 text-amber-600" />
                <SummaryCard icon={<FileText className="h-6 w-6" />} label="Nguồn khách hàng" value={source} note="Nguồn tạo khách hàng" className="bg-sky-50 text-sky-600" />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4">
                    <nav className="flex gap-6 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as CustomerTab)}
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
                            <CustomerEditorForm
                                initialData={customer}
                                customerId={customer.id}
                                submitText="Lưu thay đổi"
                                onSubmit={handleUpdate}
                                onCancel={() => setIsEditing(false)}
                            />
                        ) : (
                            <CustomerDetailSection customer={customer} onEdit={() => setIsEditing(true)} />
                        ))}

                    {activeTab === "chat" && <CustomerChatTab conversation={conversation} />}

                    {activeTab === "work" && (
                        <CustomerWorkTab
                            workJobs={workJobs}
                            isLoadingWorkJobs={isLoadingWorkJobs}
                            assignerNameById={assignerNameById}
                        />
                    )}

                    {activeTab === "media" && <CustomerMediaTab customerId={customer.id} />}
                </div>
            </div>
            <DeleteConfirmationDialog />
        </div>
    );
}

function Badge({ label, className }: { label: string; className: string }) {
    return <span className={`inline-flex rounded-md px-3 py-1 text-sm font-semibold ${className}`}>{label}</span>;
}

function QuickAction({ icon, label, className }: { icon: React.ReactNode; label: string; className: string }) {
    return (
        <button className="flex flex-col items-center gap-2 rounded-xl p-2 text-center transition hover:bg-gray-50">
            <span className={`flex h-14 w-14 items-center justify-center rounded-full ${className}`}>{icon}</span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </button>
    );
}

function SummaryCard({ icon, label, value, note, className }: { icon: React.ReactNode; label: string; value: string; note: string; className: string }) {
    return (
        <div className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${className}`}>{icon}</span>
            <div className="min-w-0">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 truncate text-xl font-bold text-gray-900">{value}</p>
                <p className="mt-1 text-sm text-gray-500">{note}</p>
            </div>
        </div>
    );
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "KH";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function shortId(id: string) {
    if (id.length <= 16) return id;
    return `${id.slice(0, 7)}...${id.slice(-5)}`;
}
