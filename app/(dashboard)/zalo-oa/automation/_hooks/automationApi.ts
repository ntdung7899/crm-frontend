import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AutomationDetail,
  AutomationHeader,
  AutomationListParams,
  AutomationSaveBody,
  AutomationStatus,
  CreateAutomationResponse,
  PaginatedResponse,
  TestRunResult,
} from "../_types/api";

const AUTOMATIONS_ENDPOINT = "/api/v1.0/automations";

function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  const isSuccess = response.status === true || response.status === "success";
  const data = response.data ?? response.responseData ?? null;

  if (!isSuccess || data === null) {
    throw new Error(response.message || "Automation API request failed");
  }

  return data;
}

function cleanParams(params: AutomationListParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export async function getAutomations(params: AutomationListParams) {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<AutomationHeader>>>(
    AUTOMATIONS_ENDPOINT,
    cleanParams(params),
  );

  return unwrapApiResponse(response);
}

export async function getAutomationDetail(id: string) {
  const response = await apiClient.get<ApiResponse<AutomationDetail>>(
    `${AUTOMATIONS_ENDPOINT}/${id}`,
  );

  return unwrapApiResponse(response);
}

export async function createAutomation(body: AutomationSaveBody) {
  const response = await apiClient.post<ApiResponse<CreateAutomationResponse>>(
    AUTOMATIONS_ENDPOINT,
    body,
  );

  return unwrapApiResponse(response);
}

export async function updateAutomation(id: string, body: AutomationSaveBody) {
  const response = await apiClient.put<ApiResponse<CreateAutomationResponse | { updated: boolean }>>(
    `${AUTOMATIONS_ENDPOINT}/${id}`,
    body,
  );

  return unwrapApiResponse(response);
}

export async function deleteAutomation(id: string) {
  const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
    `${AUTOMATIONS_ENDPOINT}/${id}`,
  );

  return unwrapApiResponse(response);
}

export async function changeAutomationStatus(id: string, status: AutomationStatus) {
  const response = await apiClient.patch<ApiResponse<{ updated: boolean }>>(
    `${AUTOMATIONS_ENDPOINT}/${id}/status`,
    { status },
  );

  return unwrapApiResponse(response);
}

export async function testRunAutomation(id: string, payload: Record<string, unknown>) {
  const response = await apiClient.post<ApiResponse<TestRunResult>>(
    `${AUTOMATIONS_ENDPOINT}/${id}/test-run`,
    { payload },
  );

  return unwrapApiResponse(response);
}
