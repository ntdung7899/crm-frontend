import { apiClient } from "@/lib/api-client";
import { EmailTemplate, EmailCampaign, EmailRecipientLog } from "@/types/email-marketing";

export function mapApiTemplateToUI(api: any): EmailTemplate {
  return {
    id: String(api.id),
    name: api.name,
    subject: api.subject,
    content: api.html_content || api.htmlContent || api.content || "",
    description: api.description,
    createdAt: new Date(api.created_at || api.createdAt),
    updatedAt: new Date(api.updated_at || api.updatedAt || api.created_at || api.createdAt),
  };
}

export function mapApiCampaignToUI(api: any): EmailCampaign {
  return {
    id: api.id,
    campaignName: api.campaign_name,
    templateId: api.template_id,
    subject: api.subject,
    totalRecipients: api.total_recipients || 0,
    sentCount: api.sent_count || 0,
    failedCount: api.failed_count || 0,
    status: api.status,
    isDelete: api.is_delete || false,
    createdAt: new Date(api.created_at || api.createdAt),
    createdBy: api.created_by,
  };
}

export function mapApiRecipientLogToUI(api: any): EmailRecipientLog {
  return {
    id: api.id,
    marketingEmailId: api.marketing_email_id,
    customerId: api.customer_id,
    email: api.email,
    status: api.status,
    errorMessage: api.error_message,
    sentAt: api.sent_at ? new Date(api.sent_at) : null,
    createdAt: new Date(api.created_at || api.createdAt),
  };
}

function unwrapTemplateResponse(res: any): any {
  const responseData = res?.responseData;
  return responseData?.data || responseData?.template || responseData;
}

class EmailMarketingService {
  async getTemplates(params?: any): Promise<{ rows: EmailTemplate[]; count: number }> {
    const res = await apiClient.get<any>("/api/v1.0/mail_templates", params);
    const rows = (res.responseData?.rows || []).map(mapApiTemplateToUI);
    const count = res.responseData?.count || rows.length;
    return { rows, count };
  }

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const res = await apiClient.get<any>(`/api/v1.0/mail_templates/${id}`);
    const data = unwrapTemplateResponse(res);
    if (!data?.id) return null;
    return data ? mapApiTemplateToUI(data) : null;
  }

  async createTemplate(data: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">): Promise<EmailTemplate> {
    const res = await apiClient.post<any>("/api/v1.0/mail_templates", {
      name: data.name,
      subject: data.subject,
      html_content: data.content,
      description: data.description,
    });
    const template = unwrapTemplateResponse(res);
    return mapApiTemplateToUI(template);
  }

  async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    await apiClient.put<any>(`/api/v1.0/mail_templates/${id}`, {
      name: data.name,
      subject: data.subject,
      html_content: data.content,
      description: data.description,
    });
    return {
      id,
      name: data.name || "",
      subject: data.subject || "",
      content: data.content || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/api/v1.0/mail_templates/${id}`);
    const responseData = res?.responseData;
    const data = responseData?.data ?? responseData;

    if (data === false) return false;
    if (data?.deleted === false || data?.success === false) return false;
    if (Array.isArray(data)) return data.length === 0 || Number(data[0]) > 0;
    if (typeof data === "number") return data > 0;

    return true;
  }

  async sendEmail(payload: {
    campaignName: string;
    templateId: string;
    subjectOverride?: string;
    htmlContentOverride?: string;
    tagIds?: string[];
    customerIds?: string[];
  }): Promise<any> {
    return apiClient.post<any>("/api/v1.0/marketing_email", {
      campaign_name: payload.campaignName,
      template_id: payload.templateId,
      subject_override: payload.subjectOverride,
      html_content_override: payload.htmlContentOverride,
      tag_ids: payload.tagIds,
      customer_ids: payload.customerIds,
    });
  }

  async getCampaigns(params?: any): Promise<{ rows: EmailCampaign[]; count: number }> {
    const res = await apiClient.get<any>("/api/v1.0/marketing_email", params);
    const rows = (res.responseData?.rows || []).map(mapApiCampaignToUI);
    const count = res.responseData?.count || rows.length;
    return { rows, count };
  }

  async getCampaignById(id: string): Promise<{ campaign: EmailCampaign; recipients: EmailRecipientLog[] } | null> {
    const res = await apiClient.get<any>(`/api/v1.0/marketing_email/${id}`);
    const campaignData = res.responseData?.campaign;
    const recipientsData = res.responseData?.recipients;
    if (!campaignData) return null;
    return {
      campaign: mapApiCampaignToUI(campaignData),
      recipients: (recipientsData || []).map(mapApiRecipientLogToUI),
    };
  }
}

export const emailMarketingService = new EmailMarketingService();
