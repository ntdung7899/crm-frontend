import React from "react";
import { JobApiRow, StatusApiRow } from "@/types/api";
import { FiClock, FiUsers, FiEdit2, FiTrash2, FiAlertCircle, FiCheck } from "react-icons/fi";
import { getFormTimeFromApi } from "../utils/tasksHelpers";
import { getInitials } from "@/lib/utils";

type TasksGroupedListProps = {
    jobs: JobApiRow[];
    statuses: StatusApiRow[];
    getPerformerLabel: (job: JobApiRow) => string;
    getCustomerLabel: (job: JobApiRow) => string;
    onOpenDetail: (job: JobApiRow) => void;
    onOpenEdit: (job: JobApiRow) => void;
    onRequestDelete: (job: JobApiRow) => void;
    onUpdateStatus: (jobId: string, statusId: string) => Promise<void>;
};

const getJobPriority = (job: JobApiRow): "Cao" | "Trung bình" | "Thấp" => {
    if ((job as any).priority) return (job as any).priority;
    const name = job.job_name.toLowerCase();
    if (name.includes("premium") || name.includes("gọi lại khách hàng") || name.includes("demo") || name.includes("lên lịch")) {
        return "Cao";
    }
    if (name.includes("sau bán") || name.includes("zalo oa") || name.includes("chăm sóc")) {
        return "Thấp";
    }
    return "Trung bình";
};

