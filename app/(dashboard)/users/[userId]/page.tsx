"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { UserEditorForm } from "../components/forms/UserEditorForm";
import { UserActivityTab } from "./components/UserActivityTab";
import { UserChatTab } from "./components/UserChatTab";
import { UserDetailSection } from "./components/UserDetailSection";
import { UserWorkTab } from "./components/UserWorkTab";
import { UserTab, useUserDetailPage } from "./hooks/useUserDetailPage";

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
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
                    Đang tải chi tiết người dùng...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                    <p className="text-sm text-gray-500 mt-1">Mã người dùng: {user.id}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" onClick={goToUsers}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Danh sách người dùng
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent>
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as UserTab)} />

                    <div className="pt-6">
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
                                <UserDetailSection user={user} onEdit={() => setIsEditing(true)} />
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

                        {activeTab === "chat" && (
                            <UserChatTab userId={user.id} userName={user.full_name} />
                        )}
                    </div>
                </CardContent>
            </Card>
            <DeleteConfirmationDialog />
        </div>
    );
}
