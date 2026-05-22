"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiPlus, FiTrash2, FiPlay } from "react-icons/fi";
import { ChevronDown, FileText, Info, Mail, MoreVertical, RefreshCw, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TablePagination } from "@/components/ui/TablePagination";
import {
  fetchOaTemplates,
  fetchTemplateInfo,
  sendTemplateByPhone,
} from "@/lib/zalo-oa";
import { apiClient } from "@/lib/api-client";
import { formatDateVN } from "@/lib/utils";
import {
  appendTemplateMessage,
  updateTemplateMessage,
} from "@/lib/zaloTemplateMessageStore";
import { Campaign, CampaignFormState, segmentOptions } from "@/types/marketing";
import type { OaConnection, ZbsTemplate } from "@/types/zalo-oa";
import {
  CampaignRecipientsImport,
  type CampaignRecipient,
} from "./CampaignRecipientsImport";

const CONNECTIONS_STORAGE_KEY = "crm.zaloOa.connections.v1";

const loadStoredConnections = (): OaConnection[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OaConnection[]) : [];
  } catch {
    return [];
  }
};

const initialFormState: CampaignFormState = {
  name: "",
  channel: "",
  segment: segmentOptions[0].value,
  scheduledAt: "",
  message: "",
  templateCode: "",
  mode: "development",
};

const STATUS_BADGE: Record<
  ZbsTemplate["status"],
  { label: string; className: string }
> = {
  approved: { label: "Đã duyệt", className: "bg-green-100 text-green-700" },
  pending_review: {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-700",
  },
  rejected: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
  draft: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
  inactive: { label: "Ngừng dùng", className: "bg-gray-100 text-gray-500" },
};

