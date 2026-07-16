import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAccessTokenSession,
} from "@/lib/auth-session";
import {
  RefreshAccessTokenPayload,
  RefreshAccessTokenResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const AUTH_REFRESH_ENDPOINT = "/api/v1.0/auth/genNewAccessToken";
const AUTH_LOGIN_ENDPOINT = "/api/v1.0/auth/login";
const AUTH_REGISTER_ENDPOINT = "/api/v1.0/auth/register";

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getRequestHeaders(
    headers?: HeadersInit,
    accessToken?: string,
  ): Headers {
    const requestHeaders = new Headers(headers);

    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    return requestHeaders;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.executeRefreshTokenRequest();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async executeRefreshTokenRequest(): Promise<string | null> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const payload: RefreshAccessTokenPayload = { refreshToken };
      const response = await fetch(`${this.baseUrl}${AUTH_REFRESH_ENDPOINT}`, {
        method: "POST",
        headers: this.getRequestHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as RefreshAccessTokenResponse;
      const nextAccessToken = data.responseData?.accessToken;
      const nextExpiresIn = data.responseData?.expiresIn;

      if (!nextAccessToken) {
        return null;
      }

      setAccessTokenSession(nextAccessToken, nextExpiresIn ?? "");
      return nextAccessToken;
    } catch (error) {
      console.error("Refresh access token failed:", error);
      return null;
    }
  }

  private redirectToLoginIfNeeded(endpoint: string): void {
    if (typeof window === "undefined") {
      return;
    }

    if (
      endpoint === AUTH_LOGIN_ENDPOINT ||
      endpoint === AUTH_REGISTER_ENDPOINT
    ) {
      return;
    }

    window.location.href = "/auth/login";
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    retryOnUnauthorized = true,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const accessToken = getAccessToken();

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getRequestHeaders(
          options?.headers,
          accessToken || undefined,
        ),
      });

      if (
        response.status === 401 &&
        retryOnUnauthorized &&
        endpoint !== AUTH_REFRESH_ENDPOINT
      ) {
        const refreshedAccessToken = await this.refreshAccessToken();

        if (refreshedAccessToken) {
          return this.request<T>(
            endpoint,
            {
              ...options,
              headers: this.getRequestHeaders(
                options?.headers,
                refreshedAccessToken,
              ),
            },
            false,
          );
        }

        clearAuthSession();
        this.redirectToLoginIfNeeded(endpoint);
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthSession();
          this.redirectToLoginIfNeeded(endpoint);
        }

        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>, config?: RequestInit): Promise<T> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.request<T>(`${endpoint}${queryString}`, {
      ...config,
      method: "GET",
    });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async upload<T>(
    endpoint: string,
    file: File,
    fieldName = "file",
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    const accessToken = getAccessToken();
    const headers = new Headers();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`,
      );
    }
    return await response.json();
  }

  async downloadBlob(endpoint: string, data?: any): Promise<Blob> {
    const accessToken = getAccessToken();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`Export failed! status: ${response.status}`);
    }
    return await response.blob();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
