"use client";

import { Input } from "@/components/ui/Input";
import { TextEditor } from "@/components/ui/TextEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SendEmailSectionProps {
  campaignName: string;
  setCampaignName: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  recipientType: "group" | "specific";
  setRecipientType: (v: "group" | "specific") => void;
  selectedGroup: string;
  setSelectedGroup: (v: string) => void;
  selectedCustomers: string[];
  setSelectedCustomers: (v: string[]) => void;
  recipientSearch: string;
  setRecipientSearch: (v: string) => void;
  onSend: () => void;
  isSubmitting: boolean;
  isLoadingTemplate?: boolean;
  isLoadingData?: boolean;
  isLoadingRecipients?: boolean;
  groups: any[];
  customers: any[];
}

export function SendEmailSection({
  campaignName,
  setCampaignName,
  subject,
  setSubject,
  content,
  setContent,
  selectedCustomers,
  setSelectedCustomers,
  recipientSearch,
  setRecipientSearch,
  onSend,
  isSubmitting,
  isLoadingTemplate,
  isLoadingData,
  isLoadingRecipients,
  customers,
}: SendEmailSectionProps) {
  const router = useRouter();
  const customersWithEmail = customers.filter((customer) => customer.email);

  if (isLoadingTemplate || isLoadingData) {
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung Email</h2>
          <div className="space-y-4">
            <Input
              label="Tên chiến dịch email"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Nhập tên chiến dịch (để trống hệ thống sẽ tự sinh)..."
            />

            <Input
              label="Tiêu đề email (Subject)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Nhập tiêu đề email..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung email (Chỉnh sửa trước khi gửi không ảnh hưởng mẫu gốc)
              </label>
              <TextEditor value={content} onChange={setContent} />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Người nhận</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn khách hàng cụ thể
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                placeholder="Tìm theo tên"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto p-2 space-y-1 bg-white">
              {isLoadingRecipients ? (
                <p className="text-sm text-gray-500 p-2 text-center">
                  Đang tìm kiếm khách hàng...
                </p>
              ) : customersWithEmail.length === 0 ? (
                <p className="text-sm text-gray-500 p-2 text-center">
                  {recipientSearch.trim()
                    ? "Không tìm thấy khách hàng phù hợp"
                    : "Không có khách hàng nào có địa chỉ email"}
                </p>
              ) : (
                customersWithEmail.map((customer) => {
                  const fullName =
                    customer.full_name ||
                    `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                    "Chưa đặt tên";

                  return (
                    <label
                      key={customer.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id]);
                          } else {
                            setSelectedCustomers(
                              selectedCustomers.filter((id) => id !== customer.id),
                            );
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium text-primary">
              Đã chọn {selectedCustomers.length} khách hàng
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={onSend}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Thực hiện gửi"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
