"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiPlus, FiTrash2, FiPlay } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  fetchOaTemplates,
  fetchTemplateInfo,
  sendTemplateByPhone,
} from "@/lib/zalo-oa";
import { apiClient } from "@/lib/api-client";
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

interface TemplateWithOa extends ZbsTemplate {
  connectionId: string;
  oaName: string;
}

export function MarketingSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState<CampaignFormState>(initialFormState);
  const [templatesByOa, setTemplatesByOa] = useState<
    Record<string, ZbsTemplate[]>
  >({});
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [connections, setConnections] = useState<OaConnection[]>([]);
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);

  // Thông tin biến (listParams) của template đang chọn
  const [templateInfoLoading, setTemplateInfoLoading] = useState(false);
  const [templateInfoError, setTemplateInfoError] = useState<string>("");
  // Cho phép user nhập tay danh sách tên biến nếu API không trả (mỗi dòng 1 tên)
  const [manualParamNames, setManualParamNames] = useState<string>("");

  // Filter & pagination cho danh sách template
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateStatusFilter, setTemplateStatusFilter] = useState<
    "all" | ZbsTemplate["status"]
  >("all");
  const [templateOaFilter, setTemplateOaFilter] = useState<string>("all");
  const [templatePage, setTemplatePage] = useState(1);
  const TEMPLATE_PAGE_SIZE = 6;

  useEffect(() => {
    setConnections(loadStoredConnections());
  }, []);

  // Load danh sách campaigns từ backend
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

  // Fetch templates cho TẤT CẢ OA đã kết nối
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

  // Gộp template từ tất cả OA, gắn thêm connectionId/oaName
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

  // Số OA có ít nhất 1 template
  const oaWithTemplatesCount = useMemo(
    () => new Set(allTemplates.map((t) => t.connectionId)).size,
    [allTemplates],
  );

  // Filter theo search / status / OA
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

  // Reset về page 1 khi filter thay đổi và đang ở page > totalPages
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

  const handleTemplateChange = (templateCode: string) => {
    const template = allTemplates.find((t) => t.templateCode === templateCode);
    setForm((prev) => ({
      ...prev,
      templateCode,
      // Tự set kênh theo OA của template được chọn
      channel: template ? template.connectionId : "",
      message: template ? template.previewContent : "",
    }));
    setRecipients([]); // reset danh sách khi đổi template (vì cột biến có thể khác)
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

  // Áp dụng danh sách biến nhập tay (fallback khi API /template/info không khả dụng)
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
  };

  /** Trạng thái progress khi đang chạy campaign */
  const [runningCampaignId, setRunningCampaignId] = useState<string | null>(
    null,
  );
  const [runProgress, setRunProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const handleRunCampaign = async (campaignId: string) => {
    if (runningCampaignId) return; // tránh chạy đồng thời
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    if (
      !campaign.templateId ||
      !campaign.recipients ||
      campaign.recipients.length === 0
    ) {
      alert(
        "Chiến dịch này không có template hoặc danh sách người nhận hợp lệ.",
      );
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
        c.id === campaignId
          ? { ...c, status: "running", sent: 0, failed: 0 }
          : c,
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

      // Lưu pending log
      const recordId = `tm-${campaign.id}-${i}-${Date.now()}`;
      appendTemplateMessage({
        // id: recordId,
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

      // Update log
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

      // Lưu từng bản ghi per-recipient lên backend
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
        console.error(
          `[Marketing] Lưu bản ghi recipient ${r.phone} thất bại:`,
          err,
        );
      }

      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, sent, failed } : c)),
      );
      setRunProgress({ done: i + 1, total });

      // Delay 200ms giữa các tin để tránh rate limit
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
      console.log(
        `[Marketing] Campaign "${campaign.name}" hoàn tất. Quota còn: ${lastQuotaRemaining}`,
      );
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.filter((campaign) => campaign.id !== campaignId),
    );
  };

  const validRecipientsCount = recipients.filter(
    (r) => r.errors.length === 0,
  ).length;
  const canCreate =
    !!form.name.trim() && !!selectedTemplate && validRecipientsCount > 0;
  const hasConnections = connections.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Marketing</h2>
        <p className="text-xs text-gray-500 mt-1">
          Tạo chiến dịch broadcast cho Zalo OA — gộp template từ tất cả OA đã
          kết nối
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Tổng chiến dịch</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {campaigns.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Đang chạy / đã lịch</p>
            <p className="mt-1 text-lg font-bold text-orange-600">
              {
                campaigns.filter(
                  (c) => c.status === "running" || c.status === "scheduled",
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Tổng tin gửi</p>
            <p className="mt-1 text-lg font-bold text-green-700">
              {totalSent.toLocaleString("vi-VN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Template / OA</p>
            <p className="mt-1 text-lg font-bold text-primary-700">
              {approvedTemplates.length}
              <span className="text-xs font-medium text-gray-400">
                {" "}
                / {allTemplates.length} • {connections.length} OA
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách template tổng hợp từ mọi OA */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Template từ tất cả Zalo OA
            </h3>
            <div className="flex items-center gap-2">
              {templatesLoading && (
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                  Đang đồng bộ...
                </span>
              )}
              {/* <Link
                href="/zalo-oa/tao-template"
                className={`inline-flex items-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2${connections.length === 0 ? " pointer-events-none opacity-50" : ""
                  }`}
                aria-disabled={connections.length === 0}
                tabIndex={connections.length === 0 ? -1 : undefined}
              >
                <FiPlus className="mr-1.5 h-3.5 w-3.5" />
                Tạo template
              </Link> */}
            </div>
          </div>

          {!hasConnections ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              Chưa có Zalo OA nào được kết nối. Vui lòng kết nối OA trước ở
              trang Zalo OA.
            </p>
          ) : allTemplates.length === 0 && !templatesLoading ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              Các OA hiện chưa có template nào.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Filter row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => {
                    setTemplateSearch(e.target.value);
                    setTemplatePage(1);
                  }}
                  placeholder="Tìm tên / mã / OA..."
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 bg-white"
                />
                <select
                  value={templateStatusFilter}
                  onChange={(e) => {
                    setTemplateStatusFilter(
                      e.target.value as typeof templateStatusFilter,
                    );
                    setTemplatePage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-white"
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
                  onChange={(e) => {
                    setTemplateOaFilter(e.target.value);
                    setTemplatePage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-white"
                >
                  <option value="all">
                    Tất cả OA ({oaWithTemplatesCount})
                  </option>
                  {connections
                    .filter((c) =>
                      allTemplates.some((t) => t.connectionId === c.id),
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.oaName}
                      </option>
                    ))}
                </select>
              </div>

              <p className="text-[11px] text-gray-400">
                Hiển thị{" "}
                {filteredTemplates.length === 0
                  ? 0
                  : (templatePage - 1) * TEMPLATE_PAGE_SIZE + 1}
                –
                {Math.min(
                  templatePage * TEMPLATE_PAGE_SIZE,
                  filteredTemplates.length,
                )}{" "}
                trong tổng {filteredTemplates.length} template
                {filteredTemplates.length !== allTemplates.length
                  ? ` (đã lọc từ ${allTemplates.length})`
                  : ""}
              </p>

              {filteredTemplates.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  Không có template nào khớp bộ lọc.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {paginatedTemplates.map((t) => {
                      const isSelected = form.templateCode === t.templateCode;
                      const canPick = t.status === "approved";
                      return (
                        <button
                          key={`${t.connectionId}-${t.id}`}
                          type="button"
                          onClick={() =>
                            canPick && handleTemplateChange(t.templateCode)
                          }
                          disabled={!canPick}
                          className={`text-left rounded-lg border p-3 transition-colors ${
                            isSelected
                              ? "border-primary-500 bg-primary-50/40"
                              : canPick
                                ? "border-gray-200 hover:border-primary-300 bg-white"
                                : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 text-[10px] font-semibold">
                              {t.oaName}
                            </span>
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {t.templateName}
                            </p>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${STATUS_BADGE[t.status].className}`}
                            >
                              {STATUS_BADGE[t.status].label}
                            </span>
                          </div>
                          {t.previewContent && (
                            <p className="text-[11px] text-gray-500 line-clamp-2">
                              {t.previewContent}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] text-gray-400">
                            {t.templateType} • {t.templateCode} •{" "}
                            {t.params.length} biến
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[11px] text-gray-500">
                        Trang {templatePage} / {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setTemplatePage(1)}
                          disabled={templatePage === 1}
                          className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          «
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTemplatePage((p) => Math.max(1, p - 1))
                          }
                          disabled={templatePage === 1}
                          className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          ‹ Trước
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTemplatePage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={templatePage >= totalPages}
                          className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Sau ›
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplatePage(totalPages)}
                          disabled={templatePage >= totalPages}
                          className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Tạo chiến dịch mới
          </h3>
          <div className="space-y-3">
            <Input
              label="Tên chiến dịch"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Khuyến mãi mùa hè"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template ZBS{" "}
                <span className="text-gray-400 font-normal">
                  (từ tất cả OA)
                </span>
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
              <p className="mt-1 text-[11px] text-gray-400">
                {approvedTemplates.length > 0
                  ? `Có ${approvedTemplates.length} template đã duyệt sẵn sàng để gửi từ ${oaWithTemplatesCount} OA.`
                  : "Chưa có template nào sẵn sàng để gửi."}
              </p>
            </div>

            <div className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đối tượng
              </label>
              <Select
                value={form.segment}
                onChange={(e) => setForm({ ...form, segment: e.target.value })}
                options={segmentOptions}
                size="md"
              />
            </div>

            {selectedTemplate && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-[10px] font-semibold">
                    {selectedTemplate.oaName}
                  </span>
                  <p className="text-xs font-semibold text-gray-800">
                    {selectedTemplate.templateName}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_BADGE[selectedTemplate.status].className}`}
                  >
                    {STATUS_BADGE[selectedTemplate.status].label}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {selectedTemplate.templateType} • Template ID:{" "}
                    {selectedTemplate.templateId}
                  </span>
                </div>
                <p className="text-xs text-gray-600 whitespace-pre-line">
                  {selectedTemplate.previewContent}
                </p>
                {templateInfoLoading ? (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                    Đang tải danh sách biến của template...
                  </p>
                ) : selectedTemplate.params.length > 0 ? (
                  <p className="text-[11px] text-gray-500">
                    Biến cần truyền:{" "}
                    {selectedTemplate.params.map((p) => (
                      <span
                        key={p.name}
                        className="inline-block mr-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-700"
                      >
                        {p.name}
                        {p.required ? " *" : ""}
                      </span>
                    ))}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-amber-700">
                      ⚠️{" "}
                      {templateInfoError ||
                        "Không lấy được danh sách biến từ Zalo. Hãy nhập tay tên biến của template:"}
                    </p>
                    <textarea
                      value={manualParamNames}
                      onChange={(e) => setManualParamNames(e.target.value)}
                      placeholder={`Mỗi dòng 1 tên biến, ví dụ:\ncustomer_name\norder_code\namount`}
                      rows={4}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] font-mono outline-none focus:border-primary-400 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyManualParams}
                      className="px-3 py-1 text-[11px] rounded border border-primary-300 text-primary-700 hover:bg-primary-50"
                    >
                      Áp dụng danh sách biến
                    </button>
                    <p className="text-[10px] text-gray-400">
                      Mẹo: vào Zalo Business → Template → bấm vào template để
                      xem các biến (vd: <code>customer_name</code>,{" "}
                      <code>order_code</code>, <code>amount</code>
                      ).
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedTemplate &&
              !templateInfoLoading &&
              selectedTemplate.params.length > 0 && (
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
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chế độ gửi
              </label>
              <div className="flex gap-2">
                <label
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-xs ${
                    form.mode === "development"
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="campaign-mode"
                    value="development"
                    checked={form.mode === "development"}
                    onChange={() => setForm({ ...form, mode: "development" })}
                    className="mr-2"
                  />
                  <span className="font-semibold">🧪 Development</span>
                  <p className="text-[10px] text-gray-500 mt-0.5 ml-5">
                    Test gửi — không trừ quota, không gửi tới máy khách thật.
                  </p>
                </label>
                <label
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-xs ${
                    form.mode === "production"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="campaign-mode"
                    value="production"
                    checked={form.mode === "production"}
                    onChange={() => setForm({ ...form, mode: "production" })}
                    className="mr-2"
                  />
                  <span className="font-semibold">🚀 Production</span>
                  <p className="text-[10px] text-gray-500 mt-0.5 ml-5">
                    Gửi thật — trừ quota OA, tin nhắn đến khách hàng.
                  </p>
                </label>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full text-sm"
              onClick={handleCreateCampaign}
              disabled={!canCreate}
            >
              {validRecipientsCount > 0
                ? `Tạo chiến dịch (${validRecipientsCount} người nhận, ${form.mode === "development" ? "Dev" : "Prod"})`
                : "Tạo chiến dịch"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-3 py-2 font-medium text-gray-600">#</th>
                <th className="px-3 py-2 font-medium text-gray-600">Tên</th>
                <th className="px-3 py-2 font-medium text-gray-600">Kênh</th>
                <th className="px-3 py-2 font-medium text-gray-600">
                  Template
                </th>
                <th className="px-3 py-2 font-medium text-gray-600">Mode</th>
                <th className="px-3 py-2 font-medium text-gray-600">
                  Người nhận
                </th>
                <th className="px-3 py-2 font-medium text-gray-600">
                  Trạng thái
                </th>
                <th className="px-3 py-2 font-medium text-gray-600">
                  Gửi / Lỗi
                </th>
                <th className="px-3 py-2 font-medium text-gray-600 w-20">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, idx) => (
                <tr
                  key={campaign.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 text-xs"
                >
                  <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {campaign.name}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {channelLabelById[campaign.channel] || campaign.channel}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {campaign.templateName ? (
                      <span title={campaign.templateCode}>
                        {campaign.templateName}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {campaign.mode === "production" ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                        🚀 Prod
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
                        🧪 Dev
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {typeof campaign.recipientsCount === "number"
                      ? campaign.recipientsCount.toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {campaign.status === "running" &&
                    runningCampaignId === campaign.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-1 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                          Đang gửi
                        </span>
                        {runProgress && (
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{
                                  width: `${(runProgress.done / Math.max(1, runProgress.total)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500">
                              {runProgress.done}/{runProgress.total}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-medium ${
                          campaign.status === "draft"
                            ? "bg-gray-100 text-gray-700"
                            : campaign.status === "scheduled"
                              ? "bg-orange-100 text-orange-700"
                              : campaign.status === "running"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                        }`}
                      >
                        {campaign.status === "draft"
                          ? "Nháp"
                          : campaign.status === "scheduled"
                            ? "Đã lịch"
                            : campaign.status === "running"
                              ? "Đang gửi"
                              : "Hoàn thành"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {campaign.sent} / {campaign.failed}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {campaign.status !== "completed" &&
                        campaign.status !== "running" && (
                          <button
                            onClick={() => handleRunCampaign(campaign.id)}
                            disabled={!!runningCampaignId}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Chạy ngay"
                          >
                            <FiPlay className="w-4 h-4" />
                          </button>
                        )}
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        disabled={runningCampaignId === campaign.id}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    Chưa có chiến dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
