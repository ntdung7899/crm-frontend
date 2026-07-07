import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { emailMarketingService } from "@/services/emailMarketing";
import { useToast } from "@/components/ui/ToastProvider";

export function useSendEmail(initialTemplateId?: string) {
  const [templateId, setTemplateId] = useState<string | undefined>(initialTemplateId);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientType, setRecipientType] = useState<"group" | "specific">("group");
  
  // Fake state for audience selection
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (templateId) {
      setIsLoadingTemplate(true);
      emailMarketingService.getTemplateById(templateId)
        .then((tpl) => {
          if (tpl) {
            setSubject(tpl.subject);
            setContent(tpl.content);
          }
        })
        .finally(() => setIsLoadingTemplate(false));
    }
  }, [templateId]);

  const handleSend = async () => {
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
      const recipients = recipientType === "group" ? [selectedGroup] : selectedCustomers;
      await emailMarketingService.sendEmail({
        templateId,
        subject,
        content,
        recipientType,
        recipients,
      });
      toast.success("Gửi email thành công");
      router.push("/marketing/email-marketing");
    } catch (error) {
      toast.error("Lỗi khi gửi email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    handleSend,
  };
}
