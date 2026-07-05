import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | TechX CRM",
  description:
    "Chính sách bảo mật của hệ thống CRM & Marketing TechX — cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "05/07/2026";

const sections = [
  {
    id: "gioi-thieu",
    title: "1. Giới thiệu",
    body: (
      <>
        <p>
          Chính sách bảo mật này mô tả cách <strong>TechX</strong> (&ldquo;chúng
          tôi&rdquo;) thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân khi
          bạn sử dụng hệ thống CRM &amp; Marketing TechX (&ldquo;Dịch vụ&rdquo;).
        </p>
        <p>
          Bằng việc truy cập và sử dụng Dịch vụ, bạn đồng ý với các điều khoản
          được nêu trong Chính sách bảo mật này.
        </p>
      </>
    ),
  },
  {
    id: "thong-tin-thu-thap",
    title: "2. Thông tin chúng tôi thu thập",
    body: (
      <>
        <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
        <ul>
          <li>
            <strong>Thông tin tài khoản:</strong> họ tên, email, số điện thoại,
            tên đăng nhập và mật khẩu.
          </li>
          <li>
            <strong>Dữ liệu khách hàng:</strong> thông tin liên hệ, đơn hàng, giao
            dịch và lịch sử tương tác do bạn nhập vào hệ thống.
          </li>
          <li>
            <strong>Dữ liệu sử dụng:</strong> nhật ký truy cập, địa chỉ IP, loại
            trình duyệt, thiết bị và các thao tác trên hệ thống.
          </li>
          <li>
            <strong>Cookie và công nghệ tương tự:</strong> để duy trì phiên đăng
            nhập và cải thiện trải nghiệm.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "muc-dich",
    title: "3. Mục đích sử dụng thông tin",
    body: (
      <>
        <p>Thông tin được sử dụng nhằm:</p>
        <ul>
          <li>Cung cấp, vận hành và duy trì Dịch vụ.</li>
          <li>Quản lý tài khoản và xác thực người dùng.</li>
          <li>Cải thiện, cá nhân hóa và mở rộng tính năng của Dịch vụ.</li>
          <li>Gửi thông báo, cập nhật và hỗ trợ kỹ thuật.</li>
          <li>Phát hiện, ngăn chặn gian lận và bảo đảm an toàn hệ thống.</li>
        </ul>
      </>
    ),
  },
  {
    id: "chia-se",
    title: "4. Chia sẻ thông tin",
    body: (
      <>
        <p>
          Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn. Thông
          tin chỉ được chia sẻ trong các trường hợp:
        </p>
        <ul>
          <li>Với sự đồng ý của bạn.</li>
          <li>
            Với các nhà cung cấp dịch vụ hỗ trợ vận hành (lưu trữ, phân tích) theo
            thỏa thuận bảo mật.
          </li>
          <li>Khi được yêu cầu bởi pháp luật hoặc cơ quan có thẩm quyền.</li>
        </ul>
      </>
    ),
  },
  {
    id: "bao-mat",
    title: "5. Bảo mật dữ liệu",
    body: (
      <p>
        Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức hợp lý (mã hóa,
        kiểm soát truy cập, sao lưu) để bảo vệ thông tin của bạn khỏi truy cập,
        thay đổi, tiết lộ hoặc phá hủy trái phép. Tuy nhiên, không có phương thức
        truyền tải nào trên Internet là an toàn tuyệt đối.
      </p>
    ),
  },
  {
    id: "luu-tru",
    title: "6. Lưu trữ dữ liệu",
    body: (
      <p>
        Thông tin được lưu trữ trong thời gian cần thiết để cung cấp Dịch vụ và
        tuân thủ nghĩa vụ pháp lý. Khi không còn cần thiết, dữ liệu sẽ được xóa
        hoặc ẩn danh một cách an toàn.
      </p>
    ),
  },
  {
    id: "quyen-cua-ban",
    title: "7. Quyền của bạn",
    body: (
      <>
        <p>Bạn có quyền:</p>
        <ul>
          <li>Truy cập, chỉnh sửa hoặc cập nhật thông tin cá nhân.</li>
          <li>Yêu cầu xóa tài khoản và dữ liệu liên quan.</li>
          <li>Rút lại sự đồng ý xử lý dữ liệu bất kỳ lúc nào.</li>
          <li>Khiếu nại về việc xử lý dữ liệu cá nhân.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookie",
    title: "8. Cookie",
    body: (
      <p>
        Dịch vụ sử dụng cookie để duy trì phiên đăng nhập và ghi nhớ tùy chọn.
        Bạn có thể tắt cookie trong cài đặt trình duyệt, nhưng một số tính năng có
        thể không hoạt động đúng.
      </p>
    ),
  },
  {
    id: "thay-doi",
    title: "9. Thay đổi chính sách",
    body: (
      <p>
        Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Mọi thay
        đổi sẽ được đăng tải trên trang này kèm ngày cập nhật mới nhất.
      </p>
    ),
  },
  {
    id: "lien-he",
    title: "10. Liên hệ",
    body: (
      <p>
        Nếu bạn có câu hỏi về Chính sách bảo mật này, vui lòng liên hệ với chúng
        tôi qua email:{" "}
        <a href="mailto:support@techx.vn">support@techx.vn</a>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">TechX</span>
            <span className="text-sm font-medium text-slate-400">
              CRM &amp; Marketing
            </span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">
          Chính sách bảo mật
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Cập nhật lần cuối: {LAST_UPDATED}
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-slate-900">
                {section.title}
              </h2>
              <div className="prose-privacy mt-3 space-y-3 text-[15px] leading-relaxed text-slate-600 [&_a]:font-medium [&_a]:text-blue-600 [&_a:hover]:underline [&_li]:ml-1 [&_strong]:text-slate-800 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-400">
          © {new Date().getFullYear()} TechX. Bảo lưu mọi quyền.
        </footer>
      </div>
    </main>
  );
}
