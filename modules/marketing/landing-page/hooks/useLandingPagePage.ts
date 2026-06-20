import { useState, useEffect, useCallback } from "react";
import { LandingPage, LandingPageSubmission, LandingPageFilters } from "@/types";
import { landingPagesService } from "@/services/landingPages";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";

export function useLandingPagePage() {
  const router = useRouter();
  const toast = useToast();
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<LandingPageFilters>({
    currentPage: 1,
    pageSize: 10,
    keyword: "",
    status: "",
  });

  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [submissionsLp, setSubmissionsLp] = useState<LandingPage | null>(null);
  const [submissions, setSubmissions] = useState<LandingPageSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLp, setPreviewLp] = useState<LandingPage | null>(null);

  const fetchLandingPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await landingPagesService.getLandingPages(filters);
      setLandingPages(data.rows);
      setTotalCount(data.count);
    } catch (error: any) {
      toast.warning("Lỗi khi tải danh sách", error.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchLandingPages();
  }, [fetchLandingPages]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  };

  const handleSearch = (keyword: string) => {
    setFilters(prev => ({ ...prev, keyword, currentPage: 1 }));
  };

  const handleFilterStatus = (status: string) => {
    setFilters(prev => ({ ...prev, status: status || undefined, currentPage: 1 }));
  };

  const handleOpenCreateModal = () => {
    router.push("/marketing/landing-page/new");
  };

  const handleOpenEditModal = (lp: LandingPage) => {
    router.push(`/marketing/landing-page/${lp.id}/edit`);
  };

  const handleToggleStatus = async (lp: LandingPage) => {
    const nextStatus = lp.status === "active" ? "inactive" : "active";
    try {
      await landingPagesService.updateLandingPageStatus(lp.id, nextStatus);
      toast.success("Thành công", `Đổi trạng thái sang ${nextStatus === "active" ? "Hoạt động" : "Tạm dừng"}`);
      fetchLandingPages();
    } catch (error: any) {
      toast.warning("Lỗi thao tác", error.message || "Đã xảy ra lỗi");
    }
  };

  const handleDeleteLandingPage = async (id: string) => {
    try {
      const ok = await landingPagesService.deleteLandingPage(id);
      if (ok) {
        toast.success("Thành công", "Đã xóa landing page");
        fetchLandingPages();
      } else {
        throw new Error("Không thể xóa");
      }
    } catch (error: any) {
      toast.warning("Lỗi xóa", error.message || "Đã xảy ra lỗi");
    }
  };

  const handleOpenSubmissions = async (lp: LandingPage) => {
    setSubmissionsLp(lp);
    setIsSubmissionsOpen(true);
    setSubmissionsLoading(true);
    try {
      const data = await landingPagesService.getSubmissions(lp.id);
      setSubmissions(data.rows);
    } catch (error: any) {
      toast.warning("Lỗi tải submissions", error.message || "Không thể tải danh sách đăng ký");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleCloseSubmissions = () => {
    setIsSubmissionsOpen(false);
    setSubmissionsLp(null);
    setSubmissions([]);
  };

  const handleOpenPreview = (lp: LandingPage) => {
    setPreviewLp(lp);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewLp(null);
  };

  const handleCopyLink = (slug: string) => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const url = `${origin}/lp/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã copy link", "Link public landing page đã được sao chép");
  };

  return {
    landingPages,
    totalCount,
    loading,
    filters,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleFilterStatus,
    
    // Form navigation
    handleOpenCreateModal,
    handleOpenEditModal,
    handleToggleStatus,
    handleDeleteLandingPage,

    // Submissions
    isSubmissionsOpen,
    submissionsLp,
    submissions,
    submissionsLoading,
    handleOpenSubmissions,
    handleCloseSubmissions,

    // Preview
    isPreviewOpen,
    previewLp,
    handleOpenPreview,
    handleClosePreview,

    // Copy link
    handleCopyLink,
  };
}
