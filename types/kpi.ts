export type KPIPeriodType = "month" | "quarter";

export interface KpiActual {
  new_customers: number;
  customers_assigned: number;
  jobs_assigned: number;
  jobs_completed: number;
  job_completion_rate: number;
  revenue: number;
}

export interface KpiTarget {
  target_id?: string;
  target_revenue: string | number; // Note: API returns it as string e.g., "20000000.00"
  target_new_customers: number;
  target_jobs_completed: number;
  note?: string;
}

export interface KpiAchievement {
  revenue_rate: number;
  new_customers_rate: number;
  jobs_completed_rate: number;
}

export interface TeamKpiMember {
  user_id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  actual: KpiActual;
  target: KpiTarget | null;
  achievement: KpiAchievement | null;
}

export interface KpiSummary {
  total_revenue: number;
  total_new_customers: number;
}

// Represent the overall team KPI response
export interface TeamKpiResponse {
  period: {
    type: KPIPeriodType;
    value: number;
    year: number;
  };
  team: TeamKpiMember[];
  summary: KpiSummary;
}

export interface KpiTargetRecord {
  id: string;
  user_id: string;
  period_type: KPIPeriodType;
  period_value: number;
  year: number;
  target_revenue: string;
  target_new_customers: number;
  target_jobs_completed: number;
  note: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar: string | null;
  };
}
