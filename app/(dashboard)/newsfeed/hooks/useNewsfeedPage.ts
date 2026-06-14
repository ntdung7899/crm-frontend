"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { getCurrentUserSession } from "@/lib/auth-session";
import { newsfeedService } from "@/services/newsfeed";
import { CreatePostPayload, MyInfoResponseData, UpdatePostPayload } from "@/types/api";
import { Post, PostInteraction, PostInteractionType, PostStatus, ReactionType } from "@/types/newsfeed";
import { mapApiRowToPost, mapInteractionRowToPostInteraction } from "../utils/postMappers";

export type NewsfeedFilter = "all" | PostStatus.ACTIVE | PostStatus.INACTIVE;
const PAGE_SIZE = 500;

export function useNewsfeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [interactionsByPost, setInteractionsByPost] = useState<Record<string, PostInteraction[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<NewsfeedFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInteractionsLoading, setIsInteractionsLoading] = useState(false);
  const [currentUser] = useState<MyInfoResponseData | null>(() => getCurrentUserSession());
  const currentUserId = currentUser?.id ?? "";
  const toastRef = useStableToastRef();
  const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

  // Cập nhật tương tác (reaction/comment) của một bài viết trong state, tính lại số đếm.
  const updatePostInteractions = useCallback(
    (postId: string, updater: (interactions: PostInteraction[]) => PostInteraction[]) => {
      const recount = (post: Post): Post => {
        const post_interactions = updater(post.post_interactions);
        return {
          ...post,
          post_interactions,
          reaction_count: post_interactions.filter((i) => i.interaction_type === PostInteractionType.REACTION).length,
          comment_count: post_interactions.filter((i) => i.interaction_type === PostInteractionType.COMMENT).length,
        };
      };
      setPosts((prev) => prev.map((post) => (post.id === postId ? recount(post) : post)));
      setSelectedPost((prev) => (prev?.id === postId ? recount(prev) : prev));
    },
    [],
  );

  const buildSelfInteraction = useCallback(
    (
      type: PostInteractionType,
      opts: { content?: string; parentCommentId?: string; reactionType?: ReactionType } = {},
    ): PostInteraction => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: currentUserId,
      interaction_type: type,
      reaction_type: opts.reactionType ?? null,
      content: opts.content ?? null,
      parent_comment_id: opts.parentCommentId ?? null,
      created_at: new Date(),
      user: { id: currentUserId, full_name: currentUser?.full_name ?? "Bạn", avatar: currentUser?.avatar ?? null },
    }),
    [currentUser, currentUserId],
  );

  // Thả / đổi cảm xúc — BE upsert: mỗi user chỉ có 1 REACTION trên 1 bài.
  const setReaction = useCallback(
    async (post: Post, reactionType: ReactionType) => {
      const myReaction = post.post_interactions.find(
        (i) => i.interaction_type === PostInteractionType.REACTION && i.user_id === currentUserId,
      );
      if (myReaction) {
        // Đổi cảm xúc: cập nhật tại chỗ (optimistic), gọi API update.
        const previous = myReaction.reaction_type ?? null;
        if (previous === reactionType) return;
        updatePostInteractions(post.id, (list) =>
          list.map((i) => (i.id === myReaction.id ? { ...i, reaction_type: reactionType } : i)),
        );
        try {
          const updated = mapInteractionRowToPostInteraction(
            (await newsfeedService.updateInteraction(post.id, { interaction_id: myReaction.id, reaction_type: reactionType })).responseData,
          );
          const merged = updated.user ? updated : { ...updated, user: myReaction.user };
          updatePostInteractions(post.id, (list) =>
            list.map((i) => (i.id === myReaction.id ? merged : i)),
          );
        } catch (error) {
          updatePostInteractions(post.id, (list) =>
            list.map((i) => (i.id === myReaction.id ? { ...i, reaction_type: previous } : i)),
          );
          toastRef.current.error("Đổi cảm xúc thất bại", error instanceof Error ? error.message : "Vui lòng thử lại.");
        }
        return;
      }
      const optimistic = buildSelfInteraction(PostInteractionType.REACTION, { reactionType });
      updatePostInteractions(post.id, (list) => [...list, optimistic]);
      try {
        const created = mapInteractionRowToPostInteraction(
          (await newsfeedService.createInteraction(post.id, { interaction_type: "REACTION", reaction_type: reactionType })).responseData,
        );
        updatePostInteractions(post.id, (list) => list.map((i) => (i.id === optimistic.id ? created : i)));
      } catch (error) {
        updatePostInteractions(post.id, (list) => list.filter((i) => i.id !== optimistic.id));
        toastRef.current.error("Thả cảm xúc thất bại", error instanceof Error ? error.message : "Vui lòng thử lại.");
      }
    },
    [buildSelfInteraction, currentUserId, toastRef, updatePostInteractions],
  );

  const removeReaction = useCallback(
    async (post: Post) => {
      const myReaction = post.post_interactions.find(
        (i) => i.interaction_type === PostInteractionType.REACTION && i.user_id === currentUserId,
      );
      if (!myReaction) return;
      updatePostInteractions(post.id, (list) => list.filter((i) => i.id !== myReaction.id));
      try {
        await newsfeedService.deleteInteraction(post.id, { interaction_id: myReaction.id });
      } catch (error) {
        updatePostInteractions(post.id, (list) => [...list, myReaction]);
        toastRef.current.error("Bỏ cảm xúc thất bại", error instanceof Error ? error.message : "Vui lòng thử lại.");
      }
    },
    [currentUserId, toastRef, updatePostInteractions],
  );

  const addComment = useCallback(
    async (post: Post, rawContent: string, parentCommentId?: string) => {
      const content = rawContent.trim();
      if (!content) return;
      const optimistic = buildSelfInteraction(PostInteractionType.COMMENT, { content, parentCommentId });
      updatePostInteractions(post.id, (list) => [...list, optimistic]);
      try {
        const created = mapInteractionRowToPostInteraction(
          (await newsfeedService.createInteraction(post.id, { interaction_type: "COMMENT", content, ...(parentCommentId ? { parent_comment_id: parentCommentId } : {}) })).responseData,
        );
        const merged = created.user ? created : { ...created, user: optimistic.user };
        updatePostInteractions(post.id, (list) => list.map((i) => (i.id === optimistic.id ? merged : i)));
      } catch (error) {
        updatePostInteractions(post.id, (list) => list.filter((i) => i.id !== optimistic.id));
        toastRef.current.error("Bình luận thất bại", error instanceof Error ? error.message : "Vui lòng thử lại.");
      }
    },
    [buildSelfInteraction, toastRef, updatePostInteractions],
  );

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await newsfeedService.getPosts({ currentPage: 1, pageSize: PAGE_SIZE });
      const rows = response.responseData?.rows ?? [];
      setPosts(rows.map(mapApiRowToPost).sort((a, b) => b.created_at.getTime() - a.created_at.getTime()));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải danh sách bài viết.";
      setErrorMessage(message);
      toastRef.current.error("Tải bài viết thất bại", message);
    } finally {
      setIsLoading(false);
    }
  }, [toastRef]);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  const filterCounts = useMemo(() => ({
    all: posts.length,
    [PostStatus.ACTIVE]: posts.filter((p) => p.status === PostStatus.ACTIVE).length,
    [PostStatus.INACTIVE]: posts.filter((p) => p.status === PostStatus.INACTIVE).length,
  }), [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (activeFilter !== "all") filtered = filtered.filter((post) => post.status === activeFilter);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => (post.title || "").toLowerCase().includes(query) || post.content.toLowerCase().includes(query) || (post.created_by_user?.full_name ?? "").toLowerCase().includes(query));
    }
    return filtered;
  }, [posts, activeFilter, searchQuery]);

  const openCreateModal = useCallback(() => { setEditingPost(null); setIsFormModalOpen(true); }, []);
  const openEditModal = useCallback((post: Post) => { setEditingPost(post); setIsFormModalOpen(true); }, []);
  const closeFormModal = useCallback(() => { setIsFormModalOpen(false); setEditingPost(null); }, []);

  const loadInteractions = useCallback(async (postId: string) => {
    setIsInteractionsLoading(true);
    try {
      const response = await newsfeedService.getInteractions(postId);
      setInteractionsByPost((prev) => ({ ...prev, [postId]: (response.responseData?.rows ?? []).map(mapInteractionRowToPostInteraction) }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải danh sách tương tác.";
      toastRef.current.error("Tải tương tác thất bại", message);
    } finally {
      setIsInteractionsLoading(false);
    }
  }, [toastRef]);

  const openDetailModal = useCallback((post: Post) => { setSelectedPost(post); setIsDetailModalOpen(true); void loadInteractions(post.id); }, [loadInteractions]);
  const closeDetailModal = useCallback(() => { setIsDetailModalOpen(false); setSelectedPost(null); }, []);

  const handleSavePost = useCallback(async (payload: CreatePostPayload | UpdatePostPayload) => {
    setIsSaving(true);
    try {
      if (editingPost) {
        const updated = mapApiRowToPost((await newsfeedService.updatePost(editingPost.id, payload as UpdatePostPayload)).responseData);
        setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
        setSelectedPost((prev) => (prev?.id === updated.id ? updated : prev));
        toastRef.current.success("Cập nhật thành công", "Bài viết đã được cập nhật.");
      } else {
        const created = mapApiRowToPost((await newsfeedService.createPost(payload as CreatePostPayload)).responseData);
        setPosts((prev) => [created, ...prev]);
        toastRef.current.success("Tạo thành công", "Bài viết mới đã được tạo.");
      }
      closeFormModal();
    } catch (error) {
      toastRef.current.error("Lưu bài viết thất bại", error instanceof Error ? error.message : "Không thể lưu bài viết.");
    } finally {
      setIsSaving(false);
    }
  }, [closeFormModal, editingPost, toastRef]);

  const handleToggleStatus = useCallback(async (post: Post) => {
    const nextStatus = post.status === PostStatus.ACTIVE ? PostStatus.INACTIVE : PostStatus.ACTIVE;
    try {
      const updated = mapApiRowToPost((await newsfeedService.updatePost(post.id, { status: nextStatus })).responseData);
      setPosts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedPost((prev) => (prev?.id === updated.id ? updated : prev));
      toastRef.current.success("Cập nhật trạng thái", nextStatus === PostStatus.ACTIVE ? "Bài viết đã được hiển thị." : "Bài viết đã được ẩn.");
    } catch (error) {
      toastRef.current.error("Cập nhật thất bại", error instanceof Error ? error.message : "Không thể cập nhật trạng thái bài viết.");
    }
  }, [toastRef]);

  const handleDeletePost = useCallback(async (post: Post) => {
    try {
      await newsfeedService.deletePost(post.id);
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      if (selectedPost?.id === post.id) closeDetailModal();
      toastRef.current.success("Xóa thành công", "Bài viết đã được xóa khỏi bảng tin.");
    } catch (error) {
      toastRef.current.error("Xóa thất bại", error instanceof Error ? error.message : "Không thể xóa bài viết.");
    }
  }, [closeDetailModal, selectedPost, toastRef]);

  const requestDeletePost = useCallback((post: Post) => requestDeleteConfirmation({ title: "Xóa bài viết", description: `Bạn có chắc chắn muốn xóa bài viết "${post.title || post.content.slice(0, 40)}"?`, onConfirm: async () => handleDeletePost(post) }), [handleDeletePost, requestDeleteConfirmation]);

  const handleDeleteInteraction = useCallback(async (postId: string, interaction: PostInteraction) => {
    try {
      await newsfeedService.deleteInteraction(postId, { interaction_id: interaction.id });
      setInteractionsByPost((prev) => ({ ...prev, [postId]: (prev[postId] ?? []).filter((item) => item.id !== interaction.id) }));
      updatePostInteractions(postId, (list) => list.filter((item) => item.id !== interaction.id));
      toastRef.current.success("Đã xóa tương tác", "Tương tác đã được gỡ khỏi bài viết.");
    } catch (error) {
      toastRef.current.error("Xóa tương tác thất bại", error instanceof Error ? error.message : "Không thể xóa tương tác.");
    }
  }, [toastRef, updatePostInteractions]);

  const requestDeleteInteraction = useCallback((postId: string, interaction: PostInteraction) => requestDeleteConfirmation({ title: interaction.interaction_type === PostInteractionType.COMMENT ? "Xóa bình luận" : "Xóa cảm xúc", description: "Bạn có chắc chắn muốn xóa tương tác này?", onConfirm: async () => handleDeleteInteraction(postId, interaction) }), [handleDeleteInteraction, requestDeleteConfirmation]);

  return { posts, filteredPosts, filterCounts, searchQuery, setSearchQuery, activeFilter, setActiveFilter, isLoading, errorMessage, loadPosts, currentUser, currentUserId, setReaction, removeReaction, addComment, isFormModalOpen, editingPost, isSaving, openCreateModal, openEditModal, closeFormModal, handleSavePost, isDetailModalOpen, selectedPost, selectedPostInteractions: selectedPost ? interactionsByPost[selectedPost.id] ?? [] : [], isInteractionsLoading, openDetailModal, closeDetailModal, handleToggleStatus, requestDeletePost, requestDeleteInteraction, DeleteConfirmationDialog };
}
