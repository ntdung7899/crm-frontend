import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { emailMarketingService } from "@/services/emailMarketing";
import { tagsService } from "@/services/tags";
import { customersService } from "@/services/customers";
import { useToast } from "@/components/ui/ToastProvider";

const RECIPIENT_PAGE_SIZE = "20";

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

function mergeUniqueById(currentRows: any[], nextRows: any[]) {
  return Array.from(new Map([...currentRows, ...nextRows].map((row) => [row.id, row])).values());
}

export function useSendEmail(initialTemplateId?: string) {
  const [templateId, setTemplateId] = useState<string | undefined>(initialTemplateId);
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientType, setRecipientType] = useState<"group" | "specific">("specific");

  const [groups, setGroups] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientTotalPages, setRecipientTotalPages] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);

  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!templateId) return;

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
  }, [templateId, router, toast]);

  const fetchRecipients = useCallback(
    async ({ page, search, append }: { page: number; search: string; append: boolean }) => {
      setIsLoadingRecipients(true);
      try {
        const filters = search.trim();
        const customersRes = await customersService.getCustomers({
          currentPage: String(page),
          pageSize: RECIPIENT_PAGE_SIZE,
          ...(filters ? { filters } : {}),
        });
        const data = customersRes.responseData;
        const rows = data?.rows || [];

        setCustomers((current) => append ? mergeUniqueById(current, rows) : rows);
        setRecipientPage(data?.currentPage || page);
        setRecipientTotalPages(data?.totalPages || 1);
      } catch (err) {
        console.error("Failed to load recipients:", err);
        toast.error("Không thể tải danh sách người nhận");
      } finally {
        setIsLoadingRecipients(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const tagsRes = await tagsService.getTags({ currentPage: "1", pageSize: "1000" });
        setGroups(tagsRes.responseData?.rows || []);
        await fetchRecipients({ page: 1, search: "", append: false });
      } catch (err) {
        console.error("Failed to load tags or customers:", err);
        toast.error("Không thể tải danh sách khách hàng hoặc nhóm");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [fetchRecipients, toast]);

  useEffect(() => {
    if (isLoadingData) return;

    const timeoutId = window.setTimeout(() => {
      void fetchRecipients({ page: 1, search: recipientSearch, append: false });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [fetchRecipients, isLoadingData, recipientSearch]);

  const loadMoreRecipients = useCallback(() => {
    if (isLoadingRecipients || recipientPage >= recipientTotalPages) return;

    void fetchRecipients({
      page: recipientPage + 1,
      search: recipientSearch,
      append: true,
    });
  }, [fetchRecipients, isLoadingRecipients, recipientPage, recipientSearch, recipientTotalPages]);

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
      const finalCampaignName = campaignName.trim() || `Chiến dịch gửi ngày ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;

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
    recipientSearch,
    setRecipientSearch,
    loadMoreRecipients,
    hasMoreRecipients: recipientPage < recipientTotalPages,
    isSubmitting,
    isLoadingTemplate,
    isLoadingData,
    isLoadingRecipients,
    groups,
    customers,
    handleSend,
  };
}
