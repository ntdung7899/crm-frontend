import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { jobsService } from "@/services/jobs";
import { userHistoryService } from "@/services/user-history";
import { usersService } from "@/services/users";
import { JobApiRow, UserHistoryApiRow } from "@/types/api";
import { UserProfile } from "@/types/user";
import {
    buildUpdatePayload,
    getJobDateValue,
    isJobRelatedToUser,
    mapApiRowToProfile,
} from "../utils/userDetailMappers";

export type UserTab = "detail" | "activity" | "work" | "chat";

export function useUserDetailPage() {
    const params = useParams<{ userId: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const toastRef = useStableToastRef();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    const userId = params.userId;
    const requestedTab = searchParams.get("tab") as UserTab | null;
    const requestedMode = searchParams.get("mode");

    const [activeTab, setActiveTab] = useState<UserTab>(
        requestedTab === "activity" || requestedTab === "work" || requestedTab === "detail" || requestedTab === "chat"
            ? requestedTab
            : "detail",
    );
    const [isEditing, setIsEditing] = useState(requestedMode === "edit");
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activities, setActivities] = useState<UserHistoryApiRow[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);
    const [workJobs, setWorkJobs] = useState<JobApiRow[]>([]);
    const [isLoadingWorkJobs, setIsLoadingWorkJobs] = useState(false);
    const [assignerNameById, setAssignerNameById] = useState<Record<string, string>>({});

    useEffect(() => {
        if (requestedTab === "activity" || requestedTab === "detail" || requestedTab === "work" || requestedTab === "chat") {
            setActiveTab(requestedTab);
        }
    }, [requestedTab]);

    useEffect(() => {
        setIsEditing(requestedMode === "edit");
    }, [requestedMode]);

    const loadUser = useCallback(async () => {
        if (!userId) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await usersService.getUser(userId);
            const row = response.responseData;

            if (!row) {
                toastRef.current.error("Không tìm thấy người dùng", "Người dùng không còn tồn tại.");
                router.push("/users");
                return;
            }

            setUser(mapApiRowToProfile(row));
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể tải chi tiết người dùng.";
            toastRef.current.error("Tải dữ liệu thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [router, userId, toastRef]);

    useEffect(() => {
        void loadUser();
    }, [loadUser]);

    useEffect(() => {
        if (!user?.id) {
            setActivities([]);
            return;
        }

        let isDisposed = false;

        const loadActivities = async () => {
            setIsLoadingActivities(true);
            try {
                const response = await userHistoryService.getUserHistories({
                    pageSize: "100",
                    sortField: "created_at",
                    sortOrder: "DESC",
                    filters: `user_id==${user.id}`,
                });

                if (isDisposed) {
                    return;
                }

                setActivities(response.responseData?.rows || []);
            } catch {
                if (!isDisposed) {
                    setActivities([]);
                }
            } finally {
                if (!isDisposed) {
                    setIsLoadingActivities(false);
                }
            }
        };

        void loadActivities();

        return () => {
            isDisposed = true;
        };
    }, [user?.id]);

    useEffect(() => {
        if (activeTab !== "work" || !user?.id) {
            return;
        }

        let isDisposed = false;

        const loadWorkJobs = async () => {
            setIsLoadingWorkJobs(true);
            try {
                let rows: JobApiRow[] = [];

                try {
                    const filteredResponse = await jobsService.getJobs({
                        currentPage: "1",
                        pageSize: "300",
                        filters: `performer_uuid==${user.id}`,
                    });
                    rows = filteredResponse.responseData?.rows || [];
                } catch {
                    rows = [];
                }

                if (rows.length === 0) {
                    try {
                        const createdByResponse = await jobsService.getJobs({
                            currentPage: "1",
                            pageSize: "300",
                            filters: `created_by==${user.id}`,
                        });
                        rows = createdByResponse.responseData?.rows || [];
                    } catch {
                        rows = [];
                    }
                }

                if (rows.length === 0) {
                    const fallbackResponse = await jobsService.getJobs({
                        currentPage: "1",
                        pageSize: "500",
                    });

                    rows = (fallbackResponse.responseData?.rows || []).filter((job) => isJobRelatedToUser(job, user));
                }

                const assignerIds = Array.from(
                    new Set(
                        rows
                            .map((job) => job.created_by)
                            .filter((createdBy): createdBy is string => Boolean(createdBy && createdBy.trim())),
                    ),
                );

                if (assignerIds.length > 0) {
                    try {
                        const usersResponse = await usersService.getUsers({ currentPage: "1", pageSize: "500" });
                        const rowsById = (usersResponse.responseData?.rows || []).reduce<Record<string, string>>((acc, row) => {
                            acc[row.id] = row.full_name || row.email || row.id;
                            return acc;
                        }, {});

                        const nextAssignerMap = assignerIds.reduce<Record<string, string>>((acc, id) => {
                            acc[id] = rowsById[id] || (id === user.id ? user.full_name : id);
                            return acc;
                        }, {});

                        if (!isDisposed) {
                            setAssignerNameById(nextAssignerMap);
                        }
                    } catch {
                        const fallbackAssignerMap = assignerIds.reduce<Record<string, string>>((acc, id) => {
                            acc[id] = id === user.id ? user.full_name : id;
                            return acc;
                        }, {});

                        if (!isDisposed) {
                            setAssignerNameById(fallbackAssignerMap);
                        }
                    }
                } else if (!isDisposed) {
                    setAssignerNameById({});
                }

                if (isDisposed) {
                    return;
                }

                setWorkJobs([...rows].sort((a, b) => getJobDateValue(b) - getJobDateValue(a)));
            } catch {
                if (!isDisposed) {
                    setWorkJobs([]);
                }
            } finally {
                if (!isDisposed) {
                    setIsLoadingWorkJobs(false);
                }
            }
        };

        void loadWorkJobs();

        return () => {
            isDisposed = true;
        };
    }, [activeTab, user]);

    const tabs = useMemo(
        () => [
            { id: "detail", label: "Thông tin chi tiết" },
            { id: "activity", label: "Lịch sử hoạt động" },
            { id: "work", label: "Lịch sử chăm sóc" },
            { id: "chat", label: "Chat" },
        ],
        [],
    );

    const handleUpdate = useCallback(
        async (formData: Partial<UserProfile>) => {
            if (!user) {
                return;
            }

            const payload = buildUpdatePayload(formData, user);

            if (Object.keys(payload).length === 0) {
                toastRef.current.success("Không có thay đổi", "Thông tin người dùng giữ nguyên.");
                setIsEditing(false);
                return;
            }

            try {
                await usersService.updateUser(user.id, payload);
                toastRef.current.success("Cập nhật thành công", `Người dùng "${user.full_name}" đã được cập nhật.`);
                setIsEditing(false);
                await loadUser();
            } catch (error) {
                const message = error instanceof Error ? error.message : "Không thể cập nhật thông tin người dùng.";
                toastRef.current.error("Cập nhật thất bại", message);
            }
        },
        [loadUser, user, toastRef],
    );

    const handleDelete = useCallback(() => {
        if (!user) {
            return;
        }

        requestDeleteConfirmation({
            title: "Xóa người dùng",
            description: `Bạn có chắc chắn muốn xóa người dùng "${user.full_name}"? Hành động này không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    await usersService.deleteUser(user.id);
                    toastRef.current.success("Xóa thành công", `Người dùng "${user.full_name}" đã bị xóa.`);
                    router.push("/users");
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Không thể xóa người dùng.";
                    toastRef.current.error("Xóa thất bại", message);
                }
            },
        });
    }, [requestDeleteConfirmation, router, user, toastRef]);

    const goToUsers = useCallback(() => {
        router.push("/users");
    }, [router]);

    return {
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
    };
}
