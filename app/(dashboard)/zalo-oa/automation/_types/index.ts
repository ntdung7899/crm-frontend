export type NodeType = "trigger" | "condition" | "action" | "delay" | "end";

export interface AutomationNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, unknown>;
}

export interface AutomationEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface AutomationFlow {
  id: string;
  name: string;
  trangThai: "active" | "inactive" | "draft";
  trigger: string;
  /** null/undefined = áp dụng cho mọi OA */
  oaId?: string | null;
  soLuotChay: number;
  tiLeThanhCong: number;
  nguoiTao: string;
  ngayTao: string;
  ngayCapNhat: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}

export interface AutomationTemplate {
  id: string;
  name: string;
  moTa: string;
  category: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}
