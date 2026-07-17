import { useState, useEffect, useCallback } from "react";
import { EmailTemplate, EmailCampaign } from "@/types/email-marketing";
import { emailMarketingService } from "@/services/emailMarketing";
import { useToast } from "@/components/ui/ToastProvider";

export function useEmailMarketing() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");

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

  const fetchCampaigns = useCallback(async () => {
    setIsLoadingCampaigns(true);
    try {
      const res = await emailMarketingService.getCampaigns();
      setCampaigns(res.rows);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách chiến dịch");
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
    fetchCampaigns();
  }, [fetchTemplates, fetchCampaigns]);

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

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.campaignName.toLowerCase().includes(campaignSearchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(campaignSearchQuery.toLowerCase())
  );

  return {
    templates: filteredTemplates,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    refetchTemplates: fetchTemplates,

    campaigns: filteredCampaigns,
    isLoadingCampaigns,
    campaignSearchQuery,
    setCampaignSearchQuery,
    refetchCampaigns: fetchCampaigns,
  };
}
