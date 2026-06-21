export type LandingPageStatus = "draft" | "active" | "inactive" | "deleted";

export type LandingPageFieldType =
  | "text"
  | "phone"
  | "email"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "hidden";

export interface LandingPageField {
  id?: string;
  field_key: string;
  label: string;
  type: LandingPageFieldType;
  required: boolean;
  placeholder?: string;
  options: { label: string; value: string }[];
  sort_order: number;
}

export interface LandingPage {
  id: string;
  template_id?: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  banner_url?: string;
  primary_color: string;
  cta_text?: string;
  content?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  status: LandingPageStatus;
  submission_count: number;
  customer_count: number;
  created_at: string;
  updated_at: string;
  form_fields: LandingPageField[];
  thank_you_message?: string;
  redirect_url?: string;
}

export interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_image_url: string;
  layout_type: string;
  default_title: string;
  default_description: string;
  default_banner_url: string;
  default_primary_color: string;
  default_cta_text: string;
  default_content: string;
  default_form_fields: LandingPageField[];
  default_thank_you_message: string;
  status: "active" | "inactive" | "deleted";
  is_system_template: boolean;
  created_at?: string;
}

export interface LandingPageSubmission {
  id: string;
  landing_page_id: string;
  customer_id?: string;
  submitted_data: Record<string, any>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface LandingPageFilters {
  currentPage: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  assigned_user_id?: string;
  campaign_id?: string;
  from_date?: string;
  to_date?: string;
}

