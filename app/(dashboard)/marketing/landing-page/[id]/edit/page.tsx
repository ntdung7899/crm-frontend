"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { LandingPageForm } from "@/modules/marketing/landing-page/components/forms/LandingPageForm";
import { landingPagesService } from "@/services/landingPages";
import { useToast } from "@/components/ui/ToastProvider";
import { LandingPage } from "@/types";
import { Spinner } from "@/components/ui/Spinner";

export default function EditLandingPagePage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [lp, setLp] = useState<LandingPage | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchLp = async () => {
      try {
        setLoading(true);
        const data = await landingPagesService.getLandingPageById(id);
        setLp(data);
      } catch (error: any) {
        toast.warning("Lỗi tải thông tin", error.message || "Không thể lấy chi tiết landing page");
        router.push("/marketing/landing-page");
      } finally {
        setLoading(false);
      }
    };
    fetchLp();
  }, [id, router, toast]);

  const handleCancel = useCallback(() => {
    router.push("/marketing/landing-page");
  }, [router]);

  const handleSave = useCallback(async (payload: any) => {
    if (!id) return;
    try {
      await landingPagesService.updateLandingPage(id, payload);
      toast.success("Thành công", "Cập nhật landing page thành công");
      router.push("/marketing/landing-page");
    } catch (error: any) {
      toast.warning("Lỗi cập nhật", error.message || "Đã xảy ra lỗi");
    }
  }, [id, router, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!lp) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Chỉnh sửa Landing Page</h1>
          <p className="text-sm text-text-secondary mt-1">Cập nhật cấu hình và form fields của Landing Page.</p>
        </div>
        <Button variant="secondary" className="flex items-center gap-1.5" onClick={handleCancel}>
          <FiArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Button>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl">
        <LandingPageForm landingPage={lp} onSave={handleSave} onCancel={handleCancel} submitText="Lưu thay đổi" />
      </div>
    </div>
  );
}
