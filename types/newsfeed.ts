// Newsfeed / Posts Types - Based on Backend Models

export enum PostStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum PostInteractionType {
  REACTION = "REACTION",
  COMMENT = "COMMENT",
}

export enum ReactionType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  HAHA = "HAHA",
  WOW = "WOW",
  SAD = "SAD",
  ANGRY = "ANGRY",
}

export interface PostAuthorRef {
  id: string;
  full_name: string;
  avatar?: string | null;
}

export interface PostInteraction {
  id: string;
  post_id?: string;
  user_id: string;
  interaction_type: PostInteractionType;
  reaction_type?: ReactionType | null;
  content?: string | null;
  parent_comment_id?: string | null;
  status?: PostStatus | string;
  created_at: Date;
  updated_at?: Date;
  user?: PostAuthorRef | null;
}

export interface Post {
  id: string;
  title?: string | null;
  content: string;
  thumbnail_url?: string | null;
  media_urls: string[];
  status: PostStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  created_by_user?: PostAuthorRef | null;
  post_interactions: PostInteraction[];
  reaction_count: number;
  comment_count: number;
  /** Rỗng = mọi người xem được; có ID = chỉ user thuộc quyền đó xem được. */
  view_permission_ids: string[];
}
