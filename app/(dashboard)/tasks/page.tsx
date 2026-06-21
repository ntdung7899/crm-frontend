"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { TasksKanban } from "./components/TasksKanban";
import { TasksGroupedList } from "./components/TasksGroupedList";
import { useTasksPage } from "./hooks/useTasksPage";
import type { JobApiRow } from "@/types/api";
import { getFormTimeFromApi } from "./utils/tasksHelpers";
import { getInitials } from "@/lib/utils";
import { 
    FiGrid, 
    FiList, 
    FiPlus, 
    FiSearch, 
    FiBriefcase, 
    FiClock, 
    FiAlertTriangle, 
    FiCheckCircle 
} from "react-icons/fi";

const isOverdue = (job: JobApiRow) => {
    const jt = getFormTimeFromApi(job.job_time);
    const dateStr = jt.end || jt.start;
    if (!dateStr) return false;
    const isDone = ["done", "completed", "success"].includes(job.status?.code?.toLowerCase() || "") ||
                   (job.status?.name || "").includes("Hoàn thành");
    if (isDone) return false;
    return new Date(dateStr).getTime() < Date.now();
};

export default function TasksPage() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<"kanban" | "list">("kanban");
    const {
        isLoading,
        searchQuery,
        setSearchQuery,
        filteredJobs,
        statuses,
        isDetailOpen,
        selectedJob,
        getUserNameById,
        getPerformerLabel,
        getCustomerLabel,
        openDetail,
        closeDetail,
        handleRequestDeleteJob,
        DeleteConfirmationDialog,
        updateJobStatus,
    } = useTasksPage();

    const goEdit = (job: JobApiRow) => router.push(`/tasks/${job.id}/edit`);

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <span className="text-xs font-semibold text-slate-500">Đang tải danh sách công việc...</span>
                </div>
            </div>
        );
    }

    // Dynamic stats calculations
    const totalCount = filteredJobs.length;
    
    const doingCount = filteredJobs.filter(j => {
        const code = j.status?.code?.toLowerCase() || "";
        const name = j.status?.name?.toLowerCase() || "";
        return code.includes("progress") || code.includes("doing") || name.includes("đang làm");
    }).length;

    const completedCount = filteredJobs.filter(j => {
        const code = j.status?.code?.toLowerCase() || "";
        const name = j.status?.name?.toLowerCase() || "";
        return code.includes("done") || code.includes("complete") || name.includes("hoàn thành");
    }).length;

    const overdueCount = filteredJobs.filter(isOverdue).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header section matching mockup */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">Quản lý công việc</h1>
                    <p className="text-[11px] text-slate-400 font-bold mt-1">Kéo thả thẻ để cập nhật trạng thái công việc của đội nhóm.</p>
                </div>
                <button
                    onClick={() => router.push("/tasks/new")}
                    className="bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-1.5"
                >
                    <FiPlus className="w-4 h-4" />
                    Thêm công việc
                </button>
            </div>

            {/* Dynamic Stat cards row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Total */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FiBriefcase className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{totalCount}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tổng công việc</span>
                    </div>
                </div>

                {/* Doing */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FiClock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{doingCount}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Đang làm</span>
                    </div>
                </div>

                {/* Overdue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        overdueCount > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-400"
                    }`}>
                        <FiAlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{overdueCount}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Quá hạn</span>
                    </div>
                </div>

                {/* Completed */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FiCheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{completedCount}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Hoàn thành</span>
                    </div>
                </div>
            </div>

            {/* View Switcher, search filter and perform group */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-sm mb-6">
                {/* Switch tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                    <button
                        type="button"
                        onClick={() => setActiveView("kanban")}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                            activeView === "kanban"
                                ? "bg-white text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <FiGrid className="w-3.5 h-3.5" />
                        Bảng
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveView("list")}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                            activeView === "list"
                                ? "bg-white text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <FiList className="w-3.5 h-3.5" />
                        Danh sách
                    </button>
                </div>

                {/* Right filters */}
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1 justify-end">
                    {/* Performer list */}
                    <div className="flex -space-x-2 overflow-hidden">
                        {filteredJobs.slice(0, 4).map((job) => {
                            const label = getPerformerLabel(job);
                            return (
                                <div
                                    key={job.id}
                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-primary-500 text-[8px] font-black text-white flex items-center justify-center shadow-sm"
                                    title={label}
                                >
                                    {getInitials(label)}
                                </div>
                            );
                        })}
                        {filteredJobs.length > 4 && (
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 text-[8px] font-black text-slate-500 flex items-center justify-center shadow-sm">
                                +{filteredJobs.length - 4}
                            </div>
                        )}
                    </div>

                    {/* Search bar */}
                    <div className="relative w-full sm:w-64">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="Lọc theo tên việc, khách hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Rendering view */}
            {activeView === "kanban" ? (
                <TasksKanban
                    jobs={filteredJobs}
                    statuses={statuses}
                    getPerformerLabel={getPerformerLabel}
                    getCustomerLabel={getCustomerLabel}
                    onOpenDetail={openDetail}
                    onOpenEdit={goEdit}
                    onRequestDelete={handleRequestDeleteJob}
                    onUpdateStatus={updateJobStatus}
                    onCreateTask={() => router.push("/tasks/new")}
                />
            ) : (
                <TasksGroupedList
                    jobs={filteredJobs}
                    statuses={statuses}
                    getPerformerLabel={getPerformerLabel}
                    getCustomerLabel={getCustomerLabel}
                    onOpenDetail={openDetail}
                    onOpenEdit={goEdit}
                    onRequestDelete={handleRequestDeleteJob}
                    onUpdateStatus={updateJobStatus}
                />
            )}

            {/* Form details & confirmations */}
            <TaskDetailModal
                isOpen={isDetailOpen}
                selectedJob={selectedJob}
                statuses={statuses}
                getPerformerLabel={getPerformerLabel}
                getCustomerLabel={getCustomerLabel}
                getUserNameById={getUserNameById}
                onClose={closeDetail}
                onEdit={goEdit}
            />

            <DeleteConfirmationDialog />
        </div>
    );
}
