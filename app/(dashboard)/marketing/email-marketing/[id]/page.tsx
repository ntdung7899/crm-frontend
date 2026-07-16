import { Metadata } from "next";
import { EditTemplateClient } from "./EditTemplateClient";

export const metadata: Metadata = {
  title: "Chỉnh sửa mẫu Email | CRM System",
};

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa mẫu Email</h1>
        <p className="text-gray-500 mt-1">Cập nhật thông tin và nội dung của mẫu email</p>
      </div>
      
      <EditTemplateClient templateId={params.id} />
    </div>
  );
}
