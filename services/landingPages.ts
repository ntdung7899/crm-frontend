import { apiClient } from "@/lib/api-client";
import { LandingPage, LandingPageSubmission, LandingPageFilters, LandingPageField, LandingPageTemplate } from "@/types";

const ENDPOINT = "/api/v1.0/landing-pages";
const PUBLIC_ENDPOINT = "/api/v1.0/public/landing-pages";
const TEMPLATE_ENDPOINT = "/api/v1.0/landing-page-templates";

// Default/mock landing pages to seed localStorage if empty
const defaultLandingPages: LandingPage[] = [
  {
    id: "lp-1",
    name: "Landing page sửa máy lạnh",
    slug: "sua-may-lanh",
    title: "Đăng ký tư vấn sửa máy lạnh tại nhà",
    description: "Nhập thông tin để được tư vấn nhanh và nhận ưu đãi 10%.",
    banner_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    primary_color: "#0C9CEC",
    content: `<h3>Dịch vụ sửa chữa điện lạnh TechX</h3>
    <p>Chúng tôi chuyên cung cấp dịch vụ sửa chữa, bảo trì và vệ sinh máy lạnh chuyên nghiệp tại nhà với:</p>
    <ul>
      <li>Đội ngũ kỹ thuật viên tay nghề cao, trên 5 năm kinh nghiệm.</li>
      <li>Kiểm tra và báo giá rõ ràng trước khi sửa chữa.</li>
      <li>Chính sách bảo hành dài hạn từ 3 - 6 tháng.</li>
    </ul>`,
    assigned_user_id: "user-1",
    assigned_user_name: "Nguyễn Văn A",
    campaign_id: "camp-2",
    campaign_name: "Nhắc lịch kiểm tra máy lạnh - OA miền Nam",
    status: "active",
    submission_count: 5,
    customer_count: 5,
    created_at: "2026-06-18T10:30:00.000Z",
    updated_at: "2026-06-18T10:30:00.000Z",
    form_fields: [
      {
        field_key: "full_name",
        label: "Họ và tên",
        type: "text",
        required: true,
        placeholder: "Nhập họ và tên",
        options: [],
        sort_order: 1,
      },
      {
        field_key: "phone",
        label: "Số điện thoại",
        type: "phone",
        required: true,
        placeholder: "Nhập số điện thoại",
        options: [],
        sort_order: 2,
      },
      {
        field_key: "email",
        label: "Email",
        type: "email",
        required: false,
        placeholder: "Nhập email của bạn",
        options: [],
        sort_order: 3,
      },
      {
        field_key: "service_interest",
        label: "Dịch vụ quan tâm",
        type: "select",
        required: true,
        placeholder: "Chọn dịch vụ",
        options: [
          { label: "Sửa máy lạnh", value: "repair" },
          { label: "Vệ sinh máy lạnh", value: "cleaning" },
          { label: "Lắp đặt máy lạnh", value: "install" },
        ],
        sort_order: 4,
      },
      {
        field_key: "demand",
        label: "Nhu cầu tư vấn",
        type: "textarea",
        required: false,
        placeholder: "Nhập nhu cầu chi tiết của bạn",
        options: [],
        sort_order: 5,
      },
    ],
  },
  {
    id: "lp-2",
    name: "Tư vấn bảo trì tủ lạnh",
    slug: "bao-tri-tu-lanh",
    title: "Chương trình chăm sóc tủ lạnh định kỳ",
    description: "Nhận báo giá sửa chữa và vệ sinh tủ lạnh nhanh chóng.",
    banner_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
    primary_color: "#EF4444",
    content: `<p>Tủ lạnh nhà bạn gặp sự cố? Đừng lo lắng, chúng tôi sẽ hỗ trợ nhanh chóng trong vòng 30 phút!</p>`,
    status: "inactive",
    submission_count: 0,
    customer_count: 0,
    created_at: "2026-06-19T09:00:00.000Z",
    updated_at: "2026-06-19T09:00:00.000Z",
    form_fields: [
      {
        field_key: "full_name",
        label: "Họ và tên",
        type: "text",
        required: true,
        placeholder: "Nhập họ và tên",
        options: [],
        sort_order: 1,
      },
      {
        field_key: "phone",
        label: "Số điện thoại",
        type: "phone",
        required: true,
        placeholder: "Nhập số điện thoại",
        options: [],
        sort_order: 2,
      },
    ],
  },
];