const CAMPAIGN_STATUS_BADGE: Record<Campaign["status"], { label: string; className: string }> = {
  draft: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
  scheduled: { label: "Đã lịch", className: "bg-orange-100 text-orange-700" },
  running: { label: "Đang gửi", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-600" },
};

interface TemplateWithOa extends ZbsTemplate {
  connectionId: string;
  oaName: string;
}

const CAMPAIGN_PAGE_SIZE = 10;

export function MarketingSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState<CampaignFormState>(initialFormState);
  const [templatesByOa, setTemplatesByOa] = useState<
    Record<string, ZbsTemplate[]>
  >({});
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [connections, setConnections] = useState<OaConnection[]>([]);
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);

  const [templateInfoLoading, setTemplateInfoLoading] = useState(false);
  const [templateInfoError, setTemplateInfoError] = useState<string>("");
  const [manualParamNames, setManualParamNames] = useState<string>("");

  const [templateSearch, setTemplateSearch] = useState("");
  const [templateStatusFilter, setTemplateStatusFilter] = useState<
    "all" | ZbsTemplate["status"]
  >("all");
  const [templateOaFilter, setTemplateOaFilter] = useState<string>("all");
  const [templatePage, setTemplatePage] = useState(1);
  const TEMPLATE_PAGE_SIZE = 6;

  // Campaign filter & pagination
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>("all");
  const [campaignModeFilter, setCampaignModeFilter] = useState<string>("all");
  const [campaignOaFilter, setCampaignOaFilter] = useState<string>("all");
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignPageSize, setCampaignPageSize] = useState(CAMPAIGN_PAGE_SIZE);

  // Toggle create form
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setConnections(loadStoredConnections());
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{
        responseData: {
          rows: {
            id: string;
            name: string;
            channel: string;
            segment: string;
            scheduled_at: string;
            message: string;
            status: string;
            sent: number;
            failed: number;
            template_id?: string;
            template_code?: string;
            template_name?: string;
            recipients_count?: number;
            mode?: "development" | "production";
            oa_official_id?: string;
            phone?: string;
            template_data?: Record<string, string>;
          }[];
        };
      }>("/api/v1.0/marketing")
      .then(({ responseData }) => {
        if (cancelled) return;
        const loaded: Campaign[] = (responseData?.rows ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          channel: row.channel,
          segment: row.segment,
          scheduledAt: row.scheduled_at,
          message: row.message,
          status: row.status as Campaign["status"],
          sent: row.sent,
          failed: row.failed,
          templateId: row.template_id,
          templateCode: row.template_code,
          templateName: row.template_name,
          recipientsCount: row.recipients_count,
          mode: row.mode,
          oaOfficialId: row.oa_official_id,
        }));
        setCampaigns(loaded);
      })
      .catch((err) => {
        console.error("[Marketing] Load campaigns thất bại:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (connections.length === 0) return;

    let cancelled = false;
    const missing = connections.filter((c) => !templatesByOa[c.oaOfficialId]);
    if (missing.length === 0) return;

    setTemplatesLoading(true);
    Promise.all(
      missing.map((c) =>
        fetchOaTemplates(c.oaOfficialId, c.accessToken).then((list) => ({
          oaOfficialId: c.oaOfficialId,
          list,
        })),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        setTemplatesByOa((prev) => {
          const next = { ...prev };
          for (const { oaOfficialId, list } of results) {
            next[oaOfficialId] = list;
          }
          return next;
        });
      })
      .finally(() => {
        if (!cancelled) setTemplatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [connections, templatesByOa]);

  const totalSent = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.sent, 0),
    [campaigns],
  );

  const channelLabelById = useMemo(
    () =>
      connections.reduce<Record<string, string>>((acc, connection) => {
        acc[connection.id] = connection.oaName;
        return acc;
      }, {}),
    [connections],
  );

  const allTemplates = useMemo<TemplateWithOa[]>(() => {
    const flat: TemplateWithOa[] = [];
    for (const conn of connections) {
      const list = templatesByOa[conn.oaOfficialId] ?? [];
      for (const t of list) {
        flat.push({ ...t, connectionId: conn.id, oaName: conn.oaName });
      }
    }
    return flat;
  }, [connections, templatesByOa]);

  const approvedTemplates = useMemo(
    () => allTemplates.filter((t) => t.status === "approved"),
    [allTemplates],
  );

  const oaWithTemplatesCount = useMemo(
    () => new Set(allTemplates.map((t) => t.connectionId)).size,
    [allTemplates],
  );

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    return allTemplates.filter((t) => {
      if (templateOaFilter !== "all" && t.connectionId !== templateOaFilter)
        return false;
      if (templateStatusFilter !== "all" && t.status !== templateStatusFilter)
        return false;
      if (!q) return true;
      return (
        t.templateName.toLowerCase().includes(q) ||
        t.templateCode.toLowerCase().includes(q) ||
        t.oaName.toLowerCase().includes(q)
      );
    });
  }, [allTemplates, templateSearch, templateStatusFilter, templateOaFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTemplates.length / TEMPLATE_PAGE_SIZE),
  );

  useEffect(() => {
    if (templatePage > totalPages) setTemplatePage(1);
  }, [templatePage, totalPages]);

  const paginatedTemplates = useMemo(() => {
    const start = (templatePage - 1) * TEMPLATE_PAGE_SIZE;
    return filteredTemplates.slice(start, start + TEMPLATE_PAGE_SIZE);
  }, [filteredTemplates, templatePage]);

  const selectedTemplate = useMemo(
    () =>
      allTemplates.find((t) => t.templateCode === form.templateCode) || null,
    [allTemplates, form.templateCode],
  );

  // Campaign filter
  const filteredCampaigns = useMemo(() => {
    const q = campaignSearch.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (campaignStatusFilter !== "all" && c.status !== campaignStatusFilter) return false;
      if (campaignModeFilter !== "all" && c.mode !== campaignModeFilter) return false;
      if (campaignOaFilter !== "all" && c.channel !== campaignOaFilter) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || (c.templateName?.toLowerCase().includes(q) ?? false);
    });
  }, [campaigns, campaignSearch, campaignStatusFilter, campaignModeFilter, campaignOaFilter]);

  useEffect(() => {
    setCampaignPage(1);
  }, [campaignSearch, campaignStatusFilter, campaignModeFilter, campaignOaFilter]);

  const pagedCampaigns = useMemo(
    () => filteredCampaigns.slice((campaignPage - 1) * campaignPageSize, campaignPage * campaignPageSize),
    [filteredCampaigns, campaignPage, campaignPageSize],
  );

  const handleTemplateChange = (templateCode: string) => {
    const template = allTemplates.find((t) => t.templateCode === templateCode);
    setForm((prev) => ({
      ...prev,
      templateCode,
      channel: template ? template.connectionId : "",
      message: template ? template.previewContent : "",
    }));
    setRecipients([]);
    setTemplateInfoError("");
    setManualParamNames("");

    if (!template) return;
    if (template.params.length > 0) return;

    const conn = connections.find((c) => c.id === template.connectionId);
    if (!conn) return;

    setTemplateInfoLoading(true);
    fetchTemplateInfo(template.templateId, conn.accessToken)
      .then((result) => {
        if (result.params.length > 0) {
          setTemplatesByOa((prev) => {
            const list = prev[template.oaId] ?? [];
            const next = list.map((t) =>
              t.templateId === template.templateId
                ? { ...t, params: result.params }
                : t,
            );
            return { ...prev, [template.oaId]: next };
          });
          return;
        }
        setTemplateInfoError(
          result.errorMessage
            ? `Zalo: ${result.errorMessage}${result.errorCode !== undefined ? ` (code ${result.errorCode})` : ""}`
            : "Không lấy được danh sách biến của template.",
        );
      })
      .finally(() => setTemplateInfoLoading(false));
  };

  const handleApplyManualParams = () => {
    if (!selectedTemplate) return;
    const names = manualParamNames
      .split(/[\n,;]/)
      .map((s) => s.trim())
      .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s));
    if (names.length === 0) {
      setTemplateInfoError(
        "Hãy nhập ít nhất 1 tên biến hợp lệ (chữ/số/_, không bắt đầu bằng số).",
      );
      return;
    }
    const params: typeof selectedTemplate.params = names.map((name) => ({
      name,
      type: "string" as const,
      required: true,
      sample: "Giá trị mẫu",
    }));
    setTemplatesByOa((prev) => {
      const list = prev[selectedTemplate.oaId] ?? [];
      const next = list.map((t) =>
        t.templateId === selectedTemplate.templateId ? { ...t, params } : t,
      );
      return { ...prev, [selectedTemplate.oaId]: next };
    });
    setTemplateInfoError("");
    setRecipients([]);
  };

  const handleCreateCampaign = () => {
    const name = form.name.trim();
    if (!name || !selectedTemplate) {
      return;
    }

    const validRecipients = recipients.filter((r) => r.errors.length === 0);
    const conn = connections.find(
      (c) => c.id === selectedTemplate.connectionId,
    );

    const nextCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      channel: selectedTemplate.connectionId,
      segment: form.segment,
      scheduledAt: form.scheduledAt || "Chưa đặt lịch",
      message: selectedTemplate.previewContent,
      status: form.scheduledAt ? "scheduled" : "draft",
      sent: 0,
      failed: 0,
      templateId: selectedTemplate.templateId,
      templateCode: selectedTemplate.templateCode,
      templateName: selectedTemplate.templateName,
      recipientsCount: validRecipients.length,
      recipients: validRecipients.map((r) => ({
        rowIndex: r.rowIndex,
        phone: r.phone,
        templateData: r.templateData,
      })),
      mode: form.mode,
      oaOfficialId: conn?.oaOfficialId,
    };

    setCampaigns((prev) => [nextCampaign, ...prev]);
    setForm((prev) => ({
      ...prev,
      name: "",
      scheduledAt: "",
      message: "",
      templateCode: "",
      channel: "",
      mode: "development",
    }));
    setRecipients([]);
    setShowCreateForm(false);
  };

  const [runningCampaignId, setRunningCampaignId] = useState<string | null>(null);
  const [runProgress, setRunProgress] = useState<{ done: number; total: number } | null>(null);

  const handleRunCampaign = async (campaignId: string) => {
    if (runningCampaignId) return;
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    if (
      !campaign.templateId ||
      !campaign.recipients ||
      campaign.recipients.length === 0
    ) {
      alert("Chiến dịch này không có template hoặc danh sách người nhận hợp lệ.");
      return;
    }

    const conn = connections.find((c) => c.id === campaign.channel);
    if (!conn) {
      alert("Không tìm thấy OA tương ứng. Có thể OA đã bị xoá kết nối.");
      return;
    }

    setRunningCampaignId(campaignId);
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, status: "running", sent: 0, failed: 0 } : c,
      ),
    );

    const total = campaign.recipients.length;
    setRunProgress({ done: 0, total });

    let sent = 0;
    let failed = 0;
    let lastQuotaRemaining: number | undefined;
    const mode = campaign.mode || "development";

    for (let i = 0; i < campaign.recipients.length; i++) {
      const r = campaign.recipients[i];
      const now = new Date().toISOString();

      const recordId = `tm-${campaign.id}-${i}-${Date.now()}`;
      appendTemplateMessage({
        oaId: campaign.channel,
        oaOfficialId: campaign.oaOfficialId,
        templateId: campaign.templateId,
        templateCode: campaign.templateCode,
        templateName: campaign.templateName,
        phone: r.phone,
        normalizedPhone: r.phone,
        trackingId: "",
        mode,
        templateData: r.templateData,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        campaignId: campaign.id,
      });

      const result = await sendTemplateByPhone({
        oaId: campaign.channel,
        oaOfficialId: campaign.oaOfficialId,
        accessToken: conn.accessToken,
        templateId: campaign.templateId,
        templateCode: campaign.templateCode,
        templateName: campaign.templateName,
        phone: r.phone,
        templateData: r.templateData,
        mode,
      });

      updateTemplateMessage(recordId, {
        msgId: result.msgId,
        trackingId: result.trackingId,
        status: result.status,
        sentAt: result.sentAt,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        zaloErrorCode: result.zaloErrorCode,
        quotaRemaining: result.quotaRemaining,
        dailyQuota: result.dailyQuota,
      });

      if (result.status === "sent_to_zalo") {
        sent += 1;
        lastQuotaRemaining = result.quotaRemaining ?? lastQuotaRemaining;
      } else {
        failed += 1;
      }

      try {
        await apiClient.post("/api/v1.0/marketing", {
          id: recordId,
          name: campaign.name,
          channel: campaign.channel,
          segment: campaign.segment,
          scheduledAt: campaign.scheduledAt,
          message: campaign.message,
          status: result.status === "sent_to_zalo" ? "completed" : "failed",
          sent: result.status === "sent_to_zalo" ? 1 : 0,
          failed: result.status === "sent_to_zalo" ? 0 : 1,
          templateId: campaign.templateId,
          templateCode: campaign.templateCode,
          templateName: campaign.templateName,
          recipientsCount: 1,
          mode,
          oaOfficialId: campaign.oaOfficialId,
          phone: r.phone,
          template_data: r.templateData,
        });
      } catch (err) {
        console.error(`[Marketing] Lưu bản ghi recipient ${r.phone} thất bại:`, err);
      }

      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, sent, failed } : c)),
      );
      setRunProgress({ done: i + 1, total });

      if (i < campaign.recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, status: "completed", sent, failed } : c,
      ),
    );
    setRunningCampaignId(null);
    setRunProgress(null);

    if (lastQuotaRemaining !== undefined) {
      console.log(`[Marketing] Campaign "${campaign.name}" hoàn tất. Quota còn: ${lastQuotaRemaining}`);
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== campaignId));
    setOpenMenuId(null);
  };

  const handleSyncTemplates = () => {
    setTemplatesByOa({});
  };

  const validRecipientsCount = recipients.filter((r) => r.errors.length === 0).length;
  const canCreate = !!form.name.trim() && !!selectedTemplate && validRecipientsCount > 0;
  const hasConnections = connections.length > 0;
  const runningOrScheduled = campaigns.filter((c) => c.status === "running" || c.status === "scheduled").length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tạo và quản lý chiến dịch broadcast qua Zalo OA, theo dõi trạng thái gửi và hiệu quả chiến dịch.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <FiPlus className="h-4 w-4" />
          Tạo chiến dịch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Send className="h-6 w-6" />}
          label="Tổng chiến dịch"
          value={campaigns.length}
          note="Tất cả chiến dịch đã tạo"
          className="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Đang chạy / Đã lịch"
          value={runningOrScheduled}
          note="Chiến dịch đang chờ gửi"
          className="bg-orange-50 text-orange-600"
        />
        <StatCard
          icon={<Mail className="h-6 w-6" />}
          label="Tổng tin gửi"
          value={totalSent}
          note="Số tin đã gửi qua Zalo OA"
          className="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Template khả dụng"
          value={approvedTemplates.length}
          note={`/ ${allTemplates.length} OA`}
          subNote={`Template ZBS trên các OA`}
          className="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Template ZBS section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">Template ZBS khả dụng</h2>
          <Info className="h-4 w-4 text-gray-400" />
        </div>

        <div className="p-6">
          {!hasConnections || (allTemplates.length === 0 && !templatesLoading) ? (
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-8">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                  <FileText className="h-10 w-10 text-emerald-500" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Chưa có template khả dụng</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {!hasConnections
                      ? "Hiện chưa có template ZBS nào từ các OA đã kết nối."
                      : "Các OA hiện chưa có template nào."}
                  </p>
                  <p className="text-sm text-gray-400">
                    Vui lòng đồng bộ template hoặc tạo template mới trên Zalo OA để bắt đầu gửi chiến dịch.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSyncTemplates}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Đồng bộ template
                </button>
                <Link
                  href="/zalo-oa/template-history"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
                >
                  <FileText className="h-4 w-4" />
                  Xem lịch sử template
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {templatesLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                  Đang đồng bộ template...
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {approvedTemplates.length} template đã duyệt từ {oaWithTemplatesCount} OA
                </p>
                <button
                  onClick={handleSyncTemplates}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Đồng bộ
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => { setTemplateSearch(e.target.value); setTemplatePage(1); }}
                  placeholder="Tìm tên / mã / OA..."
                  className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                <select
                  value={templateStatusFilter}
                  onChange={(e) => { setTemplateStatusFilter(e.target.value as typeof templateStatusFilter); setTemplatePage(1); }}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-primary-400"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="pending_review">Chờ duyệt</option>
                  <option value="rejected">Bị từ chối</option>
                  <option value="inactive">Ngừng dùng</option>
                  <option value="draft">Nháp</option>
                </select>
                <select
                  value={templateOaFilter}
                  onChange={(e) => { setTemplateOaFilter(e.target.value); setTemplatePage(1); }}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-primary-400"
                >
                  <option value="all">Tất cả OA ({oaWithTemplatesCount})</option>
                  {connections
                    .filter((c) => allTemplates.some((t) => t.connectionId === c.id))
                    .map((c) => <option key={c.id} value={c.id}>{c.oaName}</option>)}
                </select>
              </div>

              {filteredTemplates.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">Không có template nào khớp bộ lọc.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedTemplates.map((t) => {
                    const isSelected = form.templateCode === t.templateCode;
                    const canPick = t.status === "approved";
                    return (
                      <button
                        key={`${t.connectionId}-${t.id}`}
                        type="button"
                        onClick={() => canPick && handleTemplateChange(t.templateCode)}
                        disabled={!canPick}
                        className={`text-left rounded-lg border p-4 transition ${
                          isSelected
                            ? "border-primary-500 bg-primary-50/40 ring-1 ring-primary-200"
                            : canPick
                              ? "border-gray-200 hover:border-primary-300 bg-white"
                              : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="rounded bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">{t.oaName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[t.status].className}`}>
                            {STATUS_BADGE[t.status].label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{t.templateName}</p>
                        {t.previewContent && (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{t.previewContent}</p>
                        )}
                        <p className="mt-2 text-[11px] text-gray-400">{t.templateType} • {t.templateCode} • {t.params.length} biến</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">Trang {templatePage} / {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setTemplatePage(1)} disabled={templatePage === 1} className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-40">«</button>
                    <button type="button" onClick={() => setTemplatePage((p) => Math.max(1, p - 1))} disabled={templatePage === 1} className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-40">‹ Trước</button>
                    <button type="button" onClick={() => setTemplatePage((p) => Math.min(totalPages, p + 1))} disabled={templatePage >= totalPages} className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-40">Sau ›</button>
                    <button type="button" onClick={() => setTemplatePage(totalPages)} disabled={templatePage >= totalPages} className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-40">»</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Campaign filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_200px_160px_200px_240px_auto] xl:items-end">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={campaignSearch}
              onChange={(e) => setCampaignSearch(e.target.value)}
              placeholder="Tìm kiếm chiến dịch..."
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <FilterSelect
            label="Trạng thái"
            value={campaignStatusFilter}
            onChange={setCampaignStatusFilter}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "draft", label: "Nháp" },
              { value: "scheduled", label: "Đã lịch" },
              { value: "running", label: "Đang gửi" },
              { value: "completed", label: "Hoàn thành" },
            ]}
          />
          <FilterSelect
            label="Mode"
            value={campaignModeFilter}
            onChange={setCampaignModeFilter}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "development", label: "Development" },
              { value: "production", label: "Production" },
            ]}
          />
          <FilterSelect
            label="Kênh (OA)"
            value={campaignOaFilter}
            onChange={setCampaignOaFilter}
            options={[
              { value: "all", label: "Tất cả OA" },
              ...connections.map((c) => ({ value: c.id, label: c.oaName })),
            ]}
          />
          <div>
            <span className="mb-2 block text-sm font-semibold text-gray-700">Ngày gửi</span>
            <div className="flex items-center gap-2">
              <input type="date" className="h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400" />
              <span className="text-gray-400">~</span>
              <input type="date" className="h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary-400" />
            </div>
          </div>
          <button
            onClick={() => { setCampaignSearch(""); setCampaignStatusFilter("all"); setCampaignModeFilter("all"); setCampaignOaFilter("all"); }}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Campaign list */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">
            Danh sách chiến dịch ({filteredCampaigns.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Chiến dịch</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">OA / Kênh</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Template</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Mode</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Người nhận</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Gửi / Lỗi</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Lịch gửi</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedCampaigns.map((campaign) => {
                const oaName = channelLabelById[campaign.channel] || campaign.channel;
                const statusBadge = CAMPAIGN_STATUS_BADGE[campaign.status] || CAMPAIGN_STATUS_BADGE.draft;
                const isRunningThis = runningCampaignId === campaign.id;

                return (
                  <tr key={campaign.id} className="transition-colors hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{campaign.name}</p>
                      <p className="mt-0.5 text-xs text-gray-400">ID: {campaign.id.length > 18 ? campaign.id.slice(0, 18) + "..." : campaign.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">Z</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{oaName}</p>
                          <p className="text-xs text-gray-400">Zalo OA</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {campaign.templateName ? (
                        <div>
                          <p className="text-sm text-gray-900">{campaign.templateName}</p>
                          <p className="text-xs text-gray-400">{campaign.templateCode || ""}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${campaign.mode === "production" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {campaign.mode === "production" ? "Production" : "Development"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900">{typeof campaign.recipientsCount === "number" ? campaign.recipientsCount : "—"}</p>
                      <p className="text-xs text-gray-400">Người</p>
                    </td>
                    <td className="px-5 py-4">
                      {isRunningThis && runProgress ? (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}`}>
                            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                            Đang gửi
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: `${(runProgress.done / Math.max(1, runProgress.total)) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500">{runProgress.done}/{runProgress.total}</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}`}>
                            {campaign.status === "completed" && <span className="h-2 w-2 rounded-full bg-current" />}
                            {statusBadge.label}
                          </span>
                          {campaign.status === "completed" && campaign.sent > 0 && (
                            <p className="mt-0.5 text-xs text-gray-400">Gửi thành công</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900">{campaign.sent} / {campaign.failed}</p>
                      {campaign.sent + campaign.failed > 0 && (
                        <p className="text-xs text-gray-400">
                          {Math.round((campaign.sent / Math.max(1, campaign.sent + campaign.failed)) * 100)}%
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-pre-line">
                      {campaign.scheduledAt && campaign.scheduledAt !== "Chưa đặt lịch" ? formatDateVN(campaign.scheduledAt) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative flex items-center justify-end">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === campaign.id && (
                          <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                            {campaign.status !== "completed" && campaign.status !== "running" && (
                              <button
                                onClick={() => { setOpenMenuId(null); handleRunCampaign(campaign.id); }}
                                disabled={!!runningCampaignId}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-40"
                              >
                                <FiPlay className="h-4 w-4" />
                                Chạy ngay
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              disabled={isRunningThis}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                            >
                              <FiTrash2 className="h-4 w-4" />
                              Xóa chiến dịch
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-sm text-gray-400">Chưa có chiến dịch nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={campaignPage}
          pageSize={campaignPageSize}
          totalCount={filteredCampaigns.length}
          onPageChange={setCampaignPage}
          onPageSizeChange={(size) => { setCampaignPageSize(size); setCampaignPage(1); }}
        />
      </div>

      {/* Create campaign modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6 pt-20">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Tạo chiến dịch mới</h2>
              <button onClick={() => setShowCreateForm(false)} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4 p-6">
              <Input
                label="Tên chiến dịch"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Khuyến mãi mùa hè"
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Template ZBS <span className="font-normal text-gray-400">(từ tất cả OA)</span>
                </label>
                <Select
                  value={form.templateCode}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  options={[
                    { value: "", label: "-- Chọn template --" },
                    ...approvedTemplates.map((t) => ({
                      value: t.templateCode,
                      label: `[${t.oaName}] ${t.templateName}`,
                    })),
                  ]}
                  size="md"
                  disabled={approvedTemplates.length === 0}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {approvedTemplates.length > 0
                    ? `Có ${approvedTemplates.length} template đã duyệt sẵn sàng để gửi từ ${oaWithTemplatesCount} OA.`
                    : "Chưa có template nào sẵn sàng để gửi."}
                </p>
              </div>

              {selectedTemplate && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">{selectedTemplate.oaName}</span>
                    <p className="text-sm font-semibold text-gray-800">{selectedTemplate.templateName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[selectedTemplate.status].className}`}>
                      {STATUS_BADGE[selectedTemplate.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 whitespace-pre-line">{selectedTemplate.previewContent}</p>
                  {templateInfoLoading ? (
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                      Đang tải danh sách biến...
                    </p>
                  ) : selectedTemplate.params.length > 0 ? (
                    <p className="text-xs text-gray-500">
                      Biến cần truyền:{" "}
                      {selectedTemplate.params.map((p) => (
                        <span key={p.name} className="mr-1 inline-block rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-700">
                          {p.name}{p.required ? " *" : ""}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-700">
                        {templateInfoError || "Không lấy được danh sách biến từ Zalo. Hãy nhập tay tên biến:"}
                      </p>
                      <textarea
                        value={manualParamNames}
                        onChange={(e) => setManualParamNames(e.target.value)}
                        placeholder={`Mỗi dòng 1 tên biến, ví dụ:\ncustomer_name\norder_code`}
                        rows={3}
                        className="w-full rounded border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-primary-400"
                      />
                      <button type="button" onClick={handleApplyManualParams} className="rounded border border-primary-300 px-3 py-1.5 text-xs text-primary-700 hover:bg-primary-50">
                        Áp dụng danh sách biến
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedTemplate && !templateInfoLoading && selectedTemplate.params.length > 0 && (
                <CampaignRecipientsImport
                  params={selectedTemplate.params}
                  recipients={recipients}
                  onChange={setRecipients}
                  templateName={selectedTemplate.templateName}
                  templateCode={selectedTemplate.templateCode}
                />
              )}

              <Input
                label="Lịch gửi (nếu có)"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Chế độ gửi</label>
                <div className="flex gap-3">
                  <label className={`flex-1 cursor-pointer rounded-lg border px-4 py-3 text-sm ${form.mode === "development" ? "border-amber-400 bg-amber-50 text-amber-800" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                    <input type="radio" name="campaign-mode" value="development" checked={form.mode === "development"} onChange={() => setForm({ ...form, mode: "development" })} className="mr-2" />
                    <span className="font-semibold">Development</span>
                    <p className="ml-5 mt-0.5 text-xs text-gray-500">Test gửi — không trừ quota.</p>
                  </label>
                  <label className={`flex-1 cursor-pointer rounded-lg border px-4 py-3 text-sm ${form.mode === "production" ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                    <input type="radio" name="campaign-mode" value="production" checked={form.mode === "production"} onChange={() => setForm({ ...form, mode: "production" })} className="mr-2" />
                    <span className="font-semibold">Production</span>
                    <p className="ml-5 mt-0.5 text-xs text-gray-500">Gửi thật — trừ quota OA.</p>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <button onClick={() => setShowCreateForm(false)} className="flex-1 rounded-lg border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                  Hủy
                </button>
                <button onClick={handleCreateCampaign} disabled={!canCreate} className="flex-1 rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50">
                  {validRecipientsCount > 0
                    ? `Tạo chiến dịch (${validRecipientsCount} người nhận)`
                    : "Tạo chiến dịch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, note, subNote, className }: { icon: React.ReactNode; label: string; value: number; note: string; subNote?: string; className: string }) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${className}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {value.toLocaleString("vi-VN")}
          {subNote && <span className="ml-1 text-xs font-medium text-gray-400">{note}</span>}
        </p>
        <p className="mt-1 text-sm text-gray-400">{subNote || note}</p>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-600 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </label>
  );
}
