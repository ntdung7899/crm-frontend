import { EmailTemplate } from "@/types/email-marketing";
import { mockEmailTemplates } from "@/mock-data/email-marketing";

// Fake delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class EmailMarketingService {
  private templates: EmailTemplate[] = [...mockEmailTemplates];

  async getTemplates(): Promise<{ rows: EmailTemplate[]; count: number }> {
    await delay(300);
    return {
      rows: [...this.templates],
      count: this.templates.length,
    };
  }

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    await delay(300);
    const template = this.templates.find((t) => t.id === id);
    return template || null;
  }

  async createTemplate(data: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">): Promise<EmailTemplate> {
    await delay(300);
    const newTemplate: EmailTemplate = {
      ...data,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.templates = [newTemplate, ...this.templates];
    return newTemplate;
  }

  async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    await delay(300);
    const index = this.templates.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.templates[index],
      ...data,
      updatedAt: new Date(),
    };
    this.templates[index] = updated;
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    await delay(300);
    const initialLength = this.templates.length;
    this.templates = this.templates.filter((t) => t.id !== id);
    return this.templates.length < initialLength;
  }

  async sendEmail(payload: { templateId?: string; subject: string; content: string; recipientType: string; recipients: string[] }): Promise<boolean> {
    await delay(500);
    console.log("Sending email with payload:", payload);
    return true; // Simulate success
  }
}

export const emailMarketingService = new EmailMarketingService();
