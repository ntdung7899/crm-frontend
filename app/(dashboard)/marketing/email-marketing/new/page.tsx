import { Metadata } from "next";
import { CreateTemplateClient } from "./CreateTemplateClient";

export const metadata: Metadata = {
  title: "Tạo mẫu Email | CRM System",
};

export default function CreateTemplatePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo mẫu Email mới</h1>
        <p className="text-gray-500 mt-1">Thiết kế mẫu email để gửi cho các chiến dịch marketing</p>
      </div>
      
      <CreateTemplateClient />
    </div>
  );
}
