"use client";

import { useState, useCallback, useEffect } from "react";
import type { AutomationFlow, AutomationTemplate, AutomationNode, AutomationEdge, NodeType } from "../_types";
import type { AutomationDetail, AutomationHeader, AutomationSaveBody, AutomationStatus, ConditionResult } from "../_types/api";
import {
  changeAutomationStatus,
  createAutomation,
  deleteAutomation,
  getAutomationDetail,
  getAutomations,
  updateAutomation,
} from "./automationApi";

// ── Seed data ──────────────────────────────────────────────────────────────

const SEED_FLOWS: AutomationFlow[] = [
  {
    id: "f1",
    name: "Chào mừng khách hàng mới",
    trangThai: "active",
    trigger: "Theo dõi OA",
    soLuotChay: 142,
    tiLeThanhCong: 87,
    nguoiTao: "Nguyễn Thị Lan",
    ngayTao: "2024-01-10",
    ngayCapNhat: "2024-03-15",
    nodes: [
      { id: "n1", type: "trigger", label: "Theo dõi OA", x: 300, y: 60, config: { event: "follow_oa" } },
      { id: "n2", type: "action", label: "Gửi tin Zalo", x: 300, y: 200, config: { action: "send_zalo", message: "Xin chào! Cảm ơn bạn đã theo dõi." } },
      { id: "n3", type: "delay", label: "Chờ 1 ngày", x: 300, y: 340, config: { unit: "day", amount: 1 } },
      { id: "n4", type: "action", label: "Gán tag KH mới", x: 300, y: 480, config: { action: "add_tag", tag: "KH mới" } },
      { id: "n5", type: "end", label: "Kết thúc", x: 300, y: 620, config: {} },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" },
      { id: "e4", from: "n4", to: "n5" },
    ],
  },
  {
    id: "f2",
    name: "Nhắc nhở đơn hàng bỏ giỏ",
    trangThai: "active",
    trigger: "Bỏ giỏ hàng",
    soLuotChay: 89,
    tiLeThanhCong: 62,
    nguoiTao: "Trần Văn Minh",
    ngayTao: "2024-02-01",
    ngayCapNhat: "2024-03-20",
    nodes: [
      { id: "n1", type: "trigger", label: "Bỏ giỏ hàng", x: 300, y: 60, config: { event: "cart_abandon" } },
      { id: "n2", type: "delay", label: "Chờ 2 giờ", x: 300, y: 200, config: { unit: "hour", amount: 2 } },
      { id: "n3", type: "action", label: "Gửi nhắc nhở", x: 300, y: 340, config: { action: "send_zalo", message: "Bạn còn sản phẩm trong giỏ hàng!" } },
      { id: "n4", type: "end", label: "Kết thúc", x: 300, y: 480, config: {} },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" },
    ],
  },
  {
    id: "f3",
    name: "Upsell sau mua hàng",
    trangThai: "inactive",
    trigger: "Hoàn thành đơn hàng",
    soLuotChay: 230,
    tiLeThanhCong: 45,
    nguoiTao: "Lê Thị Hoa",
    ngayTao: "2024-01-20",
    ngayCapNhat: "2024-02-28",
    nodes: [
      { id: "n1", type: "trigger", label: "Hoàn thành đơn", x: 300, y: 60, config: { event: "order_complete" } },
      { id: "n2", type: "delay", label: "Chờ 3 ngày", x: 300, y: 200, config: { unit: "day", amount: 3 } },
      { id: "n3", type: "condition", label: "Đã mua >500k?", x: 300, y: 340, config: { field: "order_value", op: "gt", value: "500000" } },
      { id: "n4", type: "action", label: "Gửi offer VIP", x: 180, y: 480, config: { action: "send_zalo", message: "Ưu đãi VIP dành riêng cho bạn!" } },
      { id: "n5", type: "action", label: "Gửi offer thường", x: 420, y: 480, config: { action: "send_zalo", message: "Khám phá sản phẩm mới nhé!" } },
      { id: "n6", type: "end", label: "Kết thúc", x: 300, y: 620, config: {} },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4", label: "Có" },
      { id: "e4", from: "n3", to: "n5", label: "Không" },
      { id: "e5", from: "n4", to: "n6" },
      { id: "e6", from: "n5", to: "n6" },
    ],
  },
  {
    id: "f4",
    name: "Chăm sóc sinh nhật",
    trangThai: "draft",
    trigger: "Sinh nhật khách hàng",
    soLuotChay: 0,
    tiLeThanhCong: 0,
    nguoiTao: "Phạm Văn Đức",
    ngayTao: "2024-03-01",
    ngayCapNhat: "2024-03-25",
    nodes: [
      { id: "n1", type: "trigger", label: "Sinh nhật KH", x: 300, y: 60, config: { event: "birthday" } },
      { id: "n2", type: "action", label: "Gửi lời chúc", x: 300, y: 200, config: { action: "send_zalo", message: "Chúc mừng sinh nhật! Tặng bạn voucher 10%." } },
      { id: "n3", type: "end", label: "Kết thúc", x: 300, y: 340, config: {} },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
    ],
  },
];

