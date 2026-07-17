"use client";

import { useState } from "react";
import { EmailCampaign } from "@/types/email-marketing";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { CampaignDetailModal } from "../forms/CampaignDetailModal";

interface CampaignTableProps {
  items: EmailCampaign[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case "sending":
      return {
        label: "Đang gửi",
        className: "bg-blue-100 text-blue-700",
      };
    case "completed":
      return {
        label: "Hoàn thành",
        className: "bg-emerald-100 text-emerald-700",
      };
    case "failed":
      return {
        label: "Thất bại",
        className: "bg-rose-100 text-rose-700",
      };
    case "partial_success":
      return {
        label: "Lỗi một phần",
        className: "bg-amber-100 text-amber-700",
      };
    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-600",
      };
  }
}

export function CampaignTable({ items }: CampaignTableProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (id: string) => {
    setSelectedCampaignId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 font-medium text-gray-900">Tên chiến dịch</th>
            <th className="px-6 py-4 font-medium text-gray-900">Tiêu đề (Subject)</th>
            <th className="px-6 py-4 font-medium text-gray-900 text-center">Người nhận</th>
            <th className="px-6 py-4 font-medium text-gray-900 text-center">Đã gửi</th>
            <th className="px-6 py-4 font-medium text-gray-900 text-center">Lỗi</th>
            <th className="px-6 py-4 font-medium text-gray-900 text-center">Trạng thái</th>
            <th className="px-6 py-4 font-medium text-gray-900">Ngày tạo</th>
            <th className="px-6 py-4 font-medium text-gray-900 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                Chưa có chiến dịch email marketing nào được thực hiện.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.campaignName}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {item.subject}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-700">
                    {item.totalRecipients}
                  </td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold">
                    {item.sentCount}
                  </td>
                  <td className="px-6 py-4 text-center text-rose-600 font-semibold">
                    {item.failedCount}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(item.id)}
                    >
                      <Eye className="w-4 h-4 mr-1 text-primary" />
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {selectedCampaignId && (
        <CampaignDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCampaignId(null);
          }}
          campaignId={selectedCampaignId}
        />
      )}
    </div>
  );
}
