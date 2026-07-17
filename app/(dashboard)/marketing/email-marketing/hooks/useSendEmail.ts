import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { emailMarketingService } from "@/services/emailMarketing";
import { tagsService } from "@/services/tags";
import { customersService } from "@/services/customers";
import { useToast } from "@/components/ui/ToastProvider";

function getFriendlySendError(message?: string) {
  if (!message) return "Lỗi khi gửi email";

  if (/invalid from/i.test(message)) {
    return "Email người gửi chưa được cấu hình hợp lệ ở hệ thống SMTP";
  }

  if (/authentication failed|invalid login|535/i.test(message)) {
    return "Tài khoản SMTP xác thực thất bại. Vui lòng kiểm tra cấu hình email gửi";
  }

  return message;
}

export function useSendEmail(initialTemplateId?: string) {
  const [templateId, setTemplateId] = useState<string | undefined>(initialTemplateId);
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientType, setRecipientType] = useState<"group" | "specific">("specific");
  
  // Real data for audience selection
  const [groups, setGroups] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const router = useRouter();
  const toast = useToast();

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId) {
      setIsLoadingTemplate(true);
      emailMarketingService.getTemplateById(templateId)
        .then((tpl) => {
          if (tpl) {
            setSubject(tpl.subject);
            setContent(tpl.content);
            setCampaignName(`Chiến dịch gửi: ${tpl.name}`);
          } else {
            toast.error("Không tìm thấy template");
            router.push("/marketing/email-marketing");
          }
        })
        .catch(() => {
          toast.error("Lỗi khi tải template");
        })
        .finally(() => setIsLoadingTemplate(false));
    }
  }, [templateId, router, toast]);

  // Load tags and customers from the backend
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [tagsRes, customersRes] = await Promise.all([
          tagsService.getTags({ currentPage: "1", pageSize: "1000" }),
          customersService.getCustomers({ currentPage: "1", pageSize: "1000" }),
        ]);
        setGroups(tagsRes.responseData?.rows || []);
        setCustomers(customersRes.responseData?.rows || []);
      } catch (err) {
        console.error("Failed to load tags or customers:", err);
        toast.error("Không thể tải danh sách khách hàng hoặc nhóm");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [toast]);

  const handleSend = async () => {
    if (!templateId) {
      toast.error("Vui lòng chọn mẫu email để thực hiện");
      return;
    }

    if (!subject || !content) {
      toast.error("Tiêu đề và nội dung không được để trống");
      return;
    }

    if (recipientType === "group" && !selectedGroup) {
      toast.error("Vui lòng chọn nhóm khách hàng");
      return;
    }

    if (recipientType === "specific" && selectedCustomers.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 khách hàng");
      return;
    }

    setIsSubmitting(true);
    try {
      // Auto generate campaign name if left blank
      const finalCampaignName = campaignName.trim() || `Chiến dịch gửi ngày ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}`;

      await emailMarketingService.sendEmail({
        campaignName: finalCampaignName,
        templateId,
        subjectOverride: subject,
        htmlContentOverride: content,
        tagIds: recipientType === "group" ? [selectedGroup] : undefined,
        customerIds: recipientType === "specific" ? selectedCustomers : undefined,
      });

      toast.success("Tạo chiến dịch gửi email thành công");
      router.push("/marketing/email-marketing");
    } catch (error: any) {
      toast.error(getFriendlySendError(error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    campaignName,
    setCampaignName,
    templateId,
    setTemplateId,
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
    isSubmitting,
    isLoadingTemplate,
    isLoadingData,
    groups,
    customers,
    handleSend,
  };
}