const SEED_TEMPLATES: AutomationTemplate[] = [
  {
    id: "t1",
    name: "Chào mừng theo dõi OA",
    moTa: "Tự động gửi tin chào mừng khi khách theo dõi OA",
    category: "welcome",
    nodes: [
      { id: "n1", type: "trigger", label: "Theo dõi OA", x: 300, y: 60, config: { event: "follow_oa" } },
      { id: "n2", type: "action", label: "Gửi tin chào mừng", x: 300, y: 200, config: { action: "send_zalo" } },
      { id: "n3", type: "end", label: "Kết thúc", x: 300, y: 340, config: {} },
    ],
    edges: [{ id: "e1", from: "n1", to: "n2" }, { id: "e2", from: "n2", to: "n3" }],
  },
  {
    id: "t2",
    name: "Chuỗi chào mừng 3 ngày",
    moTa: "Gửi 3 tin trong 3 ngày đầu sau khi theo dõi",
    category: "welcome",
    nodes: [
      { id: "n1", type: "trigger", label: "Theo dõi OA", x: 300, y: 60, config: { event: "follow_oa" } },
      { id: "n2", type: "action", label: "Gửi tin ngày 1", x: 300, y: 200, config: { action: "send_zalo" } },
      { id: "n3", type: "delay", label: "Chờ 1 ngày", x: 300, y: 340, config: { unit: "day", amount: 1 } },
      { id: "n4", type: "action", label: "Gửi tin ngày 2", x: 300, y: 480, config: { action: "send_zalo" } },
      { id: "n5", type: "delay", label: "Chờ 1 ngày", x: 300, y: 620, config: { unit: "day", amount: 1 } },
      { id: "n6", type: "action", label: "Gửi tin ngày 3", x: 300, y: 760, config: { action: "send_zalo" } },
      { id: "n7", type: "end", label: "Kết thúc", x: 300, y: 900, config: {} },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" }, { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" }, { id: "e4", from: "n4", to: "n5" },
      { id: "e5", from: "n5", to: "n6" }, { id: "e6", from: "n6", to: "n7" },
    ],
  },
  {
    id: "t3",
    name: "Nhắc nhở giỏ hàng bỏ quên",
    moTa: "Gửi tin nhắc sau 2h khi khách bỏ giỏ hàng",
    category: "nurture",
    nodes: [
      { id: "n1", type: "trigger", label: "Bỏ giỏ hàng", x: 300, y: 60, config: { event: "cart_abandon" } },
      { id: "n2", type: "delay", label: "Chờ 2 giờ", x: 300, y: 200, config: { unit: "hour", amount: 2 } },
      { id: "n3", type: "action", label: "Gửi nhắc nhở", x: 300, y: 340, config: { action: "send_zalo" } },
      { id: "n4", type: "end", label: "Kết thúc", x: 300, y: 480, config: {} },
    ],
    edges: [{ id: "e1", from: "n1", to: "n2" }, { id: "e2", from: "n2", to: "n3" }, { id: "e3", from: "n3", to: "n4" }],
  },
  {
    id: "t4",
    name: "Upsell sau mua hàng",
    moTa: "Gợi ý sản phẩm liên quan sau khi hoàn thành đơn",
    category: "upsell",
    nodes: [
      { id: "n1", type: "trigger", label: "Hoàn thành đơn", x: 300, y: 60, config: { event: "order_complete" } },
      { id: "n2", type: "delay", label: "Chờ 3 ngày", x: 300, y: 200, config: { unit: "day", amount: 3 } },
      { id: "n3", type: "action", label: "Gửi gợi ý SP", x: 300, y: 340, config: { action: "send_zalo" } },
      { id: "n4", type: "end", label: "Kết thúc", x: 300, y: 480, config: {} },
    ],
    edges: [{ id: "e1", from: "n1", to: "n2" }, { id: "e2", from: "n2", to: "n3" }, { id: "e3", from: "n3", to: "n4" }],
  },
  {
    id: "t5",
    name: "Chúc mừng sinh nhật",
    moTa: "Tự động gửi lời chúc và voucher vào ngày sinh nhật",
    category: "nurture",
    nodes: [
      { id: "n1", type: "trigger", label: "Sinh nhật KH", x: 300, y: 60, config: { event: "birthday" } },
      { id: "n2", type: "action", label: "Gửi lời chúc + voucher", x: 300, y: 200, config: { action: "send_zalo" } },
      { id: "n3", type: "end", label: "Kết thúc", x: 300, y: 340, config: {} },
    ],
    edges: [{ id: "e1", from: "n1", to: "n2" }, { id: "e2", from: "n2", to: "n3" }],
  },
  {
    id: "t6",
    name: "Nhắc nhở gia hạn dịch vụ",
    moTa: "Nhắc khách hàng 7 ngày trước khi hết hạn",
    category: "reminder",
    nodes: [
      { id: "n1", type: "trigger", label: "Sắp hết hạn DV", x: 300, y: 60, config: { event: "service_expiry", daysBefore: 7 } },
      { id: "n2", type: "action", label: "Gửi tin nhắc hạn", x: 300, y: 200, config: { action: "send_zalo" } },
      { id: "n3", type: "delay", label: "Chờ 3 ngày", x: 300, y: 340, config: { unit: "day", amount: 3 } },
      { id: "n4", type: "condition", label: "Đã gia hạn?", x: 300, y: 480, config: { field: "renewed", op: "eq", value: "true" } },
      { id: "n5", type: "end", label: "Đã gia hạn - Kết thúc", x: 160, y: 620, config: {} },
      { id: "n6", type: "action", label: "Nhắc lần 2", x: 440, y: 620, config: { action: "send_zalo" } },
      { id: "n7", type: "end", label: "Kết thúc", x: 440, y: 760, config: {} },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" }, { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" },
      { id: "e4", from: "n4", to: "n5", label: "Có" },
      { id: "e5", from: "n4", to: "n6", label: "Không" },
      { id: "e6", from: "n6", to: "n7" },
    ],
  },
];

