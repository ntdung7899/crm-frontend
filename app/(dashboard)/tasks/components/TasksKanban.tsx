import React, { useState } from "react";
import { JobApiRow, StatusApiRow } from "@/types/api";
import { FiBriefcase, FiClock, FiPlus, FiUser, FiUsers, FiEdit2, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { getFormTimeFromApi } from "../utils/tasksHelpers";
import { getInitials } from "@/lib/utils";

type TasksKanbanProps = {
    jobs: JobApiRow[];
    statuses: StatusApiRow[];
    getPerformerLabel: (job: JobApiRow) => string;
    getCustomerLabel: (job: JobApiRow) => string;
    onOpenDetail: (job: JobApiRow) => void;
    onOpenEdit: (job: JobApiRow) => void;
    onRequestDelete: (job: JobApiRow) => void;
    onUpdateStatus: (jobId: string, statusId: string) => Promise<void>;
    onCreateTask: () => void;
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

export function TasksKanban({
    jobs,
    statuses,
    getPerformerLabel,
    getCustomerLabel,
    onOpenDetail,
    onOpenEdit,
    onRequestDelete,
    onUpdateStatus,
    onCreateTask,
}: TasksKanbanProps) {
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

    // Fallback default statuses matching mockup if API statuses list is empty
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

    const getStatusColorClass = (code: string | null) => {
        const c = (code || "").toLowerCase();
        if (c.includes("todo") || c.includes("need")) return "bg-blue-500";
        if (c.includes("progress") || c.includes("doing")) return "bg-primary-500";
        if (c.includes("pending") || c.includes("wait")) return "bg-amber-500";
        if (c.includes("done") || c.includes("complete")) return "bg-emerald-500";
        return "bg-slate-400";
    };

    const handleDragStart = (e: React.DragEvent, jobId: string) => {
        e.dataTransfer.setData("text/plain", jobId);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        setDragOverColumnId(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumnId(null);
    };

    const handleDrop = async (e: React.DragEvent, statusId: string) => {
        e.preventDefault();
        setDragOverColumnId(null);
        const jobId = e.dataTransfer.getData("text/plain");
        if (jobId) {
            await onUpdateStatus(jobId, statusId);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 select-none items-start">
            {displayStatuses.map((status) => {
                const columnJobs = getStatusJobs(status.id);
                const isOver = dragOverColumnId === status.id;
                const dotColor = getStatusColorClass(status.code);

                return (
                    <div
                        key={status.id}
                        onDragOver={(e) => handleDragOver(e, status.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status.id)}
                        className={`w-72 shrink-0 p-3.5 rounded-2xl border transition-all flex flex-col gap-3.5 min-h-[550px] ${
                            isOver 
                                ? "bg-slate-100 border-primary/30 shadow-inner" 
                                : "bg-slate-50/60 border-slate-200/60"
                        }`}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-sm`} />
                                <span className="text-xs font-black text-slate-800 tracking-tight">
                                    {status.name}
                                </span>
                                <span className="bg-slate-200/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-slate-500 shadow-sm">
                                    {columnJobs.length}
                                </span>
                            </div>
                        </div>

                        {/* Cards List */}
                        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                            {columnJobs.map((job) => {
                                const priority = getJobPriority(job);
                                const jt = getFormTimeFromApi(job.job_time);
                                const dateStr = jt.start || jt.end;
                                const dateDisplay = formatJobTimeRelative(dateStr);
                                const overdue = isOverdue(job);
                                const performerLabel = getPerformerLabel(job);
                                const performerInitials = getInitials(performerLabel);

                                return (
                                    <div
                                        key={job.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, job.id)}
                                        onClick={() => onOpenDetail(job)}
                                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex flex-col relative group"
                                    >
                                        {/* Action buttons (hover) */}
                                        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenEdit(job);
                                                }}
                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                                                title="Sửa"
                                            >
                                                <FiEdit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRequestDelete(job);
                                                }}
                                                className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                                                title="Xóa"
                                            >
                                                <FiTrash2 className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Priority Badge */}
                                        <div className="mb-2">
                                            <span
                                                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    priority === "Cao"
                                                        ? "bg-rose-50 text-rose-600 border border-rose-100/60"
                                                        : priority === "Trung bình"
                                                        ? "bg-amber-50 text-amber-600 border border-amber-100/60"
                                                        : "bg-slate-100 text-slate-600 border border-slate-200/60"
                                                }`}
                                            >
                                                {priority}
                                            </span>
                                        </div>

                                        {/* Job Title */}
                                        <h4 className="text-slate-800 text-xs font-black leading-snug line-clamp-2 mb-2 pr-6 hover:text-primary transition-colors cursor-pointer">
                                            {job.job_name}
                                        </h4>

                                        {/* Customer label */}
                                        {(job.customer || job.customer_uuid) && (
                                            <div className="flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded text-[10px] text-slate-500 font-bold w-fit mb-3 max-w-full truncate">
                                                <FiUsers className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span>{getCustomerLabel(job)}</span>
                                            </div>
                                        )}

                                        {/* Time and Performer avatar */}
                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-1 text-[10px]">
                                                {overdue ? (
                                                    <div className="flex items-center gap-1 text-red-500 font-bold animate-pulse">
                                                        <FiAlertCircle className="w-3.5 h-3.5" />
                                                        <span>Quá hạn: {dateDisplay}</span>
                                                    </div>
                                                ) : dateDisplay ? (
                                                    <div className="flex items-center gap-1 text-slate-400 font-semibold">
                                                        <FiClock className="w-3.5 h-3.5" />
                                                        <span>{dateDisplay}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 italic">Không thời hạn</span>
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <div 
                                                className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[8px] font-black text-white bg-primary-500 shadow-sm border border-white"
                                                title={performerLabel}
                                            >
                                                {performerInitials}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {columnJobs.length === 0 && (
                                <div className="border border-dashed border-slate-200 rounded-xl py-8 text-center text-slate-400 text-[11px] italic bg-white/30">
                                    Không có công việc
                                </div>
                            )}
                        </div>

                        {/* Add Card Button */}
                        <button
                            onClick={onCreateTask}
                            className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors bg-white/50 mt-1"
                        >
                            <FiPlus className="w-3.5 h-3.5" /> Thêm thẻ
                        </button>
                    </div>
                );
            })}
        </div>
    );
}