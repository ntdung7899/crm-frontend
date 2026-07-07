import { Metadata } from "next";
import { EmailMarketingList } from "./EmailMarketingList";

export const metadata: Metadata = {
  title: "Email Marketing | CRM System",
  description: "Quản lý mẫu email và gửi email marketing",
};

export default function EmailMarketingPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-500 mt-1">Quản lý các mẫu email và thực hiện gửi thông điệp tới khách hàng</p>
        </div>
      </div>
      
      <EmailMarketingList />
    </div>
  );
}
