"use client";

import { useParams } from "next/navigation";
import { TaskFormView } from "../../components/TaskFormView";

export default function EditTaskPage() {
    const params = useParams<{ jobId: string }>();
    return <TaskFormView jobId={params.jobId} />;
}
