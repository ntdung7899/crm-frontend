"use client";

import { Input } from "@/components/ui/Input";
import { TextEditor } from "@/components/ui/TextEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mockCustomers } from "@/mock-data/customers";

interface SendEmailSectionProps {
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
  onSend: () => void;
  isSubmitting: boolean;
  isLoadingTemplate?: boolean;
}

export function SendEmailSection({
  subject,
  setSubject,
  content,
  setContent,
  recipientType,
  setRecipientType,
  selectedGroup,
  setSelectedGroup,
  selectedCustomers,
  setSelectedCustomers,
  onSend,
  isSubmitting,
  isLoadingTemplate,
}: SendEmailSectionProps) {
  const router = useRouter();

  // Giả lập danh sách nhóm
  const groupOptions = [
    { value: "vip", label: "Khách hàng VIP" },
    { value: "new", label: "Khách hàng mới" },
    { value: "inactive", label: "Khách hàng không hoạt động (>30 ngày)" },
  ];

  if (isLoadingTemplate) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột trái: Form chỉnh sửa nội dung (2/3 chiều rộng) */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung Email</h2>
          <div className="space-y-4">
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
              <TextEditor
                value={content}
                onChange={setContent}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Cột phải: Chọn đối tượng nhận & Action (1/3 chiều rộng) */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Người nhận</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức gửi</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    checked={recipientType === "group"}
                    onChange={() => setRecipientType("group")}
                  />
                  Theo nhóm
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    checked={recipientType === "specific"}
                    onChange={() => setRecipientType("specific")}
                  />
                  Khách hàng cụ thể
                </label>
              </div>
            </div>

            {recipientType === "group" ? (
              <Select
                label="Chọn nhóm khách hàng"
                options={groupOptions}
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khách hàng cụ thể</label>
                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto p-2 space-y-1 bg-white">
                  {mockCustomers.map((customer) => (
                    <label key={customer.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id]);
                          } else {
                            setSelectedCustomers(selectedCustomers.filter((id) => id !== customer.id));
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{customer.customerName}</p>
                        <p className="text-xs text-gray-500 truncate">{customer.phone || 'Chưa có SĐT'}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium text-primary">
                  Đã chọn {selectedCustomers.length} khách hàng
                </p>
              </div>
            )}
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