// ── Hook ───────────────────────────────────────────────────────────────────

let nextId = 100;
const genId = (prefix: string) => `${prefix}${++nextId}`;

const statusToUi = (status: AutomationStatus): AutomationFlow["trangThai"] => status === "paused" ? "inactive" : status;
const conditionResultFromLabel = (label?: string): ConditionResult => {
  if (label === "true" || label === "Có") return "true";
  if (label === "false" || label === "Không") return "false";
  return "default";
};

function toUiFlow(header: AutomationHeader, detail?: AutomationDetail): AutomationFlow {
  return {
    id: header.id,
    name: header.name,
    trangThai: statusToUi(header.status),
    trigger: header.trigger_name,
    soLuotChay: header.run_count,
    tiLeThanhCong: Math.round(header.success_rate),
    nguoiTao: header.created_by_name,
    ngayTao: header.created_at.slice(0, 10),
    ngayCapNhat: header.updated_at.slice(0, 10),
    nodes: detail?.nodes.map((node) => ({
      id: node.id,
      type: node.node_type,
      label: node.name,
      x: node.position_x ?? 0,
      y: node.position_y ?? 0,
      config: {
        ...(node.config ?? {}),
        event: node.trigger_type ?? (node.config?.event as string | undefined),
        action: node.action_type === "send_zalo_message" ? "send_zalo" : node.action_type ?? (node.config?.action as string | undefined),
        amount: node.delay_value?.toString() ?? (node.config?.amount as string | undefined),
        unit: node.delay_unit ?? (node.config?.unit as string | undefined),
      },
    })) ?? [],
    edges: detail?.edges.map((edge) => ({
      id: edge.id,
      from: edge.source_node_id,
      to: edge.target_node_id,
      label: edge.condition_result && edge.condition_result !== "default" ? edge.condition_result : undefined,
    })) ?? [],
  };
}

