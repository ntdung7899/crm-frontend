import { useState, useEffect, useCallback } from "react";
import { EmailTemplate } from "@/types/email-marketing";
import { emailMarketingService } from "@/services/emailMarketing";
import { useToast } from "@/components/ui/ToastProvider";

export function useEmailMarketing() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await emailMarketingService.getTemplates();
      setTemplates(res.rows);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách template");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    try {
      const success = await emailMarketingService.deleteTemplate(id);
      if (success) {
        toast.success("Xóa template thành công");
        fetchTemplates();
      } else {
        toast.error("Không tìm thấy template");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa template");
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    templates: filteredTemplates,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    refetch: fetchTemplates,
  };
}
