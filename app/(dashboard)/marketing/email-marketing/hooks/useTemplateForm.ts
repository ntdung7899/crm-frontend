import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { emailMarketingService } from "@/services/emailMarketing";
import { useToast } from "@/components/ui/ToastProvider";

export function useTemplateForm(templateId?: string) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!templateId);
  
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (templateId) {
      const fetchTemplate = async () => {
        try {
          const tpl = await emailMarketingService.getTemplateById(templateId);
          if (tpl) {
            setName(tpl.name);
            setSubject(tpl.subject);
            setContent(tpl.content);
          } else {
            toast.error("Không tìm thấy template");
            router.push("/marketing/email-marketing");
          }
        } catch (error) {
          toast.error("Lỗi khi tải template");
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplate();
    }
  }, [templateId, router, toast]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !content) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      if (templateId) {
        await emailMarketingService.updateTemplate(templateId, { name, subject, content });
        toast.success("Cập nhật template thành công");
      } else {
        await emailMarketingService.createTemplate({ name, subject, content });
        toast.success("Tạo mới template thành công");
      }
      router.push("/marketing/email-marketing");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    subject,
    setSubject,
    content,
    setContent,
    isLoading,
    isSubmitting,
    onSubmit,
  };
}
