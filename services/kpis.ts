import { apiClient } from "@/lib/api-client";
import { TeamKpiResponse } from "@/types/kpi";
import { ApiEnvelope, PaginatedRows } from "@/types/api";

const KPI_TEAM_ENDPOINT = "/api/v1.0/kpi/team";
const KPI_TARGET_ENDPOINT = "/api/v1.0/kpi/target";
const KPI_SUMMARY_ENDPOINT = "/api/v1.0/kpi/summary";

export interface CreateKpiTargetPayload {
    user_id: string;
    period_type: "month" | "quarter";
    period_value: number;
    year: number;
    target_revenue?: number;
    target_new_customers?: number;
    target_jobs_completed?: number;
    note?: string;
}

export const kpiService = {
    async getTeamKpis(year: number, periodType: string, periodValue: number): Promise<ApiEnvelope<TeamKpiResponse>> {
        return apiClient.get<ApiEnvelope<TeamKpiResponse>>(
            KPI_TEAM_ENDPOINT,
            { year, periodType, periodValue, period_type: periodType, period_value: periodValue, t: Date.now() },
            { headers: { isadmin: 'true', 'Cache-Control': 'no-cache' } }
        );
    },

    async getMyKpiSummary(year: number, periodType: string, periodValue: number): Promise<ApiEnvelope<any>> {
        return apiClient.get<ApiEnvelope<any>>(
            KPI_SUMMARY_ENDPOINT, 
            { year, periodType, periodValue, period_type: periodType, period_value: periodValue, t: Date.now() }, 
            { headers: { 'Cache-Control': 'no-cache' } }
        );
    },

    async createKpiTarget(payload: CreateKpiTargetPayload): Promise<ApiEnvelope<any>> {
        return apiClient.post<ApiEnvelope<any>>(
            KPI_TARGET_ENDPOINT,
            payload,
            { headers: { isadmin: 'true' } }
        );
    },

    async updateKpiTarget(id: string, payload: Partial<CreateKpiTargetPayload>): Promise<ApiEnvelope<any>> {
        return apiClient.put<ApiEnvelope<any>>(
            `${KPI_TARGET_ENDPOINT}/${id}`,
            payload,
            { headers: { isadmin: 'true' } }
        );
    }
};
