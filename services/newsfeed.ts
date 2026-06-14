import { apiClient } from "@/lib/api-client";
import {
  CreatePostInteractionPayload,
  CreatePostInteractionResponse,
  CreatePostPayload,
  DeletePostInteractionPayload,
  DeletePostInteractionResponse,
  DeletePostResponse,
  GetPostInteractionsResponse,
  GetPostResponse,
  GetPostsResponse,
  UpdatePostInteractionPayload,
  UpdatePostInteractionResponse,
  UpdatePostPayload,
  UpdatePostResponse,
  CreatePostResponse,
} from "@/types/api";

const POSTS_ENDPOINT = "/api/v1.0/posts";

interface GetPostsParams {
  currentPage?: number | string;
  pageSize?: number | string;
}

interface GetInteractionsParams {
  interaction_type?: "REACTION" | "COMMENT";
}

export const newsfeedService = {
  getPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
    return apiClient.get<GetPostsResponse>(POSTS_ENDPOINT, params);
  },

  getPost(postId: string): Promise<GetPostResponse> {
    return apiClient.get<GetPostResponse>(`${POSTS_ENDPOINT}/${postId}`);
  },

  createPost(payload: CreatePostPayload): Promise<CreatePostResponse> {
    return apiClient.post<CreatePostResponse>(POSTS_ENDPOINT, payload);
  },

  updatePost(postId: string, payload: UpdatePostPayload): Promise<UpdatePostResponse> {
    return apiClient.put<UpdatePostResponse>(`${POSTS_ENDPOINT}/${postId}`, payload);
  },

  deletePost(postId: string): Promise<DeletePostResponse> {
    return apiClient.delete<DeletePostResponse>(`${POSTS_ENDPOINT}/${postId}`);
  },

  getInteractions(
    postId: string,
    params: GetInteractionsParams = {},
  ): Promise<GetPostInteractionsResponse> {
    return apiClient.get<GetPostInteractionsResponse>(`${POSTS_ENDPOINT}/${postId}/interactions`, params);
  },

  createInteraction(
    postId: string,
    payload: CreatePostInteractionPayload,
  ): Promise<CreatePostInteractionResponse> {
    return apiClient.post<CreatePostInteractionResponse>(`${POSTS_ENDPOINT}/${postId}/interactions`, payload);
  },

  updateInteraction(
    postId: string,
    payload: UpdatePostInteractionPayload,
  ): Promise<UpdatePostInteractionResponse> {
    return apiClient.put<UpdatePostInteractionResponse>(`${POSTS_ENDPOINT}/${postId}/interactions`, payload);
  },

  deleteInteraction(
    postId: string,
    payload?: DeletePostInteractionPayload,
  ): Promise<DeletePostInteractionResponse> {
    return apiClient.delete<DeletePostInteractionResponse>(`${POSTS_ENDPOINT}/${postId}/interactions`, payload);
  },
};
