"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { emailMarketingService } from "@/services/emailMarketing";
import { EmailCampaign, EmailRecipientLog } from "@/types/email-marketing";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle } from "lucide-react";

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

function getFriendlyEmailError(message?: string | null) {
  if (!message) return "-";

  if (/invalid from/i.test(message)) {
    return "Email người gửi chưa được cấu hình hợp lệ ở hệ thống SMTP.";
  }

  if (/authentication failed|invalid login|535/i.test(message)) {
    return "Tài khoản SMTP xác thực thất bại. Vui lòng kiểm tra cấu hình email gửi.";
  }

  return message;
}

export function CampaignDetailModal({ isOpen, onClose, campaignId }: CampaignDetailModalProps) {
  const [data, setData] = useState<{ campaign: EmailCampaign; recipients: EmailRecipientLog[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (campaignId && isOpen) {
      setIsLoading(true);
      emailMarketingService.getCampaignById(campaignId)
        .then((res) => {
          if (res) {
            setData(res);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch campaign details:", err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [campaignId, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Chiến dịch Email"
      size="xl"
      footer={
        <Button onClick={onClose} variant="outline">
          Đóng
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : !data ? (
        <p className="text-center text-gray-500 py-6">Không tìm thấy thông tin chiến dịch.</p>
      ) : (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Tên chiến dịch</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{data.campaign.campaignName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Tiêu đề gửi</p>
              <p className="text-sm text-gray-700 mt-0.5 truncate" title={data.campaign.subject}>
                {data.campaign.subject}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Thành công</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">
                {data.campaign.sentCount} / {data.campaign.totalRecipients}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Thất bại</p>
              <p className="text-sm font-bold text-rose-600 mt-0.5">
                {data.campaign.failedCount} / {data.campaign.totalRecipients}
              </p>
            </div>
          </div>

          {/* Recipients List Table */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Kết quả gửi tới khách hàng</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold">Thời gian</th>
                    <th className="px-4 py-3 font-semibold">Chi tiết lỗi (nếu có)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.recipients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                        Không có lịch sử gửi email cho các địa chỉ cụ thể.
                      </td>
                    </tr>
                  ) : (
                    data.recipients.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{rec.email}</td>
                        <td className="px-4 py-3 text-center">
                          {rec.status === "sent" ? (
                            <span className="inline-flex items-center text-emerald-600 font-semibold gap-1 justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-rose-600 font-semibold gap-1 justify-center">
                              <XCircle className="w-3.5 h-3.5" /> Thất bại
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {rec.sentAt ? format(new Date(rec.sentAt), "dd/MM/yyyy HH:mm:ss") : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-medium break-all">
                          <span title={rec.errorMessage || undefined}>
                            {getFriendlyEmailError(rec.errorMessage)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
