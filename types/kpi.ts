export type KPIPeriodType = "MONTHLY" | "QUARTERLY" | "YEARLY";
export type KPIStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED" | "OVERACHIEVED";
export type KPIType = "MANUAL" | "AUTOMATIC";

export interface KPI {
  id: string;
  user_id: string;
  user_full_name: string;
  user_role: string;
  kpi_name: string;
  description?: string;
  kpi_type: KPIType;
  related_module?: string;
  target_value: number;
  unit: string;
  current_value: number;
  completion_percentage: number;
  status: KPIStatus;
  period_type: KPIPeriodType;
  period: number;
  year: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KPIStats {
  total_kpis: number;
  completed_kpis: number;
  in_progress_kpis: number;
  failed_kpis: number;
  overachieved_kpis: number;
  average_completion_rate: number;
  completion_rate_by_status: Record<KPIStatus, number>;
}