function toApiBody(name: string, nodes: AutomationNode[], edges: AutomationEdge[]): AutomationSaveBody {
  const triggerNode = nodes.find((node) => node.type === "trigger");

  const triggerName = triggerNode?.label || "Chưa cấu hình";

  return {
    name,
    trigger_name: triggerName,
    automation: {
      name,
      trigger_name: triggerName,
    },
    nodes: nodes.map((node, index) => {
      const config = { ...node.config };
      const event = typeof config.event === "string" ? config.event : undefined;
      const action = typeof config.action === "string" ? config.action : undefined;
      const amount = Number(config.amount);

      return {
        temp_id: node.id,
        node_type: node.type,
        name: node.label,
        trigger_type: node.type === "trigger"
          ? event === "follow_oa" ? "zalo_follow" : event === "send_message" ? "zalo_message" : "customer_created"
          : null,
        action_type: node.type === "action" ? action === "create_task" ? "create_task" : "send_zalo_message" : null,
        delay_value: node.type === "delay" && Number.isFinite(amount) ? amount : undefined,
        delay_unit: node.type === "delay" && ["minute", "hour", "day", "week"].includes(String(config.unit)) ? config.unit as "minute" | "hour" | "day" | "week" : undefined,
        config,
        position_x: node.x,
        position_y: node.y,
        sort_order: index,
        is_active: true,
      };
    }),
    edges: edges.map((edge) => ({
      source_node_temp_id: edge.from,
      target_node_temp_id: edge.to,
      condition_result: conditionResultFromLabel(edge.label),
    })),
  };
}

