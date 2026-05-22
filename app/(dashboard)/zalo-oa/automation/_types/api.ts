export type AutomationStatus = "draft" | "active" | "paused";
export type ApiNodeType = "trigger" | "condition" | "action" | "delay" | "end";
export type DelayUnit = "minute" | "hour" | "day" | "week";
export type TriggerType = "customer_created" | "zalo_follow" | "zalo_message";
export type ActionType = "send_zalo_message" | "create_task";
export type ConditionResult = "default" | "true" | "false" | null;

export interface ApiResponse<T> {
  status: boolean | "success" | "error";
  data?: T | null;
  responseData?: T | null;
  message?: string;
  message_en?: string;
}

export interface PaginatedResponse<T> {
  rows: T[];
  count: number;
  currentPage: number;
  totalPages: number;
}

export interface AutomationHeader {
  id: string;
  name: string;
  description: string | null;
  trigger_name: string;
  status: AutomationStatus;
  run_count: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationApiNode {
  id: string;
  automation_id: string;
  node_type: ApiNodeType;
  name: string;
  description: string | null;
  trigger_type: TriggerType | null;
  action_type: ActionType | null;
  delay_value?: number | null;
  delay_unit?: DelayUnit | null;
  config?: Record<string, unknown> | null;
  position_x?: number | null;
  position_y?: number | null;
  sort_order?: number | null;
  is_active: boolean;
}

export interface AutomationApiEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  condition_result: ConditionResult;
}

export interface AutomationDetail {
  automation: AutomationHeader;
  nodes: AutomationApiNode[];
  edges: AutomationApiEdge[];
}

export interface AutomationNodeInput {
  temp_id: string;
  node_type: ApiNodeType;
  name: string;
  description?: string | null;
  trigger_type?: TriggerType | null;
  action_type?: ActionType | null;
  delay_value?: number;
  delay_unit?: DelayUnit;
  config?: Record<string, unknown>;
  position_x: number;
  position_y: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface AutomationEdgeInput {
  source_node_temp_id: string;
  target_node_temp_id: string;
  condition_result?: ConditionResult;
}

export interface AutomationSaveBody {
  name: string;
  description?: string | null;
  trigger_name: string;
  automation: {
    name: string;
    description?: string | null;
    trigger_name: string;
  };
  nodes: AutomationNodeInput[];
  edges: AutomationEdgeInput[];
}

export interface CreateAutomationResponse {
  id: string;
  tempIdMap: Record<string, string>;
}

export interface AutomationListParams {
  status?: "all" | AutomationStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TestRunLog {
  nodeId: string;
  nodeName: string;
  nodeType: ApiNodeType;
  status: "success" | "failed" | "skipped";
  output: Record<string, unknown>;
}

export interface TestRunResult {
  executionId: string;
  finalStatus: "success" | "failed";
  logs: TestRunLog[];
}