const defaultSubmissions: LandingPageSubmission[] = [
  {
    id: "sub-1",
    landing_page_id: "lp-1",
    customer_id: "cust-1",
    submitted_data: {
      full_name: "Trần Văn B",
      phone: "0912345678",
      email: "tranvanb@example.com",
      service_interest: "repair",
      demand: "Tủ lạnh máy lạnh không lạnh, có tiếng kêu to",
    },
    utm_source: "facebook",
    utm_medium: "cpc",
    utm_campaign: "summer_2026",
    utm_content: "banner_01",
    ip_address: "127.0.0.1",
    user_agent: "Mozilla/5.0",
    created_at: "2026-06-20T10:00:00.000Z",
  },
  {
    id: "sub-2",
    landing_page_id: "lp-1",
    customer_id: "cust-2",
    submitted_data: {
      full_name: "Lê Thị C",
      phone: "0987654321",
      email: "lethic@example.com",
      service_interest: "cleaning",
    },
    utm_source: "google",
    utm_medium: "organic",
    ip_address: "127.0.0.1",
    user_agent: "Mozilla/5.0",
    created_at: "2026-06-20T11:15:00.000Z",
  },
];

const defaultTemplates: LandingPageTemplate[] = [
  {
    id: "tpl-service",
    name: "Mẫu tư vấn dịch vụ",
    description: "Phù hợp thu lead cho dịch vụ bảo trì, sửa chữa, vệ sinh hoặc tư vấn giải pháp.",
    category: "service",
    preview_image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
    layout_type: "basic_lead_form",
    default_title: "Đăng ký nhận tư vấn dịch vụ chuyên nghiệp",
    default_description: "Vui lòng điền đầy đủ thông tin bên dưới để được nhân viên hỗ trợ liên hệ trong vòng 15 phút.",
    default_banner_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    default_primary_color: "#0C9CEC",
    default_cta_text: "Đăng ký tư vấn",
    default_content: `<h3>Dịch vụ kỹ thuật chuyên nghiệp</h3>
    <p>Đội ngũ kỹ sư tay nghề cao sẵn sàng hỗ trợ bạn 24/7 với chất lượng tốt nhất.</p>
    <ul>
      <li>Kiểm tra và khảo sát tận nơi miễn phí.</li>
      <li>Báo giá minh bạch, không phát sinh chi phí.</li>
      <li>Bảo hành dịch vụ từ 3 - 12 tháng.</li>
    </ul>`,
    default_form_fields: [
      {
        field_key: "full_name",
        label: "Họ và tên",
        type: "text",
        required: true,
        placeholder: "Nhập họ và tên",
        options: [],
        sort_order: 1,
      },
      {
        field_key: "phone",
        label: "Số điện thoại",
        type: "phone",
        required: true,
        placeholder: "Nhập số điện thoại",
        options: [],
        sort_order: 2,
      },
      {
        field_key: "demand",
        label: "Nhu cầu tư vấn chi tiết",
        type: "textarea",
        required: false,
        placeholder: "Ví dụ: Máy lạnh không mát, tủ lạnh kêu to...",
        options: [],
        sort_order: 3,
      },
    ],
    default_thank_you_message: "Cảm ơn bạn đã quan tâm. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.",
    status: "active",
    is_system_template: true,
  },
  {
    id: "tpl-quote",
    name: "Mẫu đăng ký nhận báo giá",
    description: "Tối ưu hóa chuyển đổi cho các chiến dịch quảng cáo gửi bảng giá, báo giá dịch vụ.",
    category: "quote",
    preview_image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop",
    layout_type: "basic_lead_form",
    default_title: "Nhận báo giá dịch vụ nhanh chóng",
    default_description: "Nhập thông tin bên dưới để nhận bảng báo giá chi tiết qua Email và Zalo.",
    default_banner_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
    default_primary_color: "#10B981",
    default_cta_text: "Nhận báo giá ngay",
    default_content: `<p>Bảng giá dịch vụ của chúng tôi luôn được cập nhật mới nhất kèm các chương trình khuyến mãi tháng này.</p>`,
    default_form_fields: [
      {
        field_key: "full_name",
        label: "Họ và tên",
        type: "text",
        required: true,
        placeholder: "Nhập họ và tên",
        options: [],
        sort_order: 1,
      },
      {
        field_key: "phone",
        label: "Số điện thoại",
        type: "phone",
        required: true,
        placeholder: "Nhập số điện thoại",
        options: [],
        sort_order: 2,
      },
      {
        field_key: "email",
        label: "Địa chỉ Email",
        type: "email",
        required: true,
        placeholder: "example@gmail.com",
        options: [],
        sort_order: 3,
      },
      {
        field_key: "service_interest",
        label: "Dịch vụ quan tâm",
        type: "select",
        required: true,
        placeholder: "Chọn dịch vụ nhận báo giá",
        options: [
          { label: "Báo giá dịch vụ A", value: "service_a" },
          { label: "Báo giá dịch vụ B", value: "service_b" },
        ],
        sort_order: 4,
      },
    ],
    default_thank_you_message: "Bảng báo giá chi tiết đã được gửi tới thông tin của bạn. Vui lòng kiểm tra điện thoại/email.",
    status: "active",
    is_system_template: true,
  },
  {
    id: "tpl-booking",
    name: "Mẫu đặt lịch hẹn",
    description: "Thích hợp cho các mô hình spa, phòng khám, tư vấn tài chính cần chọn thời gian hẹn gặp.",
    category: "booking",
    preview_image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop",
    layout_type: "basic_lead_form",
    default_title: "Đặt lịch hẹn tư vấn trực tiếp",
    default_description: "Đặt chỗ trước để nhận tư vấn chuyên sâu 1-1 từ các chuyên gia hàng đầu.",
    default_banner_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    default_primary_color: "#F59E0B",
    default_cta_text: "Đặt lịch hẹn",
    default_content: `<p>Được tư vấn trực tiếp giúp giải quyết nhanh chóng mọi thắc mắc và định hướng giải pháp hiệu quả nhất.</p>`,
    default_form_fields: [
      {
        field_key: "full_name",
        label: "Họ và tên",
        type: "text",
        required: true,
        placeholder: "Nhập họ và tên",
        options: [],
        sort_order: 1,
      },
      {
        field_key: "phone",
        label: "Số điện thoại",
        type: "phone",
        required: true,
        placeholder: "Nhập số điện thoại",
        options: [],
        sort_order: 2,
      },
      {
        field_key: "appointment_date",
        label: "Ngày muốn đặt hẹn",
        type: "date",
        required: true,
        placeholder: "",
        options: [],
        sort_order: 3,
      },
      {
        field_key: "appointment_time",
        label: "Khung giờ mong muốn",
        type: "select",
        required: true,
        placeholder: "Chọn khung giờ",
        options: [
          { label: "Sáng (8:00 - 11:30)", value: "morning" },
          { label: "Chiều (13:30 - 17:30)", value: "afternoon" },
          { label: "Tối (18:00 - 20:30)", value: "evening" },
        ],
        sort_order: 4,
      },
    ],
    default_thank_you_message: "Đặt lịch thành công! Chúng tôi sẽ gọi điện xác nhận khung giờ hẹn cụ thể với bạn.",
    status: "active",
    is_system_template: true,
  },
  {
    id: "tpl-product",
    name: "Mẫu giới thiệu sản phẩm",
    description: "Giới thiệu sản phẩm mới, tính năng nổi bật và tặng kèm mã giảm giá đặt mua hàng.",
    category: "product",
    preview_image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
    layout_type: "basic_lead_form",
    default_title: "Đăng ký đặt trước sản phẩm nhận ưu đãi lớn",
    default_description: "Nhận chiết khấu lên đến 20% cho 50 khách hàng đăng ký sớm nhất hôm nay.",
    default_banner_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
    default_primary_color: "#EF4444",
    default_cta_text: "Đăng ký nhận ưu đãi",
    default_content: `<h3>Thông số và ưu điểm nổi bật</h3>
    <p>Sản phẩm thế hệ mới mang lại hiệu quả vượt trội gấp 2 lần, tiết kiệm điện năng tối đa.</p>`,
    default_form_fields: [
      {
        field_key: "full_name",
        label: "Họ và tên",
        type: "text",
        required: true,
        placeholder: "Nhập họ và tên",
        options: [],
        sort_order: 1,
      },
      {
        field_key: "phone",
        label: "Số điện thoại",
        type: "phone",
        required: true,
        placeholder: "Nhập số điện thoại",
        options: [],
        sort_order: 2,
      },
      {
        field_key: "product_interest",
        label: "Sản phẩm quan tâm",
        type: "select",
        required: true,
        placeholder: "Chọn dòng sản phẩm",
        options: [
          { label: "Sản phẩm phiên bản Standard", value: "std" },
          { label: "Sản phẩm phiên bản Pro", value: "pro" },
        ],
        sort_order: 3,
      },
      {
        field_key: "quantity",
        label: "Số lượng dự kiến đặt mua",
        type: "text",
        required: false,
        placeholder: "Ví dụ: 1 chiếc, 2 chiếc...",
        options: [],
        sort_order: 4,
      },
    ],
    default_thank_you_message: "Cảm ơn bạn đã đăng ký. Đơn hàng ưu đãi của bạn đã được ghi nhận thành công.",
    status: "active",
    is_system_template: true,
  },
  {
    id: "tpl-event",
    name: "Mẫu đăng ký sự kiện",
    description: "Thu thập danh sách học viên, người tham gia workshop, hội thảo khoa học, sự kiện công ty.",
    category: "event",
    preview_image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop",
    layout_type: "basic_lead_form",
    default_title: "Đăng ký tham gia sự kiện TechX 2026",
    default_description: "Đăng ký miễn phí vé mời tham gia buổi hội thảo chia sẻ giải pháp chuyển đổi số.",
    default_banner_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
    default_primary_color: "#6366F1",
    default_cta_text: "Đăng ký tham gia",
    default_content: `<p>Địa điểm: Khách sạn Grand Plaza, Hà Nội.<br/>Thời gian: 09:00 - 11:30 ngày 25/07/2026.</p>`,
    default_form_fields: [
      {
        field_key: "full_name",
        label: "Họ và tên",
        type: "text",
        required: true,
        placeholder: "Nhập họ và tên",
        options: [],
        sort_order: 1,
      },
      {
        field_key: "phone",
        label: "Số điện thoại",
        type: "phone",
        required: true,
        placeholder: "Nhập số điện thoại",
        options: [],
        sort_order: 2,
      },
      {
        field_key: "email",
        label: "Email nhận vé điện tử",
        type: "email",
        required: true,
        placeholder: "example@gmail.com",
        options: [],
        sort_order: 3,
      },
      {
        field_key: "participant_count",
        label: "Số lượng người đi cùng",
        type: "text",
        required: false,
        placeholder: "Ví dụ: 1 người, 2 người...",
        options: [],
        sort_order: 4,
      },
    ],
    default_thank_you_message: "Đăng ký thành công! Vé mời điện tử (QR Code) đã được gửi tới email của bạn.",
    status: "active",
    is_system_template: true,
  },
];


