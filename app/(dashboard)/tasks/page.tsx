"use client";

import { useRouter } from "next/navigation";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { TasksSearchBar } from "./components/TasksSearchBar";
import { TasksTable } from "./components/TasksTable";
import { useTasksPage } from "./hooks/useTasksPage";
import type { JobApiRow } from "@/types/api";

export default function TasksPage() {
    const router = useRouter();
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
    } = useTasksPage();

    const goEdit = (job: JobApiRow) => router.push(`/tasks/${job.id}/edit`);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
                    Đang tải danh sách công việc...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <TasksSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                resultCount={filteredJobs.length}
                onCreate={() => router.push("/tasks/new")}
            />

            <ListPageLayout
                items={filteredJobs}
                resetPageKey={searchQuery}
                renderTable={(paged) => (
                    <TasksTable
                        jobs={paged}
                        statuses={statuses}
                        getPerformerLabel={getPerformerLabel}
                        getCustomerLabel={getCustomerLabel}
                        onOpenDetail={openDetail}
                        onOpenEdit={goEdit}
                        onRequestDelete={handleRequestDeleteJob}
                    />
                )}
            />

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
