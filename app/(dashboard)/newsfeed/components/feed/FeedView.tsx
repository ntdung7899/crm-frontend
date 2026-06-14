"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useNewsfeedPage } from "../../hooks/useNewsfeedPage";
import { PostFormModal } from "../forms/PostFormModal";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";

export function FeedView() {
  const page = useNewsfeedPage();
  const DeleteConfirmationDialog = page.DeleteConfirmationDialog;

  return (
    <div className="space-y-4">
      <PostComposer currentUser={page.currentUser} onCreate={page.openCreateModal} />

      {page.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : page.errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{page.errorMessage}</div>
      ) : page.posts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
        </div>
      ) : (
        page.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={page.currentUserId}
            currentUser={page.currentUser}
            onSetReaction={(reactionType) => void page.setReaction(post, reactionType)}
            onRemoveReaction={() => void page.removeReaction(post)}
            onAddComment={(content, parentCommentId) => void page.addComment(post, content, parentCommentId)}
            onEdit={() => page.openEditModal(post)}
            onToggleStatus={() => void page.handleToggleStatus(post)}
            onDelete={() => page.requestDeletePost(post)}
            onDeleteInteraction={(interaction) => page.requestDeleteInteraction(post.id, interaction)}
          />
        ))
      )}

      <PostFormModal
        isOpen={page.isFormModalOpen}
        onClose={page.closeFormModal}
        onSave={page.handleSavePost}
        post={page.editingPost}
        isSaving={page.isSaving}
      />

      <DeleteConfirmationDialog />
    </div>
  );
}
