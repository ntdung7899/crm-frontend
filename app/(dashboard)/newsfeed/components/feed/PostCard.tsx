"use client";

import { useMemo, useRef, useState } from "react";
import {
  FiMoreHorizontal,
  FiThumbsUp,
  FiMessageCircle,
  FiBookmark,
  FiSend,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiTrash2,
} from "react-icons/fi";
import { MyInfoResponseData } from "@/types/api";
import { Post, PostInteraction, PostInteractionType, PostStatus, ReactionType } from "@/types/newsfeed";
import { isVideoUrl, resolveMediaUrl } from "../../utils/postMappers";
import { FeedAvatar } from "./FeedAvatar";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  currentUser: MyInfoResponseData | null;
  onSetReaction: (reactionType: ReactionType) => void;
  onRemoveReaction: () => void;
  onAddComment: (content: string, parentCommentId?: string) => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onDeleteInteraction: (interaction: PostInteraction) => void;
}

const REACTIONS: { key: ReactionType; emoji: string; label: string; color: string }[] = [
  { key: ReactionType.LIKE, emoji: "👍", label: "Thích", color: "text-primary-600" },
  { key: ReactionType.LOVE, emoji: "❤️", label: "Yêu thích", color: "text-red-500" },
  { key: ReactionType.HAHA, emoji: "😆", label: "Haha", color: "text-amber-500" },
  { key: ReactionType.WOW, emoji: "😮", label: "Wow", color: "text-amber-500" },
  { key: ReactionType.SAD, emoji: "😢", label: "Buồn", color: "text-amber-500" },
  { key: ReactionType.ANGRY, emoji: "😡", label: "Phẫn nộ", color: "text-orange-600" },
];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày`;
  return date.toLocaleDateString("vi-VN");
}

export function PostCard({
  post,
  currentUserId,
  currentUser,
  onSetReaction,
  onRemoveReaction,
  onAddComment,
  onEdit,
  onToggleStatus,
  onDelete,
  onDeleteInteraction,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const pickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { reactions, comments, rootComments, repliesByParent, myReaction, reactionEmojis } = useMemo(() => {
    const reactionList = post.post_interactions.filter((i) => i.interaction_type === PostInteractionType.REACTION);
    const commentList = post.post_interactions
      .filter((i) => i.interaction_type === PostInteractionType.COMMENT)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    const repliesMap: Record<string, PostInteraction[]> = {};
    for (const c of commentList) {
      if (c.parent_comment_id) {
        (repliesMap[c.parent_comment_id] ??= []).push(c);
      }
    }
    const mine = reactionList.find((i) => i.user_id === currentUserId)?.reaction_type ?? null;
    const distinct = Array.from(new Set(reactionList.map((i) => i.reaction_type).filter(Boolean)));
    return {
      reactions: reactionList,
      comments: commentList,
      rootComments: commentList.filter((c) => !c.parent_comment_id),
      repliesByParent: repliesMap,
      myReaction: mine,
      reactionEmojis: distinct.slice(0, 3).map((rt) => REACTIONS.find((r) => r.key === rt)?.emoji ?? "👍"),
    };
  }, [post.post_interactions, currentUserId]);

  const reacted = myReaction !== null;

  const mediaList = post.media_urls.length > 0 ? post.media_urls : post.thumbnail_url ? [post.thumbnail_url] : [];
  const authorName = post.created_by_user?.full_name || "Người dùng";

  const openComments = () => {
    setCommentsOpen(true);
    setTimeout(() => commentInputRef.current?.focus(), 0);
  };

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment(text);
    setCommentText("");
  };

  const currentReaction = REACTIONS.find((r) => r.key === myReaction) ?? REACTIONS[0];

  const openPicker = () => {
    if (pickerTimer.current) clearTimeout(pickerTimer.current);
    setShowReactions(true);
  };
  const closePicker = () => {
    pickerTimer.current = setTimeout(() => setShowReactions(false), 250);
  };

  const handleLikeClick = () => {
    if (reacted) onRemoveReaction();
    else onSetReaction(ReactionType.LIKE);
  };
  const pickReaction = (key: ReactionType) => {
    onSetReaction(key);
    setShowReactions(false);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4">
        <FeedAvatar src={post.created_by_user?.avatar} name={authorName} size={42} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{authorName}</p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>{timeAgo(post.created_at)}</span>
            {post.status === PostStatus.INACTIVE && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500">Đã ẩn</span>
            )}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Tùy chọn"
          >
            <FiMoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <MenuItem icon={<FiEdit2 className="h-4 w-4" />} label="Chỉnh sửa" onClick={() => { setMenuOpen(false); onEdit(); }} />
                <MenuItem
                  icon={post.status === PostStatus.ACTIVE ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  label={post.status === PostStatus.ACTIVE ? "Ẩn bài viết" : "Hiện bài viết"}
                  onClick={() => { setMenuOpen(false); onToggleStatus(); }}
                />
                <MenuItem icon={<FiTrash2 className="h-4 w-4" />} label="Xóa bài viết" danger onClick={() => { setMenuOpen(false); onDelete(); }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 pt-2">
        {post.title && <h3 className="mb-1 text-base font-semibold text-gray-900">{post.title}</h3>}
        {post.content && <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{post.content}</p>}
      </div>

      {/* Media */}
      {mediaList.length > 0 && (
        <div className={mediaList.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}>
          {mediaList.slice(0, 4).map((url, index) => {
            const resolved = resolveMediaUrl(url);
            const showOverlay = mediaList.length > 4 && index === 3;
            return (
              <div key={`${url}-${index}`} className="relative bg-gray-100">
                {isVideoUrl(url) ? (
                  <video src={resolved} controls className="max-h-[480px] w-full bg-black object-contain" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolved}
                    alt="Ảnh bài viết"
                    className={mediaList.length === 1 ? "max-h-[480px] w-full object-cover" : "h-44 w-full object-cover"}
                  />
                )}
                {showOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-semibold text-white">
                    +{mediaList.length - 4}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Counts */}
      {(reactions.length > 0 || comments.length > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            {reactions.length > 0 && (
              <>
                <span className="flex items-center -space-x-1">
                  {reactionEmojis.map((emoji, i) => (
                    <span key={i} className="text-sm leading-none">{emoji}</span>
                  ))}
                </span>
                <span>{reactions.length}</span>
              </>
            )}
          </div>
          {comments.length > 0 && (
            <button type="button" onClick={() => setCommentsOpen((v) => !v)} className="hover:underline">
              {comments.length} bình luận
            </button>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="mx-4 grid grid-cols-3 border-t border-gray-100 py-1">
        <div className="relative" onMouseEnter={openPicker} onMouseLeave={closePicker}>
          {/* Reaction picker */}
          <div
            className={`absolute bottom-full left-0 z-30 mb-2 flex items-center gap-1 rounded-full border border-gray-100 bg-white px-2 py-1.5 shadow-xl transition-all duration-150 ${
              showReactions ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-1 scale-95 opacity-0"
            }`}
          >
            {REACTIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                title={r.label}
                onClick={() => pickReaction(r.key)}
                className="text-2xl leading-none transition-transform duration-100 hover:-translate-y-1 hover:scale-125"
              >
                {r.emoji}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleLikeClick}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-gray-100 ${
              reacted ? currentReaction.color : "text-gray-600"
            }`}
          >
            {reacted ? (
              <span className="text-base leading-none">{currentReaction.emoji}</span>
            ) : (
              <FiThumbsUp className="h-5 w-5" />
            )}
            {reacted ? currentReaction.label : "Thích"}
          </button>
        </div>
        <ActionButton icon={<FiMessageCircle className="h-5 w-5" />} label="Bình luận" onClick={openComments} />
        <ActionButton icon={<FiBookmark className="h-5 w-5" />} label="Lưu" onClick={() => {}} />
      </div>

      {/* Comments */}
      {commentsOpen && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3">
          <div className="space-y-3">
            {rootComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={repliesByParent[comment.id] ?? []}
                currentUserId={currentUserId}
                currentUser={currentUser}
                onReply={(content) => onAddComment(content, comment.id)}
                onDeleteInteraction={onDeleteInteraction}
              />
            ))}
            {comments.length === 0 && <p className="py-1 text-xs text-gray-400">Hãy là người đầu tiên bình luận.</p>}
          </div>

          {/* Comment composer */}
          <div className="mt-3 flex items-center gap-2">
            <FeedAvatar src={currentUser?.avatar} name={currentUser?.full_name || "Bạn"} size={32} />
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 focus-within:ring-primary-400">
              <input
                ref={commentInputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitComment();
                  }
                }}
                placeholder="Viết bình luận..."
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={submitComment}
                disabled={!commentText.trim()}
                className="text-primary-600 transition-colors hover:text-primary-700 disabled:text-gray-300"
                aria-label="Gửi bình luận"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-gray-100 ${
        active ? "text-primary-600" : "text-gray-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
        danger ? "text-red-600" : "text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function CommentItem({
  comment,
  replies,
  currentUserId,
  currentUser,
  onReply,
  onDeleteInteraction,
}: {
  comment: PostInteraction;
  replies: PostInteraction[];
  currentUserId: string;
  currentUser: MyInfoResponseData | null;
  onReply: (content: string) => void;
  onDeleteInteraction: (interaction: PostInteraction) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replyInputRef = useRef<HTMLInputElement>(null);

  const openReply = () => {
    setReplyOpen(true);
    setTimeout(() => replyInputRef.current?.focus(), 0);
  };
  const submitReply = () => {
    const text = replyText.trim();
    if (!text) return;
    onReply(text);
    setReplyText("");
    setReplyOpen(false);
  };

  return (
    <div className="space-y-2">
      <CommentBubble comment={comment} currentUserId={currentUserId} onReply={openReply} onDelete={() => onDeleteInteraction(comment)} />

      {(replies.length > 0 || replyOpen) && (
        <div className="ml-10 space-y-2 border-l border-gray-200 pl-3">
          {replies.map((reply) => (
            <CommentBubble
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              size="sm"
              onDelete={() => onDeleteInteraction(reply)}
            />
          ))}

          {replyOpen && (
            <div className="flex items-center gap-2 pt-0.5">
              <FeedAvatar src={currentUser?.avatar} name={currentUser?.full_name || "Bạn"} size={28} />
              <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200 focus-within:ring-primary-400">
                <input
                  ref={replyInputRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitReply();
                    }
                  }}
                  placeholder={`Trả lời ${comment.user?.full_name || "bình luận"}...`}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="text-primary-600 transition-colors hover:text-primary-700 disabled:text-gray-300"
                  aria-label="Gửi trả lời"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommentBubble({
  comment,
  currentUserId,
  onReply,
  onDelete,
  size = "md",
}: {
  comment: PostInteraction;
  currentUserId: string;
  onReply?: () => void;
  onDelete?: () => void;
  size?: "sm" | "md";
}) {
  const name = comment.user?.full_name || "Người dùng";
  const isMine = comment.user_id === currentUserId;

  return (
    <div className="group flex items-start gap-2">
      <FeedAvatar src={comment.user?.avatar} name={name} size={size === "sm" ? 28 : 32} />
      <div className="min-w-0 flex-1">
        <div className="inline-block rounded-2xl bg-gray-100 px-3 py-2">
          <p className="text-xs font-semibold text-gray-900">{name}</p>
          <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{comment.content}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-3 pl-1 text-[11px] text-gray-400">
          <span>{timeAgo(comment.created_at)}</span>
          {onReply && (
            <button type="button" onClick={onReply} className="font-medium hover:text-gray-600">
              Trả lời
            </button>
          )}
          {isMine && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
