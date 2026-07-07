import { EmailTemplate } from "@/types/email-marketing";

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "template-1",
    name: "Mẫu Chào mừng Khách hàng mới",
    subject: "Chào mừng bạn đến với hệ thống CRM",
    content: `
      <h2>Xin chào,</h2>
      <p>Cảm ơn bạn đã đăng ký và sử dụng dịch vụ của chúng tôi.</p>
      <p>Hệ thống CRM của chúng tôi cung cấp các công cụ mạnh mẽ để giúp bạn quản lý khách hàng dễ dàng hơn.</p>
      <br />
      <p>Trân trọng,</p>
      <p><strong>Đội ngũ Getfly</strong></p>
    `,
    createdAt: new Date("2024-01-15T08:30:00Z"),
    updatedAt: new Date("2024-01-20T09:15:00Z"),
  },
  {
    id: "template-2",
    name: "Mẫu Tri ân Khách hàng VIP",
    subject: "Ưu đãi độc quyền dành riêng cho bạn!",
    content: `
      <h2>Kính gửi Quý khách hàng,</h2>
      <p>Nhân dịp kỷ niệm thành lập công ty, chúng tôi dành tặng riêng cho các khách hàng VIP voucher giảm giá <strong>50%</strong> cho lần gia hạn tiếp theo.</p>
      <p>Vui lòng nhập mã: <strong>VIP50</strong> khi thanh toán.</p>
      <br />
      <p>Cảm ơn bạn đã luôn đồng hành cùng chúng tôi.</p>
    `,
    createdAt: new Date("2024-02-10T14:00:00Z"),
    updatedAt: new Date("2024-02-12T10:00:00Z"),
  },
  {
    id: "template-3",
    name: "Mẫu Thông báo Cập nhật Tính năng",
    subject: "Khám phá các tính năng mới trên CRM",
    content: `
      <h2>Chào bạn,</h2>
      <p>Chúng tôi vừa cập nhật một số tính năng mới trên hệ thống để nâng cao trải nghiệm của bạn:</p>
      <ul>
        <li>Tích hợp Zalo OA</li>
        <li>Báo cáo phân tích chuyên sâu</li>
        <li>Giao diện thân thiện hơn</li>
      </ul>
      <p>Hãy đăng nhập ngay để trải nghiệm!</p>
    `,
    createdAt: new Date("2024-03-05T09:00:00Z"),
    updatedAt: new Date("2024-03-05T09:00:00Z"),
  },
  {
    id: "template-4",
    name: "Mẫu Nhắc nhở Gia hạn Dịch vụ",
    subject: "Dịch vụ của bạn sắp hết hạn",
    content: `
      <h2>Kính gửi Quý khách,</h2>
      <p>Dịch vụ CRM của quý khách sẽ hết hạn trong vòng <strong>7 ngày tới</strong>.</p>
      <p>Để không bị gián đoạn, vui lòng truy cập hệ thống và tiến hành gia hạn.</p>
      <br />
      <p>Nếu có thắc mắc, vui lòng liên hệ hotline: 1900 xxxx.</p>
    `,
    createdAt: new Date("2024-03-20T16:30:00Z"),
    updatedAt: new Date("2024-03-21T08:45:00Z"),
  }
];