export function useMarketingAutomation() {
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [search, setSearch] = useState("");
  const [trangThaiFilter, setTrangThaiFilter] = useState<"all" | "active" | "inactive" | "draft">("all");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [editingFlow, setEditingFlow] = useState<AutomationFlow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Builder state
  const [builderNodes, setBuilderNodes] = useState<AutomationNode[]>([]);
  const [builderEdges, setBuilderEdges] = useState<AutomationEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [builderName, setBuilderName] = useState("");
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const templates = SEED_TEMPLATES;

  const loadFlows = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const status = trangThaiFilter === "inactive" ? "paused" : trangThaiFilter;
      const data = await getAutomations({ status, search: search || undefined, page: 1, limit: 200 });
      setFlows(data.rows.map((row) => toUiFlow(row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách automation");
    } finally {
      setIsLoading(false);
    }
  }, [search, trangThaiFilter]);

  useEffect(() => {
    void loadFlows();
  }, [loadFlows]);

  // List handlers
  const onDelete = useCallback(async (id: string) => {
    await deleteAutomation(id);
    setFlows((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const onToggleStatus = useCallback(async (id: string) => {
    const current = flows.find((flow) => flow.id === id);
    if (!current) return;

    const nextStatus = current.trangThai === "active" ? "paused" : "active";
    await changeAutomationStatus(id, nextStatus);
    setFlows((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, trangThai: statusToUi(nextStatus) }
          : f,
      ),
    );
  }, [flows]);

  const onEdit = useCallback(async (flow: AutomationFlow) => {
    setError(null);
    try {
      const detail = await getAutomationDetail(flow.id);
      const fullFlow = toUiFlow(detail.automation, detail);
      setEditingFlow(fullFlow);
      setBuilderNodes(fullFlow.nodes.map((n) => ({ ...n })));
      setBuilderEdges(fullFlow.edges.map((e) => ({ ...e })));
      setBuilderName(fullFlow.name);
      setSelectedNodeId(null);
      setConnectingFrom(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được chi tiết automation");
    }
  }, []);

  const onCreate = useCallback((template?: AutomationTemplate) => {
    setShowTemplatePicker(false);
    const now = new Date().toISOString().slice(0, 10);
    const newFlow: AutomationFlow = {
      id: genId("f"),
      name: template?.name ?? "Automation mới",
      trangThai: "draft",
      trigger: template?.nodes[0]?.label ?? "Chưa cấu hình",
      soLuotChay: 0,
      tiLeThanhCong: 0,
      nguoiTao: "Admin",
      ngayTao: now,
      ngayCapNhat: now,
      nodes: template ? template.nodes.map((n) => ({ ...n })) : [
        { id: "n1", type: "trigger", label: "Chọn trigger", x: 300, y: 60, config: {} },
        { id: "n2", type: "end", label: "Kết thúc", x: 300, y: 200, config: {} },
      ],
      edges: template ? template.edges.map((e) => ({ ...e })) : [
        { id: "e1", from: "n1", to: "n2" },
      ],
    };
    setEditingFlow(newFlow);
    setBuilderNodes(newFlow.nodes.map((n) => ({ ...n })));
    setBuilderEdges(newFlow.edges.map((e) => ({ ...e })));
    setBuilderName(newFlow.name);
    setSelectedNodeId(null);
    setConnectingFrom(null);
  }, []);

  const onBack = useCallback(() => {
    setEditingFlow(null);
    setSelectedNodeId(null);
    setConnectingFrom(null);
  }, []);

  const saveFlow = useCallback(async () => {
    if (!editingFlow) return;

    const body = toApiBody(builderName, builderNodes, builderEdges);

    try {
      const isExisting = flows.some((flow) => flow.id === editingFlow.id);
      if (isExisting) {
        await updateAutomation(editingFlow.id, body);
      } else {
        await createAutomation(body);
      }

      await loadFlows();
      setEditingFlow(null);
      setSelectedNodeId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được automation");
    }
  }, [editingFlow, builderName, builderNodes, builderEdges, flows, loadFlows]);

  // Builder node/edge handlers
  const addNode = useCallback((type: NodeType) => {
    const labels: Record<NodeType, string> = {
      trigger: "Trigger mới",
      condition: "Điều kiện",
      action: "Hành động",
      delay: "Chờ",
      end: "Kết thúc",
    };
    const newNode: AutomationNode = {
      id: genId("n"),
      type,
      label: labels[type],
      x: 100 + Math.random() * 200,
      y: 100 + builderNodes.length * 140,
      config: {},
    };
    setBuilderNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  }, [builderNodes.length]);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setBuilderNodes((prev) => prev.map((n) => n.id === id ? { ...n, x, y } : n));
  }, []);

  const updateNodeConfig = useCallback((id: string, patch: Record<string, unknown>) => {
    setBuilderNodes((prev) =>
      prev.map((n) => n.id === id ? { ...n, ...patch, config: { ...n.config, ...patch.config as Record<string, unknown> } } : n),
    );
  }, []);

  const deleteNode = useCallback((id: string) => {
    setBuilderNodes((prev) => prev.filter((n) => n.id !== id));
    setBuilderEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setSelectedNodeId(null);
  }, []);

  const addEdge = useCallback((from: string, to: string) => {
    const exists = builderEdges.some((e) => e.from === from && e.to === to);
    if (!exists && from !== to) {
      setBuilderEdges((prev) => [...prev, { id: genId("e"), from, to }]);
    }
    setConnectingFrom(null);
  }, [builderEdges]);

  const deleteEdge = useCallback((id: string) => {
    setBuilderEdges((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const filteredFlows = flows;

  return {
    // list
    flows, filteredFlows, search, setSearch,
    trangThaiFilter, setTrangThaiFilter,
    isLoading, error,
    showTemplatePicker, setShowTemplatePicker,
    templates,
    onDelete, onToggleStatus, onEdit, onCreate,
    // builder
    editingFlow,
    builderName, setBuilderName,
    builderNodes, builderEdges,
    selectedNodeId, setSelectedNodeId,
    connectingFrom, setConnectingFrom,
    addNode, updateNodePosition, updateNodeConfig, deleteNode,
    addEdge, deleteEdge,
    saveFlow, onBack,
  };
}

export type UseMarketingAutomationReturn = ReturnType<typeof useMarketingAutomation>;
