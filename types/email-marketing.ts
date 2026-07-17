export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampaign {
  id: string;
  campaignName: string;
  templateId: string;
  subject: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: "sending" | "completed" | "failed" | "partial_success";
  isDelete: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface EmailRecipientLog {
  id: string;
  marketingEmailId: string;
  customerId: string;
  email: string;
  status: "sent" | "failed";
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
}

