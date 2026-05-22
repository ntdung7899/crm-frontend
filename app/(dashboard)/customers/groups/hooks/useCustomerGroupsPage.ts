import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { customerTagsService } from "@/services/customer-tags";
import { tagsService } from "@/services/tags";
import { userTagsService } from "@/services/user-tags";
import { usersService } from "@/services/users";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { toErrorMessage } from "@/lib/utils";

export interface GroupItem {
    id: string;
    name: string;
    customerCount: number;
    isActive: boolean;
    createdAt: string | null;
}

export interface UserOption {
    id: string;
    label: string;
}

const TAG_PAGE_SIZE = "500";
const LINK_PAGE_SIZE = "5000";
const SITE_LEADER_PERMISSION_NAME = "SITE LEADER";

export function useCustomerGroupsPage() {
    const router = useRouter();
    const toastRef = useStableToastRef();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [groupOwnerByTagId, setGroupOwnerByTagId] = useState<Record<string, string>>({});
    const [assigningGroupId, setAssigningGroupId] = useState<string | null>(null);

    const loadGroups = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tagsRes, linksRes, usersRes, userTagsRes] = await Promise.all([
                tagsService.getTags({ currentPage: "1", pageSize: TAG_PAGE_SIZE }),
                customerTagsService.getCustomerTags({ currentPage: "1", pageSize: LINK_PAGE_SIZE }),
                usersService.getAdminUsers({ currentPage: "1", pageSize: "500" }),
                userTagsService.getUserTags({ currentPage: "1", pageSize: LINK_PAGE_SIZE }),
            ]);

            const tags = tagsRes.responseData?.rows || [];
            const links = linksRes.responseData?.rows || [];

            const countByTagId = links.reduce<Record<string, number>>((acc, link) => {
                acc[link.tag_id] = (acc[link.tag_id] || 0) + 1;
                return acc;
            }, {});

            const nextGroups = tags
                .map((tag) => ({
                    id: tag.id,
                    name: tag.name,
                    customerCount: countByTagId[tag.id] || 0,
                    isActive: tag.is_active !== false,
                    createdAt: tag.created_at,
                }))
                .sort((a, b) => a.name.localeCompare(b.name, "vi"));

            setGroups(nextGroups);

            const mappedUsers = (usersRes?.responseData?.rows || [])
                .filter((user) =>
                    (user.user_permisions || []).some(
                        (permissionItem) =>
                            permissionItem.permision?.name?.trim().toUpperCase() === SITE_LEADER_PERMISSION_NAME,
                    ),
                )
                .map((user) => ({
                    id: user.id,
                    label: user.full_name?.trim() || user.email || user.id,
                }))
                .sort((a, b) => a.label.localeCompare(b.label, "vi"));
            setUserOptions(mappedUsers);

            const ownerMap: Record<string, string> = {};
            (userTagsRes?.responseData?.rows || []).forEach((row) => {
                if (!ownerMap[row.tag_id]) {
                    ownerMap[row.tag_id] = row.user_id;
                }
            });
            setGroupOwnerByTagId(ownerMap);
        } catch (error) {
            toastRef.current.error("Không thể tải danh sách nhóm", toErrorMessage(error, "Đã có lỗi xảy ra."));
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void loadGroups();
    }, [loadGroups]);

    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) {
            return groups;
        }

        const query = searchQuery.toLowerCase();
        return groups.filter((group) => group.name.toLowerCase().includes(query));
    }, [groups, searchQuery]);

    const handleAssignGroupOwner = useCallback(async (groupId: string, userId: string) => {
        setAssigningGroupId(groupId);
        try {
            const existingRes = await userTagsService.getUserTagsByTagId(groupId, {
                currentPage: "1",
                pageSize: LINK_PAGE_SIZE,
            });

            const existingLinks = existingRes.responseData?.rows || [];
            if (existingLinks.length > 0) {
                await Promise.all(existingLinks.map((link) => userTagsService.deleteUserTag(link.id)));
            }

            if (userId) {
                await userTagsService.createUserTags([{ tag_id: groupId, user_id: userId }]);
            }

            setGroupOwnerByTagId((prev) => {
                const next = { ...prev };
                if (userId) {
                    next[groupId] = userId;
                } else {
                    delete next[groupId];
                }
                return next;
            });

            toastRef.current.success("Cập nhật phụ trách nhóm", "Đã cập nhật người phụ trách cho nhóm.");
        } catch (error) {
            toastRef.current.error("Cập nhật phụ trách thất bại", toErrorMessage(error, "Không thể cập nhật phụ trách nhóm."));
        } finally {
            setAssigningGroupId(null);
        }
    }, [toastRef]);

    const handleCreateGroup = useCallback(async () => {
        const name = newGroupName.trim();
        if (!name) {
            toastRef.current.error("Tên nhóm không hợp lệ", "Vui lòng nhập tên nhóm khách hàng.");
            return;
        }

        setIsCreating(true);
        try {
            await tagsService.createTag({ name });
            setNewGroupName("");
            toastRef.current.success("Tạo nhóm thành công", `Đã tạo nhóm \"${name}\".`);
            await loadGroups();
        } catch (error) {
            toastRef.current.error("Tạo nhóm thất bại", toErrorMessage(error, "Không thể tạo nhóm khách hàng."));
        } finally {
            setIsCreating(false);
        }
    }, [loadGroups, newGroupName, toastRef]);

    const handleDeleteGroup = useCallback(
        (group: GroupItem) => {
            requestDeleteConfirmation({
                title: "Xóa nhóm",
                description: `Bạn có chắc chắn muốn xóa nhóm "${group.name}"? Mọi liên kết khách hàng thuộc nhóm sẽ bị xóa.`,
                onConfirm: async () => {
                    setIsLoading(true);
                    try {
                        const linksRes = await customerTagsService.getCustomerTagsByTagId(group.id, {
                            currentPage: "1",
                            pageSize: LINK_PAGE_SIZE,
                        });

                        const links = linksRes.responseData?.rows || [];
                        if (links.length > 0) {
                            await Promise.all(links.map((link) => customerTagsService.deleteCustomerTag(link.id)));
                        }

                        await tagsService.deleteTag(group.id);
                        toastRef.current.success("Xóa nhóm thành công", `Đã xóa nhóm \"${group.name}\".`);
                        await loadGroups();
                    } catch (error) {
                        toastRef.current.error("Xóa nhóm thất bại", toErrorMessage(error, "Không thể xóa nhóm khách hàng."));
                    } finally {
                        setIsLoading(false);
                    }
                },
            });
        },
        [loadGroups, requestDeleteConfirmation, toastRef],
    );

    const openGroupDetail = useCallback(
        (groupId: string) => {
            router.push(`/customers/groups/${groupId}`);
        },
        [router],
    );

    return {
        groups,
        filteredGroups,
        isLoading,
        isCreating,
        newGroupName,
        setNewGroupName,
        searchQuery,
        setSearchQuery,
        userOptions,
        groupOwnerByTagId,
        assigningGroupId,
        handleAssignGroupOwner,
        handleCreateGroup,
        handleDeleteGroup,
        openGroupDetail,
        DeleteConfirmationDialog,
    };
}