const formatJobTimeRelative = (jobTimeStr?: string | null) => {
    if (!jobTimeStr) return "";
    const d = new Date(jobTimeStr);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const pad = (n: number) => String(n).padStart(2, "0");
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (diffDays === 0) {
        return `Hôm nay, ${timeStr}`;
    } else if (diffDays === 1) {
        return `Ngày mai, ${timeStr}`;
    } else if (diffDays === -1) {
        return `Hôm qua, ${timeStr}`;
    } else {
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${timeStr}`;
    }
};

const isOverdue = (job: JobApiRow) => {
    const jt = getFormTimeFromApi(job.job_time);
    const dateStr = jt.end || jt.start;
    if (!dateStr) return false;
    const isDone = ["done", "completed", "success"].includes(job.status?.code?.toLowerCase() || "") ||
                   (job.status?.name || "").includes("Hoàn thành");
    if (isDone) return false;
    return new Date(dateStr).getTime() < Date.now();
};

export function TasksGroupedList({
    jobs,
    statuses,
    getPerformerLabel,
    getCustomerLabel,
    onOpenDetail,
    onOpenEdit,
    onRequestDelete,
    onUpdateStatus,
}: TasksGroupedListProps) {
    const displayStatuses = statuses.length > 0 ? statuses : [
        { id: "todo", name: "Cần làm", code: "todo" },
        { id: "in_progress", name: "Đang làm", code: "in_progress" },
        { id: "pending", name: "Chờ xử lý", code: "pending" },
        { id: "done", name: "Hoàn thành", code: "done" }
    ] as StatusApiRow[];

    const getStatusJobs = (statusId: string) => {
        return jobs.filter((job) => {
            if (job.status_id === statusId) return true;
            if (job.status?.id === statusId) return true;
            return false;
        });
    };

    const getStatusColorClass = (code: string | null, name?: string | null) => {
        const c = (code || "").toLowerCase();
        const n = (name || "").toLowerCase();
        if (c.includes("todo") || c.includes("need") || n.includes("cần làm") || n.includes("mới")) return "bg-blue-500";
        if (c.includes("progress") || c.includes("doing") || n.includes("đang thực hiện") || n.includes("đang làm")) return "bg-primary-500";
        if (c.includes("pending") || c.includes("wait") || n.includes("chờ xử lý")) return "bg-amber-500";
        if (c.includes("done") || c.includes("complete") || n.includes("hoàn thành") || n.includes("thành công")) return "bg-emerald-500";
        return "bg-slate-400";
    };

    const handleToggleComplete = async (job: JobApiRow, completedStatus: StatusApiRow, todoStatus: StatusApiRow) => {
        const isCurrentlyCompleted = job.status_id === completedStatus.id || job.status?.id === completedStatus.id;
        const targetStatusId = isCurrentlyCompleted ? todoStatus.id : completedStatus.id;
        await onUpdateStatus(job.id, targetStatusId);
    };

    const completedStatus = displayStatuses.find(s => s.code?.toLowerCase() === "done" || s.name === "Hoàn thành") || displayStatuses[displayStatuses.length - 1];
    const todoStatus = displayStatuses.find(s => s.code?.toLowerCase() === "todo" || s.name === "Cần làm") || displayStatuses[0];

    return (
        <div className="flex flex-col gap-6 select-none">
            {displayStatuses.map((status) => {
                const columnJobs = getStatusJobs(status.id);
                const dotColor = getStatusColorClass(status.code, status.name);

                return (
                    <div key={status.id} className="flex flex-col gap-3">
                        {/* Section Header */}
                        <div className="flex items-center gap-2 px-1 py-1 border-b border-slate-100 pb-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-sm`} />
                            <span className="text-xs font-bold text-slate-800 tracking-tight">
                                {status.name}
                            </span>
                            <span className="bg-slate-200/70 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-slate-600 shadow-sm">
                                {columnJobs.length}
                            </span>
                        </div>

                        {/* List Stack */}
                        <div className="flex flex-col gap-2.5">
                            {columnJobs.map((job) => {
                                const priority = getJobPriority(job);
                                const jt = getFormTimeFromApi(job.job_time);
                                const dateStr = jt.start || jt.end;
                                const dateDisplay = formatJobTimeRelative(dateStr);
                                const overdue = isOverdue(job);
                                const performerLabel = getPerformerLabel(job);
                                const performerInitials = getInitials(performerLabel);
                                const isJobChecked = completedStatus ? (job.status_id === completedStatus.id || job.status?.id === completedStatus.id) : false;

                                return (
                                    <div
                                        key={job.id}
                                        onClick={() => onOpenDetail(job)}
                                        className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                            {/* Circular Checkbox */}
                                            {completedStatus && todoStatus && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleComplete(job, completedStatus, todoStatus);
                                                    }}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                        isJobChecked
                                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                                            : "border-slate-300 hover:border-emerald-500/80 hover:bg-emerald-50/50"
                                                    }`}
                                                >
                                                    {isJobChecked && <FiCheck className="w-3.5 h-3.5 stroke-[3.5]" />}
                                                </button>
                                            )}

                                            {/* Details Info */}
                                            <div className="flex flex-col min-w-0">
                                                <span className={`text-xs font-bold text-slate-800 leading-snug truncate pr-4 ${
                                                    isJobChecked ? "line-through text-slate-400 font-medium" : ""
                                                }`}>
                                                    {job.job_name}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-slate-400 mt-1 font-medium">
                                                    {(job.customer || job.customer_uuid) && (
                                                        <span className="flex items-center gap-1 text-slate-500">
                                                            <FiUsers className="w-3.5 h-3.5 shrink-0" />
                                                            {getCustomerLabel(job)}
                                                        </span>
                                                    )}
                                                    {(job.customer || job.customer_uuid) && dateDisplay && (
                                                        <span className="text-slate-300">•</span>
                                                    )}
                                                    {overdue ? (
                                                        <span className="flex items-center gap-1 text-red-500 font-bold animate-pulse">
                                                            <FiAlertCircle className="w-3.5 h-3.5" />
                                                            Quá hạn: {dateDisplay}
                                                        </span>
                                                    ) : dateDisplay ? (
                                                        <span className="flex items-center gap-1 text-slate-400">
                                                            <FiClock className="w-3.5 h-3.5" />
                                                            {dateDisplay}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Badges & Avatars */}
                                        <div className="flex items-center gap-3.5 shrink-0">
                                            {/* Priority */}
                                            <span
                                                className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    priority === "Cao"
                                                        ? "bg-rose-50 text-rose-600 border border-rose-100/60"
                                                        : priority === "Trung bình"
                                                        ? "bg-amber-50 text-amber-600 border border-amber-100/60"
                                                        : "bg-slate-100 text-slate-600 border border-slate-200/60"
                                                }`}
                                            >
                                                {priority}
                                            </span>

                                            {/* Performer Avatar */}
                                            <div 
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white bg-primary-500 shadow-sm border border-white shrink-0"
                                                title={performerLabel}
                                            >
                                                {performerInitials}
                                            </div>

                                            {/* Edit & Delete hover controls */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenEdit(job);
                                                    }}
                                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                                                    title="Sửa"
                                                >
                                                    <FiEdit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRequestDelete(job);
                                                    }}
                                                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <FiTrash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {columnJobs.length === 0 && (
                                <div className="border border-dashed border-slate-200 rounded-xl py-6 text-center text-slate-400 text-[10px] italic bg-white/20">
                                    Không có công việc thuộc trạng thái này
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}