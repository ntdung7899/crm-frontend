import { Post, PostInteraction, PostInteractionType, PostStatus, ReactionType } from "@/types/newsfeed";
import { PostApiRow, PostInteractionApiRow } from "@/types/api";

function parseDate(date: string | null | undefined): Date {
  return date ? new Date(date) : new Date();
}

function normalizeInteractionType(type: string): PostInteractionType {
  return type === PostInteractionType.COMMENT ? PostInteractionType.COMMENT : PostInteractionType.REACTION;
}

function normalizeReactionType(type: string | null | undefined): ReactionType | null {
  if (!type) return null;
  const upper = type.toUpperCase();
  return (Object.values(ReactionType) as string[]).includes(upper) ? (upper as ReactionType) : null;
}

export function mapInteractionRowToPostInteraction(row: PostInteractionApiRow): PostInteraction {
  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    interaction_type: normalizeInteractionType(row.interaction_type),
    reaction_type: normalizeReactionType(row.reaction_type),
    content: row.content ?? null,
    parent_comment_id: row.parent_comment_id ?? null,
    status: row.status,
    created_at: parseDate(row.created_at),
    updated_at: row.updated_at ? parseDate(row.updated_at) : undefined,
    user: row.user ?? null,
  };
}

export function mapApiRowToPost(row: PostApiRow): Post {
  const interactions = (row.post_interactions ?? []).map(mapInteractionRowToPostInteraction);
  const createdAt = parseDate(row.created_at);

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    thumbnail_url: row.thumbnail_url,
    media_urls: row.media_urls ?? [],
    status: row.status === PostStatus.INACTIVE ? PostStatus.INACTIVE : PostStatus.ACTIVE,
    created_by: row.created_by,
    created_at: createdAt,
    updated_at: row.updated_at ? parseDate(row.updated_at) : createdAt,
    created_by_user: row.created_by_user ?? null,
    post_interactions: interactions,
    reaction_count: interactions.filter((i) => i.interaction_type === PostInteractionType.REACTION).length,
    comment_count: interactions.filter((i) => i.interaction_type === PostInteractionType.COMMENT).length,
    view_permission_ids: row.view_permission_ids ?? [],
  };
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (!baseUrl) return url;

  return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}
