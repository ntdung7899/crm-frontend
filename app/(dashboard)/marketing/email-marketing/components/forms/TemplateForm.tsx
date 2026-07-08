"use client";

import { Input } from "@/components/ui/Input";
import { TextEditor } from "@/components/ui/TextEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

interface TemplateFormProps {
  name: string;
  setName: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isLoading?: boolean;
}

export function TemplateForm({
  name,
  setName,
  subject,
  setSubject,
  content,
  setContent,
  onSubmit,
  isSubmitting,
  isLoading,
}: TemplateFormProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Tên mẫu email"
            placeholder="Ví dụ: Mẫu giới thiệu tháng 5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Tiêu đề email (Subject)"
            placeholder="Ví dụ: Khám phá sản phẩm mới từ chúng tôi"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung email
          </label>
          <TextEditor
            value={content}
            onChange={setContent}
            placeholder="Soạn nội dung email của bạn tại đây..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu mẫu email"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