// Helper to get from localStorage or initialize
function getLocalData<T>(key: string, defaults: T): T {
  if (typeof window === "undefined") return defaults;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
}

function saveLocalData<T>(key: string, data: T) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const landingPagesService = {
  // Admin endpoints
  async getLandingPages(filters?: LandingPageFilters): Promise<{ rows: LandingPage[]; count: number }> {
    try {
      const res = await apiClient.get<{ rows: LandingPage[]; count: number }>(ENDPOINT, filters);
      if (res && res.rows) return res;
      throw new Error("No data from server");
    } catch (error) {
      console.log("Fallback to localStorage for getLandingPages:", error);
      const lps = getLocalData<LandingPage[]>("crm:landing_pages", defaultLandingPages);
      
      let filtered = lps.filter(lp => lp.status !== "deleted");
      
      if (filters?.keyword) {
        const kw = filters.keyword.toLowerCase();
        filtered = filtered.filter(lp => 
          lp.name.toLowerCase().includes(kw) || 
          lp.slug.toLowerCase().includes(kw) || 
          lp.title.toLowerCase().includes(kw)
        );
      }
      if (filters?.status) {
        filtered = filtered.filter(lp => lp.status === filters.status);
      }
      
      const count = filtered.length;
      const page = filters?.currentPage || 1;
      const limit = filters?.pageSize || 20;
      const rows = filtered.slice((page - 1) * limit, page * limit);
      
      return { rows, count };
    }
  },

  async getLandingPageById(id: string): Promise<LandingPage> {
    try {
      const res = await apiClient.get<LandingPage>(`${ENDPOINT}/${id}`);
      if (res && res.id) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for getLandingPageById:", error);
      const lps = getLocalData<LandingPage[]>("crm:landing_pages", defaultLandingPages);
      const lp = lps.find(x => x.id === id);
      if (!lp) throw new Error("Landing page not found");
      return lp;
    }
  },

  async createLandingPage(payload: Omit<LandingPage, "id" | "submission_count" | "customer_count" | "created_at" | "updated_at">): Promise<LandingPage> {
    try {
      const res = await apiClient.post<LandingPage>(ENDPOINT, payload);
      if (res && res.id) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for createLandingPage:", error);
      const lps = getLocalData<LandingPage[]>("crm:landing_pages", defaultLandingPages);
      
      // Slug validation
      if (lps.some(x => x.slug === payload.slug && x.status !== "deleted")) {
        throw new Error("Slug đã tồn tại");
      }

      const newLp: LandingPage = {
        ...payload,
        id: "lp-" + Math.random().toString(36).substr(2, 9),
        submission_count: 0,
        customer_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      lps.push(newLp);
      saveLocalData("crm:landing_pages", lps);
      return newLp;
    }
  },

  async updateLandingPage(id: string, payload: Partial<LandingPage>): Promise<LandingPage> {
    try {
      const res = await apiClient.put<LandingPage>(`${ENDPOINT}/${id}`, payload);
      if (res && res.id) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for updateLandingPage:", error);
      const lps = getLocalData<LandingPage[]>("crm:landing_pages", defaultLandingPages);
      const idx = lps.findIndex(x => x.id === id);
      if (idx === -1) throw new Error("Landing page not found");
      
      // Slug validation
      if (payload.slug && lps.some(x => x.slug === payload.slug && x.id !== id && x.status !== "deleted")) {
        throw new Error("Slug đã tồn tại");
      }

      const updated = {
        ...lps[idx],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      
      lps[idx] = updated;
      saveLocalData("crm:landing_pages", lps);
      return updated;
    }
  },

  async updateLandingPageStatus(id: string, status: "active" | "inactive"): Promise<LandingPage> {
    try {
      const res = await apiClient.patch<LandingPage>(`${ENDPOINT}/${id}/status`, { status });
      if (res && res.id) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for updateLandingPageStatus:", error);
      return this.updateLandingPage(id, { status });
    }
  },

  async deleteLandingPage(id: string): Promise<boolean> {
    try {
      await apiClient.delete<void>(`${ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      console.log("Fallback to localStorage for deleteLandingPage:", error);
      const lps = getLocalData<LandingPage[]>("crm:landing_pages", defaultLandingPages);
      const idx = lps.findIndex(x => x.id === id);
      if (idx === -1) return false;
      
      lps[idx].status = "deleted";
      lps[idx].slug = `${lps[idx].slug}-deleted-${Date.now()}`; // free up slug
      saveLocalData("crm:landing_pages", lps);
      return true;
    }
  },

  async getSubmissions(id: string, filters?: { currentPage?: number; pageSize?: number }): Promise<{ rows: LandingPageSubmission[]; count: number }> {
    try {
      const res = await apiClient.get<{ rows: LandingPageSubmission[]; count: number }>(`${ENDPOINT}/${id}/submissions`, filters);
      if (res && res.rows) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for getSubmissions:", error);
      const subs = getLocalData<LandingPageSubmission[]>("crm:submissions", defaultSubmissions);
      const filtered = subs.filter(s => s.landing_page_id === id);
      
      const count = filtered.length;
      const page = filters?.currentPage || 1;
      const limit = filters?.pageSize || 20;
      const rows = filtered.slice((page - 1) * limit, page * limit);
      
      return { rows, count };
    }
  },

  // Public endpoints
  async getPublicLandingPage(slug: string): Promise<LandingPage> {
    try {
      const res = await apiClient.get<LandingPage>(`${PUBLIC_ENDPOINT}/${slug}`);
      if (res && res.id) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for getPublicLandingPage:", error);
      const lps = getLocalData<LandingPage[]>("crm:landing_pages", defaultLandingPages);
      const lp = lps.find(x => x.slug === slug && x.status === "active");
      if (!lp) throw new Error("Landing page không khả dụng");
      return lp;
    }
  },

  async submitPublicLandingPage(slug: string, payload: Record<string, any>): Promise<{ customer_id: string; submission_id: string }> {
    try {
      const res = await apiClient.post<{ customer_id: string; submission_id: string }>(`${PUBLIC_ENDPOINT}/${slug}/submit`, payload);
      if (res && res.submission_id) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for submitPublicLandingPage:", error);
      const lps = getLocalData<LandingPage[]>("crm:landing_pages", defaultLandingPages);
      const lp = lps.find(x => x.slug === slug && x.status === "active");
      if (!lp) throw new Error("Landing page không khả dụng");

      const submissionId = "sub-" + Math.random().toString(36).substr(2, 9);
      const customerId = "cust-" + Math.random().toString(36).substr(2, 9);

      // Save submission
      const subs = getLocalData<LandingPageSubmission[]>("crm:submissions", defaultSubmissions);
      const newSub: LandingPageSubmission = {
        id: submissionId,
        landing_page_id: lp.id,
        customer_id: customerId,
        submitted_data: { ...payload },
        utm_source: payload.utm_source,
        utm_medium: payload.utm_medium,
        utm_campaign: payload.utm_campaign,
        utm_content: payload.utm_content,
        utm_term: payload.utm_term,
        ip_address: "127.0.0.1",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
        created_at: new Date().toISOString(),
      };
      
      subs.push(newSub);
      saveLocalData("crm:submissions", subs);

      // Increment counters on LandingPage
      const lpIdx = lps.findIndex(x => x.id === lp.id);
      if (lpIdx !== -1) {
        lps[lpIdx].submission_count += 1;
        lps[lpIdx].customer_count += 1;
        saveLocalData("crm:landing_pages", lps);
      }

      // In real backend, this will invoke CustomerService.createCustomer.
      // Here we can also push a customer to local customers if crm:customers exists in localStorage.
      if (typeof window !== "undefined") {
        const storedCustomers = localStorage.getItem("crm:customers");
        if (storedCustomers) {
          try {
            const customers = JSON.parse(storedCustomers);
            customers.push({
              id: customerId,
              full_name: payload.full_name || "Khách hàng từ Landing Page",
              phone: payload.phone || "",
              email: payload.email || "",
              address: payload.address || "",
              notes: payload.demand || "",
              source: "LANDING_PAGE",
              status: "lead",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            localStorage.setItem("crm:customers", JSON.stringify(customers));
          } catch (e) {
            console.error("Error updates crm:customers", e);
          }
        }
      }

      return { customer_id: customerId, submission_id: submissionId };
    }
  },

  async createLandingPageFromTemplate(payload: { template_id: string; name: string; slug: string }): Promise<LandingPage> {
    try {
      const res = await apiClient.post<LandingPage>(`${ENDPOINT}/from-template`, payload);
      if (res && res.id) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for createLandingPageFromTemplate:", error);
      const lps = getLocalData<LandingPage[]>("crm:landing_pages", defaultLandingPages);
      const tpls = getLocalData<LandingPageTemplate[]>("crm:landing_page_templates", defaultTemplates);
      
      const tpl = tpls.find(x => x.id === payload.template_id);
      if (!tpl) throw new Error("Template không tồn tại");

      if (lps.some(x => x.slug === payload.slug && x.status !== "deleted")) {
        throw new Error("Slug đã tồn tại");
      }

      const newLp: LandingPage = {
        id: "lp-" + Math.random().toString(36).substr(2, 9),
        template_id: tpl.id,
        name: payload.name,
        slug: payload.slug.trim().toLowerCase(),
        title: tpl.default_title,
        description: tpl.default_description,
        banner_url: tpl.default_banner_url,
        primary_color: tpl.default_primary_color,
        cta_text: tpl.default_cta_text,
        content: tpl.default_content,
        status: "draft",
        submission_count: 0,
        customer_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        form_fields: tpl.default_form_fields.map((f, idx) => ({ ...f, id: "field-" + idx + "-" + Math.random().toString(36).substr(2, 5) })),
        thank_you_message: tpl.default_thank_you_message,
      };

      lps.push(newLp);
      saveLocalData("crm:landing_pages", lps);
      return newLp;
    }
  }
};

export const landingPageTemplatesService = {
  async getTemplates(filters?: { keyword?: string; category?: string }): Promise<{ rows: LandingPageTemplate[]; count: number }> {
    try {
      const res = await apiClient.get<{ rows: LandingPageTemplate[]; count: number }>(TEMPLATE_ENDPOINT, filters);
      if (res && res.rows) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for getTemplates:", error);
      const tpls = getLocalData<LandingPageTemplate[]>("crm:landing_page_templates", defaultTemplates);
      let filtered = tpls.filter(x => x.status === "active");

      if (filters?.keyword) {
        const kw = filters.keyword.toLowerCase();
        filtered = filtered.filter(x => x.name.toLowerCase().includes(kw) || x.description.toLowerCase().includes(kw));
      }
      if (filters?.category) {
        filtered = filtered.filter(x => x.category === filters.category);
      }

      return { rows: filtered, count: filtered.length };
    }
  },

  async getTemplateById(id: string): Promise<LandingPageTemplate> {
    try {
      const res = await apiClient.get<LandingPageTemplate>(`${TEMPLATE_ENDPOINT}/${id}`);
      if (res && res.id) return res;
      throw new Error("No data");
    } catch (error) {
      console.log("Fallback to localStorage for getTemplateById:", error);
      const tpls = getLocalData<LandingPageTemplate[]>("crm:landing_page_templates", defaultTemplates);
      const tpl = tpls.find(x => x.id === id);
      if (!tpl) throw new Error("Mẫu landing page không tồn tại");
      return tpl;
    }
  }
};
