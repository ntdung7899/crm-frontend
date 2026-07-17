"use client";

import { EmailTemplate } from "@/types/email-marketing";
import { Button } from "@/components/ui/Button";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { format } from "date-fns";
import { Pencil, Trash2, Send } from "lucide-react";
import Link from "next/link";

interface TemplateTableProps {
  items: EmailTemplate[];
  onDelete: (id: string) => void | Promise<void>;
}

export function TemplateTable({ items, onDelete }: TemplateTableProps) {
  const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 font-medium text-gray-900">Tên mẫu</th>
            <th className="px-6 py-4 font-medium text-gray-900">Tiêu đề (Subject)</th>
            <th className="px-6 py-4 font-medium text-gray-900">Ngày tạo</th>
            <th className="px-6 py-4 font-medium text-gray-900 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">
                {item.name}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {item.subject}
              </td>
              <td className="px-6 py-4 text-gray-500">
                {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/marketing/email-marketing/${item.id}`}>
                    <Pencil className="w-4 h-4 text-primary" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    requestDeleteConfirmation({
                      title: "Xóa mẫu email",
                      description: `Bạn có chắc chắn muốn xóa mẫu "${item.name}"?`,
                      confirmText: "Xóa",
                      cancelText: "Hủy",
                      onConfirm: () => onDelete(item.id),
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/marketing/email-marketing/send?templateId=${item.id}`}>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DeleteConfirmationDialog />
    </div>
  );
}
