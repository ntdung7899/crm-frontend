import { Metadata } from "next";
import { SendEmailClient } from "./SendEmailClient";

export const metadata: Metadata = {
  title: "Gửi Email Marketing | CRM System",
};

export default function SendEmailPage({
  searchParams,
}: {
  searchParams: { templateId?: string };
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gửi Email Marketing</h1>
        <p className="text-gray-500 mt-1">Chỉnh sửa nội dung và chọn tệp khách hàng để gửi email</p>
      </div>
      
      <SendEmailClient initialTemplateId={searchParams.templateId} />
    </div>
  );
}
